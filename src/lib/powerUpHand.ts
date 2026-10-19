/**
 * The power-ups a player gets for a game: a few of them, picked at random for each player
 * The realtime server (quiz-credo-server) deals the hands of a room's game the same way, so keep
 * POWER_UP_HAND_SIZE in sync with it
 */

import type { PowerUpId } from "@/types/quiz";

/** Every power-up, in the order of the bar (the catalog, src/components/quiz/powerUps.tsx) */
export const POWER_UP_IDS: readonly PowerUpId[] = ["freeze", "steal", "shield", "break", "bonus"];

/** Power-ups each player gets for a game */
export const POWER_UP_HAND_SIZE = 3;

// A random whole number from 0 to max - 1, from the browser's cryptographic random source
const randomIndex = (max: number) => {
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return value % max;
};

/**
 * Deals a hand: `size` power-ups picked at random from all of them, kept in the order of `ids`
 * (the order of the bar)
 *
 * @param ids - Every power-up, in the order of the bar
 * @param size - Power-ups to pick
 * @param random - Picks a whole number from 0 to max - 1 (for tests)
 * @returns The picked power-ups, in the order of `ids`
 */
export const dealPowerUps = <Id>(
  ids: readonly Id[],
  size = POWER_UP_HAND_SIZE,
  random: (max: number) => number = randomIndex
): Id[] => {
  const left = [...ids];
  const picked = new Set<Id>();
  while (picked.size < Math.min(size, ids.length)) {
    const [id] = left.splice(random(left.length), 1);
    picked.add(id);
  }
  return ids.filter((id) => picked.has(id));
};
