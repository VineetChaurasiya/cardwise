import re

from fastapi import APIRouter, Depends, HTTPException

from app.config import get_settings
from app.schemas import CreateCardRequest, CreditCard, RewardRule
from app.services.auth import verify_admin_token
from app.services.supabase_client import get_supabase

router = APIRouter(prefix="/cards", tags=["cards"])


def _slugify(issuer: str, name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", f"{issuer}-{name}".lower()).strip("-")
    return slug or "card"


@router.get("", response_model=list[CreditCard])
def list_cards():
    supabase = get_supabase()
    cards_res = supabase.table("cards").select("*").execute()
    rules_res = supabase.table("reward_rules").select("*").execute()

    rules_by_card: dict[str, list[RewardRule]] = {}
    for row in rules_res.data:
        rules_by_card.setdefault(row["card_id"], []).append(
            RewardRule(category=row["category"], reward_rate=row["reward_rate"], note=row["note"])
        )

    return [
        CreditCard(
            id=row["id"],
            issuer=row["issuer"],
            name=row["name"],
            network=row["network"],
            gradient=row["gradient"],
            annual_fee=row["annual_fee"],
            rewards=rules_by_card.get(row["id"], []),
        )
        for row in cards_res.data
    ]


@router.post("", response_model=CreditCard, status_code=201, dependencies=[Depends(verify_admin_token)])
def create_card(body: CreateCardRequest):
    supabase = get_supabase()

    name = body.name.strip()
    existing_name = supabase.table("cards").select("id").ilike("name", name).execute()
    if existing_name.data:
        raise HTTPException(status_code=409, detail=f"A card named '{name}' already exists")

    base_slug = _slugify(body.issuer, name)
    slug = base_slug
    suffix = 2
    while supabase.table("cards").select("id").eq("id", slug).execute().data:
        slug = f"{base_slug}-{suffix}"
        suffix += 1

    if body.network not in ("Visa", "Mastercard", "Amex", "RuPay"):
        raise HTTPException(status_code=422, detail="network must be one of Visa, Mastercard, Amex, RuPay")

    supabase.table("cards").insert(
        {
            "id": slug,
            "issuer": body.issuer,
            "name": name,
            "network": body.network,
            "gradient": body.gradient,
            "annual_fee": body.annual_fee,
        }
    ).execute()

    return CreditCard(
        id=slug,
        issuer=body.issuer,
        name=name,
        network=body.network,
        gradient=body.gradient,
        annual_fee=body.annual_fee,
        rewards=[],
    )


@router.put("/{card_id}", response_model=CreditCard, dependencies=[Depends(verify_admin_token)])
def update_card(card_id: str, body: CreateCardRequest):
    supabase = get_supabase()

    existing = supabase.table("cards").select("*").eq("id", card_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Card not found")

    if body.network not in ("Visa", "Mastercard", "Amex", "RuPay"):
        raise HTTPException(status_code=422, detail="network must be one of Visa, Mastercard, Amex, RuPay")

    name = body.name.strip()
    duplicate = supabase.table("cards").select("id").ilike("name", name).neq("id", card_id).execute()
    if duplicate.data:
        raise HTTPException(status_code=409, detail=f"A card named '{name}' already exists")

    supabase.table("cards").update(
        {
            "issuer": body.issuer,
            "name": name,
            "network": body.network,
            "gradient": body.gradient,
            "annual_fee": body.annual_fee,
        }
    ).eq("id", card_id).execute()

    rules_res = supabase.table("reward_rules").select("*").eq("card_id", card_id).execute()
    rewards = [
        RewardRule(category=r["category"], reward_rate=r["reward_rate"], note=r["note"]) for r in rules_res.data
    ]

    return CreditCard(
        id=card_id,
        issuer=body.issuer,
        name=name,
        network=body.network,
        gradient=body.gradient,
        annual_fee=body.annual_fee,
        rewards=rewards,
    )


@router.delete("/{card_id}", status_code=204, dependencies=[Depends(verify_admin_token)])
def delete_card(card_id: str):
    supabase = get_supabase()

    existing = supabase.table("cards").select("id").eq("id", card_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Card not found")

    docs = supabase.table("card_documents").select("storage_path").eq("card_id", card_id).execute()
    if docs.data:
        settings = get_settings()
        paths = [d["storage_path"] for d in docs.data]
        supabase.storage.from_(settings.supabase_storage_bucket).remove(paths)

    supabase.table("cards").delete().eq("id", card_id).execute()
