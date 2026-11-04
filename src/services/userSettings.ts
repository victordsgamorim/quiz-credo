/**
 * User Settings Service (Supabase-based)
 * Keeps the logged-in admin's game settings (one row per user in `user_settings`), so the lobby
 * starts with them after a login. The Supabase client sends the user's access token with every
 * request and the table's row level security only lets a user reach their own row
 */

import { supabase } from "@/lib/supabase";
import { isValidGameSettings, type GameSettings } from "@/types/gameSettings";

const TABLE = "user_settings";

type UserSettingsRow = {
  user_id: string;
  question_count: number;
  timer_duration: number | null;
  max_category_selections: number;
  top_categories_count: number;
  low_time_threshold: number;
  critical_time_threshold: number;
  streak_threshold: number;
  enable_question_cache: boolean;
  enable_debug_mode: boolean;
  power_ups: unknown;
};

const toRow = (userId: string, settings: GameSettings): UserSettingsRow => ({
  user_id: userId,
  question_count: settings.questionCount,
  timer_duration: settings.timerDuration,
  max_category_selections: settings.maxCategorySelections,
  top_categories_count: settings.topCategoriesCount,
  low_time_threshold: settings.lowTimeThreshold,
  critical_time_threshold: settings.criticalTimeThreshold,
  streak_threshold: settings.streakThreshold,
  enable_question_cache: settings.enableQuestionCache,
  enable_debug_mode: settings.enableDebugMode,
  power_ups: settings.powerUps,
});

const fromRow = (row: UserSettingsRow): GameSettings | null => {
  const settings = {
    questionCount: row.question_count,
    timerDuration: row.timer_duration,
    maxCategorySelections: row.max_category_selections,
    topCategoriesCount: row.top_categories_count,
    lowTimeThreshold: row.low_time_threshold,
    criticalTimeThreshold: row.critical_time_threshold,
    streakThreshold: row.streak_threshold,
    enableQuestionCache: row.enable_question_cache,
    enableDebugMode: row.enable_debug_mode,
    powerUps: row.power_ups,
  };
  return isValidGameSettings(settings) ? settings : null;
};

/**
 * Loads the settings the user saved
 *
 * @param userId - The logged-in user
 * @returns The saved settings, or null when there are none (or they can't be read)
 */
export const fetchUserSettings = async (userId: string): Promise<GameSettings | null> => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .maybeSingle<UserSettingsRow>();

    if (error) {
      console.error("[UserSettings] Error fetching settings:", error);
      return null;
    }

    return data ? fromRow(data) : null;
  } catch (error) {
    console.error("[UserSettings] Error fetching settings:", error);
    return null;
  }
};

/**
 * Saves the user's settings, replacing the ones saved before
 *
 * @param userId - The logged-in user
 * @param settings - The settings to keep
 * @returns True when they were saved
 */
export const saveUserSettings = async (
  userId: string,
  settings: GameSettings
): Promise<boolean> => {
  try {
    const { error } = await supabase.from(TABLE).upsert(toRow(userId, settings));

    if (error) {
      console.error("[UserSettings] Error saving settings:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[UserSettings] Error saving settings:", error);
    return false;
  }
};
