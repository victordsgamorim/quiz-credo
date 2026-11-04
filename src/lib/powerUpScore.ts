import type { AnswerRecord, PowerUpOutcome } from "@/types/quiz";

import { applyCut } from "./scoring";

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

/**
 * The points the Cut power-up took from the player's right answers in this game: on each question
 * it hit them on (another player used it, and their shield didn't block it), a right answer earns
 * only the game's Cut percent of its points. The server's ranking counts them the same way, whether
 * Cut came before or after the answer.
 *
 * @param answers - The player's answers, with the points they earned before any cut
 * @param cutQuestionIds - Questions Cut hit the player on
 * @param percent - Percent of the points Cut leaves (PowerUpSettings.cutPercent)
 * @returns Points to take from the player's own score
 */
export const getCutLoss = (
  answers: readonly AnswerRecord[],
  cutQuestionIds: ReadonlySet<string>,
  percent: number
) =>
  answers.reduce(
    (loss, { questionId, pointsEarned }) =>
      cutQuestionIds.has(questionId) ? loss + pointsEarned - applyCut(pointsEarned, percent) : loss,
    0
  );
