# Question Selection and Difficulty Levels

## Overview

The questions of a game are drawn when the admin starts it: the realtime server receives the whole
list once (in every locale) and plays it in order. The draw follows three rules:

1. **Levels go from 1 to 5**: question N always has the level of the game's schedule.
2. **Categories are drawn at random, in rounds**: a drawn category waits until every other
   selected category was drawn.
3. **No repeated questions**: never inside a game, and questions shown in recent games are avoided.

| Piece                                  | Role                                                 |
| -------------------------------------- | ---------------------------------------------------- |
| `src/services/questionSelection.ts`    | The draw (pure logic, unit tested)                   |
| `src/services/questionService.ts`      | Supabase calls, mapping to `Question`, cache updates |
| `supabase_game_question_selection.sql` | RPC functions that provide the data for the draw     |

## 1. Level schedule

The questions are split between the levels with this distribution, at least one question per level:

| Level | Share | Points |
| ----- | ----- | ------ |
| 1     | 20%   | 10     |
| 2     | 25%   | 20     |
| 3     | 25%   | 30     |
| 4     | 25%   | 40     |
| 5     | 5%    | 50     |

Points are before the player's streak multiplier (see [Scoring](../README.md#scoring)).

Each level first gets its rounded-down share (at least 1). The leftover questions go to the levels
with the largest remainders; ties go to levels 3, 2, 4, 1 and 5, in that order. The levels are then
played in ascending order: the game starts at level 1 and ends at level 5.

| Questions | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 |
| --------- | ------- | ------- | ------- | ------- | ------- |
| 5         | 1       | 1       | 1       | 1       | 1       |
| 10        | 2       | 2       | 3       | 2       | 1       |
| 15        | 3       | 4       | 4       | 3       | 1       |
| 20        | 4       | 5       | 5       | 5       | 1       |
| 25        | 5       | 6       | 7       | 6       | 1       |
| 30        | 6       | 8       | 8       | 7       | 1       |
| 40        | 8       | 10      | 10      | 10      | 2       |
| 50        | 10      | 13      | 13      | 12      | 2       |

A 10-question game is played as levels `1, 1, 2, 2, 3, 3, 3, 4, 4, 5`.

## 2. Category rounds

Example with history, geography and chemistry selected:

| Question | Can be drawn                  | Drawn (example) | Waiting queue                 |
| -------- | ----------------------------- | --------------- | ----------------------------- |
| 1        | history, geography, chemistry | geography       | geography                     |
| 2        | history, chemistry            | history         | geography, history            |
| 3        | chemistry                     | chemistry       | geography, history, chemistry |
| 4        | geography, history            | history         | history                       |
| 5        | geography, chemistry          | ...             | ...                           |

At question 4 no category was left to draw, so the waiting queue went back into the draw. The
category drawn last (chemistry) sits out that first draw only, so a category is never used twice in
a row.

Once the category is drawn, the question is drawn at random among that category's questions of the
question's level. Only selected categories are used; with no selected category, all categories are.

## 3. No repeated questions

- **In-game cache**: the IDs drawn for the current game. A question that belongs to several selected
  categories can't be drawn twice. The cache is created when a game's questions are drawn and is
  discarded with that game, so leaving or finishing a game always starts the next one empty. Nothing
  is kept in memory or `localStorage` between games.
- **Supabase cache** (`enableQuestionCache` game setting, on by default): the IDs shown to the logged-in
  user in the last 24 hours (`quiz.user_question_cache`). They are only drawn when no fresh question
  is left, and the IDs of every new game are added to it once its questions are loaded.

## When questions run out

For each question, the draw tries in this order:

1. a fresh question of the drawn category, at the question's level
2. a fresh question of another selected category, at the same level
3. steps 1 and 2 with questions from recent games (Supabase cache)
4. nothing left at that level: the question is skipped and the game is one question shorter

The level of a question never changes. With the current bank (at least 28 questions per category and
level) steps 2 to 4 only happen after many games with the same categories within 24 hours.

## Supabase functions

Run `supabase_game_question_selection.sql` in the Supabase SQL Editor. Both functions are
`SECURITY DEFINER` (the `quiz` tables are not readable by users) and can only be called with a
logged-in session (`authenticated` role).

### `get_question_candidates(p_categories, p_langs, p_per_bucket, p_recent_ids)`

Returns up to `p_per_bucket` random questions for every (category, level) pair of `p_categories`,
fresh questions first. Rows: `question_id`, `category_id`, `difficulty`, `is_recent` (the ID is in
`p_recent_ids`). Only questions with a text in every language of `p_langs` and a correct option are
returned. The app asks for as many candidates per pair as the largest level of the game has
questions, so a pair never runs out early.

### `get_questions_by_ids(p_question_ids, p_langs)`

Returns the drawn questions, one row per (question, language): `id`, `lang`, `question_text`,
`options` (ordered by option key) and `correct_answer_index` (0-based, the same in every language),
plus `difficulty`. The app keeps the order of the draw.

## Why questions used to repeat

The previous function, `get_questions_by_categories`, selected each level with
`SELECT DISTINCT ON (q.id) ... ORDER BY q.id, random() LIMIT n`. `DISTINCT ON` forces the rows to be
sorted by question ID first, so `LIMIT` always kept the questions with the smallest IDs; `random()`
only chose which category row of a question was kept. The same categories always produced the same
questions, and the Supabase cache only moved the game to the next smallest IDs. It also:

- gave 10-question games 2/1/3/3/1 questions per level instead of 2/2/3/2/1 (its adjustment loop
  always removed questions from level 2 first)
- did not balance categories
- could report a category of the question that was not selected
- loaded other languages by fetching 500 questions per language without exclusions, which failed with
  "Missing translations" once the cache pushed the game's questions past those 500

`supabase_rpc_function.sql`, `supabase_update_rpc_with_exclude.sql` and
`supabase_fix_category_randomization.sql` define that function. It is no longer used by the app and
can be dropped once no deployed frontend calls it.
