-- Enable pgvector
create extension if not exists vector;

create table cards (
  id text primary key,
  issuer text not null,
  name text not null,
  network text not null check (network in ('Visa', 'Mastercard', 'Amex', 'RuPay')),
  gradient text not null,
  annual_fee text not null,
  created_at timestamptz not null default now()
);

create table reward_rules (
  id uuid primary key default gen_random_uuid(),
  card_id text not null references cards(id) on delete cascade,
  category text not null,
  reward_rate text not null,
  note text not null default ''
);
create index reward_rules_card_id_idx on reward_rules(card_id);

create table card_documents (
  id uuid primary key default gen_random_uuid(),
  card_id text not null references cards(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  file_size_kb int not null,
  status text not null default 'processing' check (status in ('processing', 'ready', 'error')),
  uploaded_at timestamptz not null default now()
);
create index card_documents_card_id_idx on card_documents(card_id);

create table document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references card_documents(id) on delete cascade,
  card_id text not null references cards(id) on delete cascade,
  chunk_index int not null,
  chunk_text text not null,
  embedding vector(1536) not null
);
create index document_chunks_card_id_idx on document_chunks(card_id);
create index document_chunks_embedding_idx on document_chunks
  using hnsw (embedding vector_cosine_ops);

create table user_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table user_cards (
  session_id uuid not null references user_sessions(id) on delete cascade,
  card_id text not null references cards(id) on delete cascade,
  primary key (session_id, card_id)
);

-- Vector similarity search scoped to a set of card ids
create or replace function match_document_chunks(
  query_embedding vector(1536),
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
