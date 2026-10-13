from typing import Optional

from pydantic import BaseModel


class RewardRule(BaseModel):
    category: str
    reward_rate: str
    note: str


class CreditCard(BaseModel):
    id: str
    issuer: str
    name: str
    network: str
    gradient: str
    annual_fee: str
    rewards: list[RewardRule] = []


class CreateCardRequest(BaseModel):
    issuer: str
    name: str
    network: str
    annual_fee: str
    gradient: str


class CardDocument(BaseModel):
    id: str
    card_id: str
    file_name: str
    file_size_kb: int
    status: str
    uploaded_at: str


class SessionCreateResponse(BaseModel):
    session_id: str


class UserCardsUpdateRequest(BaseModel):
    card_ids: list[str]


class RecommendRequest(BaseModel):
    session_id: str
    amount: float
    category: str
    reward_preference: str  # "cashback" or "points"
    mode: Optional[str] = None       # "online" or "offline"
    merchant: Optional[str] = None   # e.g. "Swiggy", "Amazon"


class CardComparison(BaseModel):
    card_id: str
    issuer: str
    name: str
    gradient: str
    network: str
    rate_description: Optional[str] = None
    computed_reward: Optional[str] = None


class RecommendResponse(BaseModel):
    card: Optional[CreditCard]
    reward_rate: Optional[str] = None
    explanation: Optional[str] = None
    source_quote: Optional[str] = None
    estimated_reward: Optional[str] = None
    points_earned: Optional[float] = None
    point_value_inr: Optional[float] = None
    comparison: list[CardComparison] = []
    rewards_equal: bool = False
    secondary_card: Optional[CreditCard] = None
    secondary_note: Optional[str] = None
