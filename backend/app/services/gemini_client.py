import time
from functools import lru_cache

import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted

from app.config import get_settings

EMBED_BATCH_SIZE = 20
EMBED_BATCH_DELAY_SECONDS = 2
EMBED_MAX_RETRIES = 3


@lru_cache
def _configure() -> None:
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)


def _embed_batch_with_retry(batch: list[str], model: str) -> list[list[float]]:
    for attempt in range(EMBED_MAX_RETRIES):
        try:
            result = genai.embed_content(model=model, content=batch, output_dimensionality=768)
            return result["embedding"]
        except ResourceExhausted:
            if attempt == EMBED_MAX_RETRIES - 1:
                raise
            time.sleep(20 * (attempt + 1))
    raise AssertionError("unreachable")


def embed_texts(texts: list[str]) -> list[list[float]]:
    _configure()
    settings = get_settings()
    if not texts:
        return []

    embeddings: list[list[float]] = []
    for i in range(0, len(texts), EMBED_BATCH_SIZE):
        batch = texts[i : i + EMBED_BATCH_SIZE]
        embeddings.extend(_embed_batch_with_retry(batch, settings.gemini_embedding_model))
        if i + EMBED_BATCH_SIZE < len(texts):
            time.sleep(EMBED_BATCH_DELAY_SECONDS)
    return embeddings


def generate_json(system_prompt: str, user_prompt: str) -> str:
    _configure()
    settings = get_settings()
    model = genai.GenerativeModel(settings.gemini_chat_model, system_instruction=system_prompt)
    response = model.generate_content(
        user_prompt,
        generation_config=genai.GenerationConfig(response_mime_type="application/json"),
    )
    return response.text
