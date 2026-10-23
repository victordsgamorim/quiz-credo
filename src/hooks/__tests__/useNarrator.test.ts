import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NarratorStatus } from "@/services/narrator";
import type { Locale } from "@/types/i18n";

import { useNarratorStatus, useNarratorVoice } from "../useNarrator";

const { narrator, setStatus, unlockNarrationPlayer } = vi.hoisted(() => {
  let status: { state: string; percent?: number | null } = { state: "off" };
  const listeners = new Set<() => void>();
  return {
    narrator: {
      load: vi.fn(),
      dispose: vi.fn(),
      getStatus: () => status,
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    },
    setStatus: (next: typeof status) => {
      status = next;
      listeners.forEach((listener) => listener());
    },
    unlockNarrationPlayer: vi.fn(),
  };
});

vi.mock("@/services/narrator", () => ({
  narrator,
  NARRATOR_VOICES: {
    "pt-BR": "pt_BR-faber-medium",
    "en-UK": "en_GB-alan-medium",
    "es-BO": "es_MX-ald-medium",
  },
}));

vi.mock("@/services/narrationPlayer", () => ({ unlockNarrationPlayer }));

describe("useNarratorStatus", () => {
  it("follows the voice as it loads", () => {
    const { result } = renderHook(() => useNarratorStatus());
    expect(result.current).toEqual({ state: "off" });

    act(() => setStatus({ state: "loading", percent: 30 }));
    expect(result.current).toEqual<NarratorStatus>({ state: "loading", percent: 30 });

    act(() => setStatus({ state: "ready" }));
    expect(result.current).toEqual<NarratorStatus>({ state: "ready" });
  });
});

describe("useNarratorVoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the voice of the locale while it's enabled", () => {
    renderHook(() => useNarratorVoice(true, "pt-BR"));

    expect(narrator.load).toHaveBeenCalledWith("pt_BR-faber-medium");
  });

  it("loads no voice while it's disabled", () => {
    renderHook(() => useNarratorVoice(false, "pt-BR"));

    expect(narrator.load).not.toHaveBeenCalled();
  });

  it("drops the voice once disabled (the admin left the room)", () => {
    const { rerender } = renderHook(({ isEnabled }) => useNarratorVoice(isEnabled, "pt-BR"), {
      initialProps: { isEnabled: true },
    });

    rerender({ isEnabled: false });

    expect(narrator.dispose).toHaveBeenCalledTimes(1);
  });

  it("drops the voice when unmounted", () => {
    const { unmount } = renderHook(() => useNarratorVoice(true, "pt-BR"));

    unmount();

    expect(narrator.dispose).toHaveBeenCalledTimes(1);
  });

  it("changes the voice with the locale", () => {
    const { rerender } = renderHook(({ locale }) => useNarratorVoice(true, locale), {
      initialProps: { locale: "pt-BR" as Locale },
    });

    rerender({ locale: "en-UK" });

    expect(narrator.dispose).toHaveBeenCalledTimes(1);
    expect(narrator.load).toHaveBeenLastCalledWith("en_GB-alan-medium");
  });

  it("lets the narration play sound on a tap or a key press while it's enabled", () => {
    const { unmount } = renderHook(() => useNarratorVoice(true, "pt-BR"));

    document.body.click();
    document.body.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true }));
    expect(unlockNarrationPlayer).toHaveBeenCalledTimes(2);

    unmount();
    document.body.click();
    expect(unlockNarrationPlayer).toHaveBeenCalledTimes(2);
  });
});
