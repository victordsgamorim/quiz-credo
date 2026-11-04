import { describe, it, expect } from "vitest";

import { DEFAULT_GAME_SETTINGS } from "../gameSettings";
import {
  DEFAULT_POWER_UP_SETTINGS,
  getEnabledPowerUps,
  getPowerUpSettings,
  isValidPowerUpSettings,
  withPowerUpDefaults,
} from "../powerUpSettings";

// Settings saved before Cut existed: no switch for it, and no percent
const { cutPercent: _cutPercent, ...settingsBeforeCut } = DEFAULT_POWER_UP_SETTINGS;
const BEFORE_CUT = {
  ...settingsBeforeCut,
  stealPoints: 50,
  enabled: Object.fromEntries(
    Object.entries(DEFAULT_POWER_UP_SETTINGS.enabled).filter(([id]) => id !== "cut")
  ),
};

// eslint-disable-next-line max-lines-per-function
describe("power-up settings", () => {
  it("defaults to the power-ups as they always were", () => {
    expect(DEFAULT_POWER_UP_SETTINGS).toEqual({
      isEnabled: true,
      handSize: 3,
      enabled: { freeze: true, steal: true, shield: true, break: true, bonus: true, cut: true },
      freezeQuestions: 2,
      stealPoints: 30,
      bonusPoints: 60,
      cutPercent: 50,
    });
    expect(isValidPowerUpSettings(DEFAULT_POWER_UP_SETTINGS)).toBe(true);
  });

  it("lets each player get every power-up", () => {
    expect(isValidPowerUpSettings({ ...DEFAULT_POWER_UP_SETTINGS, handSize: 6 })).toBe(true);
    expect(isValidPowerUpSettings({ ...DEFAULT_POWER_UP_SETTINGS, handSize: 7 })).toBe(false);
  });

  it("rejects values out of the limits, or missing", () => {
    expect(isValidPowerUpSettings({ ...DEFAULT_POWER_UP_SETTINGS, handSize: 0 })).toBe(false);
    expect(isValidPowerUpSettings({ ...DEFAULT_POWER_UP_SETTINGS, stealPoints: 101 })).toBe(false);
    expect(isValidPowerUpSettings({ ...DEFAULT_POWER_UP_SETTINGS, bonusPoints: 60.5 })).toBe(false);
    expect(isValidPowerUpSettings({ ...DEFAULT_POWER_UP_SETTINGS, cutPercent: 100 })).toBe(false);
    expect(isValidPowerUpSettings({ ...DEFAULT_POWER_UP_SETTINGS, cutPercent: 5 })).toBe(false);
    expect(isValidPowerUpSettings(BEFORE_CUT)).toBe(false);
    expect(
      isValidPowerUpSettings({ ...DEFAULT_POWER_UP_SETTINGS, enabled: { freeze: true } })
    ).toBe(false);
    expect(isValidPowerUpSettings({ ...DEFAULT_POWER_UP_SETTINGS, isEnabled: "no" })).toBe(false);
    expect(isValidPowerUpSettings(null)).toBe(false);
  });

  it("plays with the defaults when the game has no valid power-up settings", () => {
    const powerUps = { ...DEFAULT_POWER_UP_SETTINGS, bonusPoints: 100 };
    expect(getPowerUpSettings({ ...DEFAULT_GAME_SETTINGS, powerUps })).toBe(powerUps);
    expect(getPowerUpSettings(null)).toBe(DEFAULT_POWER_UP_SETTINGS);
    expect(getPowerUpSettings({})).toBe(DEFAULT_POWER_UP_SETTINGS);
    expect(getPowerUpSettings({ powerUps: { handSize: 9 } })).toBe(DEFAULT_POWER_UP_SETTINGS);
  });

  it("gives settings from before a power-up its defaults, and keeps the rest", () => {
    const filled = { ...DEFAULT_POWER_UP_SETTINGS, stealPoints: 50 };
    expect(withPowerUpDefaults(BEFORE_CUT)).toEqual(filled);
    expect(getPowerUpSettings({ powerUps: BEFORE_CUT })).toEqual(filled);
    // Nothing missing, nothing changed
    expect(withPowerUpDefaults(filled)).toBe(filled);
    // Not power-up settings: left for the validation to refuse
    expect(withPowerUpDefaults({ handSize: 9 })).toEqual({ handSize: 9 });
    expect(withPowerUpDefaults(null)).toBeNull();
  });

  it("lists the enabled power-ups in the catalog's order", () => {
    const enabled = { ...DEFAULT_POWER_UP_SETTINGS.enabled, steal: false, break: false };
    expect(
      getEnabledPowerUps({ ...DEFAULT_POWER_UP_SETTINGS, enabled }, [
        "freeze",
        "steal",
        "shield",
        "break",
        "bonus",
      ])
    ).toEqual(["freeze", "shield", "bonus"]);
  });

  it("has no power-up to deal when the game's power-ups are off", () => {
    expect(
      getEnabledPowerUps({ ...DEFAULT_POWER_UP_SETTINGS, isEnabled: false }, ["freeze", "steal"])
    ).toEqual([]);
  });
});
