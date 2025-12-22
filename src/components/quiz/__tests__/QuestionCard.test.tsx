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
    difficulty: "level1",
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

  it("displays difficulty level for level1 questions", () => {
    renderWithLocale(
      <QuestionCard question={mockQuestion} questionNumber={1} totalQuestions={10} />
    );
    expect(screen.getByText(difficultyLabels.level1)).toBeInTheDocument();
  });

  it("displays difficulty level for level3 questions", () => {
    const level3Question = { ...mockQuestion, difficulty: "level3" as const };
    renderWithLocale(
      <QuestionCard question={level3Question} questionNumber={1} totalQuestions={10} />
    );
    expect(screen.getByText(difficultyLabels.level3)).toBeInTheDocument();
  });

  it("displays difficulty level for level5 questions", () => {
    const level5Question = { ...mockQuestion, difficulty: "level5" as const };
    renderWithLocale(
      <QuestionCard question={level5Question} questionNumber={1} totalQuestions={10} />
    );
    expect(screen.getByText(difficultyLabels.level5)).toBeInTheDocument();
  });

  it("applies correct color class for level1 difficulty", () => {
    renderWithLocale(
      <QuestionCard question={mockQuestion} questionNumber={1} totalQuestions={10} />
    );
    const difficultyElement = screen.getByText(difficultyLabels.level1);
    expect(difficultyElement).toHaveClass("text-success");
  });

  it("applies correct color class for level3 difficulty", () => {
    const level3Question = { ...mockQuestion, difficulty: "level3" as const };
    renderWithLocale(
      <QuestionCard question={level3Question} questionNumber={1} totalQuestions={10} />
    );
    const difficultyElement = screen.getByText(difficultyLabels.level3);
    expect(difficultyElement).toHaveClass("text-primary");
  });

  it("applies correct color class for level5 difficulty", () => {
    const level5Question = { ...mockQuestion, difficulty: "level5" as const };
    renderWithLocale(
      <QuestionCard question={level5Question} questionNumber={1} totalQuestions={10} />
    );
    const difficultyElement = screen.getByText(difficultyLabels.level5);
    expect(difficultyElement).toHaveClass("text-destructive");
  });
});
