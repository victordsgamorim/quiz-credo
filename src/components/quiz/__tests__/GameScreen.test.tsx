/* eslint-disable max-lines */
import { render, screen, waitFor, within } from "@testing-library/react";
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
const streakStrings = translations["pt-BR"].quiz.gameScreen.streak;
const powerUpStrings = translations["pt-BR"].quiz.gameScreen.powerUps;
// The other players of the room's game
const TARGETS = [
  { id: "bia", name: "Bia" },
  { id: "caio", name: "Caio" },
];
const actionStrings = translations["pt-BR"].quiz.gameScreen.actions;

const streakOf = (count: number, questionMultiplier = 1) => ({
  count,
  threshold: 5,
  questionMultiplier,
});

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
  timerRemaining: 60,
  isAdmin: false,
  isSynced: false,
  timerDuration: 60,
  lowTimeThreshold: 10,
  criticalTimeThreshold: 5,
};

const runBackToLobbyTests = () => {
  describe("back to lobby button", () => {
    it("renders back to lobby button for admin", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} isAdmin={true} />);
      expect(screen.getByTitle(lobbyStrings.backToLobbyTooltip)).toBeInTheDocument();
    });

    it("does not render back to lobby button for guests", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} isAdmin={false} />);
      expect(screen.queryByTitle(lobbyStrings.backToLobbyTooltip)).not.toBeInTheDocument();
    });

    it("calls onBackToLobby when back button is clicked (admin)", async () => {
      const onBackToLobby = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(
        <GameScreen {...defaultGameScreenProps} onBackToLobby={onBackToLobby} isAdmin={true} />
      );

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
  });
};

const runQuestionDisplayTests = () => {
  describe("question display", () => {
    it("displays the question text", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} />);
      expect(screen.getByText("What is the capital of France?")).toBeInTheDocument();
    });

    it("shows the last question on a card with no questions left behind it", () => {
      const { container } = renderWithLocale(
        <GameScreen {...defaultGameScreenProps} questionNumber={10} totalQuestions={10} />
      );

      expect(container.querySelector('[data-state="front"]')).toHaveTextContent(
        "What is the capital of France?"
      );
      expect(container.querySelectorAll('[data-state="behind"]')).toHaveLength(0);
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

    it("disables all options for admin users", () => {
      const onSelectAnswer = vi.fn();

      renderWithLocale(
        <GameScreen {...defaultGameScreenProps} isAdmin={true} onSelectAnswer={onSelectAnswer} />
      );

      const optionButtons = [
        screen.getByRole("button", { name: /London/i }),
        screen.getByRole("button", { name: /Paris/i }),
        screen.getByRole("button", { name: /Berlin/i }),
        screen.getByRole("button", { name: /Madrid/i }),
      ];

      optionButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });
};

const runSubmitButtonTests = () => {
  describe("submit button", () => {
    it("disables submit button when no answer selected", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} selectedAnswer={null} />);
      const submitButton = screen.getByRole("button", {
        name: new RegExp(translations["pt-BR"].quiz.gameScreen.actions.submit, "i"),
      });
      expect(submitButton).toBeDisabled();
    });

    it("enables submit button when answer is selected", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} selectedAnswer={1} />);
      const submitButton = screen.getByRole("button", {
        name: new RegExp(translations["pt-BR"].quiz.gameScreen.actions.submit, "i"),
      });
      expect(submitButton).not.toBeDisabled();
    });
  });
};

const runTimerBehaviorTests = () => {
  describe("timer behavior", () => {
    it("auto-submits when timer reaches zero in synced mode", async () => {
      const onSubmitAnswer = vi.fn();

      renderWithLocale(
        <GameScreen
          {...defaultGameScreenProps}
          isSynced={true}
          timerRemaining={0}
          onSubmitAnswer={onSubmitAnswer}
        />
      );

      await waitFor(() => {
        expect(onSubmitAnswer).toHaveBeenCalledTimes(1);
      });
    });

    it("locks answer selection when time is up", () => {
      renderWithLocale(
        <GameScreen {...defaultGameScreenProps} isSynced={true} timerRemaining={0} />
      );

      const optionButtons = [
        screen.getByRole("button", { name: /London/i }),
        screen.getByRole("button", { name: /Paris/i }),
        screen.getByRole("button", { name: /Berlin/i }),
        screen.getByRole("button", { name: /Madrid/i }),
      ];

      optionButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });
};

const runFeedbackDisplayTests = () => {
  describe("feedback display", () => {
    it("shows next question button when showing feedback", () => {
      renderWithLocale(
        <GameScreen {...defaultGameScreenProps} isShowingFeedback={true} selectedAnswer={1} />
      );
      expect(
        screen.getByTitle(translations["pt-BR"].quiz.gameScreen.actions.nextQuestion)
      ).toBeInTheDocument();
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
      expect(
        screen.getByTitle(translations["pt-BR"].quiz.gameScreen.actions.viewResults)
      ).toBeInTheDocument();
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

      await user.click(
        screen.getByTitle(translations["pt-BR"].quiz.gameScreen.actions.nextQuestion)
      );
      expect(onNextQuestion).toHaveBeenCalledTimes(1);
    });
  });
};

const runStreakTests = () => {
  describe("streak bar", () => {
    it("shows the player's own streak", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} streak={streakOf(2)} />);
      expect(screen.getByRole("progressbar", { name: streakStrings.label })).toHaveAttribute(
        "aria-valuenow",
        "2"
      );
    });

    it("is hidden from an admin who doesn't answer", () => {
      renderWithLocale(
        <GameScreen {...defaultGameScreenProps} isAdmin={true} streak={streakOf(2)} />
      );
      expect(
        screen.queryByRole("progressbar", { name: streakStrings.label })
      ).not.toBeInTheDocument();
    });

    it("is shown to an admin playing in debug mode", () => {
      renderWithLocale(
        <GameScreen
          {...defaultGameScreenProps}
          isAdmin={true}
          isDebugMode={true}
          streak={streakOf(2)}
        />
      );
      expect(screen.getByRole("progressbar", { name: streakStrings.label })).toBeInTheDocument();
    });

    it("shows what the question is worth with the player's multiplier", () => {
      renderWithLocale(
        <GameScreen
          {...defaultGameScreenProps}
          question={createMockQuestion({ points: 30 })}
          streak={streakOf(6, 2)}
        />
      );
      expect(screen.getByText("60")).toBeInTheDocument();
      expect(screen.getByText("×2")).toBeInTheDocument();
    });
  });
};

const runPointsPopupTests = () => {
  describe("points popup", () => {
    const answered = (selectedAnswer: number) => ({
      ...defaultGameScreenProps,
      question: createMockQuestion({ points: 30 }),
      selectedAnswer,
      isShowingFeedback: true,
    });

    it("pops up the points of a right answer, in the colors of its multiplier", () => {
      const { container } = renderWithLocale(
        <GameScreen {...answered(1)} streak={streakOf(6, 2)} />
      );
      const popup = container.querySelector(".points-popup");
      expect(popup).toHaveTextContent("+60");
      expect(popup).toHaveAttribute("data-level", "2");
    });

    it("is gold without a multiplier", () => {
      const { container } = renderWithLocale(<GameScreen {...answered(1)} />);
      const popup = container.querySelector(".points-popup");
      expect(popup).toHaveTextContent("+30");
      expect(popup).toHaveAttribute("data-level", "0");
    });

    it("doesn't pop up for a wrong answer or before the feedback", () => {
      const { container } = renderWithLocale(<GameScreen {...answered(0)} />);
      expect(container.querySelector(".points-popup")).not.toBeInTheDocument();

      const { container: beforeFeedback } = renderWithLocale(
        <GameScreen {...answered(1)} isShowingFeedback={false} />
      );
      expect(beforeFeedback.querySelector(".points-popup")).not.toBeInTheDocument();
    });

    it("doesn't pop up for an admin who doesn't answer", () => {
      const { container } = renderWithLocale(<GameScreen {...answered(1)} isAdmin={true} />);
      expect(container.querySelector(".points-popup")).not.toBeInTheDocument();
    });
  });
};

const runActionBarTests = () => {
  describe("action bar", () => {
    it("puts the admin's actions beside the countdown, not along the bottom of the screen", () => {
      const { container } = renderWithLocale(
        <GameScreen
          {...defaultGameScreenProps}
          isAdmin={true}
          isSynced={true}
          totalGuests={4}
          selectedGuestsCount={2}
        />
      );

      expect(screen.getByRole("button", { name: actionStrings.submit })).toBeInTheDocument();
      expect(screen.getByTitle("2/4 escolheram")).toBeInTheDocument();
      expect(container.querySelector(".fixed")).not.toBeInTheDocument();
    });

    it("gives the guests of a synced game the power-ups along the bottom of the screen", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} isSynced={true} />);

      const bar = screen.getByRole("navigation", { name: powerUpStrings.label });
      expect(bar).toHaveClass("bottom-0", "sm:static");
      expect(screen.queryByRole("button", { name: actionStrings.submit })).not.toBeInTheDocument();
    });

    it("gives the players outside a synced game both the actions and the power-ups", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} />);

      expect(screen.getByRole("button", { name: actionStrings.submit })).toBeInTheDocument();
      expect(screen.getByRole("navigation", { name: powerUpStrings.label })).toBeInTheDocument();
    });

    it("leaves the admins who don't answer without the power-ups", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} isAdmin={true} isSynced={true} />);
      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });

    it("uses an advantage at once on the player, and keeps the ones used before off", async () => {
      const user = userEvent.setup();
      const onUsePowerUp = vi.fn();
      renderWithLocale(
        <GameScreen
          {...defaultGameScreenProps}
          isSynced={true}
          powerUpTargets={TARGETS}
          usedPowerUps={[{ id: "freeze", questionId: "an earlier question" }]}
          onUsePowerUp={onUsePowerUp}
        />
      );

      await user.click(screen.getByRole("button", { name: powerUpStrings.shield.name }));

      expect(onUsePowerUp).toHaveBeenCalledWith("shield", undefined);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: new RegExp(powerUpStrings.freeze.name) })
      ).toBeDisabled();
      expect(screen.getByRole("button", { name: powerUpStrings.steal.name })).toBeEnabled();
    });

    it("lists the other players for a disadvantage, and uses it on the one picked", async () => {
      const user = userEvent.setup();
      const onUsePowerUp = vi.fn();
      renderWithLocale(
        <GameScreen
          {...defaultGameScreenProps}
          isSynced={true}
          powerUpTargets={TARGETS}
          onUsePowerUp={onUsePowerUp}
        />
      );

      await user.click(screen.getByRole("button", { name: powerUpStrings.steal.name }));

      const picker = screen.getByRole("dialog");
      expect(within(picker).getAllByRole("listitem")).toHaveLength(TARGETS.length);
      expect(onUsePowerUp).not.toHaveBeenCalled();

      await user.click(within(picker).getByRole("button", { name: "Bia" }));

      expect(onUsePowerUp).toHaveBeenCalledWith("steal", "bia");
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });

    it("keeps a disadvantage when its list of players is closed", async () => {
      const user = userEvent.setup();
      const onUsePowerUp = vi.fn();
      renderWithLocale(
        <GameScreen
          {...defaultGameScreenProps}
          isSynced={true}
          powerUpTargets={TARGETS}
          onUsePowerUp={onUsePowerUp}
        />
      );

      await user.click(screen.getByRole("button", { name: powerUpStrings.freeze.name }));
      await user.keyboard("{Escape}");

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(onUsePowerUp).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: powerUpStrings.freeze.name })).toBeEnabled();
    });

    it("turns the disadvantages off when nobody else is in the game", () => {
      renderWithLocale(<GameScreen {...defaultGameScreenProps} isSynced={true} />);

      const freeze = screen.getByRole("button", { name: powerUpStrings.freeze.name });
      expect(freeze).toBeDisabled();
      expect(freeze).toHaveAttribute("title", powerUpStrings.noTargets);
      expect(screen.getByRole("button", { name: powerUpStrings.shield.name })).toBeEnabled();
    });

    it("closes the list of players, without using the disadvantage, once the answer is shown", async () => {
      const user = userEvent.setup();
      const onUsePowerUp = vi.fn();
      const props = {
        ...defaultGameScreenProps,
        isSynced: true,
        powerUpTargets: TARGETS,
        onUsePowerUp,
      };
      const { rerender } = renderWithLocale(<GameScreen {...props} />);

      await user.click(screen.getByRole("button", { name: powerUpStrings.steal.name }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      rerender(
        <LocaleProvider>
          <GameScreen {...props} isShowingFeedback={true} />
        </LocaleProvider>
      );

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(onUsePowerUp).not.toHaveBeenCalled();
    });

    it("plays the power-up's animation over the screen when it is used", async () => {
      const user = userEvent.setup();
      const { container } = renderWithLocale(
        <GameScreen {...defaultGameScreenProps} isSynced={true} />
      );
      expect(container.querySelector(".power-up-cast")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: powerUpStrings.shield.name }));

      expect(container.querySelector(".power-up-cast")).toHaveAttribute("data-power-up", "shield");
    });

    it("locks the other power-ups once one is used on the question", () => {
      const question = createMockQuestion({ id: "q2" });
      renderWithLocale(
        <GameScreen
          {...defaultGameScreenProps}
          question={question}
          isSynced={true}
          usedPowerUps={[{ id: "freeze", questionId: "q2" }]}
        />
      );

      const bar = screen.getByRole("navigation", { name: powerUpStrings.label });
      within(bar)
        .getAllByRole("button")
        .forEach((button) => expect(button).toBeDisabled());
      expect(screen.getByRole("button", { name: powerUpStrings.steal.name })).toHaveAttribute(
        "data-used",
        "false"
      );
    });

    it("locks the power-ups once the answer is shown", () => {
      renderWithLocale(
        <GameScreen {...defaultGameScreenProps} isSynced={true} isShowingFeedback={true} />
      );

      const bar = screen.getByRole("navigation", { name: powerUpStrings.label });
      within(bar)
        .getAllByRole("button")
        .forEach((button) => expect(button).toBeDisabled());
    });
  });
};

// The countdown shares its row with the actions, so they must never change size
const runActionBarSizeTests = () => {
  describe("action bar size", () => {
    it("keeps the guests' count in place during feedback, so the countdown keeps its size", () => {
      renderWithLocale(
        <GameScreen
          {...defaultGameScreenProps}
          isAdmin={true}
          isSynced={true}
          totalGuests={4}
          selectedGuestsCount={4}
          selectedAnswer={1}
          isShowingFeedback={true}
        />
      );

      expect(screen.getByTitle("4/4 escolheram")).toHaveClass("invisible");
    });

    it("gives the guests' count a fixed width on wider screens, and only numbers on phones", () => {
      renderWithLocale(
        <GameScreen
          {...defaultGameScreenProps}
          isAdmin={true}
          isSynced={true}
          totalGuests={12}
          selectedGuestsCount={9}
        />
      );

      const count = screen.getByTitle("9/12 escolheram");
      expect(count).toHaveClass("sm:w-40");
      expect(screen.getByText("9/12 escolheram")).toHaveClass("sr-only", "sm:not-sr-only");
    });
  });
};

describe("GameScreen", () => {
  runBackToLobbyTests();
  runGameHeaderTests();
  runQuestionDisplayTests();
  runAnswerSelectionTests();
  runSubmitButtonTests();
  runTimerBehaviorTests();
  runFeedbackDisplayTests();
  runStreakTests();
  runPointsPopupTests();
  runActionBarTests();
  runActionBarSizeTests();
});
