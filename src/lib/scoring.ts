/**
 * Scoring rules (pure logic, no I/O)
 * The realtime server (quiz-credo-server) applies the same streak multiplier to the ranking, so
 * keep both in sync when the rules change
 */
import type { DifficultyLevel } from "@/services/questionSelection";

/** Points of a correct answer at each difficulty level, before the streak multiplier */
export const LEVEL_POINTS: Record<DifficultyLevel, number> = {
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
};

export const MAX_STREAK_MULTIPLIER = 3;

// The multiplier starts at x1.5 and every further correct answer in a row adds 0.5
const STREAK_MULTIPLIER_STEP = 0.5;

/** Multiplier levels above x1: x1.5, x2, x2.5 and x3 */
export const MAX_STREAK_LEVEL = (MAX_STREAK_MULTIPLIER - 1) / STREAK_MULTIPLIER_STEP;

/** Questions the Freeze power-up protects the streak for: the one it's used on and the next one */
export const FREEZE_QUESTIONS = 2;

// Questions whose wrong answers don't break the streak (the Freeze power-up)
type FrozenQuestions = ReadonlySet<string>;

type ScoredAnswer = {
  questionId: string;
  isCorrect: boolean;
};

/**
 * Multiplier level of a streak: 0 (x1) until the streak reaches the threshold, 1 (x1.5) when it
 * does, then one more for every further correct answer in a row, up to MAX_STREAK_LEVEL (x3)
 *
 * @param streak - Correct answers in a row so far
 * @param threshold - Correct answers in a row that start the multiplier
 * @returns Level from 0 to MAX_STREAK_LEVEL
 */
export const getStreakLevel = (streak: number, threshold: number): number =>
  Math.min(MAX_STREAK_LEVEL, Math.max(0, streak - threshold + 1));

/**
 * Multiplier of a player's next correct answer: x1 until the streak reaches the threshold, x1.5
 * when it does, then 0.5 more for every further correct answer in a row, up to x3
 *
 * @param streak - Correct answers in a row so far
 * @param threshold - Correct answers in a row that start the multiplier
 * @returns Multiplier from 1 to MAX_STREAK_MULTIPLIER
 */
export const getStreakMultiplier = (streak: number, threshold: number): number =>
  1 + getStreakLevel(streak, threshold) * STREAK_MULTIPLIER_STEP;

/**
 * Level of a multiplier, as getStreakLevel counts them: 0 for x1, 1 for x1.5, up to
 * MAX_STREAK_LEVEL for x3
 *
 * @param multiplier - Streak multiplier
 * @returns Level from 0 to MAX_STREAK_LEVEL
 */
export const getMultiplierLevel = (multiplier: number): number =>
  Math.min(MAX_STREAK_LEVEL, Math.max(0, Math.round((multiplier - 1) / STREAK_MULTIPLIER_STEP)));

/**
 * Applies a streak multiplier to a question's points
 *
 * @param points - Points of the question
 * @param multiplier - Streak multiplier
 * @returns Points earned by a correct answer
 */
export const applyMultiplier = (points: number, multiplier: number): number =>
  Math.round(points * multiplier);

/**
 * Counts the correct answers in a row at the end of a player's answers
 *
 * @param answers - The player's answers, in play order
 * @returns Current streak
 */
export const countStreak = (answers: readonly ScoredAnswer[]): number => {
  let streak = 0;
  while (streak < answers.length && answers[answers.length - 1 - streak].isCorrect) {
    streak += 1;
  }
  return streak;
};

/**
 * A player's answers as their streak sees them: a wrong answer to a frozen question (Freeze
 * power-up) is left out, so it neither breaks the streak nor adds to it
 *
 * @param answers - The player's answers, in play order
 * @param frozenQuestions - Questions the player's streak is frozen on
 * @returns The answers that count for the streak
 */
export const withoutFrozenMisses = <Answer extends ScoredAnswer>(
  answers: readonly Answer[],
  frozenQuestions: FrozenQuestions
): Answer[] =>
  answers.filter((answer) => answer.isCorrect || !frozenQuestions.has(answer.questionId));

/**
 * Questions a player's streak is frozen on: each question they used Freeze on, and the next one
 *
 * @param freezeQuestionIds - Questions the player used Freeze on
 * @param questionIds - The game's questions, in play order
 * @returns Frozen questions
 */
export const getFrozenQuestions = (
  freezeQuestionIds: readonly string[],
  questionIds: readonly string[]
): FrozenQuestions =>
  new Set(
    freezeQuestionIds.flatMap((questionId) => {
      const start = questionIds.indexOf(questionId);
      return start < 0 ? [questionId] : questionIds.slice(start, start + FREEZE_QUESTIONS);
    })
  );

/**
 * A player's answers since their streak was last broken by the Break power-up: the answers before
 * the question it was used on don't count for the streak any more (Freeze doesn't stop it, only the
 * shield does, and a blocked Break isn't passed here)
 *
 * @param answers - The player's answers, in play order
 * @param breakQuestionIds - Questions a Break hit the player on
 * @param questionIds - The game's questions, in play order
 * @returns The answers that count for the streak
 */
export const sinceStreakBreak = <Answer extends ScoredAnswer>(
  answers: readonly Answer[],
  breakQuestionIds: readonly string[],
  questionIds: readonly string[]
): Answer[] => {
  const lastBreak = Math.max(-1, ...breakQuestionIds.map((id) => questionIds.indexOf(id)));
  if (lastBreak < 0) return [...answers];
  const counted = new Set(questionIds.slice(lastBreak));
  return answers.filter((answer) => counted.has(answer.questionId));
};

/**
 * Multiplier of a question for a player: the one earned by the answers given before it, so it
 * doesn't change when the question itself is answered
 *
 * @param answers - The player's answers, in play order
 * @param questionId - Question to score
 * @param threshold - Correct answers in a row that start the multiplier
 * @returns Multiplier of a correct answer to the question
 */
export const getQuestionMultiplier = (
  answers: readonly ScoredAnswer[],
  questionId: string,
  threshold: number
): number => {
  const previousAnswers = answers.filter((answer) => answer.questionId !== questionId);
  return getStreakMultiplier(countStreak(previousAnswers), threshold);
};
