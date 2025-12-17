import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";
import { GameState, PlayerHistory } from "@/types/quiz";

import { ResultScreen } from "../ResultScreen";

const renderWithLocale = (component: React.ReactElement) => {
  return render(<LocaleProvider>{component}</LocaleProvider>);
};

const lobbyStrings = translations["pt-BR"].lobby;
const quizStrings = translations["pt-BR"].quiz;

const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
  status: "finished",
  currentQuestionIndex: 9,
  score: 750,
  playerName: "TestPlayer",
  answers: [
    { questionId: "q1", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
    { questionId: "q2", selectedAnswer: 0, isCorrect: false, timeSpent: 15 },
    { questionId: "q3", selectedAnswer: 2, isCorrect: true, timeSpent: 12 },
  ],
  ...overrides,
});

const createMockPlayerStats = (overrides: Partial<PlayerHistory> = {}): PlayerHistory => ({
  playerName: "TestPlayer",
  totalGames: 5,
  bestScore: 900,
  averageScore: 700,
  questionsAnswered: 50,
  questionsCorrect: 40,
  ...overrides,
});

const createMockRanking = (): PlayerHistory[] => [
  createMockPlayerStats({ playerName: "Player1", bestScore: 1000 }),
  createMockPlayerStats({ playerName: "TestPlayer", bestScore: 900 }),
  createMockPlayerStats({ playerName: "Player3", bestScore: 800 }),
];

const defaultResultScreenProps = {
  gameState: createMockGameState(),
  playerStats: createMockPlayerStats(),
  ranking: createMockRanking(),
  onPlayAgain: vi.fn(),
  onBackToLobby: vi.fn(),
};

const excellentAnswers = [
  { questionId: "q1", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
  { questionId: "q2", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
  { questionId: "q3", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
  { questionId: "q4", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
  { questionId: "q5", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
  { questionId: "q6", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
  { questionId: "q7", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
  { questionId: "q8", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
  { questionId: "q9", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
  { questionId: "q10", selectedAnswer: 0, isCorrect: false, timeSpent: 10 },
];

const goodAnswers = [
  { questionId: "q1", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
  { questionId: "q2", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
  { questionId: "q3", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
  { questionId: "q4", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
  { questionId: "q5", selectedAnswer: 0, isCorrect: false, timeSpent: 10 },
];

const solidAnswers = [
  { questionId: "q1", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
  { questionId: "q2", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
  { questionId: "q3", selectedAnswer: 0, isCorrect: false, timeSpent: 10 },
  { questionId: "q4", selectedAnswer: 0, isCorrect: false, timeSpent: 10 },
];

const keepTryingAnswers = [
  { questionId: "q1", selectedAnswer: 1, isCorrect: true, timeSpent: 10 },
  { questionId: "q2", selectedAnswer: 0, isCorrect: false, timeSpent: 10 },
  { questionId: "q3", selectedAnswer: 0, isCorrect: false, timeSpent: 10 },
  { questionId: "q4", selectedAnswer: 0, isCorrect: false, timeSpent: 10 },
];

const performanceMessageCase = (
  title: string,
  answers: GameState["answers"],
  expectedTranslation: string
) => {
  it(title, () => {
    const gameState = createMockGameState({ answers });

    renderWithLocale(<ResultScreen {...defaultResultScreenProps} gameState={gameState} />);
    expect(screen.getByText(expectedTranslation)).toBeInTheDocument();
  });
};

const runResultBackToLobbyTests = () => {
  describe("back to lobby button", () => {
    it("renders back to lobby button", () => {
      renderWithLocale(<ResultScreen {...defaultResultScreenProps} />);
      expect(screen.getByText(lobbyStrings.backToLobby)).toBeInTheDocument();
    });

    it("calls onBackToLobby when back button is clicked", async () => {
      const onBackToLobby = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(
        <ResultScreen {...defaultResultScreenProps} onBackToLobby={onBackToLobby} />
      );

      await user.click(screen.getByText(lobbyStrings.backToLobby));
      expect(onBackToLobby).toHaveBeenCalledTimes(1);
    });

    it("has correct tooltip", () => {
      renderWithLocale(<ResultScreen {...defaultResultScreenProps} />);
      expect(screen.getByTitle(lobbyStrings.backToLobbyTooltip)).toBeInTheDocument();
    });
  });
};

const runPlayAgainTests = () => {
  describe("play again button", () => {
    it("renders play again button", () => {
      renderWithLocale(<ResultScreen {...defaultResultScreenProps} />);
      expect(screen.getByText(quizStrings.results.playAgain)).toBeInTheDocument();
    });

    it("calls onPlayAgain when play again button is clicked", async () => {
      const onPlayAgain = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(<ResultScreen {...defaultResultScreenProps} onPlayAgain={onPlayAgain} />);

      await user.click(screen.getByText(quizStrings.results.playAgain));
      expect(onPlayAgain).toHaveBeenCalledTimes(1);
    });
  });
};

const runScoreDisplayTests = () => {
  describe("score display", () => {
    it("displays the final score", () => {
      renderWithLocale(<ResultScreen {...defaultResultScreenProps} />);
      expect(screen.getByText("750")).toBeInTheDocument();
    });

    it("displays finish title", () => {
      renderWithLocale(<ResultScreen {...defaultResultScreenProps} />);
      expect(screen.getByText(quizStrings.results.finishTitle)).toBeInTheDocument();
    });

    it("displays correct answers count", () => {
      renderWithLocale(<ResultScreen {...defaultResultScreenProps} />);
      // 2 correct out of 3 answers
      expect(screen.getByText(/2\/3/)).toBeInTheDocument();
    });
  });
};

const runPerformanceMessageTests = () => {
  describe("performance message", () => {
    performanceMessageCase(
      "shows excellent message for 90%+ accuracy",
      excellentAnswers,
      quizStrings.results.performance.excellent
    );

    performanceMessageCase(
      "shows good message for 70-89% accuracy",
      goodAnswers,
      quizStrings.results.performance.good
    );

    performanceMessageCase(
      "shows solid message for 50-69% accuracy",
      solidAnswers,
      quizStrings.results.performance.solid
    );

    performanceMessageCase(
      "shows keep trying message for below 50% accuracy",
      keepTryingAnswers,
      quizStrings.results.performance.keepTrying
    );
  });
};

const runPlayerStatsTests = () => {
  describe("player stats", () => {
    it("displays player statistics when available", () => {
      renderWithLocale(<ResultScreen {...defaultResultScreenProps} />);
      expect(screen.getByText(quizStrings.results.stats)).toBeInTheDocument();
      // Check for totalGames label and value
      expect(screen.getByText(quizStrings.results.statLabels.gamesPlayed)).toBeInTheDocument();
      expect(screen.getByText(quizStrings.results.statLabels.bestScore)).toBeInTheDocument();
    });

    it("does not display stats section when playerStats is null", () => {
      renderWithLocale(<ResultScreen {...defaultResultScreenProps} playerStats={null} />);
      expect(screen.queryByText(quizStrings.results.stats)).not.toBeInTheDocument();
    });
  });
};

const runRankingTests = () => {
  describe("ranking", () => {
    it("displays ranking section when ranking is available", () => {
      renderWithLocale(<ResultScreen {...defaultResultScreenProps} />);
      expect(screen.getByText(quizStrings.results.ranking)).toBeInTheDocument();
    });

    it("displays player names in ranking", () => {
      renderWithLocale(<ResultScreen {...defaultResultScreenProps} />);
      expect(screen.getByText("Player1")).toBeInTheDocument();
      expect(screen.getByText("Player3")).toBeInTheDocument();
    });

    it("does not display ranking section when ranking is empty", () => {
      renderWithLocale(<ResultScreen {...defaultResultScreenProps} ranking={[]} />);
      expect(screen.queryByText(quizStrings.results.ranking)).not.toBeInTheDocument();
    });
  });
};

describe("ResultScreen", () => {
  runResultBackToLobbyTests();
  runPlayAgainTests();
  runScoreDisplayTests();
  runPerformanceMessageTests();
  runPlayerStatsTests();
  runRankingTests();
});
