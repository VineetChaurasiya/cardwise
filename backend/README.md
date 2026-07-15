# CardWise backend

FastAPI + Supabase (Postgres/pgvector) + Google Gemini.

## Setup

1. Create a Supabase project at supabase.com.
2. In the SQL editor, run `migrations/001_init.sql`, then `migrations/002_gemini_embeddings.sql`
   (enables pgvector, creates all tables, sets the embedding column to Gemini's 768 dimensions).
3. In Storage, create a bucket named `card-documents` (or update `SUPABASE_STORAGE_BUCKET`).
4. Get a free Gemini API key at https://aistudio.google.com/apikey.
5. Copy `.env.example` to `.env` and fill in:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (Project Settings → API → service_role key)
   - `GEMINI_API_KEY`
6. Install deps and seed the card catalog:
   ```
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   python seed.py
   ```
7. Run the API:
   ```
   uvicorn app.main:app --reload --port 8000
   ```

API docs available at `http://localhost:8000/docs`.
