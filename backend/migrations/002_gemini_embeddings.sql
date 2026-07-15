-- Switch embedding dimension from OpenAI (1536) to Gemini text-embedding-004 (768).
-- Safe to run even if document_chunks is empty.

drop index if exists document_chunks_embedding_idx;

alter table document_chunks
  alter column embedding type vector(768);

create index document_chunks_embedding_idx on document_chunks
  using hnsw (embedding vector_cosine_ops);

create or replace function match_document_chunks(
  query_embedding vector(768),
  card_ids text[],
  match_count int default 8
)
returns table (
  id uuid,
  card_id text,
  chunk_text text,
  similarity float
)
language sql stable
as $$
  select
    document_chunks.id,
    document_chunks.card_id,
    document_chunks.chunk_text,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where document_chunks.card_id = any(card_ids)
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
$$;
