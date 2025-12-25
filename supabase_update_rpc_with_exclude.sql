-- =====================================================
-- UPDATE: Add exclude_ids parameter to RPC function
-- =====================================================
-- Execute this SQL in your Supabase SQL Editor
-- This updates the existing get_questions_by_categories function
-- to exclude already cached question IDs
-- =====================================================

DROP FUNCTION IF EXISTS public.get_questions_by_categories(text[], text, integer);

CREATE OR REPLACE FUNCTION public.get_questions_by_categories(
  p_categories text[],
  p_lang text DEFAULT 'en',
  p_limit integer DEFAULT 10,
  p_exclude_ids text[] DEFAULT ARRAY[]::text[]  -- NEW: IDs to exclude
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
  v_level1_count integer;
  v_level2_count integer;
  v_level3_count integer;
  v_level4_count integer;
  v_level5_count integer;
  v_total_assigned integer;
BEGIN
  -- Calculate question distribution by difficulty level
  v_level1_count := GREATEST(1, ROUND(p_limit * 0.20));
  v_level2_count := GREATEST(1, ROUND(p_limit * 0.25));
  v_level3_count := GREATEST(1, ROUND(p_limit * 0.25));
  v_level4_count := GREATEST(1, ROUND(p_limit * 0.25));
  v_level5_count := GREATEST(1, ROUND(p_limit * 0.05));

  v_total_assigned := v_level1_count + v_level2_count + v_level3_count + v_level4_count + v_level5_count;

  -- Adjust to match exact p_limit
  WHILE v_total_assigned > p_limit LOOP
    IF v_level2_count > 1 AND v_total_assigned > p_limit THEN
      v_level2_count := v_level2_count - 1;
      v_total_assigned := v_total_assigned - 1;
    ELSIF v_level3_count > 1 AND v_total_assigned > p_limit THEN
      v_level3_count := v_level3_count - 1;
      v_total_assigned := v_total_assigned - 1;
    ELSIF v_level4_count > 1 AND v_total_assigned > p_limit THEN
      v_level4_count := v_level4_count - 1;
      v_total_assigned := v_total_assigned - 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  WHILE v_total_assigned < p_limit LOOP
    IF v_total_assigned < p_limit THEN
      v_level2_count := v_level2_count + 1;
      v_total_assigned := v_total_assigned + 1;
    END IF;
    IF v_total_assigned < p_limit THEN
      v_level3_count := v_level3_count + 1;
      v_total_assigned := v_total_assigned + 1;
    END IF;
    IF v_total_assigned < p_limit THEN
      v_level4_count := v_level4_count + 1;
      v_total_assigned := v_total_assigned + 1;
    END IF;
  END LOOP;

  -- Step 1: Get question IDs filtered by categories (or all if empty)
  -- IMPORTANT: Exclude cached IDs passed in p_exclude_ids
  IF array_length(p_categories, 1) > 0 THEN
    SELECT array_agg(DISTINCT qc.question_id)
    INTO v_question_ids
    FROM quiz.question_categories qc
    WHERE qc.category_id = ANY(p_categories)
      AND qc.question_id::text != ALL(p_exclude_ids);  -- NEW: Exclude cached IDs
  ELSE
    SELECT array_agg(DISTINCT q.id)
    INTO v_question_ids
    FROM quiz.questions q
    WHERE q.id::text != ALL(p_exclude_ids);  -- NEW: Exclude cached IDs
  END IF;

  -- Step 2: Return error if no questions found
  IF v_question_ids IS NULL OR array_length(v_question_ids, 1) = 0 THEN
    RAISE EXCEPTION 'No questions found for the selected categories (or all questions are cached)';
  END IF;

  -- Step 3: Select random questions by difficulty level
  RETURN QUERY
  WITH difficulty_questions AS (
    -- Level 1 questions
    (
      SELECT DISTINCT ON (q.id)
        q.id as qid,
        1 as difficulty,
        qt.text as question_text,
        qc.category_id,
        random() as rand_order
      FROM quiz.questions q
      INNER JOIN quiz.question_translations qt ON qt.question_id = q.id
      LEFT JOIN quiz.question_categories qc ON qc.question_id = q.id
      WHERE q.id = ANY(v_question_ids)
        AND q.difficulty = 1
        AND qt.lang = p_lang
      ORDER BY q.id, random()
      LIMIT v_level1_count
    )
    UNION ALL
    -- Level 2 questions
    (
      SELECT DISTINCT ON (q.id)
        q.id as qid,
        2 as difficulty,
        qt.text as question_text,
        qc.category_id,
        random() as rand_order
      FROM quiz.questions q
      INNER JOIN quiz.question_translations qt ON qt.question_id = q.id
      LEFT JOIN quiz.question_categories qc ON qc.question_id = q.id
      WHERE q.id = ANY(v_question_ids)
        AND q.difficulty = 2
        AND qt.lang = p_lang
      ORDER BY q.id, random()
      LIMIT v_level2_count
    )
    UNION ALL
    -- Level 3 questions
    (
      SELECT DISTINCT ON (q.id)
        q.id as qid,
        3 as difficulty,
        qt.text as question_text,
        qc.category_id,
        random() as rand_order
      FROM quiz.questions q
      INNER JOIN quiz.question_translations qt ON qt.question_id = q.id
      LEFT JOIN quiz.question_categories qc ON qc.question_id = q.id
      WHERE q.id = ANY(v_question_ids)
        AND q.difficulty = 3
        AND qt.lang = p_lang
      ORDER BY q.id, random()
      LIMIT v_level3_count
    )
    UNION ALL
    -- Level 4 questions
    (
      SELECT DISTINCT ON (q.id)
        q.id as qid,
        4 as difficulty,
        qt.text as question_text,
        qc.category_id,
        random() as rand_order
      FROM quiz.questions q
      INNER JOIN quiz.question_translations qt ON qt.question_id = q.id
      LEFT JOIN quiz.question_categories qc ON qc.question_id = q.id
      WHERE q.id = ANY(v_question_ids)
        AND q.difficulty = 4
        AND qt.lang = p_lang
      ORDER BY q.id, random()
      LIMIT v_level4_count
    )
    UNION ALL
    -- Level 5 questions
    (
      SELECT DISTINCT ON (q.id)
        q.id as qid,
        5 as difficulty,
        qt.text as question_text,
        qc.category_id,
        random() as rand_order
      FROM quiz.questions q
      INNER JOIN quiz.question_translations qt ON qt.question_id = q.id
      LEFT JOIN quiz.question_categories qc ON qc.question_id = q.id
      WHERE q.id = ANY(v_question_ids)
        AND q.difficulty = 5
        AND qt.lang = p_lang
      ORDER BY q.id, random()
      LIMIT v_level5_count
    )
  ),
  question_options AS (
    SELECT
      o.question_id::text as question_id,
      o.option_key,
      o.is_correct,
      ot.text as option_text
    FROM quiz.options o
    INNER JOIN quiz.option_translations ot ON ot.option_id = o.id
    WHERE o.question_id IN (SELECT qid FROM difficulty_questions)
      AND ot.lang = p_lang
    ORDER BY o.question_id, o.option_key
  )
  SELECT
    dq.qid::text as id,
    dq.question_text,
    ARRAY(
      SELECT qo.option_text
      FROM question_options qo
      WHERE qo.question_id = dq.qid::text
      ORDER BY qo.option_key
    ) as options,
    COALESCE((
      SELECT ARRAY_POSITION(
        ARRAY(SELECT qo.option_key FROM question_options qo WHERE qo.question_id = dq.qid::text ORDER BY qo.option_key),
        (SELECT qo.option_key FROM question_options qo WHERE qo.question_id = dq.qid::text AND qo.is_correct LIMIT 1)
      ) - 1
    ), 0) as correct_answer_index,
    dq.difficulty,
    COALESCE(dq.category_id, '') as category_id
  FROM difficulty_questions dq
  ORDER BY dq.difficulty ASC, dq.rand_order;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_questions_by_categories(text[], text, integer, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_questions_by_categories(text[], text, integer, text[]) TO anon;

-- =====================================================
-- Test Examples
-- =====================================================

-- Test 1: Fetch questions without exclusions (old behavior)
-- SELECT * FROM get_questions_by_categories(ARRAY['art', 'science'], 'en', 5);

-- Test 2: Fetch questions excluding specific IDs
-- SELECT * FROM get_questions_by_categories(
--   ARRAY['art', 'science'],
--   'en',
--   5,
--   ARRAY['question-id-1', 'question-id-2']  -- Exclude these IDs
-- );

-- Test 3: Verify exclusion works
-- Step 1: Get some questions
-- SELECT id FROM get_questions_by_categories(ARRAY[]::text[], 'en', 3) AS initial_questions;
-- Step 2: Use those IDs in exclude list
-- SELECT id FROM get_questions_by_categories(
--   ARRAY[]::text[],
--   'en',
--   3,
--   ARRAY['id-from-step-1', 'id-from-step-1']
-- );
-- Should return DIFFERENT questions

-- =====================================================
-- Verify function was updated
-- =====================================================
-- SELECT routine_name, routine_type
-- FROM information_schema.routines
-- WHERE routine_schema = 'public'
--   AND routine_name = 'get_questions_by_categories';
