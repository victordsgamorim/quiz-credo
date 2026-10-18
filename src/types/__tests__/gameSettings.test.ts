import { describe, it, expect } from "vitest";

import { DEFAULT_GAME_SETTINGS, isValidGameSettings } from "../gameSettings";

describe("isValidGameSettings", () => {
  it("accepts the default settings", () => {
    expect(DEFAULT_GAME_SETTINGS.streakThreshold).toBe(5);
    expect(isValidGameSettings(DEFAULT_GAME_SETTINGS)).toBe(true);
  });

  it("accepts every streak threshold from 3 to 10", () => {
    [3, 10].forEach((streakThreshold) => {
      expect(isValidGameSettings({ ...DEFAULT_GAME_SETTINGS, streakThreshold })).toBe(true);
    });
  });

  it("rejects a missing or out of range streak threshold", () => {
    const { streakThreshold: _streakThreshold, ...withoutThreshold } = DEFAULT_GAME_SETTINGS;

    expect(isValidGameSettings(withoutThreshold)).toBe(false);
    expect(isValidGameSettings({ ...DEFAULT_GAME_SETTINGS, streakThreshold: 2 })).toBe(false);
    expect(isValidGameSettings({ ...DEFAULT_GAME_SETTINGS, streakThreshold: 11 })).toBe(false);
  });
});
