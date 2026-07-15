from fastapi import APIRouter, HTTPException

from app.schemas import SessionCreateResponse, UserCardsUpdateRequest
from app.services.supabase_client import get_supabase

router = APIRouter(prefix="/session", tags=["session"])


@router.post("", response_model=SessionCreateResponse)
def create_session():
    supabase = get_supabase()
    res = supabase.table("user_sessions").insert({}).execute()
    return SessionCreateResponse(session_id=res.data[0]["id"])


@router.get("/{session_id}/cards", response_model=list[str])
def get_user_cards(session_id: str):
    supabase = get_supabase()
    res = supabase.table("user_cards").select("card_id").eq("session_id", session_id).execute()
    return [row["card_id"] for row in res.data]


@router.put("/{session_id}/cards", response_model=list[str])
def set_user_cards(session_id: str, body: UserCardsUpdateRequest):
    supabase = get_supabase()

    session_check = supabase.table("user_sessions").select("id").eq("id", session_id).execute()
    if not session_check.data:
        raise HTTPException(status_code=404, detail="Session not found")

    supabase.table("user_cards").delete().eq("session_id", session_id).execute()
    if body.card_ids:
        supabase.table("user_cards").insert(
            [{"session_id": session_id, "card_id": card_id} for card_id in body.card_ids]
        ).execute()

    return body.card_ids
