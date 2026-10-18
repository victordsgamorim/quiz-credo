/**
 * Question selection for a game (pure logic, no I/O)
 * Decides the level of every question, the category it comes from and which question is used
 */

/** Question difficulty, from 1 (easiest) to 5 (hardest) */
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

/** Returns a number in [0, 1), like Math.random */
export type RandomSource = () => number;

export type QuestionCandidate = {
  questionId: string;
  categoryId: string;
  difficulty: DifficultyLevel;
  // Shown in a recent game (Supabase cache)
  isRecent: boolean;
};

export type SelectedQuestion = {
  questionId: string;
  categoryId: string;
  difficulty: DifficultyLevel;
};

export type CategoryRotation = {
  next: (isEligible: (categoryId: string) => boolean) => string | null;
};

const DIFFICULTY_LEVELS: readonly DifficultyLevel[] = [1, 2, 3, 4, 5];

// Share of the game's questions at each level, level 1 first
const LEVEL_PERCENTAGES = [20, 25, 25, 25, 5];

// Levels that receive the leftover questions when their unassigned shares tie: 3, 2, 4, 1, 5
const LEFTOVER_TIE_ORDER = [2, 1, 3, 0, 4];

const pickRandom = <T>(items: readonly T[], random: RandomSource): T =>
  items[Math.min(items.length - 1, Math.floor(random() * items.length))];

// Fewer questions than levels: spread them evenly from level 1 to level 5
const spreadAcrossLevels = (total: number): number[] => {
  const counts = DIFFICULTY_LEVELS.map(() => 0);
  const lastLevelIndex = DIFFICULTY_LEVELS.length - 1;
  for (let position = 0; position < total; position += 1) {
    const levelIndex = total === 1 ? 0 : Math.round((position * lastLevelIndex) / (total - 1));
    counts[levelIndex] += 1;
  }
  return counts;
};

/**
 * Splits the questions of a game between the levels: 20% level 1, 25% each for levels 2 to 4
 * and 5% level 5, with at least one question per level (games shorter than five questions are
 * spread from level 1 to level 5). Leftovers go to the levels with the largest remainders.
 *
 * @param questionCount - Number of questions in the game
 * @returns Number of questions for each level, level 1 first
 */
export const countQuestionsPerLevel = (questionCount: number): number[] => {
  const total = Math.max(0, Math.floor(questionCount));
  if (total < DIFFICULTY_LEVELS.length) {
    return spreadAcrossLevels(total);
  }

  // Shares are counted in hundredths of a question to avoid floating point errors
  const counts = LEVEL_PERCENTAGES.map((percentage) =>
    Math.max(1, Math.floor((percentage * total) / 100))
  );
  const unassignedShare = (levelIndex: number) =>
    LEVEL_PERCENTAGES[levelIndex] * total - counts[levelIndex] * 100;
  // Stable sort: tied levels keep the tie order
  const leftoverOrder = [...LEFTOVER_TIE_ORDER].sort(
    (a, b) => unassignedShare(b) - unassignedShare(a)
  );
  const leftover = total - counts.reduce((sum, count) => sum + count, 0);
  leftoverOrder.slice(0, leftover).forEach((levelIndex) => {
    counts[levelIndex] += 1;
  });
  return counts;
};

/**
 * Builds the level of every question of a game in play order. The game starts at level 1 and
 * the level never goes down, ending at level 5.
 *
 * @param questionCount - Number of questions in the game
 * @returns Level of each question, first question first
 */
export const buildLevelSchedule = (questionCount: number): DifficultyLevel[] =>
  countQuestionsPerLevel(questionCount).flatMap((count, levelIndex) =>
    Array.from({ length: count }, () => DIFFICULTY_LEVELS[levelIndex])
  );

/**
 * Draws categories at random without repeating one until every category was drawn. A drawn
 * category goes to the end of a waiting queue; when no category is left to draw, the queue goes
 * back into the draw. The last drawn category is never drawn again right away if another one can be.
 *
 * @param categories - Selected category IDs
 * @param random - Random number source
 * @returns Rotation whose `next` draws the category of the next question among the eligible ones
 * (null when none is eligible). A category that is still in the draw but not eligible stays in it.
 */
export const createCategoryRotation = (
  categories: readonly string[],
  random: RandomSource
): CategoryRotation => {
  const allCategories = [...new Set(categories)];
  let toDraw = [...allCategories];
  let drawnQueue: string[] = [];
  let lastCategory: string | null = null;

  const draw = (pool: string[]) => {
    const others = pool.filter((categoryId) => categoryId !== lastCategory);
    lastCategory = pickRandom(others.length > 0 ? others : pool, random);
    return lastCategory;
  };

  return {
    next: (isEligible) => {
      if (toDraw.length === 0) {
        toDraw = drawnQueue;
        drawnQueue = [];
      }

      const eligibleToDraw = toDraw.filter(isEligible);
      if (eligibleToDraw.length > 0) {
        const categoryId = draw(eligibleToDraw);
        toDraw = toDraw.filter((id) => id !== categoryId);
        drawnQueue.push(categoryId);
        return categoryId;
      }

      // None of the categories left in this round has a question for this level: reuse one
      const eligible = allCategories.filter(isEligible);
      return eligible.length > 0 ? draw(eligible) : null;
    },
  };
};

const bucketKey = (categoryId: string, difficulty: DifficultyLevel) =>
  `${categoryId}|${difficulty}`;

const groupByBucket = (candidates: readonly QuestionCandidate[]) => {
  const buckets = new Map<string, QuestionCandidate[]>();
  candidates.forEach((candidate) => {
    const key = bucketKey(candidate.categoryId, candidate.difficulty);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(candidate);
    } else {
      buckets.set(key, [candidate]);
    }
  });
  return buckets;
};

type FindFreeCandidates = (categoryId: string, canUseRecent: boolean) => QuestionCandidate[];

// Fresh questions first: recent ones are only used when no selected category has a fresh one left
const drawQuestion = (
  rotation: CategoryRotation,
  findFree: FindFreeCandidates,
  random: RandomSource
): QuestionCandidate | null => {
  for (const canUseRecent of [false, true]) {
    const categoryId = rotation.next((id) => findFree(id, canUseRecent).length > 0);
    if (categoryId !== null) {
      return pickRandom(findFree(categoryId, canUseRecent), random);
    }
  }
  return null;
};

type SelectGameQuestionsParams = {
  categories: readonly string[];
  levels: readonly DifficultyLevel[];
  candidates: readonly QuestionCandidate[];
  random?: RandomSource;
};

/**
 * Draws the questions of a game in play order, one per level of the schedule: the category comes
 * from the category rotation and the question is drawn at random among that category's candidates
 * for the level. No question is drawn twice in the same game, and a level is skipped only when no
 * selected category has a question left for it.
 *
 * @param params - Draw parameters
 * @param params.categories - Selected category IDs
 * @param params.levels - Level of each question, in play order
 * @param params.candidates - Questions available for each category and level
 * @param params.random - Random number source (defaults to Math.random)
 * @returns Drawn questions, in play order
 */
export const selectGameQuestions = ({
  categories,
  levels,
  candidates,
  random = Math.random,
}: SelectGameQuestionsParams): SelectedQuestion[] => {
  // In-game cache: questions already drawn for this game. Every game starts with an empty one.
  const usedQuestionIds = new Set<string>();
  const candidatesByBucket = groupByBucket(candidates);
  const rotation = createCategoryRotation(categories, random);
  const selected: SelectedQuestion[] = [];

  levels.forEach((level) => {
    const findFree: FindFreeCandidates = (categoryId, canUseRecent) =>
      (candidatesByBucket.get(bucketKey(categoryId, level)) ?? []).filter(
        (candidate) =>
          !usedQuestionIds.has(candidate.questionId) && (canUseRecent || !candidate.isRecent)
      );
    const question = drawQuestion(rotation, findFree, random);
    if (question) {
      usedQuestionIds.add(question.questionId);
      selected.push({
        questionId: question.questionId,
        categoryId: question.categoryId,
        difficulty: level,
      });
    }
  });

  return selected;
};
