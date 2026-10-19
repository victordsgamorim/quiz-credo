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

  it("tells the target who used a disadvantage on them", () => {
    renderNotices([steal(false)], ANA.id);
    expect(toldMessages()).toEqual(["Bia usou Roubar em você!"]);
  });

  it("tells the attacker that a shield blocked them", () => {
    renderNotices([steal(true)], BIA.id);
    expect(toldMessages()).toEqual(["O escudo de Ana bloqueou seu Roubar"]);
  });

  it("tells both players how many points a steal took", () => {
    const stole = { ...steal(false), points: 30 };
    renderNotices([stole], ANA.id);
    renderNotices([stole], BIA.id);

    expect(toldMessages()).toEqual([
      "Bia roubou 30 pontos de você!",
      "Você roubou 30 pontos de Ana!",
    ]);
  });

  it("tells both players that a break reset the target's streak", () => {
    const broke: PowerUpOutcome = { ...steal(false), powerUpId: "break" };
    renderNotices([broke], ANA.id);
    renderNotices([broke], BIA.id);

    expect(toldMessages()).toEqual([
      "Bia quebrou sua sequência!",
      "Você quebrou a sequência de Ana!",
    ]);
  });

  it("tells only the attacker when the target had no points to steal", () => {
    const empty = { ...steal(false), points: 0 };
    renderNotices([empty], ANA.id);
    renderNotices([empty], BIA.id);

    expect(toldMessages()).toEqual(["Ana não tinha pontos para roubar"]);
  });

  it("tells again, as blocked, a disadvantage the target's shield blocked afterwards", () => {
    const { rerender } = renderNotices([steal(false)], ANA.id);
    rerender({ list: [steal(false)] });
    rerender({ list: [steal(true)] });

    expect(toldMessages()).toEqual([
      "Bia usou Roubar em você!",
      "Seu escudo bloqueou Roubar de Bia!",
    ]);
  });
});
