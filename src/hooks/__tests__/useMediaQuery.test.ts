import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PHONE_LANDSCAPE_QUERY } from "@/constants/screens";

import { useIsPhoneLandscape, useMediaQuery } from "../useMediaQuery";

type ChangeListener = (event: { matches: boolean }) => void;

// The browser's media queries, matching the given ones; each query keeps its change listeners
const stubMatchMedia = (matchingQueries: string[]) => {
  const listeners = new Map<string, ChangeListener[]>();
  const matchMedia = vi.fn((query: string) => ({
    matches: matchingQueries.includes(query),
    addEventListener: (_: string, listener: ChangeListener) =>
      listeners.set(query, [...(listeners.get(query) ?? []), listener]),
    removeEventListener: (_: string, listener: ChangeListener) =>
      listeners.set(
        query,
        (listeners.get(query) ?? []).filter((current) => current !== listener)
      ),
  }));
  vi.stubGlobal("matchMedia", matchMedia);
  const change = (query: string, matches: boolean) =>
    act(() => (listeners.get(query) ?? []).forEach((listener) => listener({ matches })));
  return { matchMedia, change };
};

describe("useMediaQuery", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("doesn't match where the browser has no media queries", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(result.current).toBe(false);
  });

  it("has the answer from the first render, and follows its changes", () => {
    const { change } = stubMatchMedia(["(min-width: 768px)"]);
    const renders: boolean[] = [];
    const { result } = renderHook(() => {
      const isMatching = useMediaQuery("(min-width: 768px)");
      renders.push(isMatching);
      return isMatching;
    });

    expect(renders[0]).toBe(true);
    change("(min-width: 768px)", false);
    expect(result.current).toBe(false);
  });

  it("tells a phone on its side by the phone-landscape query", () => {
    const { matchMedia } = stubMatchMedia([PHONE_LANDSCAPE_QUERY]);
    const { result } = renderHook(() => useIsPhoneLandscape());

    expect(result.current).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith(PHONE_LANDSCAPE_QUERY);
  });
});
