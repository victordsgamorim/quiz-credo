import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { LocaleProvider, interpolate } from "@/contexts/LocaleContext";
import { translations } from "@/locales";
import { Question } from "@/types/quiz";

import { QuestionCard } from "../QuestionCard";

const renderWithLocale = (component: React.ReactElement) => {
  return render(<LocaleProvider>{component}</LocaleProvider>);
};

const localeStrings = translations["pt-BR"];
const questionTemplate = localeStrings.quiz.question;
const difficultyLabels = localeStrings.quiz.gameScreen.difficulty;
const pointsSuffix = localeStrings.quiz.gameScreen.pointsSuffix;

// eslint-disable-next-line max-lines-per-function
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
    renderWithLocale(
      <QuestionCard question={mockQuestion} questionNumber={1} totalQuestions={10} />
    );
    expect(screen.getByText("What is the capital of France?")).toBeInTheDocument();
    expect(
      screen.getByText(interpolate(questionTemplate, { current: 1, total: 10 }))
    ).toBeInTheDocument();
  });

  it("displays correct question number", () => {
    renderWithLocale(
      <QuestionCard question={mockQuestion} questionNumber={5} totalQuestions={10} />
    );
    expect(
      screen.getByText(interpolate(questionTemplate, { current: 5, total: 10 }))
    ).toBeInTheDocument();
  });

  it("displays total questions count", () => {
    renderWithLocale(
      <QuestionCard question={mockQuestion} questionNumber={1} totalQuestions={10} />
    );
    expect(
      screen.getByText(interpolate(questionTemplate, { current: 1, total: 10 }))
    ).toBeInTheDocument();
  });

  it("displays points value", () => {
    renderWithLocale(
      <QuestionCard question={mockQuestion} questionNumber={1} totalQuestions={10} />
    );
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText(pointsSuffix)).toBeInTheDocument();
  });

  it("displays difficulty level for easy questions", () => {
    renderWithLocale(
      <QuestionCard question={mockQuestion} questionNumber={1} totalQuestions={10} />
    );
    expect(screen.getByText(difficultyLabels.easy)).toBeInTheDocument();
  });

  it("displays difficulty level for medium questions", () => {
    const mediumQuestion = { ...mockQuestion, difficulty: "medium" as const };
    renderWithLocale(
      <QuestionCard question={mediumQuestion} questionNumber={1} totalQuestions={10} />
    );
    expect(screen.getByText(difficultyLabels.medium)).toBeInTheDocument();
  });

  it("displays difficulty level for hard questions", () => {
    const hardQuestion = { ...mockQuestion, difficulty: "hard" as const };
    renderWithLocale(
      <QuestionCard question={hardQuestion} questionNumber={1} totalQuestions={10} />
    );
    expect(screen.getByText(difficultyLabels.hard)).toBeInTheDocument();
  });

  it("applies correct color class for easy difficulty", () => {
    renderWithLocale(
      <QuestionCard question={mockQuestion} questionNumber={1} totalQuestions={10} />
    );
    const difficultyElement = screen.getByText(difficultyLabels.easy);
    expect(difficultyElement).toHaveClass("text-success");
  });

  it("applies correct color class for medium difficulty", () => {
    const mediumQuestion = { ...mockQuestion, difficulty: "medium" as const };
    renderWithLocale(
      <QuestionCard question={mediumQuestion} questionNumber={1} totalQuestions={10} />
    );
    const difficultyElement = screen.getByText(difficultyLabels.medium);
    expect(difficultyElement).toHaveClass("text-primary");
  });

  it("applies correct color class for hard difficulty", () => {
    const hardQuestion = { ...mockQuestion, difficulty: "hard" as const };
    renderWithLocale(
      <QuestionCard question={hardQuestion} questionNumber={1} totalQuestions={10} />
    );
    const difficultyElement = screen.getByText(difficultyLabels.hard);
    expect(difficultyElement).toHaveClass("text-destructive");
  });
});
