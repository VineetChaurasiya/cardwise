import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings

_bearer = HTTPBearer(auto_error=False)

TOKEN_EXPIRY_HOURS = 12


def create_admin_token() -> str:
    settings = get_settings()
    payload = {
        "sub": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def verify_admin_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(_bearer),
) -> None:
    settings = get_settings()
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def check_admin_password(password: str) -> bool:
    settings = get_settings()
    return secrets.compare_digest(password, settings.admin_password)
