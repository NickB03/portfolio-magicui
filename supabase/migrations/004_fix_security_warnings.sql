-- Fix Supabase security linter warnings:
--   1. function_search_path_mutable — pin search_path on search_knowledge()
--   2. extension_in_public — move vector extension to extensions schema
--
-- NOTE: Warning 3 (auth_leaked_password_protection) is a dashboard setting:
--   Supabase Dashboard → Authentication → Settings → Password Security
--   Enable "Leaked password protection"

-- Ensure the extensions schema exists (Supabase projects have it by default)
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop the function first (it depends on the vector type signature)
DROP FUNCTION IF EXISTS public.search_knowledge(vector(3072), float, int);

-- Move the vector extension to extensions schema in-place (preserves dependent columns)
ALTER EXTENSION vector SET SCHEMA extensions;

-- After moving the extension, vector type lives in extensions schema.
-- Set session search_path so DDL statements below can resolve the vector type.
SET search_path TO public, extensions;

-- Recreate the function with a pinned search_path that includes both
-- public (for table access) and extensions (for the vector type and operators).
-- Pinning the path satisfies the function_search_path_mutable linter check.
CREATE OR REPLACE FUNCTION public.search_knowledge(
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
SET search_path = 'public', 'extensions'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    public.knowledge_chunks.id,
    public.knowledge_chunks.content,
    public.knowledge_chunks.metadata,
    1 - (public.knowledge_chunks.embedding <=> query_embedding) as similarity
  FROM public.knowledge_chunks
  WHERE 1 - (public.knowledge_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY public.knowledge_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Re-grant execute permissions
GRANT EXECUTE ON FUNCTION public.search_knowledge(vector(3072), float, int) TO anon, authenticated;
