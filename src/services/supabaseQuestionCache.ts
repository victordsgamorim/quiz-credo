/**
 * Question Cache Service (Supabase-based)
 * Manages database cache for questions with 24h TTL
 * Prevents showing the same question twice within 24 hours
 * Replaces localStorage-based cache with Supabase backend
 */

import { supabase } from "@/lib/supabase";

type CacheStats = {
  total: number;
  valid: number;
  expired: number;
};

/**
 * Gets all cached question IDs that are still valid (not expired)
 * Uses Supabase RPC function to fetch from database
 *
 * @returns Promise with array of question IDs
 */
export const getCachedQuestionIds = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase.rpc("get_cached_question_ids");

    if (error) {
      console.error("[SupabaseQuestionCache] Error fetching cached IDs:", error);
      return [];
    }

    return (data as string[]) || [];
  } catch (error) {
    console.error("[SupabaseQuestionCache] Error fetching cached IDs:", error);
    return [];
  }
};

/**
 * Checks if a question ID is in the cache
 *
 * @param questionId - The question ID to check
 * @returns Promise with true if the question is cached and not expired
 */
export const isQuestionCached = async (questionId: string): Promise<boolean> => {
  const cachedIds = await getCachedQuestionIds();
  return cachedIds.includes(questionId);
};

/**
 * Adds a question ID to the cache
 * Uses Supabase RPC function to insert into database
 *
 * @param questionId - The question ID to cache
 * @returns Promise that resolves when the operation completes
 */
export const cacheQuestion = async (questionId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc("cache_user_questions", {
      p_question_ids: [questionId],
    });

    if (error) {
      console.error("[SupabaseQuestionCache] Error caching question:", error);
    }
  } catch (error) {
    console.error("[SupabaseQuestionCache] Error caching question:", error);
  }
};

/**
 * Adds multiple question IDs to the cache
 * Uses Supabase RPC function to batch insert into database
 *
 * @param questionIds - Array of question IDs to cache
 * @returns Promise that resolves when the operation completes
 */
export const cacheQuestions = async (questionIds: string[]): Promise<void> => {
  try {
    if (questionIds.length === 0) {
      return;
    }

    const { error } = await supabase.rpc("cache_user_questions", {
      p_question_ids: questionIds,
    });

    if (error) {
      console.error("[SupabaseQuestionCache] Error caching questions:", error);
    }
  } catch (error) {
    console.error("[SupabaseQuestionCache] Error caching questions:", error);
  }
};

/**
 * Clears all cached questions for the current user
 * Uses Supabase RPC function to delete from database
 *
 * @returns Promise that resolves when the operation completes
 */
export const clearQuestionCache = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc("clear_user_question_cache");

    if (error) {
      console.error("[SupabaseQuestionCache] Error clearing cache:", error);
    }
  } catch (error) {
    console.error("[SupabaseQuestionCache] Error clearing cache:", error);
  }
};

/**
 * Gets cache statistics for debugging
 * Uses Supabase RPC function to query database stats
 *
 * @returns Promise with object containing cache stats
 */
export const getCacheStats = async (): Promise<CacheStats> => {
  try {
    const { data, error } = await supabase.rpc("get_user_cache_stats");

    if (error) {
      console.error("[SupabaseQuestionCache] Error getting cache stats:", error);
      return { total: 0, valid: 0, expired: 0 };
    }

    // RPC returns array with single row
    const statsArray = data as Array<{ total: number; valid: number; expired: number }> | null;
    if (statsArray && statsArray.length > 0) {
      const stats = statsArray[0];
      return {
        total: stats.total,
        valid: stats.valid,
        expired: stats.expired,
      };
    }

    return { total: 0, valid: 0, expired: 0 };
  } catch (error) {
    console.error("[SupabaseQuestionCache] Error getting cache stats:", error);
    return { total: 0, valid: 0, expired: 0 };
  }
};
