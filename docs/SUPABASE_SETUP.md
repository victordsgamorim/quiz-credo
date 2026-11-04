# Supabase Setup: Fetching Questions from the `quiz` Schema

## The Problem

The Supabase REST API **does not allow** the JavaScript client to reach custom schemas such as
`quiz` directly. The only way to read them is through **RPC functions** (PostgreSQL functions).

## The Solution

The app reads questions through two RPC functions, defined in `supabase_game_question_selection.sql`:

- `get_question_candidates`: random question IDs for every (category, level) pair of the selected
  categories
- `get_questions_by_ids`: the drawn questions with their translations and options

They run on the PostgreSQL server with the owner's permissions (`SECURITY DEFINER`), read the `quiz`
schema tables and can be called from the Supabase JavaScript client with a logged-in session. The
draw itself (levels 1 to 5, category rounds, no repeated questions) runs in the app: see
[Question Selection and Difficulty Levels](./SUPABASE_DIFFICULTY_LEVELS.md).

---

## Setup Steps

### Step 1: Run the SQL Functions in Supabase

1. Open the [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. In the side menu, click **SQL Editor**
4. Click **New Query**
5. Paste the contents of `supabase_game_question_selection.sql`
6. Click **Run**

### Step 2: Check That the Functions Were Created

Run this SQL to check:

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_question_candidates', 'get_questions_by_ids');
```

You should see:

```
routine_name             | routine_type
-------------------------|-------------
get_question_candidates  | FUNCTION
get_questions_by_ids     | FUNCTION
```

### Step 3: Test the Functions by Hand

```sql
-- Up to 3 random candidates per level for 'art' and 'science', with a Portuguese text
SELECT * FROM get_question_candidates(
  ARRAY['art', 'science'],
  ARRAY['pt'],
  3
);

-- Two of those questions in Portuguese, English and Spanish
SELECT * FROM get_questions_by_ids(
  ARRAY['<question-id-1>', '<question-id-2>'],
  ARRAY['pt', 'en', 'es']
);
```

### Step 4: Check Row Level Security (RLS)

If you still get a permission error, run:

```sql
-- Check the RLS policies
SELECT schemaname, tablename, policyname, roles
FROM pg_policies
WHERE schemaname = 'quiz';

-- If needed, turn RLS off temporarily (for tests only)
ALTER TABLE quiz.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz.question_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz.options DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz.option_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz.question_categories DISABLE ROW LEVEL SECURITY;
```

**Important**: turning RLS off is for tests only. In production, set up proper policies.

---

## RPC Function Structure

`get_question_candidates` returns rows with this structure:

```typescript
{
  question_id: string; // Question ID (UUID)
  category_id: string; // Category the question was sampled for
  difficulty: number; // Level (1-5)
  is_recent: boolean; // In p_recent_ids (shown in a recent game)
}
```

`get_questions_by_ids` returns one row per question and language:

```typescript
{
  id: string; // Question ID (UUID)
  lang: string; // Language code (pt, en, es)
  question_text: string; // Translated question text
  options: string[]; // Translated options, ordered by option key
  correct_answer_index: number; // Index of the correct option (0-based, same in every language)
  difficulty: number; // Level (1-5)
}
```

---

## How It Works in the Code

1. **The admin clicks "Start"**
2. The code checks the Supabase session (the admin's login, with its token kept in a local cache)
3. With the question cache enabled, it reads the IDs shown in the last 24 hours
   (`get_cached_question_ids`)
4. It fetches random candidates for the selected categories:
   ```typescript
   const { data } = await supabase.rpc("get_question_candidates", {
     p_categories: ["art", "science", "history"],
     p_langs: ["pt", "en", "es"],
     p_per_bucket: 3,
     p_recent_ids: recentIds,
   });
   ```
5. `src/services/questionSelection.ts` draws the game: one question per level of the 1 → 5 schedule,
   with the category drawn in rounds and no repeated question
6. It loads the drawn questions in every language (`get_questions_by_ids`), converts them to the
   `Question` format in the order of the draw, and adds their IDs to the cache
   (`cache_user_questions`)

---

## Security

The functions use `SECURITY DEFINER`, which means they:

- run with the permissions of the function's creator (you)
- don't depend on the permissions of the user who calls them
- are safe because they only read data (nothing is modified), only return data meant to be read and
  don't expose sensitive information

---

## Common Problems

### Error: "Could not find the function public.get_question_candidates" (or `get_questions_by_ids`)

**Solution**: the functions were not created. Run `supabase_game_question_selection.sql` again.

### Error: "permission denied for schema quiz"

**Solution**: the function needs `SECURITY DEFINER` (the SQL file already has it).

### Error: "No questions found"

**Solution**:

- Check that the database has questions
- Check that the categories exist
- Check that there are translations in the requested language

### No error, but the result is empty

**Solution**: check the RLS policies (Step 4 above).

---

## Maintenance

To update a function later, run the SQL again: it uses `CREATE OR REPLACE FUNCTION`.

---

## Checklist

- [ ] I ran the SQL in the Supabase SQL Editor
- [ ] I checked that the functions were created
- [ ] I tested the functions by hand and they return data
- [ ] I set up or checked the RLS policies (optional for development)
- [ ] I tested in the app and the questions load

---

## Where the Pieces Live

- `src/services/authService.ts`: the admin's login, with the token kept in a local cache
- `src/services/questionService.ts`: fetches the questions through the RPC functions
- `src/services/questionSelection.ts`: draws the game's questions
- `src/hooks/useQuiz.ts`: loads the game's questions through those services
- `src/services/userSettings.ts`: the admin's saved game settings (the `user_settings` table, one
  row per user, protected by RLS so a user only reaches their own row)

---

## Password Reset (`/reset-password`)

The page `src/pages/ResetPassword.tsx` receives the link from the recovery email ("Send password
recovery") and calls `supabase.auth.updateUser({ password })` with the recovery session.

### Dashboard Setup

1. **Authentication → URL Configuration**
   - **Site URL**: the production domain (for example `https://<your-domain>`)
   - **Redirect URLs**: add `https://<your-domain>/reset-password` and, for development,
     `http://localhost:8080/reset-password`
2. **Authentication → Email Templates → Reset Password**: replace the template's link with:

   ```html
   <a href="{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery"
     >Reset password</a
   >
   ```

   > The default `{{ .ConfirmationURL }}` redirects to the **Site URL** (the root `/`) when the email
   > is sent from the Dashboard ("Send password recovery"), because there is no `redirectTo`. That's
   > why the template has to point straight to `/reset-password`.

The page handles the three link formats: `?token_hash=...&type=recovery`, `?code=...` (PKCE) and a
session already detected in the URL (`#access_token=...`).

### RLS

No RLS policy is needed: the password lives in `auth.users`, which Supabase Auth protects and only
lets the authenticated user change, with the recovery session. The page reads and writes no table of
the `public`/`quiz` schemas.
