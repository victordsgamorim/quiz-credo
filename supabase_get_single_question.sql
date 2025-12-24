-- =====================================================
-- RPC Function to fetch a single random question
-- =====================================================
-- Execute this SQL in your Supabase SQL Editor
-- This function fetches one random question by categories and difficulty
-- =====================================================

DROP FUNCTION IF EXISTS public.get_single_random_question(text[], integer, text, text[]);

CREATE OR REPLACE FUNCTION public.get_single_random_question(
  p_categories text[],
  p_difficulty integer DEFAULT NULL,
  p_lang text DEFAULT 'en',
  p_exclude_ids text[] DEFAULT ARRAY[]::text[]
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

  -- Step 3: Select one random question matching the criteria
  RETURN QUERY
  WITH filtered_questions AS (
    SELECT DISTINCT ON (q.id)
      q.id as qid,
      q.difficulty as diff,
      qt.text as question_text,
      qc.category_id,
      random() as rand_order
    FROM quiz.questions q
    INNER JOIN quiz.question_translations qt ON qt.question_id = q.id
    LEFT JOIN quiz.question_categories qc ON qc.question_id = q.id
    WHERE q.id = ANY(v_question_ids)
      AND qt.lang = p_lang
      -- Filter by difficulty if provided
      AND (p_difficulty IS NULL OR q.difficulty = p_difficulty)
      -- Exclude IDs from cache
      AND (array_length(p_exclude_ids, 1) IS NULL OR q.id::text != ALL(p_exclude_ids))
    ORDER BY q.id, random()
  ),
  selected_question AS (
    SELECT *
    FROM filtered_questions
    ORDER BY rand_order
    LIMIT 1
  ),
  question_options AS (
    SELECT
      o.question_id::text as question_id,
      o.option_key,
      o.is_correct,
      ot.text as option_text
    FROM quiz.options o
    INNER JOIN quiz.option_translations ot ON ot.option_id = o.id
    WHERE o.question_id IN (SELECT qid FROM selected_question)
      AND ot.lang = p_lang
    ORDER BY o.question_id, o.option_key
  )
  SELECT
    sq.qid::text as id,
    sq.question_text,
    ARRAY(
      SELECT qo.option_text
      FROM question_options qo
      WHERE qo.question_id = sq.qid::text
      ORDER BY qo.option_key
    ) as options,
    COALESCE((
      SELECT ARRAY_POSITION(
        ARRAY(SELECT qo.option_key FROM question_options qo WHERE qo.question_id = sq.qid::text ORDER BY qo.option_key),
        (SELECT qo.option_key FROM question_options qo WHERE qo.question_id = sq.qid::text AND qo.is_correct LIMIT 1)
      ) - 1
    ), 0) as correct_answer_index,
    sq.diff as difficulty,
    COALESCE(sq.category_id, '') as category_id
  FROM selected_question sq;
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.get_single_random_question(text[], integer, text, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_single_random_question(text[], integer, text, text[]) TO anon;

-- Example usage:
-- Get a random level 3 question from art category, excluding some IDs:
-- SELECT * FROM get_single_random_question(ARRAY['art'], 3, 'en', ARRAY['some-uuid-1', 'some-uuid-2']);
--
-- Get any random question from science category:
-- SELECT * FROM get_single_random_question(ARRAY['science'], NULL, 'pt', ARRAY[]::text[]);
--
-- Get any random question from any category:
-- SELECT * FROM get_single_random_question(ARRAY[]::text[], NULL, 'en', ARRAY[]::text[]);
