import { describe, it, expect } from "vitest";

import { DEFAULT_GAME_SETTINGS } from "../gameSettings";
import {
  DEFAULT_POWER_UP_SETTINGS,
  getEnabledPowerUps,
  getPowerUpSettings,
  isValidPowerUpSettings,
} from "../powerUpSettings";

describe("power-up settings", () => {
  it("defaults to the power-ups as they always were", () => {
    expect(DEFAULT_POWER_UP_SETTINGS).toEqual({
      isEnabled: true,
      handSize: 3,
      enabled: { freeze: true, steal: true, shield: true, break: true, bonus: true },
      freezeQuestions: 2,
      stealPoints: 30,
      bonusPoints: 60,
    });
    expect(isValidPowerUpSettings(DEFAULT_POWER_UP_SETTINGS)).toBe(true);
  });

  it("rejects values out of the limits, or missing", () => {
    expect(isValidPowerUpSettings({ ...DEFAULT_POWER_UP_SETTINGS, handSize: 0 })).toBe(false);
    expect(isValidPowerUpSettings({ ...DEFAULT_POWER_UP_SETTINGS, stealPoints: 101 })).toBe(false);
    expect(isValidPowerUpSettings({ ...DEFAULT_POWER_UP_SETTINGS, bonusPoints: 60.5 })).toBe(false);
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
