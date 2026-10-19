import { describe, expect, it } from "vitest";

import type { PowerUpOutcome } from "@/types/quiz";

import { getStealBalance } from "../powerUpScore";

const ANA = { id: "ana", name: "Ana" };
const BIA = { id: "bia", name: "Bia" };
const CAIO = { id: "caio", name: "Caio" };

const outcome = (overrides: Partial<PowerUpOutcome>): PowerUpOutcome => ({
  questionIndex: 0,
  powerUpId: "steal",
  attacker: ANA,
  target: BIA,
  isBlocked: false,
  ...overrides,
});

describe("getStealBalance", () => {
  it("adds what the player stole and takes away what was stolen from them", () => {
    const outcomes = [
      outcome({ points: 30 }),
      outcome({ attacker: CAIO, target: ANA, points: 12, questionIndex: 1 }),
    ];

    expect(getStealBalance(outcomes, ANA.id)).toBe(18);
    expect(getStealBalance(outcomes, BIA.id)).toBe(-30);
    expect(getStealBalance(outcomes, CAIO.id)).toBe(12);
  });

  it("leaves out the disadvantages without points, like Freeze or a blocked steal", () => {
    const outcomes = [
      outcome({ powerUpId: "freeze" }),
      outcome({ isBlocked: true, points: 0, questionIndex: 1 }),
    ];

    expect(getStealBalance(outcomes, ANA.id)).toBe(0);
    expect(getStealBalance(outcomes, BIA.id)).toBe(0);
  });
});
