-- =====================================================
-- RPC functions used to draw the questions of a game
-- =====================================================
-- Execute this SQL in your Supabase SQL Editor.
--
-- The draw itself runs in the app (src/services/questionSelection.ts):
--   * question N always gets the level of the 1 -> 5 schedule (20/25/25/25/5 %)
--   * the category of each question is drawn at random from the selected categories, and a
--     drawn category waits until every other selected category was drawn
--   * a question never repeats inside a game, and questions from recent games (Supabase cache)
--     are only used when no fresh question is left
--
-- These functions only provide the data for that draw:
--   1. get_question_candidates: random question IDs for every (category, level) pair
--   2. get_questions_by_ids:    the drawn questions with their options, in the requested languages
--
-- They replaced get_questions_by_categories (now dropped), whose `ORDER BY q.id ... LIMIT` always returned the
-- questions with the lowest IDs, so the same questions came back game after game.
-- =====================================================

-- =====================================================
-- Function 1: Random candidates per category and level
-- =====================================================
-- Returns up to p_per_bucket questions for every (category, difficulty) pair of p_categories.
-- Questions whose ID is in p_recent_ids (shown in recent games) are flagged with is_recent and
-- only fill a pair when it has fewer than p_per_bucket fresh questions.
-- A question in several categories can appear once per category.
CREATE OR REPLACE FUNCTION public.get_question_candidates(
  p_categories text[],
  p_langs text[],
  p_per_bucket integer DEFAULT 10,
  p_recent_ids text[] DEFAULT ARRAY[]::text[]
)
RETURNS TABLE (
  question_id text,
  category_id text,
  difficulty integer,
  is_recent boolean
)
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH eligible AS (
    SELECT
      qc.question_id::text AS question_id,
      qc.category_id,
      q.difficulty::integer AS difficulty,
      qc.question_id::text = ANY (COALESCE(p_recent_ids, ARRAY[]::text[])) AS is_recent
    FROM quiz.question_categories qc
    INNER JOIN quiz.questions q ON q.id = qc.question_id
    WHERE qc.category_id = ANY (p_categories[1:20])
      -- Only questions that can be shown in every requested language
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(p_langs) AS requested(lang)
        WHERE NOT EXISTS (
          SELECT 1
          FROM quiz.question_translations qt
          WHERE qt.question_id = q.id
            AND qt.lang = requested.lang
        )
      )
      AND EXISTS (
        SELECT 1
        FROM quiz.options o
        WHERE o.question_id = q.id
          AND o.is_correct
      )
  ),
  ranked AS (
    SELECT
      e.question_id,
      e.category_id,
      e.difficulty,
      e.is_recent,
      row_number() OVER (
        PARTITION BY e.category_id, e.difficulty
        -- Fresh questions first, in random order
        ORDER BY e.is_recent, random()
      ) AS bucket_rank
    FROM eligible e
  )
  SELECT r.question_id, r.category_id, r.difficulty, r.is_recent
  FROM ranked r
  WHERE r.bucket_rank <= LEAST(GREATEST(COALESCE(p_per_bucket, 10), 1), 50);
$$;

-- =====================================================
-- Function 2: Questions by ID in the requested languages
-- =====================================================
-- Returns one row per (question, language). Options are ordered by option key in every language,
-- so correct_answer_index (0-based) is the same for all languages of a question.
-- Rows come back in no particular order; the app keeps the order of the draw.
CREATE OR REPLACE FUNCTION public.get_questions_by_ids(
  p_question_ids text[],
  p_langs text[]
)
RETURNS TABLE (
  id text,
  lang text,
  question_text text,
  options text[],
  correct_answer_index integer,
  difficulty integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    q.id::text,
    qt.lang,
    qt.text,
    question_options.texts,
    question_options.correct_index,
    q.difficulty::integer
  FROM quiz.questions q
  INNER JOIN quiz.question_translations qt
    ON qt.question_id = q.id
    AND qt.lang = ANY (p_langs)
  CROSS JOIN LATERAL (
    SELECT
      array_agg(ot.text ORDER BY o.option_key) AS texts,
      array_position(array_agg(o.is_correct ORDER BY o.option_key), true) - 1 AS correct_index
    FROM quiz.options o
    INNER JOIN quiz.option_translations ot
      ON ot.option_id = o.id
      AND ot.lang = qt.lang
    WHERE o.question_id = q.id
  ) AS question_options
  WHERE q.id = ANY (p_question_ids[1:100]::uuid[]);
$$;

-- =====================================================
-- Grant permissions
-- =====================================================
-- The app always calls these functions with a logged-in session
REVOKE ALL ON FUNCTION public.get_question_candidates(text[], text[], integer, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_question_candidates(text[], text[], integer, text[]) TO authenticated;

REVOKE ALL ON FUNCTION public.get_questions_by_ids(text[], text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_questions_by_ids(text[], text[]) TO authenticated;

-- =====================================================
-- Test Examples
-- =====================================================

-- Test 1: Up to 3 random candidates per (category, level), in all languages
-- SELECT category_id, difficulty, count(*)
-- FROM get_question_candidates(ARRAY['history', 'geography', 'chemistry'], ARRAY['pt', 'en', 'es'], 3)
-- GROUP BY 1, 2
-- ORDER BY 1, 2;
-- Expected: 15 rows (3 categories x 5 levels), each with count = 3

-- Test 2: Run Test 1 twice without the GROUP BY
-- Expected: different question IDs (the sample is random)

-- Test 3: Recent questions only fill a level when fresh ones run out
-- SELECT * FROM get_question_candidates(ARRAY['history'], ARRAY['pt'], 50, ARRAY['<recent-id>']);
-- Expected: '<recent-id>' (if it belongs to history) comes back with is_recent = true

-- Test 4: Same questions in every language, same correct option index
-- SELECT id, lang, correct_answer_index, cardinality(options)
-- FROM get_questions_by_ids(ARRAY['<question-id-1>', '<question-id-2>'], ARRAY['pt', 'en', 'es'])
-- ORDER BY id, lang;
-- Expected: 3 rows per question, 4 options each, equal correct_answer_index per question

-- =====================================================
-- Verify functions were created
-- =====================================================
-- SELECT routine_name, routine_type
-- FROM information_schema.routines
-- WHERE routine_schema = 'public'
--   AND routine_name IN ('get_question_candidates', 'get_questions_by_ids');
