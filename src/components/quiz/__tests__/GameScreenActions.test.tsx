import type { ComponentProps } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, type MockInstance } from "vitest";

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
  it("shows no buttons for guests in socket mode", () => {
    renderActionPanel({ isAdmin: false, isSocketMode: true });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows no buttons for guests during feedback in socket mode", () => {
    renderActionPanel({
      isAdmin: false,
      isSocketMode: true,
      isShowingFeedback: true,
    });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
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

    const viewResultsButton = screen.getByTitle(quizStrings.gameScreen.actions.viewResults);

    expect(viewResultsButton).toBeInTheDocument();
    await user.click(viewResultsButton);
    expect(onNextQuestion).toHaveBeenCalledTimes(1);
  });

  it("shows only icon button when feedback is shown (no text feedback)", () => {
    const { container } = renderActionPanel({
      isShowingFeedback: true,
      isCorrect: false,
    });

    expect(screen.queryByText(/Resposta correta/)).not.toBeInTheDocument();
    expect(screen.getByTitle(quizStrings.gameScreen.actions.nextQuestion)).toBeInTheDocument();
    expect(container.textContent).not.toContain("Gamma");
  });

  it("shows only icon button when correct (no points text)", () => {
    const { container } = renderActionPanel({
      isShowingFeedback: true,
      isCorrect: true,
    });

    expect(screen.queryByText(/pontos/)).not.toBeInTheDocument();
    expect(screen.getByTitle(quizStrings.gameScreen.actions.nextQuestion)).toBeInTheDocument();
    expect(container.textContent).not.toContain("250");
  });

  it("keeps two button slots during feedback, so the panel doesn't change size", () => {
    const { container, rerender } = renderActionPanel();
    const buttonRow = () => container.querySelector(".flex");
    expect(buttonRow()?.children).toHaveLength(2);

    rerender(
      <LocaleProvider>
        <ActionPanel {...defaultProps} isShowingFeedback={true} />
      </LocaleProvider>
    );
    expect(buttonRow()?.children).toHaveLength(2);
    expect(screen.queryByTitle(quizStrings.gameScreen.actions.askAudience)).not.toBeInTheDocument();
    expect(buttonRow()?.lastElementChild).toHaveAttribute(
      "title",
      quizStrings.gameScreen.actions.nextQuestion
    );
  });

  it("plays the audience's sound when the admin presses the ask the audience button", async () => {
    const play: MockInstance<() => Promise<void>> = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderActionPanel({ isAdmin: true, isSocketMode: true });
    expect(play).not.toHaveBeenCalled();

    await user.click(screen.getByTitle(quizStrings.gameScreen.actions.askAudience));
    await user.click(screen.getByTitle(quizStrings.gameScreen.actions.askAudience));

    // Each press plays it from the start
    expect(play).toHaveBeenCalledTimes(2);
    expect((play.mock.contexts[0] as HTMLAudioElement).src).toMatch(/ask\.mp3$/);
    play.mockRestore();
  });

  it("admin can submit without selecting an answer", () => {
    renderActionPanel({
      isAdmin: true,
      selectedAnswer: null,
      isSocketMode: true,
    });

    const submitButton = screen.getByTitle(quizStrings.gameScreen.actions.submit);
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it("guest cannot submit without selecting an answer", () => {
    renderActionPanel({
      isAdmin: false,
      selectedAnswer: null,
      isSocketMode: false,
    });

    const submitButton = screen.getByTitle(quizStrings.gameScreen.actions.submit);
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});
