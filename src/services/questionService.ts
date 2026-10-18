import { CATEGORY_IDS, type CategoryId } from "@/constants/categories";
import { supabase } from "@/lib/supabase";
import type { Locale } from "@/types/i18n";
import type { Question } from "@/types/quiz";

import { authenticateForQuizAccess } from "./authService";
import {
  buildLevelSchedule,
  countQuestionsPerLevel,
  selectGameQuestions,
  type DifficultyLevel,
  type QuestionCandidate,
  type SelectedQuestion,
} from "./questionSelection";
import { getCachedQuestionIds, cacheQuestions } from "./supabaseQuestionCache";

type RpcQuestionResponse = {
  id: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  difficulty: number;
  category_id: string;
};

type RpcCandidateRow = {
  question_id: string;
  category_id: string;
  difficulty: number;
  is_recent: boolean;
};

type RpcQuestionContentRow = {
  id: string;
  lang: string;
  question_text: string;
  options: string[] | null;
  correct_answer_index: number | null;
  difficulty: number;
};

const SUPPORTED_LOCALES: Locale[] = ["pt-BR", "en-UK", "es-BO"];

/**
 * Maps application locale to Supabase language code
 *
 * @param locale - Application locale (pt-BR, en-UK, es-BO)
 * @returns Supabase language code (pt, en, es)
 */
const mapLocaleToLang = (locale: Locale): string => {
  if (locale === "pt-BR") return "pt";
  if (locale === "es-BO") return "es";
  return "en";
};

const isAuthTokenError = (error: { message?: string | null } | null): boolean => {
  if (!error?.message) return false;
  const normalizedMessage = error.message.toLowerCase();
  return (
    normalizedMessage.includes("jwt") ||
    normalizedMessage.includes("token") ||
    normalizedMessage.includes("auth")
  );
};

/**
 * Calls a quiz RPC function, authenticating again and retrying once when the token expired
 *
 * @param functionName - RPC function name
 * @param params - RPC function parameters
 * @param errorPrefix - Prefix of the error thrown when the call fails
 * @returns Rows returned by the function
 */
const callQuizRpc = async <T>(
  functionName: string,
  params: Record<string, unknown>,
  errorPrefix: string
): Promise<T[]> => {
  const executeRpc = () => supabase.rpc(functionName, params);

  let result = await executeRpc();
  if (result.error && isAuthTokenError(result.error)) {
    await authenticateForQuizAccess();
    result = await executeRpc();
  }

  if (result.error) {
    throw new Error(`${errorPrefix}: ${result.error.message}`);
  }

  return (result.data as unknown as T[] | null) ?? [];
};

/**
 * Maps database difficulty number to string
 *
 * @param difficulty - Difficulty number from database (1-5)
 * @returns Difficulty string
 */
const mapDifficulty = (
  difficulty: number
): "level1" | "level2" | "level3" | "level4" | "level5" => {
  if (difficulty === 1) return "level1";
  if (difficulty === 2) return "level2";
  if (difficulty === 3) return "level3";
  if (difficulty === 4) return "level4";
  return "level5";
};

/**
 * Calculates points based on difficulty level (1-5)
 *
 * @param difficulty - Difficulty number from database (1-5)
 * @returns Points for the question
 */
const calculatePoints = (difficulty: number): number => {
  if (difficulty === 1) return 100;
  if (difficulty === 2) return 250;
  if (difficulty === 3) return 500;
  if (difficulty === 4) return 1000;
  return 2000;
};

const toCandidate = (row: RpcCandidateRow): QuestionCandidate => ({
  questionId: row.question_id,
  categoryId: row.category_id,
  difficulty: row.difficulty as DifficultyLevel,
  isRecent: row.is_recent,
});

const isPlayable = (row: RpcQuestionContentRow | undefined): row is RpcQuestionContentRow =>
  row !== undefined &&
  (row.options?.length ?? 0) > 0 &&
  row.correct_answer_index !== null &&
  row.correct_answer_index >= 0 &&
  row.correct_answer_index < row.options.length;

/**
 * Maps a question row of an RPC response to Question format
 *
 * @param row - Question row
 * @param categoryId - Category shown for the question
 * @returns Mapped Question object
 */
const toQuestion = (
  row: Pick<
    RpcQuestionResponse,
    "id" | "question_text" | "options" | "correct_answer_index" | "difficulty"
  >,
  categoryId: string
): Question => ({
  id: row.id,
  question: row.question_text,
  options: row.options,
  correctAnswer: row.correct_answer_index,
  difficulty: mapDifficulty(row.difficulty),
  points: calculatePoints(row.difficulty),
  category: categoryId,
});

const buildLocaleQuestions = (
  selected: SelectedQuestion[],
  rowsByKey: Map<string, RpcQuestionContentRow>,
  locale: Locale
): Question[] => {
  const lang = mapLocaleToLang(locale);
  const questions = selected.flatMap((selection) => {
    const row = rowsByKey.get(`${selection.questionId}|${lang}`);
    // The category is the one the question was drawn for, always one of the selected categories
    return isPlayable(row) ? [toQuestion(row, selection.categoryId)] : [];
  });

  if (questions.length < selected.length) {
    throw new Error(
      `Missing translations for ${locale}: found ${questions.length}/${selected.length} questions`
    );
  }
  return questions;
};

// Guests answer by option index, and the server checks it against the pt-BR list
const assertSameAnswers = (questionLists: Question[][]) => {
  const [baseList] = questionLists;
  const hasSameAnswers = questionLists.every((questions) =>
    questions.every(
      (question, index) =>
        question.correctAnswer === baseList[index].correctAnswer &&
        question.options.length === baseList[index].options.length
    )
  );
  if (!hasSameAnswers) {
    throw new Error("Question synchronization failed: answers differ across locales");
  }
};

type FetchGameQuestionsParams = {
  categories: CategoryId[];
  locales: Locale[];
  questionCount: number;
  enableCache: boolean;
};

/**
 * Draws the questions of a new game (see questionSelection.ts) and loads them in every locale
 *
 * @param params - Game parameters
 * @param params.categories - Selected category IDs (empty means every category)
 * @param params.locales - Locales to load the questions in
 * @param params.questionCount - Number of questions in the game
 * @param params.enableCache - Whether to avoid and record questions in the Supabase cache
 * @returns One question list per locale, in the order of `locales`, with the same questions
 */
const fetchGameQuestions = async ({
  categories,
  locales,
  questionCount,
  enableCache,
}: FetchGameQuestionsParams): Promise<Question[][]> => {
  await authenticateForQuizAccess();

  const drawCategories = categories.length > 0 ? [...new Set(categories)] : CATEGORY_IDS;
  const langs = locales.map(mapLocaleToLang);
  // Questions from recent games are only drawn when no fresh question is left
  const recentIds = enableCache ? await getCachedQuestionIds() : [];

  const candidateRows = await callQuizRpc<RpcCandidateRow>(
    "get_question_candidates",
    {
      p_categories: drawCategories,
      p_langs: langs,
      // Enough candidates even when every question of a level comes from the same category
      p_per_bucket: Math.max(...countQuestionsPerLevel(questionCount)),
      p_recent_ids: recentIds,
    },
    "Failed to fetch question candidates"
  );

  const selected = selectGameQuestions({
    categories: drawCategories,
    levels: buildLevelSchedule(questionCount),
    candidates: candidateRows.map(toCandidate),
  });
  if (selected.length === 0) {
    throw new Error("No questions found for the selected categories");
  }

  const questionIds = selected.map((question) => question.questionId);
  const contentRows = await callQuizRpc<RpcQuestionContentRow>(
    "get_questions_by_ids",
    { p_question_ids: questionIds, p_langs: langs },
    "Failed to fetch questions"
  );
  const rowsByKey = new Map(contentRows.map((row) => [`${row.id}|${row.lang}`, row]));
  const questionLists = locales.map((locale) => buildLocaleQuestions(selected, rowsByKey, locale));
  assertSameAnswers(questionLists);

  if (enableCache) {
    await cacheQuestions(questionIds);
  }

  return questionLists;
};

/**
 * Fetches the questions of a new game in one locale
 * Levels go from 1 to 5, each question's category is drawn at random from the selected
 * categories, no question repeats in the game, and questions from recent games are avoided
 *
 * @param categories - Selected category IDs (empty means every category)
 * @param locale - Application locale for translations
 * @param limit - Number of questions to fetch (default 10)
 * @param enableCache - Whether to use question caching (default true)
 * @returns Promise with the game's questions, in play order
 */
export const fetchQuestionsByCategories = async (
  categories: CategoryId[],
  locale: Locale,
  limit: number = 10,
  enableCache: boolean = true
): Promise<Question[]> => {
  try {
    const [questions] = await fetchGameQuestions({
      categories,
      locales: [locale],
      questionCount: limit,
      enableCache,
    });
    return questions;
  } catch (error) {
    console.error("[QuestionService] Error fetching questions:", error);
    throw error;
  }
};

type FetchSingleQuestionParams = {
  categories: CategoryId[];
  difficulty: number | null;
  locale: Locale;
  excludeIds?: string[];
};

/**
 * Fetches a single random question from Supabase
 *
 * @param params - Parameters object
 * @param params.categories - Category IDs to pick the question from
 * @param params.difficulty - Difficulty level (1-5), or null for any level
 * @param params.locale - Application locale for translations
 * @param params.excludeIds - Question IDs that must not be returned
 * @returns Promise with a single question or null if none found
 */
export const fetchSingleQuestion = async ({
  categories,
  difficulty,
  locale,
  excludeIds = [],
}: FetchSingleQuestionParams): Promise<Question | null> => {
  try {
    await authenticateForQuizAccess();

    const data = await callQuizRpc<RpcQuestionResponse>(
      "get_single_random_question",
      {
        p_categories: categories,
        p_difficulty: difficulty,
        p_lang: mapLocaleToLang(locale),
        p_exclude_ids: excludeIds,
      },
      "Failed to fetch single question"
    );
    return data.length > 0 ? toQuestion(data[0], data[0].category_id) : null;
  } catch (error) {
    console.error("[QuestionService] Error fetching single question:", error);
    return null;
  }
};

/**
 * Fetches the SAME questions in all supported locales for multiplayer games
 * This ensures all players see the same questions, just in their preferred language
 *
 * @param categories - Array of category IDs to filter questions
 * @param limit - Number of questions to fetch (default 10)
 * @param enableCache - Whether to use question caching (default true)
 * @returns Promise with map of locale to questions array
 */
export const fetchQuestionsInAllLocales = async (
  categories: CategoryId[],
  limit: number = 10,
  enableCache: boolean = true
): Promise<Record<Locale, Question[]>> => {
  try {
    const questionLists = await fetchGameQuestions({
      categories,
      locales: SUPPORTED_LOCALES,
      questionCount: limit,
      enableCache,
    });
    return Object.fromEntries(
      SUPPORTED_LOCALES.map((locale, index) => [locale, questionLists[index]])
    ) as Record<Locale, Question[]>;
  } catch (error) {
    console.error("[QuestionService] Error fetching questions in all locales:", error);
    throw error;
  }
};
