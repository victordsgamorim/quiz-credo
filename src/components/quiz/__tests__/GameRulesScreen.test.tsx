import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import type { useSocket } from "@/hooks/useSocket";
import { translations } from "@/locales";

import { GameRulesScreen } from "../GameRulesScreen";

const createMockSocket = (overrides: Partial<ReturnType<typeof useSocket>> = {}) =>
  ({
    selfRole: "admin",
    channelDevices: [],
    isConnected: false,
    categoryTotals: [],
    ...overrides,
  }) as ReturnType<typeof useSocket>;

const renderWithLocale = (component: React.ReactElement) => {
  return render(<LocaleProvider>{component}</LocaleProvider>);
};

const lobbyStrings = translations["pt-BR"].lobby;
const quizStrings = translations["pt-BR"].quiz;

const defaultGameRulesScreenProps = {
  onStart: vi.fn(),
  onBackToLobby: vi.fn(),
  socket: createMockSocket(),
  playerName: "Test Player",
};

const runBackToLobbyTests = () => {
  describe("back to lobby button", () => {
    it("renders back to lobby button for admin", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);
      expect(screen.getByText(lobbyStrings.backToLobby)).toBeInTheDocument();
    });

    it("does not render back to lobby button for guest", () => {
      const guestSocket = createMockSocket({ selfRole: "guest" });
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} socket={guestSocket} />);
      expect(screen.queryByText(lobbyStrings.backToLobby)).not.toBeInTheDocument();
    });

    it("calls onBackToLobby when back button is clicked", async () => {
      const onBackToLobby = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(
        <GameRulesScreen {...defaultGameRulesScreenProps} onBackToLobby={onBackToLobby} />
      );

      await user.click(screen.getByText(lobbyStrings.backToLobby));
      expect(onBackToLobby).toHaveBeenCalledTimes(1);
    });

    it("has correct tooltip", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);
      expect(screen.getByTitle(lobbyStrings.backToLobbyTooltip)).toBeInTheDocument();
    });
  });
};

const runPlayerNameDisplayTests = () => {
  describe("player name display", () => {
    it("displays the player name", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} playerName="John Doe" />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("displays welcome message", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);
      expect(screen.getByText(quizStrings.rulesScreen.welcomeMessage)).toBeInTheDocument();
    });

    it("displays challenge message", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);
      expect(screen.getByText(quizStrings.rulesScreen.challengeMessage)).toBeInTheDocument();
    });
  });
};

const runCategoryDisplayTests = () => {
  describe("category display", () => {
    it("displays selected categories when categories are available", () => {
      const socketWithCategories = createMockSocket({
        categoryTotals: [
          { name: "geography", votes: 5 },
          { name: "mathematics", votes: 4 },
          { name: "history", votes: 3 },
        ],
      });

      renderWithLocale(
        <GameRulesScreen {...defaultGameRulesScreenProps} socket={socketWithCategories} />
      );

      expect(screen.getByText(quizStrings.rulesScreen.selectedCategories)).toBeInTheDocument();
      expect(screen.getByText(lobbyStrings.categoryNames.geography)).toBeInTheDocument();
      expect(screen.getByText(lobbyStrings.categoryNames.mathematics)).toBeInTheDocument();
      expect(screen.getByText(lobbyStrings.categoryNames.history)).toBeInTheDocument();
    });

    it("does not display category section when no categories", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);
      expect(
        screen.queryByText(quizStrings.rulesScreen.selectedCategories)
      ).not.toBeInTheDocument();
    });

    it("displays up to 10 categories", () => {
      const categories = Array.from({ length: 15 }, (_, i) => ({
        name: `category${i}`,
        votes: 15 - i,
      }));

      const socketWithManyCategories = createMockSocket({
        categoryTotals: categories,
      });

      renderWithLocale(
        <GameRulesScreen {...defaultGameRulesScreenProps} socket={socketWithManyCategories} />
      );

      const categoryBadges = screen.getAllByText(/category/);
      expect(categoryBadges.length).toBeLessThanOrEqual(10);
    });
  });
};

const runStartButtonTests = () => {
  describe("start button", () => {
    it("renders start button for admin", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);
      expect(
        screen.getByRole("button", { name: quizStrings.rulesScreen.startButton })
      ).toBeInTheDocument();
    });

    it("does not render start button for guest", () => {
      const guestSocket = createMockSocket({ selfRole: "guest" });
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} socket={guestSocket} />);
      expect(
        screen.queryByRole("button", { name: quizStrings.rulesScreen.startButton })
      ).not.toBeInTheDocument();
    });

    it("calls onStart when start button is clicked", async () => {
      const onStart = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} onStart={onStart} />);

      await user.click(screen.getByRole("button", { name: quizStrings.rulesScreen.startButton }));

      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it("start button is always enabled for admin", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);
      const startButton = screen.getByRole("button", { name: quizStrings.rulesScreen.startButton });
      expect(startButton).not.toBeDisabled();
    });
  });
};

const runContentDisplayTests = () => {
  describe("content display", () => {
    it("renders game title", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);
      expect(screen.getByText("QuizCredo")).toBeInTheDocument();
    });

    it("renders subtitle", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);
      expect(screen.getByText(quizStrings.rulesScreen.subtitle)).toBeInTheDocument();
    });

    it("renders how to play section", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);
      expect(screen.getByText(quizStrings.rulesScreen.howToPlay)).toBeInTheDocument();
    });

    it("renders game stats", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);
      expect(screen.getByText(quizStrings.rulesScreen.stats.questions.value)).toBeInTheDocument();
      expect(screen.getByText(quizStrings.rulesScreen.stats.timer.value)).toBeInTheDocument();
      expect(screen.getByText(quizStrings.rulesScreen.stats.points.value)).toBeInTheDocument();
      expect(screen.getByText(quizStrings.rulesScreen.stats.difficulty.value)).toBeInTheDocument();
    });
  });
};

describe("GameRulesScreen", () => {
  runBackToLobbyTests();
  runPlayerNameDisplayTests();
  runCategoryDisplayTests();
  runStartButtonTests();
  runContentDisplayTests();
});
