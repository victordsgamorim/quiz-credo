/**
 * Power-up settings: what the admin sets for each power-up before a room's game (the power-ups
 * dialog in the lobby). They go to the realtime server (quiz-credo-server) inside the game
 * settings, and it applies them, so keep the defaults and the limits in sync with it
 */
import type { PowerUpId } from "./quiz";

export type PowerUpSettings = {
  // Whether the game has power-ups at all: off, nobody gets any
  isEnabled: boolean;
  // Power-ups each player gets for a game, picked at random among the enabled ones (up to all of
  // them)
  handSize: number;
  // Which power-ups can be dealt
  enabled: Record<PowerUpId, boolean>;
  // Questions Freeze keeps the streak for, counting from the one it's used on
  freezeQuestions: number;
  // Points Steal takes, at most (never taking the target below zero)
  stealPoints: number;
  // Points Bonus gives
  bonusPoints: number;
  // Percent of the points of a right answer Cut leaves its target, on the question it's used on
  cutPercent: number;
};

export const DEFAULT_POWER_UP_SETTINGS: PowerUpSettings = {
  isEnabled: true,
  handSize: 3,
  enabled: { freeze: true, steal: true, shield: true, break: true, bonus: true, cut: true },
  freezeQuestions: 2,
  stealPoints: 30,
  bonusPoints: 60,
  cutPercent: 50,
};

export const POWER_UP_SETTINGS_LIMITS = {
  handSize: { min: 1, max: 6, step: 1 },
  freezeQuestions: { min: 1, max: 5, step: 1 },
  stealPoints: { min: 10, max: 100, step: 10 },
  bonusPoints: { min: 10, max: 200, step: 10 },
  cutPercent: { min: 10, max: 90, step: 10 },
} as const;

type NumericSetting = keyof typeof POWER_UP_SETTINGS_LIMITS;

const isWithinLimits = (key: NumericSetting, value: unknown) => {
  const { min, max } = POWER_UP_SETTINGS_LIMITS[key];
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
};

/**
 * Whether a value is a whole set of power-up settings within the limits
 *
 * @param settings - Value to check
 * @returns True when it can be used as the power-up settings
 */
export const isValidPowerUpSettings = (settings: unknown): settings is PowerUpSettings => {
  if (!settings || typeof settings !== "object") return false;
  const s = settings as Record<string, unknown>;
  const enabled = s.enabled as Record<string, unknown> | null | undefined;
  if (!enabled || typeof enabled !== "object") return false;

  const ids = Object.keys(DEFAULT_POWER_UP_SETTINGS.enabled);
  return (
    typeof s.isEnabled === "boolean" &&
    ids.every((id) => typeof enabled[id] === "boolean") &&
    (Object.keys(POWER_UP_SETTINGS_LIMITS) as NumericSetting[]).every((key) =>
      isWithinLimits(key, s[key])
    )
  );
};

// Whether every key of the defaults has a value
const hasEvery = (values: Record<string, unknown>, defaults: object) =>
  Object.keys(defaults).every((key) => values[key] !== undefined);

/**
 * Power-up settings from before a power-up existed (saved by an older frontend, or kept by an older
 * realtime server), with what they miss at its defaults: a power-up added since is in the game,
 * like every new one. Settings that miss nothing come back as they are, and anything that isn't
 * power-up settings too, for the validation to refuse
 *
 * @param settings - Power-up settings, maybe from before some power-up
 * @returns The settings, with the defaults of what they miss
 */
export const withPowerUpDefaults = (settings: unknown): unknown => {
  if (!settings || typeof settings !== "object") return settings;
  const s = settings as Record<string, unknown>;
  const enabled = s.enabled as Record<string, unknown> | null | undefined;
  if (!enabled || typeof enabled !== "object") return settings;
  if (
    hasEvery(s, DEFAULT_POWER_UP_SETTINGS) &&
    hasEvery(enabled, DEFAULT_POWER_UP_SETTINGS.enabled)
  ) {
    return settings;
  }

  return {
    ...DEFAULT_POWER_UP_SETTINGS,
    ...s,
    enabled: { ...DEFAULT_POWER_UP_SETTINGS.enabled, ...enabled },
  };
};

/**
 * The power-up settings of a game: the admin's (with the power-ups added since they were set), or
 * the defaults when the game has none (a standalone game, or settings from before the power-ups
 * dialog)
 *
 * @param gameSettings - The game's settings
 * @returns Power-up settings to play with
 */
export const getPowerUpSettings = (
  gameSettings: { powerUps?: unknown } | null | undefined
): PowerUpSettings => {
  const settings = withPowerUpDefaults(gameSettings?.powerUps);
  return isValidPowerUpSettings(settings) ? settings : DEFAULT_POWER_UP_SETTINGS;
};

/**
 * The power-ups that can be dealt, in the catalog's order: none when the game's power-ups are off
 *
 * @param settings - The game's power-up settings
 * @param ids - Every power-up, in the catalog's order
 * @returns The enabled ones
 */
export const getEnabledPowerUps = <Id extends PowerUpId>(
  settings: PowerUpSettings,
  ids: readonly Id[]
): Id[] => (settings.isEnabled ? ids.filter((id) => settings.enabled[id]) : []);
