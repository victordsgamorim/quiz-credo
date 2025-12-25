-- =====================================================
-- Question Cache Table for 24-hour Auto-Expiry
-- =====================================================
-- Execute this SQL in your Supabase SQL Editor
-- This table tracks which questions were shown to which users
-- and automatically deletes records after 24 hours
-- =====================================================

-- Step 1: Create the table
CREATE TABLE IF NOT EXISTS quiz.user_question_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),

  -- Prevent duplicate entries for same user + question
  UNIQUE(user_id, question_id)
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_question_cache_user_id
  ON quiz.user_question_cache(user_id);

CREATE INDEX IF NOT EXISTS idx_user_question_cache_expires_at
  ON quiz.user_question_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_question_cache_user_question
  ON quiz.user_question_cache(user_id, question_id);

-- Step 3: Enable Row Level Security (RLS)
ALTER TABLE quiz.user_question_cache ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- Allow authenticated users to read their own cache
CREATE POLICY "Users can view their own question cache"
  ON quiz.user_question_cache
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own cache
CREATE POLICY "Users can insert their own question cache"
  ON quiz.user_question_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own cache
CREATE POLICY "Users can delete their own question cache"
  ON quiz.user_question_cache
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 5: Create function to auto-delete expired records
CREATE OR REPLACE FUNCTION quiz.delete_expired_question_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = quiz, public
AS $$
BEGIN
  DELETE FROM quiz.user_question_cache
  WHERE expires_at <= now();
END;
$$;

-- Step 6: Create a pg_cron job to run cleanup every hour
-- Note: pg_cron extension must be enabled in Supabase Dashboard first
-- Go to: Database > Extensions > Enable "pg_cron"
-- IMPORTANT: This step is OPTIONAL and commented out by default
-- Uncomment the lines below ONLY after enabling pg_cron extension

-- SELECT cron.schedule(
--   'delete-expired-question-cache',  -- Job name
--   '0 * * * *',                       -- Every hour at minute 0 (cron syntax)
--   $$SELECT quiz.delete_expired_question_cache()$$
-- );

-- =====================================================
-- Manual Insert Example (for testing)
-- =====================================================
-- INSERT INTO quiz.user_question_cache (user_id, question_id)
-- VALUES (
--   auth.uid(),  -- Current authenticated user
--   'some-question-uuid'
-- );
-- The expires_at will automatically be set to now() + 24 hours

-- =====================================================
-- Manual Cleanup (if pg_cron is not available)
-- =====================================================
-- If you can't use pg_cron, you can manually run this periodically:
-- SELECT quiz.delete_expired_question_cache();

-- =====================================================
-- Verify the table was created
-- =====================================================
-- SELECT table_name, table_schema
-- FROM information_schema.tables
-- WHERE table_schema = 'quiz' AND table_name = 'user_question_cache';

-- =====================================================
-- Test the auto-expiry (set to 10 seconds for testing)
-- =====================================================
-- INSERT INTO quiz.user_question_cache (user_id, question_id, expires_at)
-- VALUES (
--   auth.uid(),
--   'test-question-id',
--   now() + interval '10 seconds'
-- );
--
-- Wait 10 seconds, then run:
-- SELECT quiz.delete_expired_question_cache();
-- SELECT * FROM quiz.user_question_cache WHERE question_id = 'test-question-id';
-- Should return 0 rows

-- =====================================================
-- Grant permissions
-- =====================================================
GRANT SELECT, INSERT, DELETE ON quiz.user_question_cache TO authenticated;
GRANT EXECUTE ON FUNCTION quiz.delete_expired_question_cache() TO authenticated;
