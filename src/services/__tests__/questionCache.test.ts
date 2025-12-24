import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  cacheQuestion,
  cacheQuestions,
  clearQuestionCache,
  getCachedQuestionIds,
  getCacheStats,
  isQuestionCached,
} from "../questionCache";

// eslint-disable-next-line max-lines-per-function
describe("questionCache", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe("getCachedQuestionIds", () => {
    it("returns empty array when cache is empty", () => {
      const ids = getCachedQuestionIds();
      expect(ids).toEqual([]);
    });

    it("returns cached question IDs", () => {
      cacheQuestion("q1");
      cacheQuestion("q2");

      const ids = getCachedQuestionIds();
      expect(ids).toEqual(["q1", "q2"]);
    });

    it("filters out expired questions", () => {
      // Mock Date.now to simulate time passing
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);

      cacheQuestion("q1");

      // Move time forward 25 hours (beyond 24h TTL)
      vi.spyOn(Date, "now").mockReturnValue(now + 25 * 60 * 60 * 1000);

      const ids = getCachedQuestionIds();
      expect(ids).toEqual([]);
    });

    it("keeps valid questions and removes expired ones", () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);

      cacheQuestion("q1");

      // Move time forward 12 hours
      vi.spyOn(Date, "now").mockReturnValue(now + 12 * 60 * 60 * 1000);

      cacheQuestion("q2");

      // Move time forward another 13 hours (q1 is now expired, q2 is still valid)
      vi.spyOn(Date, "now").mockReturnValue(now + 25 * 60 * 60 * 1000);

      const ids = getCachedQuestionIds();
      expect(ids).toEqual(["q2"]);
    });

    it("handles corrupted cache data gracefully", () => {
      localStorage.setItem("quiz_questions_cache", "invalid-json");

      const ids = getCachedQuestionIds();
      expect(ids).toEqual([]);
    });
  });

  describe("isQuestionCached", () => {
    it("returns false when question is not cached", () => {
      expect(isQuestionCached("q1")).toBe(false);
    });

    it("returns true when question is cached", () => {
      cacheQuestion("q1");
      expect(isQuestionCached("q1")).toBe(true);
    });

    it("returns false for expired questions", () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);

      cacheQuestion("q1");

      // Move time forward 25 hours
      vi.spyOn(Date, "now").mockReturnValue(now + 25 * 60 * 60 * 1000);

      expect(isQuestionCached("q1")).toBe(false);
    });
  });

  describe("cacheQuestion", () => {
    it("adds a question to the cache", () => {
      cacheQuestion("q1");

      expect(getCachedQuestionIds()).toEqual(["q1"]);
    });

    it("does not add duplicate questions", () => {
      cacheQuestion("q1");
      cacheQuestion("q1");

      expect(getCachedQuestionIds()).toEqual(["q1"]);
    });

    it("adds multiple different questions", () => {
      cacheQuestion("q1");
      cacheQuestion("q2");
      cacheQuestion("q3");

      expect(getCachedQuestionIds()).toEqual(["q1", "q2", "q3"]);
    });

    it("handles localStorage errors gracefully", () => {
      // Mock localStorage.setItem to throw an error
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
      setItemSpy.mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      // Should not throw
      expect(() => cacheQuestion("q1")).not.toThrow();

      setItemSpy.mockRestore();
    });
  });

  describe("cacheQuestions", () => {
    it("adds multiple questions to the cache", () => {
      cacheQuestions(["q1", "q2", "q3"]);

      expect(getCachedQuestionIds()).toEqual(["q1", "q2", "q3"]);
    });

    it("does not add duplicate questions", () => {
      cacheQuestions(["q1", "q2"]);
      cacheQuestions(["q2", "q3"]);

      expect(getCachedQuestionIds()).toEqual(["q1", "q2", "q3"]);
    });

    it("handles empty array", () => {
      cacheQuestions([]);

      expect(getCachedQuestionIds()).toEqual([]);
    });
  });

  describe("clearQuestionCache", () => {
    it("removes all cached questions", () => {
      cacheQuestions(["q1", "q2", "q3"]);

      clearQuestionCache();

      expect(getCachedQuestionIds()).toEqual([]);
    });

    it("handles errors gracefully", () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");
      removeItemSpy.mockImplementation(() => {
        throw new Error("Storage error");
      });

      // Should not throw
      expect(() => clearQuestionCache()).not.toThrow();

      removeItemSpy.mockRestore();
    });
  });

  describe("getCacheStats", () => {
    it("returns zero stats when cache is empty", () => {
      const stats = getCacheStats();

      expect(stats).toEqual({
        total: 0,
        valid: 0,
        expired: 0,
      });
    });

    it("returns correct stats for valid questions", () => {
      cacheQuestions(["q1", "q2", "q3"]);

      const stats = getCacheStats();

      expect(stats).toEqual({
        total: 3,
        valid: 3,
        expired: 0,
      });
    });

    it("returns correct stats with expired questions", () => {
      const now = Date.now();

      // Manually create cache with one expired and one valid question
      const cache = {
        questions: [
          { id: "q1", timestamp: now - 25 * 60 * 60 * 1000 }, // 25 hours ago (expired)
          { id: "q2", timestamp: now - 1 * 60 * 60 * 1000 }, // 1 hour ago (valid)
        ],
      };

      localStorage.setItem("quiz_questions_cache", JSON.stringify(cache));

      const stats = getCacheStats();

      expect(stats).toEqual({
        total: 2,
        valid: 1,
        expired: 1,
      });
    });

    it("handles corrupted cache gracefully", () => {
      localStorage.setItem("quiz_questions_cache", "invalid-json");

      const stats = getCacheStats();

      expect(stats).toEqual({
        total: 0,
        valid: 0,
        expired: 0,
      });
    });
  });
});
