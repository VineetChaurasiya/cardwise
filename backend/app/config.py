from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str
    supabase_service_key: str
    supabase_storage_bucket: str = "card-documents"

    gemini_api_key: str
    gemini_embedding_model: str = "models/gemini-embedding-001"
    gemini_chat_model: str = "gemini-3.1-flash-lite"

    cors_origins: str = "http://localhost:5173"

    admin_password: str = "admin"
    jwt_secret: str = "change-me"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
