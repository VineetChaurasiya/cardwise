from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.config import get_settings
from app.routers import admin_auth, cards, documents, recommend, sessions

settings = get_settings()

app = FastAPI(title="CardWise API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_private_network_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Private-Network"] = "true"
    return response

app.include_router(admin_auth.router, prefix="/api")
app.include_router(cards.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(recommend.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
