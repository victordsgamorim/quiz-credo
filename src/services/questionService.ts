import type { CategoryId } from "@/constants/categories";
import { supabase } from "@/lib/supabase";
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
 * Fetches 10 random questions from Supabase based on selected categories
 *
 * @param categories - Array of category IDs to filter questions
 * @returns Promise with array of 10 questions
 */
export const fetchQuestionsByCategories = async (categories: CategoryId[]): Promise<Question[]> => {
  try {
    // Authenticate to get JWT token for quiz schema access
    await authenticateForQuizAccess();

    const userLang = navigator.language.split("-")[0] || "en";

    // Call RPC function to get questions from quiz schema
    const result = await supabase.rpc("get_questions_by_categories", {
      p_categories: categories,
      p_lang: userLang,
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
 * @param difficulty - Difficulty number from database
 * @returns Difficulty string
 */
const mapDifficulty = (difficulty: number): "easy" | "medium" | "hard" => {
  if (difficulty === 1) return "easy";
  if (difficulty === 2) return "medium";
  return "hard";
};

/**
 * Calculates points based on difficulty
 *
 * @param difficulty - Difficulty number from database
 * @returns Points for the question
 */
const calculatePoints = (difficulty: number): number => {
  if (difficulty === 1) return 100;
  if (difficulty === 2) return 250;
  return 500;
};
