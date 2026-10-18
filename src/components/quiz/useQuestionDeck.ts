import { useState } from "react";

import { Question } from "@/types/quiz";

// The current question's card plus two cards behind it
export const QUESTION_DECK_SIZE = 3;

export type QuestionDeckCard = {
  id: number;
  // The question this card showed the last time it was at the front
  question: Question | null;
};

const createDeck = (question: Question): QuestionDeckCard[] =>
  Array.from({ length: QUESTION_DECK_SIZE }, (_, index) => ({
    id: index,
    question: index === 0 ? question : null,
  }));

/**
 * Keeps a deck of question cards ordered from front to back. When the question changes,
 * the card at the back is drawn to the front to carry it and the other cards move one place back.
 *
 * @param question - The question to show on the front card
 * @returns The deck, front card first
 */
export const useQuestionDeck = (question: Question): QuestionDeckCard[] => {
  const [deck, setDeck] = useState(() => createDeck(question));

  if (deck[0].question?.id !== question.id) {
    // Updating state during render is React's pattern for state derived from a changed prop
    const drawnCard = deck[deck.length - 1];
    const nextDeck = [{ ...drawnCard, question }, ...deck.slice(0, -1)];
    setDeck(nextDeck);
    return nextDeck;
  }

  return deck;
};
