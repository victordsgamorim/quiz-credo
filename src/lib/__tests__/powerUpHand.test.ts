import { describe, expect, it } from "vitest";

import { dealPowerUps, POWER_UP_HAND_SIZE, POWER_UP_IDS } from "../powerUpHand";

describe("dealPowerUps", () => {
  it("deals 3 different power-ups out of all of them", () => {
    const hand = dealPowerUps(POWER_UP_IDS);

    expect(hand).toHaveLength(POWER_UP_HAND_SIZE);
    expect(new Set(hand).size).toBe(POWER_UP_HAND_SIZE);
    hand.forEach((id) => expect(POWER_UP_IDS).toContain(id));
  });

  it("picks them at random, in the order they're picked", () => {
    // Always the last one left: bonus, then break, then shield are picked
    expect(dealPowerUps(POWER_UP_IDS, 3, (max) => max - 1)).toEqual(["bonus", "break", "shield"]);
    // Always the first one left
    expect(dealPowerUps(POWER_UP_IDS, 3, () => 0)).toEqual(["freeze", "steal", "shield"]);
  });

  it("puts every power-up in every place of the bar", () => {
    const places = POWER_UP_IDS.map(() => new Set<string>());
    Array.from({ length: 300 }, () =>
      dealPowerUps(POWER_UP_IDS).forEach((id, place) => places[place].add(id))
    );
    places
      .slice(0, POWER_UP_HAND_SIZE)
      .forEach((ids) => expect(ids).toEqual(new Set(POWER_UP_IDS)));
  });

  it("gives every power-up a chance to be left out", () => {
    const leftOut = new Set(
      Array.from({ length: 200 }, () => {
        const hand = dealPowerUps(POWER_UP_IDS);
        return POWER_UP_IDS.filter((id) => !hand.includes(id));
      }).flat()
    );
    expect(leftOut).toEqual(new Set(POWER_UP_IDS));
  });
});
