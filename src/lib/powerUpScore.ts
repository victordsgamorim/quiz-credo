import type { PowerUpOutcome } from "@/types/quiz";

/**
 * The points the player won or lost to steals in this game: what they stole from the others, minus
 * what was stolen from them. The server decides each steal's points (up to the game's Steal
 * points, never taking a player below zero), and its ranking counts them the same way.
 *
 * @param outcomes - The disadvantages the player used, or was hit by, in this game
 * @param selfId - The player's own device
 * @returns Points to add to the player's own score (negative when they lost more)
 */
export const getStealBalance = (outcomes: PowerUpOutcome[], selfId: string | null | undefined) =>
  outcomes.reduce((balance, { attacker, target, points = 0 }) => {
    if (attacker.id === selfId) return balance + points;
    if (target.id === selfId) return balance - points;
    return balance;
  }, 0);
