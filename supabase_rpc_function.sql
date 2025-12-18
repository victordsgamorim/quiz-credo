-- =====================================================
-- RPC Function to fetch questions from quiz schema
-- =====================================================
-- Execute this SQL in your Supabase SQL Editor
-- This function allows the REST API to access the quiz schema
-- =====================================================
-- IMPORTANT: Run this complete script to DROP and CREATE the function
-- =====================================================

DROP FUNCTION IF EXISTS public.get_questions_by_categories(text[], text, integer);

CREATE OR REPLACE FUNCTION public.get_questions_by_categories(
  p_categories text[],
  p_lang text DEFAULT 'en',
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  id text,
  question_text text,
  options text[],
  correct_answer_index integer,
  difficulty integer,
  category_id text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = quiz, public
AS $$
DECLARE
  v_question_ids uuid[];
BEGIN
  -- Step 1: Get question IDs filtered by categories (or all if empty)
  IF array_length(p_categories, 1) > 0 THEN
    SELECT array_agg(DISTINCT qc.question_id)
    INTO v_question_ids
    FROM quiz.question_categories qc
    WHERE qc.category_id = ANY(p_categories);
  ELSE
    SELECT array_agg(DISTINCT q.id)
    INTO v_question_ids
    FROM quiz.questions q;
  END IF;

  -- Step 2: Return error if no questions found
  IF v_question_ids IS NULL OR array_length(v_question_ids, 1) = 0 THEN
    RAISE EXCEPTION 'No questions found for the selected categories';
  END IF;

  -- Step 3: Select random questions and return them with translations
  RETURN QUERY
  WITH random_questions AS (
    SELECT
      q.id as qid,
      q.difficulty::integer as difficulty,
      qt.text as question_text,
      qc.category_id
    FROM quiz.questions q
    INNER JOIN quiz.question_translations qt ON qt.question_id = q.id
    LEFT JOIN quiz.question_categories qc ON qc.question_id = q.id
    WHERE q.id = ANY(v_question_ids)
      AND qt.lang = p_lang
    ORDER BY random()
    LIMIT p_limit
  ),
  question_options AS (
    SELECT
      o.question_id::text as question_id,
      o.option_key,
      o.is_correct,
      ot.text as option_text
    FROM quiz.options o
    INNER JOIN quiz.option_translations ot ON ot.option_id = o.id
    WHERE o.question_id IN (SELECT qid FROM random_questions)
      AND ot.lang = p_lang
    ORDER BY o.question_id, o.option_key
  )
  SELECT
    rq.qid::text as id,
    rq.question_text,
    ARRAY(
      SELECT qo.option_text
      FROM question_options qo
      WHERE qo.question_id = rq.qid::text
      ORDER BY qo.option_key
    ) as options,
    COALESCE((
      SELECT ARRAY_POSITION(
        ARRAY(SELECT qo.option_key FROM question_options qo WHERE qo.question_id = rq.qid::text ORDER BY qo.option_key),
        (SELECT qo.option_key FROM question_options qo WHERE qo.question_id = rq.qid::text AND qo.is_correct LIMIT 1)
      ) - 1
    ), 0) as correct_answer_index,
    rq.difficulty,
    COALESCE(rq.category_id, '') as category_id
  FROM random_questions rq;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_questions_by_categories(text[], text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_questions_by_categories(text[], text, integer) TO anon;

-- Example usage:
-- SELECT * FROM get_questions_by_categories(ARRAY['art', 'science'], 'en', 10);
-- SELECT * FROM get_questions_by_categories(ARRAY[]::text[], 'pt', 5);
