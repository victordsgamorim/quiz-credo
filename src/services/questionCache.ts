/**
 * Question Cache Service
 * Manages localStorage cache for questions with 24h TTL
 * Prevents showing the same question twice within 24 hours
 */

const CACHE_KEY = "quiz_questions_cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

type CachedQuestion = {
  id: string;
  timestamp: number;
};

type QuestionCache = {
  questions: CachedQuestion[];
};

/**
 * Gets all cached question IDs that are still valid (not expired)
 *
 * @returns Array of question IDs
 */
export const getCachedQuestionIds = (): string[] => {
  try {
    const cacheData = localStorage.getItem(CACHE_KEY);
    if (!cacheData) {
      return [];
    }

    const cache = JSON.parse(cacheData) as QuestionCache;
    const now = Date.now();

    // Filter out expired questions
    const validQuestions = cache.questions.filter((q) => now - q.timestamp < CACHE_TTL_MS);

    // Update cache if we removed any expired questions
    if (validQuestions.length !== cache.questions.length) {
      saveCache({ questions: validQuestions });
    }

    return validQuestions.map((q) => q.id);
  } catch (error) {
    console.error("[QuestionCache] Error reading cache:", error);
    return [];
  }
};

/**
 * Checks if a question ID is in the cache
 *
 * @param questionId - The question ID to check
 * @returns True if the question is cached and not expired
 */
export const isQuestionCached = (questionId: string): boolean => {
  const cachedIds = getCachedQuestionIds();
  return cachedIds.includes(questionId);
};

/**
 * Adds a question ID to the cache
 *
 * @param questionId - The question ID to cache
 */
export const cacheQuestion = (questionId: string): void => {
  try {
    const cachedIds = getCachedQuestionIds();

    // Don't add if already cached
    if (cachedIds.includes(questionId)) {
      return;
    }

    const cacheData = localStorage.getItem(CACHE_KEY);
    const cache: QuestionCache = cacheData
      ? (JSON.parse(cacheData) as QuestionCache)
      : { questions: [] };

    cache.questions.push({
      id: questionId,
      timestamp: Date.now(),
    });

    saveCache(cache);
  } catch (error) {
    console.error("[QuestionCache] Error caching question:", error);
  }
};

/**
 * Adds multiple question IDs to the cache
 *
 * @param questionIds - Array of question IDs to cache
 */
export const cacheQuestions = (questionIds: string[]): void => {
  try {
    const cachedIds = getCachedQuestionIds();
    const cacheData = localStorage.getItem(CACHE_KEY);
    const cache: QuestionCache = cacheData
      ? (JSON.parse(cacheData) as QuestionCache)
      : { questions: [] };

    const now = Date.now();

    // Add new questions that aren't already cached
    questionIds.forEach((id) => {
      if (!cachedIds.includes(id)) {
        cache.questions.push({
          id,
          timestamp: now,
        });
      }
    });

    saveCache(cache);
  } catch (error) {
    console.error("[QuestionCache] Error caching questions:", error);
  }
};

/**
 * Clears all cached questions
 */
export const clearQuestionCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error("[QuestionCache] Error clearing cache:", error);
  }
};

/**
 * Saves the cache to localStorage
 *
 * @param cache - The cache object to save
 */
const saveCache = (cache: QuestionCache): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("[QuestionCache] Error saving cache:", error);
  }
};

/**
 * Gets cache statistics for debugging
 *
 * @returns Object with cache stats
 */
export const getCacheStats = (): {
  total: number;
  valid: number;
  expired: number;
} => {
  try {
    const cacheData = localStorage.getItem(CACHE_KEY);
    if (!cacheData) {
      return { total: 0, valid: 0, expired: 0 };
    }

    const cache = JSON.parse(cacheData) as QuestionCache;
    const now = Date.now();

    const valid = cache.questions.filter((q) => now - q.timestamp < CACHE_TTL_MS).length;

    return {
      total: cache.questions.length,
      valid,
      expired: cache.questions.length - valid,
    };
  } catch (error) {
    console.error("[QuestionCache] Error getting cache stats:", error);
    return { total: 0, valid: 0, expired: 0 };
  }
};
