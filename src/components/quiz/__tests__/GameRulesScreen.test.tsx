import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { BackgroundMusicProvider } from "@/contexts/BackgroundMusicContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import type { useSocket } from "@/hooks/useSocket";
import { translations } from "@/locales";
import { DEFAULT_GAME_SETTINGS } from "@/types/gameSettings";

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
  return render(
    <LocaleProvider>
      <BackgroundMusicProvider>{component}</BackgroundMusicProvider>
    </LocaleProvider>
  );
};

const lobbyStrings = translations["pt-BR"].lobby;
const quizStrings = translations["pt-BR"].quiz;

const defaultGameRulesScreenProps = {
  onStart: vi.fn(async () => Promise.resolve()),
  onBackToLobby: vi.fn(),
  socket: createMockSocket(),
  playerName: "Test Player",
};

const runBackToLobbyTests = () => {
  describe("back to lobby button", () => {
    it("renders back to lobby button for admin", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);
      expect(screen.getByLabelText(lobbyStrings.backToLobby)).toBeInTheDocument();
    });

    it("does not render back to lobby button for guest", () => {
      const guestSocket = createMockSocket({ selfRole: "guest" });
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} socket={guestSocket} />);
      expect(screen.queryByLabelText(lobbyStrings.backToLobby)).not.toBeInTheDocument();
    });

    it("calls onBackToLobby when back button is clicked", async () => {
      const onBackToLobby = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(
        <GameRulesScreen {...defaultGameRulesScreenProps} onBackToLobby={onBackToLobby} />
      );

      await user.click(screen.getByLabelText(lobbyStrings.backToLobby));
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
      expect(screen.getByAltText("Quiz character")).toBeInTheDocument();
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

    it("explains the streak multiplier with the game's threshold", () => {
      const socket = createMockSocket({
        gameSettings: { ...DEFAULT_GAME_SETTINGS, streakThreshold: 4 },
      });
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} socket={socket} />);

      expect(
        screen.getByText("4 acertos seguidos multiplicam seus pontos até ×3")
      ).toBeInTheDocument();
    });

    it("explains the streak multiplier when a single correct answer starts it", () => {
      const socket = createMockSocket({
        gameSettings: { ...DEFAULT_GAME_SETTINGS, streakThreshold: 1 },
      });
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} socket={socket} />);

      expect(
        screen.getByText("Cada acerto seguido multiplica seus pontos, até ×3")
      ).toBeInTheDocument();
    });

    it("explains the streak multiplier with the default threshold before the settings arrive", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);

      expect(
        screen.getByText("5 acertos seguidos multiplicam seus pontos até ×3")
      ).toBeInTheDocument();
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
