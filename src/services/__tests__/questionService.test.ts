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

vi.mock("../supabaseQuestionCache", () => ({
  getCachedQuestionIds: vi.fn(() => Promise.resolve([])),
  cacheQuestions: vi.fn(() => Promise.resolve()),
}));

import { CATEGORY_IDS, type CategoryId } from "@/constants/categories";
import { supabase } from "@/lib/supabase";
import type { Question } from "@/types/quiz";

import { authenticateForQuizAccess } from "../authService";
import { fetchQuestionsByCategories, fetchQuestionsInAllLocales } from "../questionService";
import { cacheQuestions, getCachedQuestionIds } from "../supabaseQuestionCache";

type RpcResult = { data: unknown; error: { message: string } | null };
type RpcParams = Record<string, unknown>;

const LEVELS = [1, 2, 3, 4, 5];
const SELECTED: CategoryId[] = ["history", "geography", "chemistry"];

// Candidate rows like the get_question_candidates RPC: IDs look like "history-3-0"
const buildCandidateRows = (categories: string[], perBucket = 10) =>
  categories.flatMap((categoryId) =>
    LEVELS.flatMap((difficulty) =>
      Array.from({ length: perBucket }, (_, index) => ({
        question_id: `${categoryId}-${difficulty}-${index}`,
        category_id: categoryId,
        difficulty,
        is_recent: false,
      }))
    )
  );

// "<category>-<level>-<index>", where the category may contain dashes
const levelOf = (id: string) => {
  const parts = id.split("-");
  return Number(parts[parts.length - 2]);
};

// Content rows like the get_questions_by_ids RPC, one per (question, language)
const buildContentRows = (params: RpcParams) =>
  (params.p_question_ids as string[]).flatMap((id) =>
    (params.p_langs as string[]).map((lang) => ({
      id,
      lang,
      question_text: `${id} (${lang})`,
      options: ["A", "B", "C", "D"].map((option) => `${option} (${lang})`),
      correct_answer_index: 2,
      difficulty: levelOf(id),
    }))
  );

type RpcHandlers = {
  candidates?: (params: RpcParams) => RpcResult;
  content?: (params: RpcParams) => RpcResult;
};

const mockRpc = ({
  candidates = () => ({ data: buildCandidateRows(SELECTED), error: null }),
  content = (params) => ({ data: buildContentRows(params), error: null }),
}: RpcHandlers = {}) => {
  vi.mocked(supabase.rpc).mockImplementation(((functionName: string, params: RpcParams) =>
    Promise.resolve(
      functionName === "get_question_candidates" ? candidates(params) : content(params)
    )) as never);
};

const rpcParams = (functionName: string): RpcParams | undefined =>
  vi.mocked(supabase.rpc).mock.calls.find(([name]) => name === functionName)?.[1] as
    | RpcParams
    | undefined;

const ids = (questions: Question[]) => questions.map((question) => question.id);

describe("questionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authenticateForQuizAccess).mockResolvedValue();
    vi.mocked(getCachedQuestionIds).mockResolvedValue([]);
    mockRpc();
  });

  describe("fetchQuestionsByCategories", () => {
    it("draws random candidates of the selected categories and loads the drawn questions", async () => {
      const result = await fetchQuestionsByCategories(SELECTED, "pt-BR", 10);

      expect(authenticateForQuizAccess).toHaveBeenCalledTimes(1);
      expect(supabase.rpc).toHaveBeenCalledWith("get_question_candidates", {
        p_categories: SELECTED,
        p_langs: ["pt"],
        // 10 questions: 2/2/3/2/1 per level
        p_per_bucket: 3,
        p_recent_ids: [],
      });
      expect(supabase.rpc).toHaveBeenCalledWith("get_questions_by_ids", {
        p_question_ids: ids(result),
        p_langs: ["pt"],
      });
      expect(result).toHaveLength(10);
      expect(result[0]).toEqual({
        id: result[0].id,
        question: `${result[0].id} (pt)`,
        options: ["A (pt)", "B (pt)", "C (pt)", "D (pt)"],
        correctAnswer: 2,
        difficulty: "level1",
        points: 100,
        category: result[0].id.split("-")[0],
      });
    });

    it("respects the levels from 1 to 5 and their points", async () => {
      const result = await fetchQuestionsByCategories(SELECTED, "pt-BR", 10);

      expect(result.map((question) => question.difficulty)).toEqual([
        "level1",
        "level1",
        "level2",
        "level2",
        "level3",
        "level3",
        "level3",
        "level4",
        "level4",
        "level5",
      ]);
      expect(result.map((question) => question.points)).toEqual([
        100, 100, 250, 250, 500, 500, 500, 1000, 1000, 2000,
      ]);
    });

    it("draws each question's category in rounds of the selected categories", async () => {
      const result = await fetchQuestionsByCategories(SELECTED, "pt-BR", 10);
      const categories = result.map((question) => question.category);

      [0, 3, 6].forEach((start) => {
        expect([...categories.slice(start, start + 3)].sort()).toEqual([...SELECTED].sort());
      });
      expect(new Set(ids(result)).size).toBe(10);
    });

    it.each([
      ["pt-BR", "pt"],
      ["en-UK", "en"],
      ["es-BO", "es"],
    ] as const)("maps the %s locale to the %s language", async (locale, lang) => {
      await fetchQuestionsByCategories(SELECTED, locale, 10);

      expect(rpcParams("get_question_candidates")?.p_langs).toEqual([lang]);
      expect(rpcParams("get_questions_by_ids")?.p_langs).toEqual([lang]);
    });

    it("draws from every category when none is selected", async () => {
      mockRpc({ candidates: () => ({ data: buildCandidateRows(CATEGORY_IDS), error: null }) });

      const result = await fetchQuestionsByCategories([], "pt-BR");

      expect(rpcParams("get_question_candidates")?.p_categories).toEqual(CATEGORY_IDS);
      expect(result).toHaveLength(10);
    });

    it("ignores duplicated categories", async () => {
      await fetchQuestionsByCategories(["history", "history", "geography"], "pt-BR");

      expect(rpcParams("get_question_candidates")?.p_categories).toEqual(["history", "geography"]);
    });

    it("avoids questions from recent games and caches the drawn questions", async () => {
      vi.mocked(getCachedQuestionIds).mockResolvedValueOnce(["recent-1", "recent-2"]);

      const result = await fetchQuestionsByCategories(SELECTED, "pt-BR", 10, true);

      expect(rpcParams("get_question_candidates")?.p_recent_ids).toEqual(["recent-1", "recent-2"]);
      expect(cacheQuestions).toHaveBeenCalledWith(ids(result));
    });

    it("uses the cache by default", async () => {
      await fetchQuestionsByCategories(SELECTED, "pt-BR", 10);

      expect(getCachedQuestionIds).toHaveBeenCalled();
      expect(cacheQuestions).toHaveBeenCalledTimes(1);
    });

    it("does not use the cache when enableCache is false", async () => {
      await fetchQuestionsByCategories(SELECTED, "pt-BR", 10, false);

      expect(getCachedQuestionIds).not.toHaveBeenCalled();
      expect(cacheQuestions).not.toHaveBeenCalled();
      expect(rpcParams("get_question_candidates")?.p_recent_ids).toEqual([]);
    });

    it("authenticates again and retries when the token expires", async () => {
      let candidateCalls = 0;
      mockRpc({
        candidates: () => {
          candidateCalls += 1;
          return candidateCalls === 1
            ? { data: null, error: { message: "JWT expired" } }
            : { data: buildCandidateRows(SELECTED), error: null };
        },
      });

      const result = await fetchQuestionsByCategories(SELECTED, "pt-BR", 10);

      expect(authenticateForQuizAccess).toHaveBeenCalledTimes(2);
      expect(supabase.rpc).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(10);
    });

    it("throws when the candidates RPC fails", async () => {
      mockRpc({ candidates: () => ({ data: null, error: { message: "Database error" } }) });

      await expect(fetchQuestionsByCategories(SELECTED, "pt-BR")).rejects.toThrow(
        "Failed to fetch question candidates: Database error"
      );
    });

    it("throws when the questions RPC fails", async () => {
      mockRpc({ content: () => ({ data: null, error: { message: "Database error" } }) });

      await expect(fetchQuestionsByCategories(SELECTED, "pt-BR")).rejects.toThrow(
        "Failed to fetch questions: Database error"
      );
      expect(cacheQuestions).not.toHaveBeenCalled();
    });

    it("throws when no question is available", async () => {
      mockRpc({ candidates: () => ({ data: [], error: null }) });

      await expect(fetchQuestionsByCategories(SELECTED, "pt-BR")).rejects.toThrow(
        "No questions found for the selected categories"
      );
      expect(rpcParams("get_questions_by_ids")).toBeUndefined();
      expect(cacheQuestions).not.toHaveBeenCalled();
    });

    it("throws when a drawn question has no translation", async () => {
      mockRpc({ content: (params) => ({ data: buildContentRows(params).slice(1), error: null }) });

      await expect(fetchQuestionsByCategories(SELECTED, "pt-BR", 10)).rejects.toThrow(
        "Missing translations for pt-BR: found 9/10 questions"
      );
      expect(cacheQuestions).not.toHaveBeenCalled();
    });

    it("handles authentication failure", async () => {
      vi.mocked(authenticateForQuizAccess).mockRejectedValueOnce(
        new Error("Authentication failed")
      );

      await expect(fetchQuestionsByCategories(SELECTED, "pt-BR")).rejects.toThrow(
        "Authentication failed"
      );
      expect(supabase.rpc).not.toHaveBeenCalled();
    });
  });

  describe("fetchQuestionsInAllLocales", () => {
    it("loads the same questions in the same order for every locale", async () => {
      const result = await fetchQuestionsInAllLocales(SELECTED, 10);

      expect(rpcParams("get_question_candidates")?.p_langs).toEqual(["pt", "en", "es"]);
      expect(rpcParams("get_questions_by_ids")?.p_langs).toEqual(["pt", "en", "es"]);
      expect(Object.keys(result)).toEqual(["pt-BR", "en-UK", "es-BO"]);
      expect(ids(result["pt-BR"])).toHaveLength(10);
      expect(ids(result["en-UK"])).toEqual(ids(result["pt-BR"]));
      expect(ids(result["es-BO"])).toEqual(ids(result["pt-BR"]));
      expect(result["en-UK"][0].question).toBe(`${result["en-UK"][0].id} (en)`);
      expect(result["es-BO"][0].options[0]).toBe("A (es)");
    });

    it("draws the game only once for all locales", async () => {
      await fetchQuestionsInAllLocales(SELECTED, 10);

      expect(supabase.rpc).toHaveBeenCalledTimes(2);
      expect(cacheQuestions).toHaveBeenCalledTimes(1);
    });

    it("throws when a locale is missing a translation", async () => {
      mockRpc({
        content: (params) => ({
          data: buildContentRows(params).filter((row) => row.lang !== "es"),
          error: null,
        }),
      });

      await expect(fetchQuestionsInAllLocales(SELECTED, 10)).rejects.toThrow(
        "Missing translations for es-BO: found 0/10 questions"
      );
    });

    it("throws when the correct answer differs between locales", async () => {
      mockRpc({
        content: (params) => ({
          data: buildContentRows(params).map((row) =>
            row.lang === "en" ? { ...row, correct_answer_index: 0 } : row
          ),
          error: null,
        }),
      });

      await expect(fetchQuestionsInAllLocales(SELECTED, 10)).rejects.toThrow(
        "Question synchronization failed: answers differ across locales"
      );
      expect(cacheQuestions).not.toHaveBeenCalled();
    });
  });
});
