/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
import { describe, it, expect } from "vitest";

import {
  buildLevelSchedule,
  countQuestionsPerLevel,
  createCategoryRotation,
  selectGameQuestions,
  type DifficultyLevel,
  type QuestionCandidate,
  type RandomSource,
} from "../questionSelection";

const LEVELS: DifficultyLevel[] = [1, 2, 3, 4, 5];
const SELECTED = ["history", "geography", "chemistry"];

// Seeded random source (mulberry32), so a failing draw can be reproduced
const createSeededRandom = (seed: number): RandomSource => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

// `perBucket` questions for every category and level, with IDs like "history-3-0"
const buildCandidates = (
  categories: string[],
  perBucket: number,
  isRecent = false
): QuestionCandidate[] =>
  categories.flatMap((categoryId) =>
    LEVELS.flatMap((difficulty) =>
      Array.from({ length: perBucket }, (_, index) => ({
        questionId: `${categoryId}-${difficulty}-${index}${isRecent ? "-recent" : ""}`,
        categoryId,
        difficulty,
        isRecent,
      }))
    )
  );

const fresh = (
  questionId: string,
  categoryId: string,
  difficulty: DifficultyLevel
): QuestionCandidate => ({ questionId, categoryId, difficulty, isRecent: false });

// Shown in a recent game (Supabase cache)
const recent = (
  questionId: string,
  categoryId: string,
  difficulty: DifficultyLevel
): QuestionCandidate => ({ questionId, categoryId, difficulty, isRecent: true });

// Each round (block of one draw per category) has no repeat; a full round has every category
const expectRounds = (drawn: string[], categories: string[]) => {
  for (let start = 0; start < drawn.length; start += categories.length) {
    const round = drawn.slice(start, start + categories.length);
    expect(new Set(round).size).toBe(round.length);
    if (round.length === categories.length) {
      expect([...round].sort()).toEqual([...categories].sort());
    }
  }
};

const expectNoConsecutiveRepeats = (drawn: string[]) => {
  drawn.slice(1).forEach((categoryId, index) => {
    expect(categoryId).not.toBe(drawn[index]);
  });
};

describe("questionSelection", () => {
  describe("countQuestionsPerLevel", () => {
    it.each([
      [5, [1, 1, 1, 1, 1]],
      [10, [2, 2, 3, 2, 1]],
      [15, [3, 4, 4, 3, 1]],
      [20, [4, 5, 5, 5, 1]],
      [25, [5, 6, 7, 6, 1]],
      [30, [6, 8, 8, 7, 1]],
      [35, [7, 9, 9, 9, 1]],
      [40, [8, 10, 10, 10, 2]],
      [45, [9, 11, 12, 11, 2]],
      [50, [10, 13, 13, 12, 2]],
      [100, [20, 25, 25, 25, 5]],
    ])("splits %i questions as %j (20/25/25/25/5 %)", (questionCount, expected) => {
      expect(countQuestionsPerLevel(questionCount)).toEqual(expected);
    });

    it("always uses every question and gives every level at least one", () => {
      for (let questionCount = 5; questionCount <= 120; questionCount += 1) {
        const counts = countQuestionsPerLevel(questionCount);
        expect(counts.reduce((sum, count) => sum + count, 0)).toBe(questionCount);
        expect(Math.min(...counts)).toBeGreaterThanOrEqual(1);
      }
    });

    it.each([
      [0, [0, 0, 0, 0, 0]],
      [1, [1, 0, 0, 0, 0]],
      [2, [1, 0, 0, 0, 1]],
      [3, [1, 0, 1, 0, 1]],
      [4, [1, 1, 0, 1, 1]],
    ])("spreads %i questions from level 1 to level 5", (questionCount, expected) => {
      expect(countQuestionsPerLevel(questionCount)).toEqual(expected);
    });
  });

  describe("buildLevelSchedule", () => {
    it("orders the levels of a 10-question game from 1 to 5", () => {
      expect(buildLevelSchedule(10)).toEqual([1, 1, 2, 2, 3, 3, 3, 4, 4, 5]);
    });

    it("starts at level 1, ends at level 5 and never goes down", () => {
      for (let questionCount = 10; questionCount <= 50; questionCount += 5) {
        const levels = buildLevelSchedule(questionCount);
        expect(levels).toHaveLength(questionCount);
        expect(levels[0]).toBe(1);
        expect(levels[levels.length - 1]).toBe(5);
        expect(levels).toEqual([...levels].sort((a, b) => a - b));
      }
    });
  });

  describe("createCategoryRotation", () => {
    const drawMany = (categories: string[], count: number, seed: number) => {
      const rotation = createCategoryRotation(categories, createSeededRandom(seed));
      return Array.from({ length: count }, () => rotation.next(() => true));
    };

    it("draws every category once per round before any category repeats", () => {
      for (let seed = 1; seed <= 50; seed += 1) {
        expectRounds(drawMany(SELECTED, 12, seed), SELECTED);
      }
    });

    it("never draws the same category twice in a row, even across rounds", () => {
      for (let seed = 1; seed <= 50; seed += 1) {
        expectNoConsecutiveRepeats(drawMany(SELECTED, 30, seed));
        expectNoConsecutiveRepeats(drawMany(["history", "geography"], 10, seed));
      }
    });

    it("draws the categories in a random order", () => {
      const firstRounds = new Set(
        Array.from({ length: 30 }, (_, seed) => drawMany(SELECTED, 3, seed + 1).join(","))
      );
      expect(firstRounds.size).toBeGreaterThan(1);
    });

    it("keeps drawing the only selected category", () => {
      expect(drawMany(["history"], 3, 1)).toEqual(["history", "history", "history"]);
    });

    it("ignores duplicated categories", () => {
      expectRounds(drawMany(["history", "history", "geography"], 6, 1), ["history", "geography"]);
    });

    it("keeps a category that is not eligible in the round for a later question", () => {
      const rotation = createCategoryRotation(SELECTED, createSeededRandom(7));

      expect(rotation.next((categoryId) => categoryId === "geography")).toBe("geography");
      const rest = [rotation.next(() => true), rotation.next(() => true)];

      expect([...rest].sort()).toEqual(["chemistry", "history"]);
    });

    it("reuses a drawn category when none left in the round is eligible", () => {
      const rotation = createCategoryRotation(["history", "geography"], createSeededRandom(3));
      const first = rotation.next(() => true);
      const other = first === "history" ? "geography" : "history";

      expect(rotation.next((categoryId) => categoryId === first)).toBe(first);
      // The category that was not eligible is still waiting to be drawn in this round
      expect(rotation.next(() => true)).toBe(other);
    });

    it("returns null when no category is eligible", () => {
      const rotation = createCategoryRotation(SELECTED, createSeededRandom(1));
      expect(rotation.next(() => false)).toBeNull();
      expect(createCategoryRotation([], createSeededRandom(1)).next(() => true)).toBeNull();
    });
  });

  describe("selectGameQuestions", () => {
    it("gives every question the level of the schedule", () => {
      const levels = buildLevelSchedule(20);
      const selected = selectGameQuestions({
        categories: SELECTED,
        levels,
        candidates: buildCandidates(SELECTED, 20),
        random: createSeededRandom(1),
      });

      expect(selected.map((question) => question.difficulty)).toEqual(levels);
      selected.forEach((question) => {
        expect(question.questionId).toContain(`-${question.difficulty}-`);
      });
    });

    it("draws the category of each question in rounds of the selected categories", () => {
      const selected = selectGameQuestions({
        categories: SELECTED,
        levels: buildLevelSchedule(10),
        candidates: buildCandidates(SELECTED, 10),
        random: createSeededRandom(2),
      });
      const categories = selected.map((question) => question.categoryId);

      expect(categories).toHaveLength(10);
      expectRounds(categories, SELECTED);
      expectNoConsecutiveRepeats(categories);
      selected.forEach((question) => {
        expect(question.questionId.startsWith(question.categoryId)).toBe(true);
      });
    });

    it("only draws questions from the selected categories", () => {
      const selected = selectGameQuestions({
        categories: ["history"],
        levels: buildLevelSchedule(10),
        candidates: buildCandidates(["history", "music"], 10),
        random: createSeededRandom(3),
      });

      expect(selected).toHaveLength(10);
      expect(selected.every((question) => question.categoryId === "history")).toBe(true);
    });

    it("never repeats a question in a game, even one that belongs to several categories", () => {
      const candidates = [
        fresh("shared-1", "history", 1),
        fresh("shared-2", "history", 1),
        fresh("history-only", "history", 1),
        fresh("shared-1", "geography", 1),
        fresh("shared-2", "geography", 1),
        fresh("geography-only", "geography", 1),
      ];

      for (let seed = 1; seed <= 30; seed += 1) {
        const selected = selectGameQuestions({
          categories: ["history", "geography"],
          levels: [1, 1, 1, 1],
          candidates,
          random: createSeededRandom(seed),
        });
        const ids = selected.map((question) => question.questionId);

        expect([...ids].sort()).toEqual(["geography-only", "history-only", "shared-1", "shared-2"]);
      }
    });

    it("prefers questions that were not shown in recent games", () => {
      const selected = selectGameQuestions({
        categories: ["history"],
        levels: [1, 1],
        candidates: [
          recent("recent-1", "history", 1),
          fresh("fresh-1", "history", 1),
          recent("recent-2", "history", 1),
          fresh("fresh-2", "history", 1),
        ],
        random: createSeededRandom(4),
      });

      expect(selected.map((question) => question.questionId).sort()).toEqual([
        "fresh-1",
        "fresh-2",
      ]);
    });

    it("takes a fresh question from another category before a recent one", () => {
      const selected = selectGameQuestions({
        categories: ["history", "geography"],
        levels: [1, 1],
        candidates: [
          recent("history-recent", "history", 1),
          fresh("geography-fresh-1", "geography", 1),
          fresh("geography-fresh-2", "geography", 1),
        ],
        random: createSeededRandom(5),
      });

      expect(selected.map((question) => question.questionId).sort()).toEqual([
        "geography-fresh-1",
        "geography-fresh-2",
      ]);
    });

    it("uses recent questions once no fresh question is left", () => {
      const selected = selectGameQuestions({
        categories: ["history"],
        levels: [2, 2, 2],
        candidates: [
          recent("recent-1", "history", 2),
          fresh("fresh", "history", 2),
          recent("recent-2", "history", 2),
        ],
        random: createSeededRandom(6),
      });

      expect(selected[0].questionId).toBe("fresh");
      expect(selected.map((question) => question.questionId).sort()).toEqual([
        "fresh",
        "recent-1",
        "recent-2",
      ]);
    });

    it("skips a level only when no selected category has a question for it", () => {
      const selected = selectGameQuestions({
        categories: SELECTED,
        levels: [1, 2, 3],
        candidates: [fresh("level-1", "history", 1), fresh("level-3", "chemistry", 3)],
        random: createSeededRandom(7),
      });

      expect(selected).toEqual([
        { questionId: "level-1", categoryId: "history", difficulty: 1 },
        { questionId: "level-3", categoryId: "chemistry", difficulty: 3 },
      ]);
    });

    it("draws different questions in different games", () => {
      const draw = (seed: number) =>
        selectGameQuestions({
          categories: SELECTED,
          levels: buildLevelSchedule(10),
          candidates: buildCandidates(SELECTED, 30),
          random: createSeededRandom(seed),
        }).map((question) => question.questionId);

      expect(draw(1)).not.toEqual(draw(2));
    });

    it("draws with Math.random by default", () => {
      const levels = buildLevelSchedule(10);
      const selected = selectGameQuestions({
        categories: SELECTED,
        levels,
        candidates: buildCandidates(SELECTED, 10),
      });

      expect(selected.map((question) => question.difficulty)).toEqual(levels);
    });

    it("returns no question when no category is selected", () => {
      expect(
        selectGameQuestions({
          categories: [],
          levels: buildLevelSchedule(10),
          candidates: buildCandidates(SELECTED, 10),
        })
      ).toEqual([]);
    });

    it("keeps levels, rounds and unique questions for any game size and category count", () => {
      const allCategories = ["history", "geography", "chemistry", "art", "music"];

      for (let seed = 1; seed <= 40; seed += 1) {
        const random = createSeededRandom(seed);
        const categories = allCategories.slice(0, 1 + (seed % allCategories.length));
        const questionCount = 10 + 5 * (seed % 9);
        const levels = buildLevelSchedule(questionCount);
        const selected = selectGameQuestions({
          categories,
          levels,
          candidates: buildCandidates(categories, 15),
          random,
        });
        const drawnCategories = selected.map((question) => question.categoryId);

        expect(selected.map((question) => question.difficulty)).toEqual(levels);
        expect(new Set(selected.map((question) => question.questionId)).size).toBe(questionCount);
        expectRounds(drawnCategories, categories);
        if (categories.length > 1) {
          expectNoConsecutiveRepeats(drawnCategories);
        }
      }
    });
  });
});
