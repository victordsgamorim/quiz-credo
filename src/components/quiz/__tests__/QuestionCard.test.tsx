import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuestionCard } from "../QuestionCard";
import { Question } from "@/types/quiz";

describe("QuestionCard", () => {
  const mockQuestion: Question = {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    difficulty: "easy",
    points: 100,
    category: "Geography",
  };

  it("renders the question text", () => {
    render(<QuestionCard question={mockQuestion} questionNumber={1} totalQuestions={10} />);
    expect(screen.getByText("What is the capital of France?")).toBeInTheDocument();
  });

  it("displays correct question number", () => {
    render(<QuestionCard question={mockQuestion} questionNumber={5} totalQuestions={10} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText(/de/)).toBeInTheDocument();
  });

  it("displays total questions count", () => {
    render(<QuestionCard question={mockQuestion} questionNumber={1} totalQuestions={10} />);
    expect(screen.getByText(/de 10/)).toBeInTheDocument();
  });

  it("displays points value", () => {
    render(<QuestionCard question={mockQuestion} questionNumber={1} totalQuestions={10} />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("pts")).toBeInTheDocument();
  });

  it("displays difficulty level for easy questions", () => {
    render(<QuestionCard question={mockQuestion} questionNumber={1} totalQuestions={10} />);
    expect(screen.getByText("Fácil")).toBeInTheDocument();
  });

  it("displays difficulty level for medium questions", () => {
    const mediumQuestion = { ...mockQuestion, difficulty: "medium" as const };
    render(<QuestionCard question={mediumQuestion} questionNumber={1} totalQuestions={10} />);
    expect(screen.getByText("Médio")).toBeInTheDocument();
  });

  it("displays difficulty level for hard questions", () => {
    const hardQuestion = { ...mockQuestion, difficulty: "hard" as const };
    render(<QuestionCard question={hardQuestion} questionNumber={1} totalQuestions={10} />);
    expect(screen.getByText("Difícil")).toBeInTheDocument();
  });

  it("applies correct color class for easy difficulty", () => {
    render(<QuestionCard question={mockQuestion} questionNumber={1} totalQuestions={10} />);
    const difficultyElement = screen.getByText("Fácil");
    expect(difficultyElement).toHaveClass("text-success");
  });

  it("applies correct color class for medium difficulty", () => {
    const mediumQuestion = { ...mockQuestion, difficulty: "medium" as const };
    render(<QuestionCard question={mediumQuestion} questionNumber={1} totalQuestions={10} />);
    const difficultyElement = screen.getByText("Médio");
    expect(difficultyElement).toHaveClass("text-primary");
  });

  it("applies correct color class for hard difficulty", () => {
    const hardQuestion = { ...mockQuestion, difficulty: "hard" as const };
    render(<QuestionCard question={hardQuestion} questionNumber={1} totalQuestions={10} />);
    const difficultyElement = screen.getByText("Difícil");
    expect(difficultyElement).toHaveClass("text-destructive");
  });
});
