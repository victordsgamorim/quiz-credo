import { describe, it, expect } from "vitest";

import { generateRandomGuestName } from "../randomNameGenerator";

describe("generateRandomGuestName", () => {
  it("generates a name with correct format", () => {
    const name = generateRandomGuestName();
    expect(name).toBeTruthy();
    expect(typeof name).toBe("string");

    // Should have format: "Adjective Noun Number"
    const parts = name.split(" ");
    expect(parts.length).toBe(3);
  });

  it("generates different names on multiple calls", () => {
    const name1 = generateRandomGuestName();
    const name2 = generateRandomGuestName();
    const name3 = generateRandomGuestName();

    // At least one should be different (very high probability)
    const isAllIdentical = name1 === name2 && name2 === name3;
    expect(isAllIdentical).toBe(false);
  });

  it("generates name with number suffix", () => {
    const name = generateRandomGuestName();
    const parts = name.split(" ");
    const number = parseInt(parts[2], 10);

    expect(Number.isNaN(number)).toBe(false);
    expect(number).toBeGreaterThanOrEqual(0);
    expect(number).toBeLessThan(100);
  });
});
