import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";
import { Question } from "@/types/quiz";

import { GameScreen } from "../GameScreen";

const renderWithLocale = (component: React.ReactElement) => {
  return render(<LocaleProvider>{component}</LocaleProvider>);
};

const lobbyStrings = translations["pt-BR"].lobby;
const quizStrings = translations["pt-BR"].quiz;

const createMockQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: 1,
  question: "What is the capital of France?",
  options: ["London", "Paris", "Berlin", "Madrid"],
  correctAnswer: 1,
  difficulty: "easy",
  points: 100,
  ...overrides,
});

const defaultGameScreenProps = {
  question: createMockQuestion(),
  questionNumber: 1,
  totalQuestions: 10,
  score: 0,
  selectedAnswer: null,
  isShowingFeedback: false,
  onSelectAnswer: vi.fn(),
  onSubmitAnswer: vi.fn(),
  onNextQuestion: vi.fn(),
  onBackToLobby: vi.fn(),
};

const runBackToLobbyTests = () => {
  describe("back to lobby button", () => {
    it("renders back to lobby button", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} />);
      expect(screen.getByTitle(lobbyStrings.backToLobbyTooltip)).toBeInTheDocument();
    });

    it("calls onBackToLobby when back button is clicked", async () => {
      const onBackToLobby = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(<GameScreen {...defaultGameScreenProps} onBackToLobby={onBackToLobby} />);

      await user.click(screen.getByTitle(lobbyStrings.backToLobbyTooltip));
      expect(onBackToLobby).toHaveBeenCalledTimes(1);
    });
  });
};

const runGameHeaderTests = () => {
  describe("game header", () => {
    it("displays current score", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} score={500} />);
      expect(screen.getByText("500")).toBeInTheDocument();
    });

    it("displays score label", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} />);
      expect(screen.getByText(quizStrings.gameScreen.scoreLabel)).toBeInTheDocument();
    });
  });
};

const runQuestionDisplayTests = () => {
  describe("question display", () => {
    it("displays the question text", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} />);
      expect(screen.getByText("What is the capital of France?")).toBeInTheDocument();
    });

    it("displays all answer options", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} />);
      expect(screen.getByText("London")).toBeInTheDocument();
      expect(screen.getByText("Paris")).toBeInTheDocument();
      expect(screen.getByText("Berlin")).toBeInTheDocument();
      expect(screen.getByText("Madrid")).toBeInTheDocument();
    });
  });
};

const runAnswerSelectionTests = () => {
  describe("answer selection", () => {
    it("calls onSelectAnswer when an option is clicked", async () => {
      const onSelectAnswer = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(<GameScreen {...defaultGameScreenProps} onSelectAnswer={onSelectAnswer} />);

      await user.click(screen.getByText("Paris"));
      expect(onSelectAnswer).toHaveBeenCalledWith(1);
    });

    it("disables options when showing feedback", () => {
      const onSelectAnswer = vi.fn();

      const { container } = renderWithLocale(
        <GameScreen
          {...defaultGameScreenProps}
          isShowingFeedback={true}
          selectedAnswer={1}
          onSelectAnswer={onSelectAnswer}
        />
      );

      const answerButtons = container.querySelectorAll("button[disabled]");
      expect(answerButtons.length).toBeGreaterThan(0);
    });
  });
};

const runSubmitButtonTests = () => {
  describe("submit button", () => {
    it("disables submit button when no answer selected", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} selectedAnswer={null} />);
      const submitButton = screen.getByRole("button", {
        name: new RegExp(quizStrings.gameScreen.actions.submit, "i"),
      });
      expect(submitButton).toBeDisabled();
    });

    it("enables submit button when answer is selected", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} selectedAnswer={1} />);
      const submitButton = screen.getByRole("button", {
        name: new RegExp(quizStrings.gameScreen.actions.submit, "i"),
      });
      expect(submitButton).not.toBeDisabled();
    });
  });
};

const runFeedbackDisplayTests = () => {
  describe("feedback display", () => {
    it("shows correct feedback when answer is correct", () => {
      renderWithLocale(
        <GameScreen {...defaultGameScreenProps} isShowingFeedback={true} selectedAnswer={1} />
      );
      expect(screen.getByText(quizStrings.gameScreen.feedback.correct)).toBeInTheDocument();
    });

    it("shows incorrect feedback when answer is wrong", () => {
      renderWithLocale(
        <GameScreen {...defaultGameScreenProps} isShowingFeedback={true} selectedAnswer={0} />
      );
      expect(screen.getByText(quizStrings.gameScreen.feedback.incorrect)).toBeInTheDocument();
    });

    it("shows next question button when showing feedback", () => {
      renderWithLocale(
        <GameScreen {...defaultGameScreenProps} isShowingFeedback={true} selectedAnswer={1} />
      );
      expect(screen.getByText(quizStrings.gameScreen.actions.nextQuestion)).toBeInTheDocument();
    });

    it("shows view results button on last question", () => {
      renderWithLocale(
        <GameScreen
          {...defaultGameScreenProps}
          isShowingFeedback={true}
          selectedAnswer={1}
          questionNumber={10}
          totalQuestions={10}
        />
      );
      expect(screen.getByText(quizStrings.gameScreen.actions.viewResults)).toBeInTheDocument();
    });

    it("calls onNextQuestion when next button is clicked", async () => {
      const onNextQuestion = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(
        <GameScreen
          {...defaultGameScreenProps}
          isShowingFeedback={true}
          selectedAnswer={1}
          onNextQuestion={onNextQuestion}
        />
      );

      await user.click(screen.getByText(quizStrings.gameScreen.actions.nextQuestion));
      expect(onNextQuestion).toHaveBeenCalledTimes(1);
    });
  });
};

describe("GameScreen", () => {
  runBackToLobbyTests();
  runGameHeaderTests();
  runQuestionDisplayTests();
  runAnswerSelectionTests();
  runSubmitButtonTests();
  runFeedbackDisplayTests();
});
