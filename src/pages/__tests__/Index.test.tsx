import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import Index from "../Index";

const strings = translations["pt-BR"].quiz.adminAway;

// The room and the game, as the hooks give them to the page
const mocks = vi.hoisted(() => ({
  socket: {} as Record<string, unknown>,
  quiz: {} as Record<string, unknown>,
  lobbyRoomCodes: [] as (string | undefined)[],
}));

vi.mock("@/hooks/useSocket", () => ({ useSocket: () => mocks.socket }));
vi.mock("@/hooks/useQuiz", () => ({ useQuiz: () => mocks.quiz }));

// The screens themselves have their own tests: here they only say which one shows
vi.mock("@/components/lobby/LobbyScreen", () => ({
  LobbyScreen: ({
    onReady,
    initialRoomCode,
  }: {
    onReady: (name: string) => void;
    initialRoomCode?: string;
  }) => {
    mocks.lobbyRoomCodes.push(initialRoomCode);
    return (
      <button type="button" onClick={() => onReady("Leo")}>
        lobby
      </button>
    );
  },
}));
vi.mock("@/components/quiz/GameRulesScreen", () => ({ GameRulesScreen: () => <p>rules</p> }));
vi.mock("@/components/quiz/GameScreen", () => ({ GameScreen: () => <p>game</p> }));
vi.mock("@/components/quiz/ResultsScreen", () => ({ ResultsScreen: () => <p>results</p> }));

const Location = () => <output aria-label="location">{useLocation().pathname}</output>;

// A new tree every time, so a render picks up the hooks' new state
const page = () => (
  <LocaleProvider>
    <MemoryRouter initialEntries={["/join/ABC123"]}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/join/:roomCode" element={<Index />} />
      </Routes>
      <Location />
    </MemoryRouter>
  </LocaleProvider>
);

// In the room's game, past the lobby
const renderInGame = () => {
  const view = render(page());
  fireEvent.click(screen.getByRole("button", { name: "lobby" }));
  return { rerender: () => view.rerender(page()) };
};

const setStatus = (status: "idle" | "playing" | "finished") => {
  mocks.quiz.gameState = { ...(mocks.quiz.gameState as object), status };
};

// eslint-disable-next-line max-lines-per-function
describe("Index", () => {
  beforeEach(() => {
    mocks.lobbyRoomCodes = [];
    mocks.socket = {
      currentChannel: "ABC123",
      selfRole: "guest",
      isGameStarted: true,
      adminAway: null,
      deviceId: "device-1",
      gameState: { questions: [], currentQuestionIndex: 0, timerRemaining: 60 },
      gameSettings: null,
      categoryTotals: [],
      channelDevices: [],
      powerUpOutcomes: [],
      liveRanking: null,
      channelRanking: [],
      totalQuestions: null,
      leaveChannel: vi.fn(),
      resetGameState: vi.fn(),
    };
    mocks.quiz = {
      gameState: {
        status: "playing",
        currentQuestionIndex: 0,
        score: 0,
        answers: [],
        playerName: "Leo",
        usedPowerUps: [],
        powerUpHand: [],
      },
      currentQuestion: {
        id: "q1",
        question: "Qual planeta é conhecido como o planeta vermelho?",
        options: ["Vênus", "Marte", "Júpiter", "Saturno"],
        correctAnswer: 1,
        difficulty: "1",
        points: 10,
      },
      totalQuestions: 10,
      resetGame: vi.fn(),
    };
  });

  describe("admin away", () => {
    const adminAway = () => ({ closesAt: Date.now() + 30000, timeoutMs: 60000 });

    it("pauses a player's game while the admin is away", () => {
      const { rerender } = renderInGame();
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

      mocks.socket.adminAway = adminAway();
      rerender();

      expect(screen.getByText("game")).toBeInTheDocument();
      expect(screen.getByRole("alertdialog", { name: strings.title })).toBeInTheDocument();
    });

    it("pauses the rules screen too", () => {
      setStatus("idle");
      mocks.socket.adminAway = adminAway();
      renderInGame();

      expect(screen.getByText("rules")).toBeInTheDocument();
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("leaves the results up", () => {
      setStatus("finished");
      mocks.socket.adminAway = adminAway();
      renderInGame();

      expect(screen.getByText("results")).toBeInTheDocument();
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("doesn't pause the admin's own screen", () => {
      mocks.socket.selfRole = "admin";
      mocks.socket.adminAway = adminAway();
      renderInGame();

      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("doesn't show in the lobby", () => {
      mocks.socket.adminAway = adminAway();
      render(page());

      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("leaves the room from the dialog", () => {
      mocks.socket.adminAway = adminAway();
      renderInGame();

      fireEvent.click(screen.getByRole("button", { name: strings.leave }));

      expect(mocks.socket.leaveChannel).toHaveBeenCalledTimes(1);
    });
  });

  describe("out of the room during the game", () => {
    it("goes back to the home screen, away from the room's link", () => {
      const { rerender } = renderInGame();
      expect(screen.getByText("game")).toBeInTheDocument();
      mocks.lobbyRoomCodes = [];

      // The room closed (or the player left it)
      mocks.socket.currentChannel = null;
      mocks.socket.isGameStarted = false;
      rerender();

      expect(screen.getByRole("button", { name: "lobby" })).toBeInTheDocument();
      expect(screen.getByRole("status", { name: "location" })).toHaveTextContent(/^\/$/);
      expect(mocks.quiz.resetGame).toHaveBeenCalled();
      // The home screen never sees the room's code, so it doesn't join the room again
      expect(mocks.lobbyRoomCodes).not.toHaveLength(0);
      expect(mocks.lobbyRoomCodes.every((code) => code === undefined)).toBe(true);
    });
  });
});
