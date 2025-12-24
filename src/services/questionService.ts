import type { CategoryId } from "@/constants/categories";
import { supabase } from "@/lib/supabase";
import type { Locale } from "@/types/i18n";
import type { Question } from "@/types/quiz";

import { authenticateForQuizAccess } from "./authService";
import { getCachedQuestionIds, isQuestionCached, cacheQuestions } from "./questionCache";

type RpcQuestionResponse = {
  id: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  difficulty: number;
  category_id: string;
};

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

type FetchQuestionsRpcParams = {
  categories: CategoryId[];
  lang: string;
  limit: number;
  errorPrefix: string;
};

const fetchQuestionsRpc = async ({
  categories,
  lang,
  limit,
  errorPrefix,
}: FetchQuestionsRpcParams): Promise<RpcQuestionResponse[]> => {
  await authenticateForQuizAccess();

  const executeRpc = () =>
    supabase.rpc("get_questions_by_categories", {
      p_categories: categories,
      p_lang: lang,
      p_limit: limit,
    });

  const result = await executeRpc();

  if (result.error && isAuthTokenError(result.error)) {
    await authenticateForQuizAccess();
    const retryResult = await executeRpc();
    if (retryResult.error) {
      throw new Error(`${errorPrefix}: ${retryResult.error.message}`);
    }
    return retryResult.data as unknown as RpcQuestionResponse[];
  }

  if (result.error) {
    throw new Error(`${errorPrefix}: ${result.error.message}`);
  }

  return result.data as unknown as RpcQuestionResponse[];
};

/**
 * Fetches random questions from Supabase based on selected categories
 * Validates against cache and replaces any cached questions
 *
 * @param categories - Array of category IDs to filter questions
 * @param locale - Application locale for translations
 * @param limit - Number of questions to fetch (default 10)
 * @returns Promise with array of questions
 */
export const fetchQuestionsByCategories = async (
  categories: CategoryId[],
  locale: Locale,
  limit: number = 10
): Promise<Question[]> => {
  try {
    const lang = mapLocaleToLang(locale);

    // Get cached question IDs to exclude from initial fetch
    const cachedIds = getCachedQuestionIds();

    // Fetch more questions than needed to account for potential cache hits
    // Multiply by 3 to have a good buffer of fresh questions
    const fetchLimit = cachedIds.length > 0 ? limit * 3 : limit;

    // Call RPC function to get questions from quiz schema
    const data = await fetchQuestionsRpc({
      categories,
      lang,
      limit: fetchLimit,
      errorPrefix: "Failed to fetch questions",
    });

    if (!data || data.length === 0) {
      throw new Error("No questions found for the selected categories");
    }

    // Map RPC response to Question format
    const allQuestions = data.map((q) => ({
      id: q.id,
      question: q.question_text,
      options: q.options,
      correctAnswer: q.correct_answer_index,
      difficulty: mapDifficulty(q.difficulty),
      points: calculatePoints(q.difficulty),
      category: q.category_id,
    }));

    // Filter out cached questions and take only the needed amount
    const freshQuestions = allQuestions.filter((q) => !isQuestionCached(q.id)).slice(0, limit);

    // If we still don't have enough fresh questions after fetching 3x,
    // it means the pool is very limited - fetch more individually
    if (freshQuestions.length < limit) {
      const needed = limit - freshQuestions.length;
      const additionalQuestions = await fetchAdditionalQuestions(needed, categories, locale, [
        ...cachedIds,
        ...freshQuestions.map((q) => q.id),
      ]);
      freshQuestions.push(...additionalQuestions);
    }

    // Cache the final question IDs
    cacheQuestions(freshQuestions.map((q) => q.id));

    return freshQuestions;
  } catch (error) {
    console.error("[QuestionService] Error fetching questions:", error);
    throw error;
  }
};

/**
 * Fetches additional fresh questions when initial fetch doesn't provide enough
 *
 * @param count - Number of additional questions needed
 * @param categories - Categories to fetch from
 * @param locale - Application locale
 * @param excludeIds - Question IDs to exclude
 * @returns Promise with array of fresh questions
 */
const fetchAdditionalQuestions = async (
  count: number,
  categories: CategoryId[],
  locale: Locale,
  excludeIds: string[]
): Promise<Question[]> => {
  const additionalQuestions: Question[] = [];
  const maxAttempts = count * 3; // Safety limit to avoid infinite loops
  let attempts = 0;

  while (additionalQuestions.length < count && attempts < maxAttempts) {
    attempts++;

    // Try to fetch a single random question not in excludeIds
    const question = await fetchSingleQuestion({
      categories,
      difficulty: null, // Any difficulty
      locale,
      excludeIds: [...excludeIds, ...additionalQuestions.map((q) => q.id)],
    });

    if (question && !excludeIds.includes(question.id)) {
      additionalQuestions.push(question);
    }
  }

  return additionalQuestions;
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
 * @returns Promise with a single question or null if none found
 */
export const fetchSingleQuestion = async ({
  categories,
  difficulty,
  locale,
  excludeIds = [],
}: FetchSingleQuestionParams): Promise<Question | null> => {
  try {
    const lang = mapLocaleToLang(locale);

    await authenticateForQuizAccess();

    const executeRpc = () =>
      supabase.rpc("get_single_random_question", {
        p_categories: categories,
        p_difficulty: difficulty,
        p_lang: lang,
        p_exclude_ids: excludeIds,
      });

    const result = await executeRpc();

    if (result.error && isAuthTokenError(result.error)) {
      await authenticateForQuizAccess();
      const retryResult = await executeRpc();
      if (retryResult.error) {
        throw new Error(`Failed to fetch single question: ${retryResult.error.message}`);
      }
      const data = retryResult.data as unknown as RpcQuestionResponse[];
      return data.length > 0 ? mapRpcResponseToQuestion(data[0]) : null;
    }

    if (result.error) {
      throw new Error(`Failed to fetch single question: ${result.error.message}`);
    }

    const data = result.data as unknown as RpcQuestionResponse[];
    return data.length > 0 ? mapRpcResponseToQuestion(data[0]) : null;
  } catch (error) {
    console.error("[QuestionService] Error fetching single question:", error);
    return null;
  }
};

/**
 * Maps RPC response to Question format
 *
 * @param rpcQuestion - RPC question response
 * @returns Mapped Question object
 */
const mapRpcResponseToQuestion = (rpcQuestion: RpcQuestionResponse): Question => ({
  id: rpcQuestion.id,
  question: rpcQuestion.question_text,
  options: rpcQuestion.options,
  correctAnswer: rpcQuestion.correct_answer_index,
  difficulty: mapDifficulty(rpcQuestion.difficulty),
  points: calculatePoints(rpcQuestion.difficulty),
  category: rpcQuestion.category_id,
});

/**
 * Fetches the SAME questions in all supported locales for multiplayer games
 * This ensures all players see the same questions, just in their preferred language
 *
 * Strategy: Fetch base questions once, then get ALL questions in other languages
 * and match by ID to guarantee same questions across all locales
 *
 * @param categories - Array of category IDs to filter questions
 * @param limit - Number of questions to fetch (default 10)
 * @returns Promise with map of locale to questions array
 */
export const fetchQuestionsInAllLocales = async (
  categories: CategoryId[],
  limit: number = 10
): Promise<Record<Locale, Question[]>> => {
  const locales: Locale[] = ["pt-BR", "en-UK", "es-BO"];
  const questionsByLocale: Record<string, Question[]> = {};

  // Step 1: Fetch base questions in pt-BR to establish the question IDs
  const baseQuestions = await fetchQuestionsByCategories(categories, "pt-BR", limit);
  const questionIds = baseQuestions.map((q) => q.id);

  console.log("[QuestionService] Base question IDs:", questionIds);
  console.log("[QuestionService] Categories:", categories);

  // Step 2: For EACH locale, fetch ALL questions from the selected categories
  // Then filter by the exact IDs we got from the base questions
  // This ensures we get the SAME questions, just translated
  const results = await Promise.allSettled(
    locales.map(async (locale) => {
      const lang = mapLocaleToLang(locale);

      // Fetch as many questions as possible from these categories
      // Use a high limit to ensure we get all available questions
      const allData = await fetchQuestionsRpc({
        categories,
        lang,
        limit: 500,
        errorPrefix: `Failed to fetch questions for ${locale}`,
      });
      console.log(
        `[QuestionService] Fetched ${allData.length} total ${locale} questions from pool`
      );

      // Create a map of question ID -> Question object
      const questionsMap = new Map(
        allData.map((q) => [
          q.id,
          {
            id: q.id,
            question: q.question_text,
            options: q.options,
            correctAnswer: q.correct_answer_index,
            difficulty: mapDifficulty(q.difficulty),
            points: calculatePoints(q.difficulty),
            category: q.category_id,
          },
        ])
      );

      // Map the base question IDs to their translations in this locale
      // This preserves the exact order and ensures same questions
      const orderedQuestions = questionIds
        .map((id) => questionsMap.get(id))
        .filter((q): q is Question => q !== undefined);

      if (orderedQuestions.length < questionIds.length) {
        const missingIds = questionIds.filter((id) => !questionsMap.has(id));
        console.error(
          `[QuestionService] Missing ${questionIds.length - orderedQuestions.length} questions for ${locale}`,
          `Missing IDs: ${missingIds.join(", ")}`
        );
        throw new Error(
          `Missing translations for ${locale}: found ${orderedQuestions.length}/${questionIds.length} questions`
        );
      }

      console.log(
        `[QuestionService] Successfully mapped ${orderedQuestions.length} ${locale} questions`
      );
      return { locale, questions: orderedQuestions };
    })
  );

  // Check if any locale failed
  const failedLocales = results.filter((r) => r.status === "rejected");
  if (failedLocales.length > 0) {
    console.error("[QuestionService] Failed to fetch questions for some locales:", failedLocales);
    throw new Error(
      `Failed to fetch questions for ${failedLocales.length} locale(s). All locales must succeed.`
    );
  }

  // Build the result object
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      questionsByLocale[result.value.locale] = result.value.questions;
    }
  });

  // Verify all locales have the same question IDs in the same order
  const firstLocaleIds = questionsByLocale["pt-BR"].map((q) => q.id).join(",");
  const allMatch = locales.every(
    (locale) => questionsByLocale[locale].map((q) => q.id).join(",") === firstLocaleIds
  );

  if (!allMatch) {
    console.error("[QuestionService] Question IDs do not match across all locales!");
    locales.forEach((locale) => {
      console.error(`${locale}: ${questionsByLocale[locale].map((q) => q.id).join(",")}`);
    });
    throw new Error("Question synchronization failed: IDs do not match across locales");
  }

  console.log("[QuestionService] ✓ All locales have the same questions in the same order");
  return questionsByLocale as Record<Locale, Question[]>;
};
