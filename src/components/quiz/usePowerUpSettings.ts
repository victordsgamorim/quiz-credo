import { createContext, useCallback, useContext } from "react";

import { interpolate, useLocale } from "@/contexts/LocaleContext";
import { DEFAULT_POWER_UP_SETTINGS, type PowerUpSettings } from "@/types/powerUpSettings";
import type { PowerUpId } from "@/types/quiz";

/** The game's power-up settings, for the power-ups on the game screen (GameScreen provides them) */
export const PowerUpSettingsContext = createContext<PowerUpSettings>(DEFAULT_POWER_UP_SETTINGS);

/**
 * Hints that replace the game's, without its numbers: the tutorial's (its rules don't depend on a
 * room's settings)
 */
export const PowerUpHintsContext = createContext<Record<PowerUpId, string> | null>(null);

/**
 * The game's power-up settings: the admin's in a room's game, the defaults otherwise
 *
 * @returns Power-up settings to play with
 */
export const usePowerUpSettings = () => useContext(PowerUpSettingsContext);

/**
 * What each power-up does, with the game's values in it (the points of Steal and Bonus, the
 * questions of Freeze)
 *
 * @returns The hint of a power-up
 */
export const usePowerUpHint = () => {
  const { t } = useLocale();
  const strings = t.quiz.gameScreen.powerUps;
  const { freezeQuestions, stealPoints, bonusPoints } = usePowerUpSettings();
  const hints = useContext(PowerUpHintsContext);

  return useCallback(
    (id: PowerUpId) => {
      if (hints) return hints[id];
      if (id === "freeze") {
        const { hint, hintOne } = strings.freeze;
        return freezeQuestions === 1 ? hintOne : interpolate(hint, { count: freezeQuestions });
      }
      if (id === "steal") return interpolate(strings.steal.hint, { points: stealPoints });
      if (id === "bonus") return interpolate(strings.bonus.hint, { points: bonusPoints });
      return strings[id].hint;
    },
    [hints, strings, freezeQuestions, stealPoints, bonusPoints]
  );
};
