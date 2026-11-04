import type { ReactNode } from "react";

import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import { PowerUpHintsContext, usePowerUpHint } from "../usePowerUpSettings";

const summaries = translations["pt-BR"].tutorial.powerUps.summaries;

describe("usePowerUpHint", () => {
  it("puts the game's numbers in the hints", () => {
    const { result } = renderHook(() => usePowerUpHint(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocaleProvider>{children}</LocaleProvider>
      ),
    });

    expect(result.current("steal")).toBe("Rouba até 30 pontos de um adversário");
  });

  it("gives the hints that replace the game's, without its numbers (the tutorial's)", () => {
    const { result } = renderHook(() => usePowerUpHint(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocaleProvider>
          <PowerUpHintsContext.Provider value={summaries}>{children}</PowerUpHintsContext.Provider>
        </LocaleProvider>
      ),
    });

    expect(result.current("steal")).toBe(summaries.steal);
    expect(result.current("freeze")).toBe(summaries.freeze);
  });
});
