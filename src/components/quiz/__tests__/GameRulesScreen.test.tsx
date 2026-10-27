/* eslint-disable max-lines */
import { render, screen, within } from "@testing-library/react";
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
const ruleStrings = quizStrings.rulesScreen.rules;

const defaultGameRulesScreenProps = {
  onStart: vi.fn(async () => Promise.resolve()),
  onBackToLobby: vi.fn(),
  socket: createMockSocket(),
  playerName: "Test Player",
};

// A rule's card in the deck (the deck has every rule twice)
const getRuleCard = (container: HTMLElement, ruleId: string) => {
  const card = container.querySelector<HTMLElement>(`[data-key="${ruleId}-0"]`);
  if (!card) throw new Error(`No card for the ${ruleId} rule`);
  return within(card);
};

const runBackToLobbyTests = () => {
  describe("back to lobby button", () => {
    const backToLobby = { name: quizStrings.rulesScreen.backToLobby };

    it("renders back to lobby button for admin, beside the start button", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);

      const backButton = screen.getByRole("button", backToLobby);
      const startButton = screen.getByRole("button", { name: quizStrings.rulesScreen.startButton });
      expect(backButton.parentElement).toBe(startButton.parentElement);
    });

    it("does not render back to lobby button for guest", () => {
      const guestSocket = createMockSocket({ selfRole: "guest" });
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} socket={guestSocket} />);
      expect(screen.queryByRole("button", backToLobby)).not.toBeInTheDocument();
    });

    it("calls onBackToLobby when back button is clicked", async () => {
      const onBackToLobby = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(
        <GameRulesScreen {...defaultGameRulesScreenProps} onBackToLobby={onBackToLobby} />
      );

      await user.click(screen.getByRole("button", backToLobby));
      expect(onBackToLobby).toHaveBeenCalledTimes(1);
    });

    it("has no back arrow at the top of the screen", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);

      expect(screen.queryByTitle(lobbyStrings.backToLobbyTooltip)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(lobbyStrings.backToLobby)).not.toBeInTheDocument();
      expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    });
  });
};

const runPlayerNameDisplayTests = () => {
  describe("player name display", () => {
    it("floats the names of everyone in the room, once each", () => {
      const socket = createMockSocket({
        selfRole: "guest",
        channelDevices: [
          { id: "h", displayName: "Host", role: "admin" },
          { id: "a", displayName: "John Doe", role: "guest" },
          { id: "b", displayName: "Maria", role: "guest" },
          { id: "c", displayName: "Pedro", role: "guest" },
        ] as ReturnType<typeof useSocket>["channelDevices"],
      });
      renderWithLocale(
        <GameRulesScreen {...defaultGameRulesScreenProps} socket={socket} playerName="John Doe" />
      );
      expect(screen.getAllByText("John Doe")).toHaveLength(1);
      expect(screen.getByText("Maria")).toBeInTheDocument();
      expect(screen.getByText("Pedro")).toBeInTheDocument();
      expect(screen.queryByText("Host")).not.toBeInTheDocument();
    });

    it("leaves the admin out, even when the admin is the player", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} playerName="John Doe" />);
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });


    it("displays the player name", () => {
      renderWithLocale(
        <GameRulesScreen
          {...defaultGameRulesScreenProps}
          socket={createMockSocket({ selfRole: "guest" })}
          playerName="John Doe"
        />
      );
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("leaves the name out when the player has none", () => {
      const { container } = renderWithLocale(
        <GameRulesScreen
          {...defaultGameRulesScreenProps}
          socket={createMockSocket({ selfRole: "guest" })}
          playerName=""
        />
      );
      expect(container.querySelector(".row-game-me")).not.toBeInTheDocument();
    });
  });
};

const runCategoryDisplayTests = () => {
  describe("category display", () => {
    it("displays the room's most voted categories on their card", () => {
      const socketWithCategories = createMockSocket({
        categoryTotals: [
          { name: "geography", votes: 5 },
          { name: "mathematics", votes: 4 },
          { name: "history", votes: 3 },
        ],
      });

      const { container } = renderWithLocale(
        <GameRulesScreen {...defaultGameRulesScreenProps} socket={socketWithCategories} />
      );

      const card = getRuleCard(container, "categories");
      expect(card.getByText(ruleStrings.categories.title)).toBeInTheDocument();
      expect(card.getByText(lobbyStrings.categoryNames.geography)).toBeInTheDocument();
      expect(card.getByText(lobbyStrings.categoryNames.mathematics)).toBeInTheDocument();
      expect(card.getByText(lobbyStrings.categoryNames.history)).toBeInTheDocument();
    });

    it("says the questions come from every category when the room has none", () => {
      const { container } = renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);
      expect(
        getRuleCard(container, "categories").getByText(ruleStrings.categories.all)
      ).toBeInTheDocument();
    });

    it("displays up to 10 categories", () => {
      const categories = Array.from({ length: 15 }, (_, i) => ({
        name: `category${i}`,
        votes: 15 - i,
      }));

      const socketWithManyCategories = createMockSocket({
        categoryTotals: categories,
      });

      const { container } = renderWithLocale(
        <GameRulesScreen {...defaultGameRulesScreenProps} socket={socketWithManyCategories} />
      );

      expect(getRuleCard(container, "categories").getAllByText(/category/)).toHaveLength(10);
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

    it("does not render start button for guest, who waits for the admin instead", () => {
      const guestSocket = createMockSocket({ selfRole: "guest" });
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} socket={guestSocket} />);
      expect(
        screen.queryByRole("button", { name: quizStrings.rulesScreen.startButton })
      ).not.toBeInTheDocument();
      expect(screen.getByText(quizStrings.rulesScreen.waitingForAdmin)).toBeInTheDocument();
    });

    it("starts the room's game and calls onStart when start button is clicked", async () => {
      const onStart = vi.fn();
      const startGame = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(
        <GameRulesScreen
          {...defaultGameRulesScreenProps}
          onStart={onStart}
          socket={createMockSocket({ startGame })}
        />
      );

      await user.click(screen.getByRole("button", { name: quizStrings.rulesScreen.startButton }));

      expect(startGame).toHaveBeenCalledTimes(1);
      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it("start button is always enabled for admin", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);
      const startButton = screen.getByRole("button", { name: quizStrings.rulesScreen.startButton });
      expect(startButton).not.toBeDisabled();
    });

    it("is disabled and busy while the game starts", async () => {
      const user = userEvent.setup();
      renderWithLocale(
        <GameRulesScreen {...defaultGameRulesScreenProps} onStart={() => new Promise(() => {})} />
      );

      const startButton = screen.getByRole("button", { name: quizStrings.rulesScreen.startButton });
      expect(startButton).toHaveAttribute("aria-busy", "false");
      await user.click(startButton);

      expect(startButton).toBeDisabled();
      expect(startButton).toHaveAttribute("aria-busy", "true");
    });
  });
};

const runContentDisplayTests = () => {
  describe("content display", () => {
    it("renders game title", () => {
      renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);
      expect(screen.getByAltText("Quiz character")).toBeInTheDocument();
    });

    it("renders the game rules as a deck of cards, one rule in the center", () => {
      const { container } = renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);

      expect(
        screen.getByRole("heading", { name: quizStrings.rulesScreen.howToPlay })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("region", { name: quizStrings.rulesScreen.howToPlay })
      ).toBeInTheDocument();
      expect(container.querySelector('[data-state="front"]')).toHaveAttribute(
        "data-key",
        "questions-0"
      );
    });

    it("has a card for every rule", () => {
      const { container } = renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);

      [
        ["questions", ruleStrings.questions.title],
        ["timer", ruleStrings.timer.title],
        ["streak", ruleStrings.streak.title],
        ["difficulty", ruleStrings.difficulty.title],
        ["categories", ruleStrings.categories.title],
        ["powerUps", quizStrings.gameScreen.powerUps.label],
      ].forEach(([ruleId, title]) => {
        expect(getRuleCard(container, ruleId).getByText(title)).toBeInTheDocument();
      });
    });
  });
};

const runRuleSettingsTests = () => {
  describe("the room's settings", () => {
    it("shows the room's settings in the rules", () => {
      const socket = createMockSocket({
        gameSettings: {
          ...DEFAULT_GAME_SETTINGS,
          questionCount: 25,
          timerDuration: 90,
          powerUps: { ...DEFAULT_GAME_SETTINGS.powerUps, isEnabled: false },
        },
      });
      const { container } = renderWithLocale(
        <GameRulesScreen {...defaultGameRulesScreenProps} socket={socket} />
      );

      expect(getRuleCard(container, "questions").getByText("25")).toBeInTheDocument();
      expect(getRuleCard(container, "timer").getByText("1:30")).toBeInTheDocument();
      expect(
        getRuleCard(container, "powerUps").getByText(ruleStrings.powerUps.off)
      ).toBeInTheDocument();
    });

    it("shows the default settings before the room's arrive", () => {
      const { container } = renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);

      expect(getRuleCard(container, "questions").getByText("10")).toBeInTheDocument();
      expect(getRuleCard(container, "timer").getByText("1:00")).toBeInTheDocument();
    });

    it("explains the streak multiplier with the game's threshold", () => {
      const socket = createMockSocket({
        gameSettings: { ...DEFAULT_GAME_SETTINGS, streakThreshold: 4 },
      });
      const { container } = renderWithLocale(
        <GameRulesScreen {...defaultGameRulesScreenProps} socket={socket} />
      );

      expect(
        getRuleCard(container, "streak").getByText(
          "4 acertos seguidos multiplicam seus pontos até ×3"
        )
      ).toBeInTheDocument();
    });

    it("explains the streak multiplier with the default threshold before the settings arrive", () => {
      const { container } = renderWithLocale(<GameRulesScreen {...defaultGameRulesScreenProps} />);

      expect(
        getRuleCard(container, "streak").getByText(
          "5 acertos seguidos multiplicam seus pontos até ×3"
        )
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
  runRuleSettingsTests();
});
