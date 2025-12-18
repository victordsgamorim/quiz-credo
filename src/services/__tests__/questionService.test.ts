/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

vi.mock("../authService", () => ({
  authenticateForQuizAccess: vi.fn(),
}));

import { supabase } from "@/lib/supabase";

import { authenticateForQuizAccess } from "../authService";
import { fetchQuestionsByCategories } from "../questionService";

describe("questionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.language
    Object.defineProperty(window.navigator, "language", {
      value: "pt-BR",
      configurable: true,
    });
  });

  describe("fetchQuestionsByCategories", () => {
    it("should authenticate and fetch questions successfully", async () => {
      const mockRpcResponse = [
        {
          id: "uuid-1",
          question_text: "What is 2+2?",
          options: ["1", "2", "3", "4"],
          correct_answer_index: 3,
          difficulty: 1,
          category_id: "math",
        },
        {
          id: "uuid-2",
          question_text: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correct_answer_index: 2,
          difficulty: 2,
          category_id: "geography",
        },
      ];

      vi.mocked(authenticateForQuizAccess).mockResolvedValueOnce();
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockRpcResponse,
        error: null,
      });

      const result = await fetchQuestionsByCategories(["math", "geography"]);

      expect(authenticateForQuizAccess).toHaveBeenCalledTimes(1);
      expect(supabase.rpc).toHaveBeenCalledWith("get_questions_by_categories", {
        p_categories: ["math", "geography"],
        p_lang: "pt",
        p_limit: 10,
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "uuid-1",
        question: "What is 2+2?",
        options: ["1", "2", "3", "4"],
        correctAnswer: 3,
        difficulty: "easy",
        points: 100,
        category: "math",
      });
      expect(result[1]).toEqual({
        id: "uuid-2",
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2,
        difficulty: "medium",
        points: 250,
        category: "geography",
      });
    });

    it("should map difficulty levels correctly", async () => {
      const mockRpcResponse = [
        {
          id: "uuid-1",
          question_text: "Easy question",
          options: ["A", "B", "C", "D"],
          correct_answer_index: 0,
          difficulty: 1,
          category_id: "test",
        },
        {
          id: "uuid-2",
          question_text: "Medium question",
          options: ["A", "B", "C", "D"],
          correct_answer_index: 1,
          difficulty: 2,
          category_id: "test",
        },
        {
          id: "uuid-3",
          question_text: "Hard question",
          options: ["A", "B", "C", "D"],
          correct_answer_index: 2,
          difficulty: 3,
          category_id: "test",
        },
      ];

      vi.mocked(authenticateForQuizAccess).mockResolvedValueOnce();
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockRpcResponse,
        error: null,
      });

      const result = await fetchQuestionsByCategories([]);

      expect(result[0].difficulty).toBe("easy");
      expect(result[0].points).toBe(100);
      expect(result[1].difficulty).toBe("medium");
      expect(result[1].points).toBe(250);
      expect(result[2].difficulty).toBe("hard");
      expect(result[2].points).toBe(500);
    });

    it("should use browser language for translations", async () => {
      Object.defineProperty(window.navigator, "language", {
        value: "en-US",
        configurable: true,
      });

      const mockRpcResponse = [
        {
          id: "uuid-1",
          question_text: "Question in English",
          options: ["A", "B", "C", "D"],
          correct_answer_index: 0,
          difficulty: 1,
          category_id: "test",
        },
      ];

      vi.mocked(authenticateForQuizAccess).mockResolvedValueOnce();
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockRpcResponse,
        error: null,
      });

      await fetchQuestionsByCategories([]);

      expect(supabase.rpc).toHaveBeenCalledWith("get_questions_by_categories", {
        p_categories: [],
        p_lang: "en",
        p_limit: 10,
      });
    });

    it("should throw error when RPC call fails", async () => {
      vi.mocked(authenticateForQuizAccess).mockResolvedValueOnce();
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: "Database error" } as never,
      });

      await expect(fetchQuestionsByCategories([])).rejects.toThrow(
        "Failed to fetch questions: Database error"
      );
    });

    it("should throw error when no questions are returned", async () => {
      vi.mocked(authenticateForQuizAccess).mockResolvedValueOnce();
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [],
        error: null,
      });

      await expect(fetchQuestionsByCategories(["nonexistent"])).rejects.toThrow(
        "No questions found for the selected categories"
      );
    });

    it("should handle authentication failure", async () => {
      vi.mocked(authenticateForQuizAccess).mockRejectedValueOnce(
        new Error("Authentication failed")
      );

      await expect(fetchQuestionsByCategories([])).rejects.toThrow("Authentication failed");

      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("should pass empty array for all categories", async () => {
      const mockRpcResponse = [
        {
          id: "uuid-1",
          question_text: "Random question",
          options: ["A", "B", "C", "D"],
          correct_answer_index: 0,
          difficulty: 1,
          category_id: "any",
        },
      ];

      vi.mocked(authenticateForQuizAccess).mockResolvedValueOnce();
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockRpcResponse,
        error: null,
      });

      await fetchQuestionsByCategories([]);

      expect(supabase.rpc).toHaveBeenCalledWith("get_questions_by_categories", {
        p_categories: [],
        p_lang: "pt",
        p_limit: 10,
      });
    });
  });
});
