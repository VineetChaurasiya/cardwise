import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from app.config import get_settings
from app.schemas import CardDocument
from app.services.auth import verify_admin_token
from app.services.doc_parser import chunk_text, extract_text
from app.services.gemini_client import embed_texts
from app.services.supabase_client import get_supabase

router = APIRouter(prefix="/cards/{card_id}/documents", tags=["documents"])


@router.get("", response_model=list[CardDocument])
def list_documents(card_id: str):
    supabase = get_supabase()
    res = (
        supabase.table("card_documents")
        .select("*")
        .eq("card_id", card_id)
        .order("uploaded_at", desc=True)
        .execute()
    )
    return [
        CardDocument(
            id=row["id"],
            card_id=row["card_id"],
            file_name=row["file_name"],
            file_size_kb=row["file_size_kb"],
            status=row["status"],
            uploaded_at=row["uploaded_at"],
        )
        for row in res.data
    ]


@router.post("", response_model=CardDocument, dependencies=[Depends(verify_admin_token)])
async def upload_document(card_id: str, file: UploadFile):
    supabase = get_supabase()
    settings = get_settings()

    card_check = supabase.table("cards").select("id").eq("id", card_id).execute()
    if not card_check.data:
        raise HTTPException(status_code=404, detail="Card not found")

    file_bytes = await file.read()
    storage_path = f"{card_id}/{uuid.uuid4()}-{file.filename}"

    supabase.storage.from_(settings.supabase_storage_bucket).upload(
        storage_path, file_bytes, {"content-type": file.content_type or "application/octet-stream"}
    )

    doc_res = (
        supabase.table("card_documents")
        .insert(
            {
                "card_id": card_id,
                "file_name": file.filename,
                "storage_path": storage_path,
                "file_size_kb": max(1, round(len(file_bytes) / 1024)),
                "status": "processing",
            }
        )
        .execute()
    )
    document = doc_res.data[0]

    try:
        text = extract_text(file_bytes, file.filename or "")
        chunks = chunk_text(text)

        if not chunks:
            raise ValueError("No extractable text found in document")

        embeddings = embed_texts(chunks)
        supabase.table("document_chunks").insert(
            [
                {
                    "document_id": document["id"],
                    "card_id": card_id,
                    "chunk_index": i,
                    "chunk_text": chunk,
                    "embedding": embedding,
                }
                for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
            ]
        ).execute()

        supabase.table("card_documents").update({"status": "ready"}).eq("id", document["id"]).execute()
        document["status"] = "ready"
    except Exception:
        supabase.table("card_documents").update({"status": "error"}).eq("id", document["id"]).execute()
        document["status"] = "error"

    return CardDocument(
        id=document["id"],
        card_id=document["card_id"],
        file_name=document["file_name"],
        file_size_kb=document["file_size_kb"],
        status=document["status"],
        uploaded_at=document["uploaded_at"],
    )


@router.delete("/{document_id}", status_code=204, dependencies=[Depends(verify_admin_token)])
def delete_document(card_id: str, document_id: str):
    supabase = get_supabase()
    doc = supabase.table("card_documents").select("storage_path").eq("id", document_id).execute()
    if not doc.data:
        raise HTTPException(status_code=404, detail="Document not found")

    settings = get_settings()
    supabase.storage.from_(settings.supabase_storage_bucket).remove([doc.data[0]["storage_path"]])
    supabase.table("card_documents").delete().eq("id", document_id).execute()
