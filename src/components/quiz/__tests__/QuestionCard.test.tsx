import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Question } from "@/types/quiz";

import { QuestionCard } from "../QuestionCard";

// eslint-disable-next-line max-lines-per-function
describe("QuestionCard", () => {
  const mockQuestion: Question = {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    difficulty: "level1",
    points: 100,
    category: "Geography",
  };

  it("renders the question text", () => {
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
      />
    );
    expect(screen.getByText("What is the capital of France?")).toBeInTheDocument();
  });

  it("renders the avatar image", () => {
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
      />
    );
    expect(screen.getByAltText("Host")).toBeInTheDocument();
  });
});
