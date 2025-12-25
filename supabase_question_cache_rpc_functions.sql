-- =====================================================
-- RPC Functions for Question Cache Operations
-- =====================================================
-- Execute this SQL in your Supabase SQL Editor
-- These functions allow the frontend to interact with the cache table
-- =====================================================

-- =====================================================
-- Function 1: Add questions to cache (batch insert)
-- =====================================================
CREATE OR REPLACE FUNCTION public.cache_user_questions(
  p_question_ids text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = quiz, public
AS $$
DECLARE
  v_question_id text;
BEGIN
  -- Insert each question ID into the cache
  -- ON CONFLICT DO NOTHING prevents duplicates (user_id + question_id is UNIQUE)
  FOREACH v_question_id IN ARRAY p_question_ids
  LOOP
    INSERT INTO quiz.user_question_cache (user_id, question_id)
    VALUES (auth.uid(), v_question_id)
    ON CONFLICT (user_id, question_id) DO NOTHING;
  END LOOP;
END;
$$;

-- =====================================================
-- Function 2: Get cached question IDs for current user
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_cached_question_ids()
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = quiz, public
AS $$
DECLARE
  v_question_ids text[];
BEGIN
  -- Get all non-expired question IDs for the current user
  SELECT ARRAY_AGG(question_id)
  INTO v_question_ids
  FROM quiz.user_question_cache
  WHERE user_id = auth.uid()
    AND expires_at > now();

  -- Return empty array if no questions found
  RETURN COALESCE(v_question_ids, ARRAY[]::text[]);
END;
$$;

-- =====================================================
-- Function 3: Clear cache for current user
-- =====================================================
CREATE OR REPLACE FUNCTION public.clear_user_question_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = quiz, public
AS $$
BEGIN
  DELETE FROM quiz.user_question_cache
  WHERE user_id = auth.uid();
END;
$$;

-- =====================================================
-- Function 4: Get cache statistics for current user
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_cache_stats()
RETURNS TABLE (
  total integer,
  valid integer,
  expired integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = quiz, public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::integer as total,
    COUNT(*) FILTER (WHERE expires_at > now())::integer as valid,
    COUNT(*) FILTER (WHERE expires_at <= now())::integer as expired
  FROM quiz.user_question_cache
  WHERE user_id = auth.uid();
END;
$$;

-- =====================================================
-- Grant permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION public.cache_user_questions(text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cached_question_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_user_question_cache() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_cache_stats() TO authenticated;

-- =====================================================
-- Test Examples
-- =====================================================

-- Test 1: Cache some questions
-- SELECT cache_user_questions(ARRAY['q1', 'q2', 'q3']);

-- Test 2: Get cached IDs
-- SELECT get_cached_question_ids();
-- Should return: {q1,q2,q3}

-- Test 3: Try to cache duplicate (should be ignored)
-- SELECT cache_user_questions(ARRAY['q1', 'q4']);
-- SELECT get_cached_question_ids();
-- Should return: {q1,q2,q3,q4} (q1 not duplicated)

-- Test 4: Get cache stats
-- SELECT * FROM get_user_cache_stats();
-- Should return: total=4, valid=4, expired=0

-- Test 5: Clear cache
-- SELECT clear_user_question_cache();
-- SELECT get_cached_question_ids();
-- Should return: {} (empty array)

-- =====================================================
-- Verify functions were created
-- =====================================================
-- SELECT routine_name, routine_type
-- FROM information_schema.routines
-- WHERE routine_schema = 'public'
--   AND routine_name IN (
--     'cache_user_questions',
--     'get_cached_question_ids',
--     'clear_user_question_cache',
--     'get_user_cache_stats'
--   );
