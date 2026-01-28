-- Update vector dimension for gemini-embedding-001 (3072 dimensions)

-- Drop the old function first
DROP FUNCTION IF EXISTS search_knowledge(vector(768), float, int);

-- Drop the old index BEFORE altering column
DROP INDEX IF EXISTS knowledge_chunks_embedding_idx;

-- Alter the column type
ALTER TABLE knowledge_chunks ALTER COLUMN embedding TYPE vector(3072);

-- NOTE: Cannot index vectors with >2000 dimensions in pgvector with ivfflat/hnsw (default build).
-- Since the dataset is small (<1000 rows), sequential scan is fast enough.
-- We explicitly DO NOT create an index here.

-- Recreate the function with new dimension
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(3072),
  match_threshold float default 0.5,
  match_count int default 5
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_chunks.id,
    knowledge_chunks.content,
    knowledge_chunks.metadata,
    1 - (knowledge_chunks.embedding <=> query_embedding) as similarity
  FROM knowledge_chunks
  WHERE 1 - (knowledge_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_knowledge(vector(3072), float, int) TO anon, authenticated;
