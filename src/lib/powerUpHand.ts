/**
 * The power-ups a player gets for a game: a few of them, picked at random for each player, in a
 * random order. The realtime server (quiz-credo-server) deals the hands of a room's game, also
 * spreading the power-ups over the room's players, with the admin's power-up settings
 */

import { DEFAULT_POWER_UP_SETTINGS } from "@/types/powerUpSettings";
import type { PowerUpId } from "@/types/quiz";

/** Every power-up (the catalog, src/components/quiz/powerUps.tsx) */
export const POWER_UP_IDS: readonly PowerUpId[] = ["freeze", "steal", "shield", "break", "bonus"];

/** Power-ups each player gets for a game, by default (PowerUpSettings.handSize) */
export const POWER_UP_HAND_SIZE = DEFAULT_POWER_UP_SETTINGS.handSize;

// A random whole number from 0 to max - 1, from the browser's cryptographic random source
const randomIndex = (max: number) => {
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return value % max;
};

/**
 * Deals a hand: `size` power-ups picked at random from all of them, in the random order they were
 * picked (the order of the bar)
 *
 * @param ids - Every power-up, in the order of the bar
 * @param size - Power-ups to pick
 * @param random - Picks a whole number from 0 to max - 1 (for tests)
 * @returns The picked power-ups, in a random order
 */
export const dealPowerUps = <Id>(
  ids: readonly Id[],
  size = POWER_UP_HAND_SIZE,
  random: (max: number) => number = randomIndex
): Id[] => {
  const left = [...ids];
  const hand: Id[] = [];
  while (hand.length < size && left.length > 0) {
    hand.push(...left.splice(random(left.length), 1));
  }
  return hand;
};
