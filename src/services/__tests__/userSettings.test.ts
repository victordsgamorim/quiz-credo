import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_GAME_SETTINGS } from "@/types/gameSettings";

import { fetchUserSettings, saveUserSettings } from "../userSettings";

const from = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase", () => ({ supabase: { from } }));

const row = {
  user_id: "u1",
  question_count: 20,
  timer_duration: null,
  max_category_selections: 4,
  top_categories_count: 8,
  low_time_threshold: 10,
  critical_time_threshold: 5,
  streak_threshold: 3,
  enable_question_cache: false,
  enable_debug_mode: true,
  power_ups: DEFAULT_GAME_SETTINGS.powerUps,
};

const mockFrom = (result: unknown) => {
  const upsert = vi.fn().mockResolvedValue(result);
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
    upsert,
  };
  from.mockReturnValue(query);
  return { upsert };
};

// eslint-disable-next-line max-lines-per-function
describe("userSettings", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("maps the saved row to game settings", async () => {
    mockFrom({ data: row, error: null });
    await expect(fetchUserSettings("u1")).resolves.toEqual({
      questionCount: 20,
      timerDuration: null,
      maxCategorySelections: 4,
      topCategoriesCount: 8,
      lowTimeThreshold: 10,
      criticalTimeThreshold: 5,
      streakThreshold: 3,
      enableQuestionCache: false,
      enableDebugMode: true,
      powerUps: DEFAULT_GAME_SETTINGS.powerUps,
    });
  });

  it("gives settings saved before a power-up existed that power-up, on, at its defaults", async () => {
    const { cutPercent: _cutPercent, ...savedBeforeCut } = DEFAULT_GAME_SETTINGS.powerUps;
    const enabled = Object.fromEntries(
      Object.entries(DEFAULT_GAME_SETTINGS.powerUps.enabled).filter(([id]) => id !== "cut")
    );
    mockFrom({
      data: { ...row, power_ups: { ...savedBeforeCut, bonusPoints: 90, enabled } },
      error: null,
    });

    const settings = await fetchUserSettings("u1");

    expect(settings?.questionCount).toBe(20);
    expect(settings?.powerUps).toEqual({ ...DEFAULT_GAME_SETTINGS.powerUps, bonusPoints: 90 });
  });

  it("returns null with no row, an error or an invalid row", async () => {
    mockFrom({ data: null, error: null });
    await expect(fetchUserSettings("u1")).resolves.toBeNull();
    mockFrom({ data: null, error: { message: "boom" } });
    await expect(fetchUserSettings("u1")).resolves.toBeNull();
    mockFrom({ data: { ...row, power_ups: {} }, error: null });
    await expect(fetchUserSettings("u1")).resolves.toBeNull();
  });

  it("upserts the settings under the user", async () => {
    const query = mockFrom({ error: null });
    await expect(saveUserSettings("u1", DEFAULT_GAME_SETTINGS)).resolves.toBe(true);
    expect(query.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "u1", question_count: 10, timer_duration: 60 })
    );
  });

  it("reports a failed save", async () => {
    mockFrom({ error: { message: "boom" } });
    await expect(saveUserSettings("u1", DEFAULT_GAME_SETTINGS)).resolves.toBe(false);
  });
});
