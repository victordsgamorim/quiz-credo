import { describe, expect, it } from "vitest";

import { dealPowerUps, POWER_UP_HAND_SIZE, POWER_UP_IDS } from "../powerUpHand";

describe("dealPowerUps", () => {
  it("deals 3 different power-ups out of the 4, in the bar's order", () => {
    const hand = dealPowerUps(POWER_UP_IDS);

    expect(hand).toHaveLength(POWER_UP_HAND_SIZE);
    expect(new Set(hand).size).toBe(POWER_UP_HAND_SIZE);
    expect(hand).toEqual(POWER_UP_IDS.filter((id) => hand.includes(id)));
  });

  it("picks at random which one is left out", () => {
    // Always the last one left: break, then shield, then steal are picked
    expect(dealPowerUps(POWER_UP_IDS, 3, (max) => max - 1)).toEqual(["steal", "shield", "break"]);
    // Always the first one left
    expect(dealPowerUps(POWER_UP_IDS, 3, () => 0)).toEqual(["freeze", "steal", "shield"]);
  });

  it("gives every power-up a chance to be left out", () => {
    const leftOut = new Set(
      Array.from({ length: 200 }, () => {
        const hand = dealPowerUps(POWER_UP_IDS);
        return POWER_UP_IDS.find((id) => !hand.includes(id));
      })
    );
    expect(leftOut).toEqual(new Set(POWER_UP_IDS));
  });
});
