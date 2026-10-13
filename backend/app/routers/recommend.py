import json

from fastapi import APIRouter, HTTPException

from app.schemas import CardComparison, RecommendRequest, RecommendResponse
from app.services.gemini_client import embed_texts, generate_json
from app.services.supabase_client import get_supabase

router = APIRouter(prefix="/recommend", tags=["recommend"])


@router.post("", response_model=RecommendResponse)
def recommend(body: RecommendRequest):
    if body.reward_preference not in ("cashback", "points"):
        raise HTTPException(status_code=422, detail="reward_preference must be 'cashback' or 'points'")

    supabase = get_supabase()

    user_cards_res = (
        supabase.table("user_cards").select("card_id").eq("session_id", body.session_id).execute()
    )
    card_ids = [row["card_id"] for row in user_cards_res.data]
    if not card_ids:
        raise HTTPException(status_code=400, detail="No cards selected for this session")

    cards_res = supabase.table("cards").select("*").in_("id", card_ids).execute()
    cards_by_id = {row["id"]: row for row in cards_res.data}

    mode_label = f"{body.mode} " if body.mode else ""
    merchant_label = f" on {body.merchant}" if body.merchant else ""
    query = f"Best card for a {mode_label}{body.category} payment of {body.amount}{merchant_label}, {body.reward_preference} rewards"
    [query_embedding] = embed_texts([query])

    chunks_res = supabase.rpc(
        "match_document_chunks",
        {"query_embedding": query_embedding, "card_ids": card_ids, "match_count": 8},
    ).execute()
    retrieved_chunks = chunks_res.data or []

    if not retrieved_chunks:
        return RecommendResponse(card=None)

    context_parts = [
        f"Doc excerpt for {cards_by_id.get(chunk['card_id'], {}).get('name')}: {chunk['chunk_text']}"
        for chunk in retrieved_chunks
    ]
    context = "\n\n".join(context_parts)
    card_names = ", ".join(f"{c['name']} ({c['id']})" for c in cards_by_id.values())

    preference_label = "cashback" if body.reward_preference == "cashback" else "reward points"

    system_prompt = (
        "You recommend the single best credit card for a payment, using only the provided "
        "document context. The user has said they prefer "
        f"{preference_label} for this payment. Strongly prefer a card whose benefit for this "
        "category matches that preference. If none of the user's cards offer that preferred "
        "reward type for this category, still recommend the single best overall card and "
        "clearly say in the explanation that none of their cards earn the preferred reward "
        "type here, so you picked the next best option instead.\n\n"
        "IMPORTANT: The payment mode (online or offline) is critical. Only consider rewards "
        "that apply to the stated mode. For example, if mode=online, ignore offline-only cashback "
        "rates and look for online/e-commerce/app-specific rewards. If a merchant/app is specified, "
        "prioritise any merchant-specific or platform-specific rewards mentioned in the context "
        "(e.g. extra cashback on Swiggy, Amazon, Zomato). Never recommend an offline benefit for "
        "an online payment or vice versa.\n\n"
        "Respond as JSON with exactly these keys: "
        '{"card_id": string, "reward_type": "cashback" | "points", "rate_description": string, '
        '"points_earned": number or null, "point_value_inr": number or null, "explanation": string, '
        '"source_quote": string or null, "comparison": array}.\n'
        "- card_id must be one of the user's card ids.\n"
        "- reward_type is whichever the chosen card actually earns for this category (cashback or points), "
        "not necessarily the user's preference.\n"
        "- rate_description is a short human-readable rate, e.g. '5% cashback' or '4 points per ₹150 spent'.\n"
        "- points_earned: only fill this in if reward_type is 'points' AND the context gives enough information "
        "to compute how many points this exact payment would earn. Otherwise null.\n"
        "- point_value_inr: only fill this in if the context explicitly states a points-to-rupee redemption rate "
        "for this card. Never estimate or guess a rate. Otherwise null.\n"
        "- source_quote must be the exact sentence (or short span), copied verbatim character-for-character from "
        "the context above, that justifies the reward rate/points/value you used for this decision. Do not "
        "paraphrase or summarize. If you relied on multiple sentences, quote the single most decisive one. If "
        "no card had any relevant document context to quote from, set this to null.\n"
        "- comparison must be an array with one entry per user card (ALL of them, including the recommended one). "
        f"Each entry: {{\"card_id\": string, \"rate_description\": string or null, \"computed_reward\": string or null}}. "
        "rate_description: a very short rate label from the context (e.g. '5% CashPoints', '1% cashback', '3x points'). "
        "Never copy raw sentences from the document — extract only the rate number/label. "
        f"computed_reward: the actual reward this card earns for this specific payment of {body.amount}, "
        "calculated from the rate — e.g. '₹100 cashback', '100 pts', '60 miles'. "
        "If no rate info exists for this card for this category, set both to null.\n"
        "- If none of the cards has a clear benefit at all, pick the lowest-fee card and say so in the explanation."
    )
    payment_details = f"amount=₹{body.amount}, category={body.category}, mode={body.mode or 'unspecified'}"
    if body.merchant:
        payment_details += f", merchant/app={body.merchant}"
    payment_details += f", preferred reward type={body.reward_preference}"

    user_prompt = (
        f"User's cards: {card_names}\n"
        f"Payment: {payment_details}\n\n"
        f"Context:\n{context}"
    )

    raw_response = generate_json(system_prompt, user_prompt)
    result = json.loads(raw_response)
    chosen_card = cards_by_id.get(result.get("card_id"))
    if not chosen_card:
        raise HTTPException(status_code=502, detail="Recommendation engine returned an unknown card")

    reward_type = result.get("reward_type")
    rate_description = result.get("rate_description", "")
    points_earned = result.get("points_earned")
    point_value_inr = result.get("point_value_inr")

    estimated_reward = None
    if reward_type == "cashback":
        rate_digits = "".join(ch for ch in rate_description if ch.isdigit() or ch == ".")
        if rate_digits:
            estimated_reward = f"₹{round((float(rate_digits) / 100) * body.amount):,} est. value"
    elif reward_type == "points" and isinstance(points_earned, (int, float)) and isinstance(point_value_inr, (int, float)):
        estimated_reward = f"₹{round(points_earned * point_value_inr):,} est. value"

    raw_comparison = result.get("comparison") or []
    comparison = [
        CardComparison(
            card_id=entry["card_id"],
            issuer=cards_by_id[entry["card_id"]]["issuer"],
            name=cards_by_id[entry["card_id"]]["name"],
            gradient=cards_by_id[entry["card_id"]]["gradient"],
            network=cards_by_id[entry["card_id"]]["network"],
            rate_description=entry.get("rate_description"),
            computed_reward=entry.get("computed_reward"),
        )
        for entry in raw_comparison
        if isinstance(entry, dict) and entry.get("card_id") in cards_by_id
    ]

    return RecommendResponse(
        card={
            "id": chosen_card["id"],
            "issuer": chosen_card["issuer"],
            "name": chosen_card["name"],
            "network": chosen_card["network"],
            "gradient": chosen_card["gradient"],
            "annual_fee": chosen_card["annual_fee"],
            "rewards": [],
        },
        reward_rate=rate_description,
        explanation=result.get("explanation"),
        source_quote=result.get("source_quote"),
        estimated_reward=estimated_reward,
        points_earned=points_earned if isinstance(points_earned, (int, float)) else None,
        point_value_inr=point_value_inr if isinstance(point_value_inr, (int, float)) else None,
        comparison=comparison,
    )
