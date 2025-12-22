/**
 * Game settings configuration types and constants
 */

export type GameSettings = {
  questionCount: number; // 10-50
  timerDuration: number | null; // 60-300 seconds or null (unlimited)
  maxCategorySelections: number; // 3-10
  topCategoriesCount: number; // 5-15
  lowTimeThreshold: number; // 5-20 seconds
  criticalTimeThreshold: number; // 3-10 seconds
};

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  questionCount: 10,
  timerDuration: 60,
  maxCategorySelections: 5,
  topCategoriesCount: 10,
  lowTimeThreshold: 10,
  criticalTimeThreshold: 5,
};

export const GAME_SETTINGS_LIMITS = {
  questionCount: { min: 10, max: 50, step: 5 },
  timerDuration: { min: 60, max: 300, step: 30 },
  maxCategorySelections: { min: 3, max: 10, step: 1 },
  topCategoriesCount: { min: 5, max: 15, step: 1 },
  lowTimeThreshold: { min: 5, max: 20, step: 5 },
  criticalTimeThreshold: { min: 3, max: 10, step: 1 },
} as const;

export const TIMER_PRESETS = [60, 90, 120, 180, 240, 300] as const;
export type TimerPreset = (typeof TIMER_PRESETS)[number];

export const isValidGameSettings = (settings: unknown): settings is GameSettings => {
  if (!settings || typeof settings !== "object") return false;

  const s = settings as Record<string, unknown>;

  // Validate each field
  if (typeof s.questionCount !== "number") return false;
  if (s.timerDuration !== null && typeof s.timerDuration !== "number") return false;
  if (typeof s.maxCategorySelections !== "number") return false;
  if (typeof s.topCategoriesCount !== "number") return false;
  if (typeof s.lowTimeThreshold !== "number") return false;
  if (typeof s.criticalTimeThreshold !== "number") return false;

  // Validate ranges
  const { questionCount, timerDuration, maxCategorySelections, topCategoriesCount } =
    s as GameSettings;

  if (
    questionCount < GAME_SETTINGS_LIMITS.questionCount.min ||
    questionCount > GAME_SETTINGS_LIMITS.questionCount.max
  ) {
    return false;
  }

  if (timerDuration !== null) {
    if (
      timerDuration < GAME_SETTINGS_LIMITS.timerDuration.min ||
      timerDuration > GAME_SETTINGS_LIMITS.timerDuration.max
    ) {
      return false;
    }
  }

  if (
    maxCategorySelections < GAME_SETTINGS_LIMITS.maxCategorySelections.min ||
    maxCategorySelections > GAME_SETTINGS_LIMITS.maxCategorySelections.max
  ) {
    return false;
  }

  if (
    topCategoriesCount < GAME_SETTINGS_LIMITS.topCategoriesCount.min ||
    topCategoriesCount > GAME_SETTINGS_LIMITS.topCategoriesCount.max
  ) {
    return false;
  }

  return true;
};
