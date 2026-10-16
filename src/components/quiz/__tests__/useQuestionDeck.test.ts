import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Question } from "@/types/quiz";

import { QUESTION_DECK_SIZE, useQuestionDeck } from "../useQuestionDeck";

const createQuestion = (id: string): Question => ({
  id,
  question: `Question ${id}`,
  options: ["A", "B", "C", "D"],
  correctAnswer: 0,
  difficulty: "level1",
  points: 100,
});

const renderDeck = (question: Question) =>
  renderHook(({ current }) => useQuestionDeck(current), { initialProps: { current: question } });

describe("useQuestionDeck", () => {
  it("starts with the question on the front card and empty cards behind it", () => {
    const question = createQuestion("1");
    const { result } = renderDeck(question);

    expect(result.current).toHaveLength(QUESTION_DECK_SIZE);
    expect(result.current.map((card) => card.question)).toEqual([question, null, null]);
  });

  it("draws the back card to the front when the question changes", () => {
    const { result, rerender } = renderDeck(createQuestion("1"));
    const [front, middle, back] = result.current;
    const nextQuestion = createQuestion("2");

    rerender({ current: nextQuestion });

    expect(result.current.map((card) => card.id)).toEqual([back.id, front.id, middle.id]);
    expect(result.current[0].question).toBe(nextQuestion);
    expect(result.current[1].question?.id).toBe("1");
  });

  it("keeps the previous questions on the cards behind as the game goes on", () => {
    const { result, rerender } = renderDeck(createQuestion("1"));
    const startingOrder = result.current.map((card) => card.id);

    ["2", "3", "4"].forEach((id) => rerender({ current: createQuestion(id) }));

    expect(result.current.map((card) => card.id)).toEqual(startingOrder);
    expect(result.current.map((card) => card.question?.id)).toEqual(["4", "3", "2"]);
  });

  it("keeps the deck unchanged when rendered again with the same question", () => {
    const question = createQuestion("1");
    const { result, rerender } = renderDeck(question);
    const deck = result.current;

    rerender({ current: question });

    expect(result.current).toBe(deck);
  });
});
