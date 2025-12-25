-- =====================================================
-- OPTIONAL: Enable Auto-Cleanup with pg_cron
-- =====================================================
-- Execute this ONLY AFTER enabling pg_cron extension
-- Go to: Supabase Dashboard > Database > Extensions > Enable "pg_cron"
-- =====================================================

-- Step 1: Verify pg_cron is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
-- Should return 1 row if enabled

-- Step 2: Create the cron job to run cleanup every hour
SELECT cron.schedule(
  'delete-expired-question-cache',  -- Job name
  '0 * * * *',                       -- Every hour at minute 0 (cron syntax)
  $$SELECT quiz.delete_expired_question_cache()$$
);

-- Step 3: Verify the job was created
SELECT * FROM cron.job WHERE jobname = 'delete-expired-question-cache';
-- Should return 1 row with the job details

-- =====================================================
-- Alternative Cron Schedules (choose one)
-- =====================================================

-- Run every 30 minutes:
-- SELECT cron.schedule(
--   'delete-expired-question-cache',
--   '*/30 * * * *',
--   $$SELECT quiz.delete_expired_question_cache()$$
-- );

-- Run every 6 hours:
-- SELECT cron.schedule(
--   'delete-expired-question-cache',
--   '0 */6 * * *',
--   $$SELECT quiz.delete_expired_question_cache()$$
-- );

-- Run daily at midnight:
-- SELECT cron.schedule(
--   'delete-expired-question-cache',
--   '0 0 * * *',
--   $$SELECT quiz.delete_expired_question_cache()$$
-- );

-- =====================================================
-- Managing the Cron Job
-- =====================================================

-- View all cron jobs:
-- SELECT * FROM cron.job;

-- View job run history:
-- SELECT * FROM cron.job_run_details
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'delete-expired-question-cache')
-- ORDER BY start_time DESC
-- LIMIT 10;

-- Unschedule (delete) the job:
-- SELECT cron.unschedule('delete-expired-question-cache');

-- =====================================================
-- Manual Cleanup (if you don't use pg_cron)
-- =====================================================
-- You can run this manually whenever you want to clean up expired records:
-- SELECT quiz.delete_expired_question_cache();
