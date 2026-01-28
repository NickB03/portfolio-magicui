-- Vector Store for AI Chat RAG
-- Enables pgvector and creates knowledge chunks table

-- Enable vector extension
create extension if not exists vector;

-- Knowledge base chunks table
create table if not exists knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  metadata jsonb default '{}',
  embedding vector(768),  -- Gemini text-embedding-004 dimension
  created_at timestamptz default now()
);

-- Create index for vector similarity search
-- Using IVFFlat for good balance of speed and accuracy
create index if not exists knowledge_chunks_embedding_idx 
  on knowledge_chunks 
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Enable RLS
alter table knowledge_chunks enable row level security;

-- Public read access (anyone can query the knowledge base)
create policy "Public read access for knowledge_chunks" 
  on knowledge_chunks for select using (true);

-- Function to search knowledge base by embedding similarity
create or replace function search_knowledge(
  query_embedding vector(768),
  match_threshold float default 0.5,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    knowledge_chunks.id,
    knowledge_chunks.content,
    knowledge_chunks.metadata,
    1 - (knowledge_chunks.embedding <=> query_embedding) as similarity
  from knowledge_chunks
  where 1 - (knowledge_chunks.embedding <=> query_embedding) > match_threshold
  order by knowledge_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Grant execute permission on the function
grant execute on function search_knowledge(vector(768), float, int) to anon, authenticated;
