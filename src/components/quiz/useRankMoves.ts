import { useState } from "react";

import type { LiveRankingEntry } from "@/hooks/useSocket";

export type RankMove = {
  direction: "up" | "down";
  // Where the move ended, which tells a player's move from their next one
  position: number;
};

const NO_MOVES: ReadonlyMap<string, RankMove> = new Map();

// The moves before, with the players who changed places from one ranking to the next
const withMoves = (
  moves: ReadonlyMap<string, RankMove>,
  before: LiveRankingEntry[],
  after: LiveRankingEntry[]
): ReadonlyMap<string, RankMove> => {
  const positions = new Map(before.map(({ deviceId, position }) => [deviceId, position]));
  const changes = after.flatMap(({ deviceId, position }): [string, RankMove][] => {
    const previous = positions.get(deviceId);
    if (previous === undefined || previous === position) return [];
    return [[deviceId, { direction: position < previous ? "up" : "down", position }]];
  });
  return changes.length > 0 ? new Map([...moves, ...changes]) : moves;
};

/**
 * The last move of each player in the live ranking, up or down, worked out every time a new ranking
 * comes. The first ranking has none, and a player who just joined hasn't moved.
 *
 * @param ranking - The players by points, most first
 * @returns Each player's last move, by device
 */
export const useRankMoves = (ranking: LiveRankingEntry[]) => {
  const [previous, setPrevious] = useState(ranking);
  const [moves, setMoves] = useState(NO_MOVES);
  // Worked out while rendering, so a move shows in the same frame as the new order
  if (ranking !== previous) {
    setPrevious(ranking);
    setMoves(withMoves(moves, previous, ranking));
  }
  return moves;
};
