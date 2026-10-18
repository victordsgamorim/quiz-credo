import { describe, it, expect } from "vitest";

import {
  LEVEL_POINTS,
  MAX_STREAK_LEVEL,
  MAX_STREAK_MULTIPLIER,
  applyMultiplier,
  countStreak,
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
