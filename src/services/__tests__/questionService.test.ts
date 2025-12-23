/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
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

      const result = await fetchQuestionsByCategories(["math", "geography"], "pt-BR");

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
        difficulty: "level1",
        points: 100,
        category: "math",
      });
      expect(result[1]).toEqual({
        id: "uuid-2",
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2,
        difficulty: "level2",
        points: 250,
        category: "geography",
      });
    });

    it("should retry when the token expires during the RPC call", async () => {
      const mockRpcResponse = [
        {
          id: "uuid-1",
          question_text: "Recovered question",
          options: ["A", "B", "C", "D"],
          correct_answer_index: 1,
          difficulty: 1,
          category_id: "math",
        },
      ];

      vi.mocked(authenticateForQuizAccess).mockResolvedValue();
      vi.mocked(supabase.rpc)
        .mockResolvedValueOnce({
          data: null,
          error: { message: "JWT expired" } as never,
        })
        .mockResolvedValueOnce({
          data: mockRpcResponse,
          error: null,
        });

      const result = await fetchQuestionsByCategories(["math"], "pt-BR");

      expect(authenticateForQuizAccess).toHaveBeenCalledTimes(2);
      expect(supabase.rpc).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "uuid-1",
        question: "Recovered question",
        options: ["A", "B", "C", "D"],
        correctAnswer: 1,
        difficulty: "level1",
        points: 100,
        category: "math",
      });
    });

    it("should map difficulty levels correctly", async () => {
      const mockRpcResponse = [
        {
          id: "uuid-1",
          question_text: "Level 1 question",
          options: ["A", "B", "C", "D"],
          correct_answer_index: 0,
          difficulty: 1,
          category_id: "test",
        },
        {
          id: "uuid-2",
          question_text: "Level 2 question",
          options: ["A", "B", "C", "D"],
          correct_answer_index: 1,
          difficulty: 2,
          category_id: "test",
        },
        {
          id: "uuid-3",
          question_text: "Level 3 question",
          options: ["A", "B", "C", "D"],
          correct_answer_index: 2,
          difficulty: 3,
          category_id: "test",
        },
        {
          id: "uuid-4",
          question_text: "Level 4 question",
          options: ["A", "B", "C", "D"],
          correct_answer_index: 3,
          difficulty: 4,
          category_id: "test",
        },
        {
          id: "uuid-5",
          question_text: "Level 5 question",
          options: ["A", "B", "C", "D"],
          correct_answer_index: 0,
          difficulty: 5,
          category_id: "test",
        },
      ];

      vi.mocked(authenticateForQuizAccess).mockResolvedValueOnce();
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockRpcResponse,
        error: null,
      });

      const result = await fetchQuestionsByCategories([], "pt-BR");

      expect(result[0].difficulty).toBe("level1");
      expect(result[0].points).toBe(100);
      expect(result[1].difficulty).toBe("level2");
      expect(result[1].points).toBe(250);
      expect(result[2].difficulty).toBe("level3");
      expect(result[2].points).toBe(500);
      expect(result[3].difficulty).toBe("level4");
      expect(result[3].points).toBe(1000);
      expect(result[4].difficulty).toBe("level5");
      expect(result[4].points).toBe(2000);
    });

    it("should map pt-BR locale to pt language", async () => {
      const mockRpcResponse = [
        {
          id: "uuid-1",
          question_text: "Pergunta em português",
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

      await fetchQuestionsByCategories([], "pt-BR");

      expect(supabase.rpc).toHaveBeenCalledWith("get_questions_by_categories", {
        p_categories: [],
        p_lang: "pt",
        p_limit: 10,
      });
    });

    it("should map en-UK locale to en language", async () => {
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

      await fetchQuestionsByCategories([], "en-UK");

      expect(supabase.rpc).toHaveBeenCalledWith("get_questions_by_categories", {
        p_categories: [],
        p_lang: "en",
        p_limit: 10,
      });
    });

    it("should map es-BO locale to es language", async () => {
      const mockRpcResponse = [
        {
          id: "uuid-1",
          question_text: "Pregunta en español",
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

      await fetchQuestionsByCategories([], "es-BO");

      expect(supabase.rpc).toHaveBeenCalledWith("get_questions_by_categories", {
        p_categories: [],
        p_lang: "es",
        p_limit: 10,
      });
    });

    it("should throw error when RPC call fails", async () => {
      vi.mocked(authenticateForQuizAccess).mockResolvedValueOnce();
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: "Database error" } as never,
      });

      await expect(fetchQuestionsByCategories([], "pt-BR")).rejects.toThrow(
        "Failed to fetch questions: Database error"
      );
    });

    it("should throw error when no questions are returned", async () => {
      vi.mocked(authenticateForQuizAccess).mockResolvedValueOnce();
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [],
        error: null,
      });

      await expect(fetchQuestionsByCategories(["nonexistent"], "pt-BR")).rejects.toThrow(
        "No questions found for the selected categories"
      );
    });

    it("should handle authentication failure", async () => {
      vi.mocked(authenticateForQuizAccess).mockRejectedValueOnce(
        new Error("Authentication failed")
      );

      await expect(fetchQuestionsByCategories([], "pt-BR")).rejects.toThrow(
        "Authentication failed"
      );

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

      await fetchQuestionsByCategories([], "pt-BR");

      expect(supabase.rpc).toHaveBeenCalledWith("get_questions_by_categories", {
        p_categories: [],
        p_lang: "pt",
        p_limit: 10,
      });
    });
  });
});
