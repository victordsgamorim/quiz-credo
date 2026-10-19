import { describe, it, expect } from "vitest";

import {
  LEVEL_POINTS,
  MAX_STREAK_LEVEL,
  MAX_STREAK_MULTIPLIER,
  applyMultiplier,
  countStreak,
  getFrozenQuestions,
  withoutFrozenMisses,
  getMultiplierLevel,
  getQuestionMultiplier,
  getStreakLevel,
  getStreakMultiplier,
} from "../scoring";

// Answers to questions "q1", "q2", ..., in play order
const answersOf = (results: boolean[]) =>
  results.map((isCorrect, index) => ({ questionId: `q${index + 1}`, isCorrect }));

// eslint-disable-next-line max-lines-per-function
describe("scoring", () => {
  describe("LEVEL_POINTS", () => {
    it("gives more points to every harder level", () => {
      expect(Object.values(LEVEL_POINTS)).toEqual([10, 20, 30, 40, 50]);
    });
  });

  describe("getStreakMultiplier", () => {
    it.each([
      [0, 1],
      [4, 1],
      [5, 1.5],
      [6, 2],
      [7, 2.5],
      [8, 3],
      [20, 3],
    ])("gives a streak of %i a x%s multiplier with the default threshold", (streak, multiplier) => {
      expect(getStreakMultiplier(streak, 5)).toBe(multiplier);
    });

    it("starts the multiplier when the streak reaches the threshold", () => {
      expect(getStreakMultiplier(0, 1)).toBe(1);
      expect(getStreakMultiplier(1, 1)).toBe(1.5);
      expect(getStreakMultiplier(4, 1)).toBe(3);
      expect(getStreakMultiplier(2, 3)).toBe(1);
      expect(getStreakMultiplier(3, 3)).toBe(1.5);
      expect(getStreakMultiplier(9, 10)).toBe(1);
      expect(getStreakMultiplier(10, 10)).toBe(1.5);
    });

    it("never goes above the maximum multiplier", () => {
      expect(MAX_STREAK_MULTIPLIER).toBe(3);
      expect(getStreakMultiplier(50, 3)).toBe(MAX_STREAK_MULTIPLIER);
    });
  });

  describe("getMultiplierLevel", () => {
    it("numbers the multipliers like getStreakLevel", () => {
      expect([1, 1.5, 2, 2.5, 3].map(getMultiplierLevel)).toEqual([0, 1, 2, 3, 4]);
      expect(getMultiplierLevel(getStreakMultiplier(7, 5))).toBe(getStreakLevel(7, 5));
    });

    it("stays within the levels", () => {
      expect(getMultiplierLevel(0.5)).toBe(0);
      expect(getMultiplierLevel(5)).toBe(MAX_STREAK_LEVEL);
    });
  });

  describe("getStreakLevel", () => {
    it("numbers the multipliers from 0 (x1) to 4 (x3)", () => {
      expect([3, 4, 5, 6, 7, 8, 30].map((streak) => getStreakLevel(streak, 5))).toEqual([
        0, 0, 1, 2, 3, 4, 4,
      ]);
      expect(MAX_STREAK_LEVEL).toBe(4);
    });
  });

  describe("applyMultiplier", () => {
    it("multiplies the points of every level into whole numbers", () => {
      Object.values(LEVEL_POINTS).forEach((points) => {
        [1, 1.5, 2, 2.5, 3].forEach((multiplier) => {
          expect(Number.isInteger(applyMultiplier(points, multiplier))).toBe(true);
        });
      });
      expect(applyMultiplier(30, 1.5)).toBe(45);
      expect(applyMultiplier(50, 3)).toBe(150);
    });
  });

  describe("countStreak", () => {
    it("is zero without answers or after a wrong answer", () => {
      expect(countStreak([])).toBe(0);
      expect(countStreak(answersOf([true, true, false]))).toBe(0);
    });

    it("counts only the correct answers since the last wrong one", () => {
      expect(countStreak(answersOf([true, false, true, true]))).toBe(2);
      expect(countStreak(answersOf([true, true, true]))).toBe(3);
    });
  });

  describe("frozen streak (Freeze)", () => {
    it("keeps the streak through a wrong answer to a frozen question", () => {
      const answers = answersOf([true, true, true, false, true]);
      expect(countStreak(withoutFrozenMisses(answers, new Set(["q4"])))).toBe(4);
      // Without the freeze, the wrong answer breaks it
      expect(countStreak(answers)).toBe(1);
    });

    it("doesn't add to the streak with a frozen wrong answer, nor protect the other questions", () => {
      const answers = answersOf([true, true, false, false]);
      expect(countStreak(withoutFrozenMisses(answers, new Set(["q3", "q4"])))).toBe(2);
      expect(countStreak(withoutFrozenMisses(answers, new Set(["q4"])))).toBe(0);
    });

    it("keeps the multiplier of the question after a frozen miss", () => {
      const answers = answersOf([true, true, true, true, true, false]);
      expect(getQuestionMultiplier(withoutFrozenMisses(answers, new Set(["q6"])), "q7", 5)).toBe(
        1.5
      );
      expect(getQuestionMultiplier(answers, "q7", 5)).toBe(1);
    });

    it("freezes the question Freeze is used on and the next one", () => {
      const ids = ["q1", "q2", "q3", "q4"];
      expect(getFrozenQuestions(["q2"], ids)).toEqual(new Set(["q2", "q3"]));
      expect(getFrozenQuestions(["q4"], ids)).toEqual(new Set(["q4"]));
      expect(getFrozenQuestions([], ids)).toEqual(new Set());
    });
  });

  describe("getQuestionMultiplier", () => {
    const fiveCorrect = answersOf([true, true, true, true, true]);

    it("uses the streak earned before the question", () => {
      expect(getQuestionMultiplier(fiveCorrect, "q6", 5)).toBe(1.5);
      expect(getQuestionMultiplier(fiveCorrect.slice(0, 4), "q5", 5)).toBe(1);
    });

    it("keeps the question's multiplier once it is answered", () => {
      const sixCorrect = answersOf([true, true, true, true, true, true]);
      const missedSixth = answersOf([true, true, true, true, true, false]);

      expect(getQuestionMultiplier(sixCorrect, "q6", 5)).toBe(1.5);
      expect(getQuestionMultiplier(missedSixth, "q6", 5)).toBe(1.5);
      expect(getQuestionMultiplier(missedSixth, "q7", 5)).toBe(1);
    });
  });
});
