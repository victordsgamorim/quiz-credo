import type { CategoryId } from "@/constants/categories";
import { supabase } from "@/lib/supabase";
import type { Locale } from "@/types/i18n";
import type { Question } from "@/types/quiz";

import { authenticateForQuizAccess } from "./authService";

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

/**
 * Fetches 10 random questions from Supabase based on selected categories
 *
 * @param categories - Array of category IDs to filter questions
 * @param locale - Application locale for translations
 * @returns Promise with array of 10 questions
 */
export const fetchQuestionsByCategories = async (
  categories: CategoryId[],
  locale: Locale
): Promise<Question[]> => {
  try {
    // Authenticate to get JWT token for quiz schema access
    await authenticateForQuizAccess();

    const lang = mapLocaleToLang(locale);

    // Call RPC function to get questions from quiz schema
    const result = await supabase.rpc("get_questions_by_categories", {
      p_categories: categories,
      p_lang: lang,
      p_limit: 10,
    });

    if (result.error) {
      throw new Error(`Failed to fetch questions: ${result.error.message}`);
    }

    const data = result.data as unknown as RpcQuestionResponse[];

    if (!data || data.length === 0) {
      throw new Error("No questions found for the selected categories");
    }

    // Map RPC response to Question format
    return data.map((q) => ({
      id: q.id,
      question: q.question_text,
      options: q.options,
      correctAnswer: q.correct_answer_index,
      difficulty: mapDifficulty(q.difficulty),
      points: calculatePoints(q.difficulty),
      category: q.category_id,
    }));
  } catch (error) {
    console.error("[QuestionService] Error fetching questions:", error);
    throw error;
  }
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
