import { renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import type { PowerUpOutcome } from "@/types/quiz";

import { usePowerUpNotices } from "../usePowerUpNotices";

vi.mock("sonner", () => ({ toast: vi.fn() }));

const ANA = { id: "ana", name: "Ana" };
const BIA = { id: "bia", name: "Bia" };

const steal = (isBlocked: boolean): PowerUpOutcome => ({
  questionIndex: 2,
  powerUpId: "steal",
  attacker: BIA,
  target: ANA,
  isBlocked,
});

const renderNotices = (outcomes: PowerUpOutcome[], selfId: string) =>
  renderHook(({ list }) => usePowerUpNotices(list, selfId), {
    initialProps: { list: outcomes },
    wrapper: LocaleProvider,
  });

const toldMessages = () => vi.mocked(toast).mock.calls.map(([message]) => message);

describe("usePowerUpNotices", () => {
  beforeEach(() => {
    vi.mocked(toast).mockClear();
  });

  it("tells the attacker their disadvantage hit", () => {
    renderNotices([steal(false)], BIA.id);
    expect(toldMessages()).toEqual(["Roubar acertou Ana!"]);
  });

  it("tells the attacker that a shield blocked them", () => {
    renderNotices([steal(true)], BIA.id);
    expect(toldMessages()).toEqual(["O escudo de Ana bloqueou seu Roubar"]);
  });

  it("tells the attacker how many points a steal took, and when there was nothing to take", () => {
    renderNotices([{ ...steal(false), points: 30 }], BIA.id);
    renderNotices([{ ...steal(false), questionIndex: 3, points: 0 }], BIA.id);

    expect(toldMessages()).toEqual([
      "Você roubou 30 pontos de Ana!",
      "Ana não tinha pontos para roubar",
    ]);
  });

  it("tells the attacker that a break reset the target's streak", () => {
    renderNotices([{ ...steal(false), powerUpId: "break" }], BIA.id);
    expect(toldMessages()).toEqual(["Você quebrou a sequência de Ana!"]);
  });

  it("tells the target nothing: not the disadvantage, nor their shield blocking it", () => {
    const { rerender } = renderNotices([steal(false)], ANA.id);
    rerender({ list: [steal(true)] });
    rerender({ list: [{ ...steal(false), points: 30 }] });
    rerender({ list: [{ ...steal(false), powerUpId: "break" }] });

    expect(toast).not.toHaveBeenCalled();
  });

  it("tells the attacker again, as blocked, a disadvantage the target's shield blocked afterwards", () => {
    const { rerender } = renderNotices([steal(false)], BIA.id);
    rerender({ list: [steal(false)] });
    rerender({ list: [steal(true)] });

    expect(toldMessages()).toEqual(["Roubar acertou Ana!", "O escudo de Ana bloqueou seu Roubar"]);
  });
});
