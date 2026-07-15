from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.auth import check_admin_password, create_admin_token

router = APIRouter(prefix="/admin", tags=["admin"])


class LoginRequest(BaseModel):
    password: str


class TokenResponse(BaseModel):
    token: str


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    if not check_admin_password(body.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return TokenResponse(token=create_admin_token())
