import type { ComponentProps } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";
import { Question } from "@/types/quiz";

import { ActionPanel } from "../GameScreenActions";

const quizStrings = translations["pt-BR"].quiz;

const baseQuestion: Question = {
  id: "q1",
  question: "Sample question?",
  options: ["Alpha", "Beta", "Gamma", "Delta"],
  correctAnswer: 1,
  difficulty: "level1",
  points: 150,
};

const renderWithLocale = (component: React.ReactElement) => {
  return render(<LocaleProvider>{component}</LocaleProvider>);
};

const defaultProps = {
  question: baseQuestion,
  questionNumber: 1,
  totalQuestions: 3,
  selectedAnswer: 0,
  isShowingFeedback: false,
  isCorrect: false,
  onSubmit: vi.fn(),
  onNextQuestion: vi.fn(),
  isAdmin: true,
  isSocketMode: false,
} satisfies ComponentProps<typeof ActionPanel>;

const renderActionPanel = (props: Partial<ComponentProps<typeof ActionPanel>> = {}) =>
  renderWithLocale(<ActionPanel {...defaultProps} {...props} />);

describe("ActionPanel", () => {
  it("shows waiting message instead of submit button when guest is in socket mode", () => {
    renderActionPanel({ isAdmin: false, isSocketMode: true });

    expect(screen.getByText(quizStrings.gameScreen.actions.waitingForAdmin)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: quizStrings.gameScreen.actions.submit })
    ).not.toBeInTheDocument();
  });

  it("shows waiting message instead of next question button for guests during feedback in socket mode", () => {
    renderActionPanel({ isAdmin: false, isSocketMode: true, isShowingFeedback: true });

    expect(screen.getByText(quizStrings.gameScreen.actions.waitingForAdmin)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: quizStrings.gameScreen.actions.nextQuestion })
    ).not.toBeInTheDocument();
  });

  it("shows view results button on the last question when admin is advancing", async () => {
    const onNextQuestion = vi.fn();
    const user = userEvent.setup();

    renderActionPanel({
      isAdmin: true,
      isSocketMode: true,
      isShowingFeedback: true,
      questionNumber: 5,
      totalQuestions: 5,
      onNextQuestion,
    });

    const viewResultsButton = screen.getByRole("button", {
      name: quizStrings.gameScreen.actions.viewResults,
    });

    expect(viewResultsButton).toBeInTheDocument();
    await user.click(viewResultsButton);
    expect(onNextQuestion).toHaveBeenCalledTimes(1);
  });

  it("shows correct answer text when feedback is incorrect", () => {
    renderActionPanel({
      isShowingFeedback: true,
      isCorrect: false,
      question: { ...baseQuestion, correctAnswer: 2, options: ["Alpha", "Beta", "Gamma", "Delta"] },
    });

    expect(screen.getByText(/Resposta correta: Gamma/)).toBeInTheDocument();
  });

  it("shows points gained when feedback is correct", () => {
    renderActionPanel({
      isShowingFeedback: true,
      isCorrect: true,
      question: { ...baseQuestion, points: 250 },
    });

    expect(screen.getByText("+250 pontos")).toBeInTheDocument();
  });
});
