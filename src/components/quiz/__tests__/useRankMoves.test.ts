import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { LiveRankingEntry } from "@/hooks/useSocket";

import { useRankMoves } from "../useRankMoves";

// The players, by device id, in the ranking's order
const rank = (...deviceIds: string[]): LiveRankingEntry[] =>
  deviceIds.map((deviceId, index) => ({
    position: index + 1,
    deviceId,
    displayName: deviceId,
    totalPoints: 100 - index,
  }));

const renderMoves = (ranking: LiveRankingEntry[]) =>
  renderHook(({ current }) => useRankMoves(current), { initialProps: { current: ranking } });

describe("useRankMoves", () => {
  it("has no moves for the first ranking", () => {
    const { result } = renderMoves(rank("ana", "bia"));
    expect(result.current.size).toBe(0);
  });

  it("tells who moved up and who moved down, and where to", () => {
    const { result, rerender } = renderMoves(rank("ana", "bia", "caio"));

    rerender({ current: rank("caio", "ana", "bia") });

    expect(Object.fromEntries(result.current)).toEqual({
      caio: { direction: "up", position: 1 },
      ana: { direction: "down", position: 2 },
      bia: { direction: "down", position: 3 },
    });
  });

  it("keeps each player's last move while the others move", () => {
    const { result, rerender } = renderMoves(rank("ana", "bia", "caio"));

    rerender({ current: rank("bia", "ana", "caio") });
    rerender({ current: rank("bia", "caio", "ana") });

    expect(Object.fromEntries(result.current)).toEqual({
      bia: { direction: "up", position: 1 },
      ana: { direction: "down", position: 3 },
      caio: { direction: "up", position: 2 },
    });
  });

  it("doesn't count a player who just joined as a move, nor a new ranking in the same order", () => {
    const { result, rerender } = renderMoves(rank("ana", "bia"));
    const before = result.current;

    rerender({ current: rank("ana", "bia", "caio") });

    expect(result.current).toBe(before);
  });
});
