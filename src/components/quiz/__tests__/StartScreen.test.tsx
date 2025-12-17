import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import type { useSocket } from "@/hooks/useSocket";
import { translations } from "@/locales";

import { StartScreen } from "../StartScreen";

const createMockSocket = (overrides: Partial<ReturnType<typeof useSocket>> = {}) =>
  ({
    selfRole: "admin",
    channelDevices: [],
    isConnected: false,
    ...overrides,
  }) as ReturnType<typeof useSocket>;

const renderWithLocale = (component: React.ReactElement) => {
  return render(<LocaleProvider>{component}</LocaleProvider>);
};

const lobbyStrings = translations["pt-BR"].lobby;
const quizStrings = translations["pt-BR"].quiz;

const defaultStartScreenProps = {
  onStart: vi.fn(),
  onBackToLobby: vi.fn(),
  socket: createMockSocket(),
};

const runStartBackToLobbyTests = () => {
  describe("back to lobby button", () => {
    it("renders back to lobby button for admin", () => {
      renderWithLocale(<StartScreen {...defaultStartScreenProps} />);
      expect(screen.getByText(lobbyStrings.backToLobby)).toBeInTheDocument();
    });

    it("does not render back to lobby button for guest", () => {
      const guestSocket = createMockSocket({ selfRole: "guest" });
      renderWithLocale(<StartScreen {...defaultStartScreenProps} socket={guestSocket} />);
      expect(screen.queryByText(lobbyStrings.backToLobby)).not.toBeInTheDocument();
    });

    it("calls onBackToLobby when back button is clicked", async () => {
      const onBackToLobby = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(<StartScreen {...defaultStartScreenProps} onBackToLobby={onBackToLobby} />);

      await user.click(screen.getByText(lobbyStrings.backToLobby));
      expect(onBackToLobby).toHaveBeenCalledTimes(1);
    });

    it("has correct tooltip", () => {
      renderWithLocale(<StartScreen {...defaultStartScreenProps} />);
      expect(screen.getByTitle(lobbyStrings.backToLobbyTooltip)).toBeInTheDocument();
    });
  });
};

const runPlayerNameInputTests = () => {
  describe("player name input", () => {
    it("renders player name input", () => {
      renderWithLocale(<StartScreen {...defaultStartScreenProps} />);
      expect(screen.getByLabelText(lobbyStrings.yourName)).toBeInTheDocument();
    });

    it("disables start button when name is empty", () => {
      renderWithLocale(<StartScreen {...defaultStartScreenProps} />);
      const startButton = screen.getByRole("button", { name: quizStrings.startScreen.startButton });
      expect(startButton).toBeDisabled();
    });

    it("enables start button when name is provided", async () => {
      const user = userEvent.setup();
      renderWithLocale(<StartScreen {...defaultStartScreenProps} />);

      await user.type(screen.getByLabelText(lobbyStrings.yourName), "Player 1");

      const startButton = screen.getByRole("button", { name: quizStrings.startScreen.startButton });
      expect(startButton).not.toBeDisabled();
    });

    it("calls onStart with player name when start button is clicked", async () => {
      const onStart = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(<StartScreen {...defaultStartScreenProps} onStart={onStart} />);

      await user.type(screen.getByLabelText(lobbyStrings.yourName), "Player 1");
      await user.click(screen.getByRole("button", { name: quizStrings.startScreen.startButton }));

      expect(onStart).toHaveBeenCalledWith("Player 1");
    });

    it("calls onStart when pressing Enter with valid name", async () => {
      const onStart = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(<StartScreen {...defaultStartScreenProps} onStart={onStart} />);

      const input = screen.getByLabelText(lobbyStrings.yourName);
      await user.type(input, "Player 1");
      fireEvent.keyPress(input, { key: "Enter", charCode: 13 });

      expect(onStart).toHaveBeenCalledWith("Player 1");
    });

    it("trims whitespace from player name", async () => {
      const onStart = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(<StartScreen {...defaultStartScreenProps} onStart={onStart} />);

      await user.type(screen.getByLabelText(lobbyStrings.yourName), "  Player 1  ");
      await user.click(screen.getByRole("button", { name: quizStrings.startScreen.startButton }));

      expect(onStart).toHaveBeenCalledWith("Player 1");
    });
  });
};

const runContentDisplayTests = () => {
  describe("content display", () => {
    it("renders game title", () => {
      renderWithLocale(<StartScreen {...defaultStartScreenProps} />);
      expect(screen.getByText("QuizCredo")).toBeInTheDocument();
    });

    it("renders how to play section", () => {
      renderWithLocale(<StartScreen {...defaultStartScreenProps} />);
      expect(screen.getByText(quizStrings.startScreen.howToPlay)).toBeInTheDocument();
    });

    it("renders game stats", () => {
      renderWithLocale(<StartScreen {...defaultStartScreenProps} />);
      expect(screen.getByText(quizStrings.startScreen.stats.questions.value)).toBeInTheDocument();
      expect(screen.getByText(quizStrings.startScreen.stats.timer.value)).toBeInTheDocument();
      expect(screen.getByText(quizStrings.startScreen.stats.points.value)).toBeInTheDocument();
      expect(screen.getByText(quizStrings.startScreen.stats.difficulty.value)).toBeInTheDocument();
    });
  });
};

describe("StartScreen", () => {
  runStartBackToLobbyTests();
  runPlayerNameInputTests();
  runContentDisplayTests();
});
