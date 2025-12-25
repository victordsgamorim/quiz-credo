/* eslint-disable @typescript-eslint/unbound-method */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { supabase } from "@/lib/supabase";

import {
  cacheQuestion,
  cacheQuestions,
  clearQuestionCache,
  getCachedQuestionIds,
  getCacheStats,
} from "../supabaseQuestionCache";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

// eslint-disable-next-line max-lines-per-function
describe("supabaseQuestionCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCachedQuestionIds", () => {
    it("returns empty array when no cache exists", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null,
      } as never);

      const ids = await getCachedQuestionIds();
      expect(ids).toEqual([]);
      expect(supabase.rpc).toHaveBeenCalledWith("get_cached_question_ids");
    });

    it("returns cached question IDs from Supabase", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: ["q1", "q2", "q3"],
        error: null,
      } as never);

      const ids = await getCachedQuestionIds();
      expect(ids).toEqual(["q1", "q2", "q3"]);
    });

    it("handles Supabase errors gracefully", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      } as never);

      const ids = await getCachedQuestionIds();
      expect(ids).toEqual([]);
    });

    it("handles exceptions gracefully", async () => {
      vi.mocked(supabase.rpc).mockRejectedValue(new Error("Network error"));

      const ids = await getCachedQuestionIds();
      expect(ids).toEqual([]);
    });
  });

  describe("cacheQuestion", () => {
    it("caches a single question via Supabase RPC", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
      } as never);

      await cacheQuestion("q1");

      expect(supabase.rpc).toHaveBeenCalledWith("cache_user_questions", {
        p_question_ids: ["q1"],
      });
    });

    it("handles Supabase errors gracefully", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      } as never);

      await expect(cacheQuestion("q1")).resolves.not.toThrow();
    });

    it("handles exceptions gracefully", async () => {
      vi.mocked(supabase.rpc).mockRejectedValue(new Error("Network error"));

      await expect(cacheQuestion("q1")).resolves.not.toThrow();
    });
  });

  describe("cacheQuestions", () => {
    it("caches multiple questions via Supabase RPC", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
      } as never);

      await cacheQuestions(["q1", "q2", "q3"]);

      expect(supabase.rpc).toHaveBeenCalledWith("cache_user_questions", {
        p_question_ids: ["q1", "q2", "q3"],
      });
    });

    it("skips RPC call when array is empty", async () => {
      await cacheQuestions([]);

      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("handles Supabase errors gracefully", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      } as never);

      await expect(cacheQuestions(["q1", "q2"])).resolves.not.toThrow();
    });
  });

  describe("clearQuestionCache", () => {
    it("clears cache via Supabase RPC", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
      } as never);

      await clearQuestionCache();

      expect(supabase.rpc).toHaveBeenCalledWith("clear_user_question_cache");
    });

    it("handles Supabase errors gracefully", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      } as never);

      await expect(clearQuestionCache()).resolves.not.toThrow();
    });
  });

  describe("getCacheStats", () => {
    it("returns cache statistics from Supabase", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [{ total: 10, valid: 8, expired: 2 }],
        error: null,
      } as never);

      const stats = await getCacheStats();

      expect(stats).toEqual({
        total: 10,
        valid: 8,
        expired: 2,
      });
      expect(supabase.rpc).toHaveBeenCalledWith("get_user_cache_stats");
    });

    it("returns zero stats when no data", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null,
      } as never);

      const stats = await getCacheStats();

      expect(stats).toEqual({
        total: 0,
        valid: 0,
        expired: 0,
      });
    });

    it("handles Supabase errors gracefully", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      } as never);

      const stats = await getCacheStats();

      expect(stats).toEqual({
        total: 0,
        valid: 0,
        expired: 0,
      });
    });
  });
});
