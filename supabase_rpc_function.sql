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
  v_level1_count integer;
  v_level2_count integer;
  v_level3_count integer;
  v_level4_count integer;
  v_level5_count integer;
  v_total_assigned integer;
BEGIN
  -- Calculate question distribution by difficulty level
  -- 15% level 1, 25% level 2, 25% level 3, 25% level 4, 10% level 5
  -- Use ROUND for smart rounding (1.5 -> 2, 1.4 -> 1, 1.6 -> 2)
  v_level1_count := GREATEST(1, ROUND(p_limit * 0.15));  -- At least 1
  v_level2_count := GREATEST(1, ROUND(p_limit * 0.25));  -- At least 1
  v_level3_count := GREATEST(1, ROUND(p_limit * 0.25));  -- At least 1
  v_level4_count := GREATEST(1, ROUND(p_limit * 0.25));  -- At least 1
  v_level5_count := GREATEST(1, ROUND(p_limit * 0.10));  -- At least 1

  -- Calculate total assigned
  v_total_assigned := v_level1_count + v_level2_count + v_level3_count + v_level4_count + v_level5_count;

  -- Adjust to match exact p_limit by removing from the largest groups
  WHILE v_total_assigned > p_limit LOOP
    -- Remove from level 2, 3, or 4 (the 25% groups) that have more than 1
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
      EXIT; -- Can't reduce anymore without going below 1
    END IF;
  END LOOP;

  -- If still need more questions to reach p_limit, add to the 25% groups
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

  -- Step 3: Select random questions by difficulty level and return them with translations
  -- Questions are ordered by difficulty (ascending) to start with easier questions
  -- Random within each level for variety
  RETURN QUERY
  WITH difficulty_questions AS (
    -- Level 1 questions (15% - always at least 1)
    (
      SELECT
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
      ORDER BY random()
      LIMIT v_level1_count
    )
    UNION ALL
    -- Level 2 questions (25% - always at least 1)
    (
      SELECT
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
      ORDER BY random()
      LIMIT v_level2_count
    )
    UNION ALL
    -- Level 3 questions (25% - always at least 1)
    (
      SELECT
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
      ORDER BY random()
      LIMIT v_level3_count
    )
    UNION ALL
    -- Level 4 questions (25% - always at least 1)
    (
      SELECT
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
      ORDER BY random()
      LIMIT v_level4_count
    )
    UNION ALL
    -- Level 5 questions (10% - always at least 1)
    (
      SELECT
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
      ORDER BY random()
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
  -- Order by difficulty first (easy to hard), then random within each level
  ORDER BY dq.difficulty ASC, dq.rand_order;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_questions_by_categories(text[], text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_questions_by_categories(text[], text, integer) TO anon;

-- Example usage:
-- SELECT * FROM get_questions_by_categories(ARRAY['art', 'science'], 'en', 10);
-- SELECT * FROM get_questions_by_categories(ARRAY[]::text[], 'pt', 5);
--
-- Distribution examples (ALWAYS includes all 5 levels):
-- 5 questions:  1 level 1, 1 level 2, 1 level 3, 1 level 4, 1 level 5
-- 10 questions: 2 level 1, 2 level 2, 2 level 3, 3 level 4, 1 level 5
-- 20 questions: 3 level 1, 5 level 2, 5 level 3, 5 level 4, 2 level 5
-- 100 questions: 15 level 1, 25 level 2, 25 level 3, 25 level 4, 10 level 5
