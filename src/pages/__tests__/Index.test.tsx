/* eslint-disable max-lines */
import { fireEvent, render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
  type InitialEntry,
} from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BackgroundMusicProvider } from "@/contexts/BackgroundMusicContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import Index from "../Index";

const strings = translations["pt-BR"].quiz.adminAway;
const quitStrings = translations["pt-BR"].quiz.quitGame;

type SocketOptions = { accessToken?: string | null; onSessionExpired?: () => void };

// The room and the game, as the hooks give them to the page
const mocks = vi.hoisted(() => ({
  socket: {} as Record<string, unknown>,
  quiz: {} as Record<string, unknown>,
  lobbyRoomCodes: [] as (string | undefined)[],
  // What the page gives the socket: the admin's session, and what to do when it expires
  socketOptions: undefined as SocketOptions | undefined,
  session: null as { access_token: string } | null,
  tryRefreshSession: vi.fn(),
}));

vi.mock("@/hooks/useSocket", () => ({
  useSocket: (_locale: string, options: typeof mocks.socketOptions) => {
    mocks.socketOptions = options;
    return mocks.socket;
  },
}));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ session: mocks.session }) }));
vi.mock("@/services/authService", () => ({ tryRefreshSession: mocks.tryRefreshSession }));
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
vi.mock("@/components/quiz/GameRulesScreen", () => ({
  GameRulesScreen: ({ onBackToLobby }: { onBackToLobby: () => void }) => (
    <>
      <p>rules</p>
      <button type="button" onClick={onBackToLobby}>
        rules back to lobby
      </button>
    </>
  ),
}));
vi.mock("@/components/quiz/GameScreen", () => ({ GameScreen: () => <p>game</p> }));
vi.mock("@/components/quiz/ResultsScreen", () => ({
  ResultsScreen: ({ onBackToLobby }: { onBackToLobby: () => void }) => (
    <>
      <p>results</p>
      <button type="button" onClick={onBackToLobby}>
        ranking back to lobby
      </button>
    </>
  ),
}));

// The browser around the page: its address, and its back and forward buttons
const Browser = () => {
  const navigate = useNavigate();

  return (
    <>
      <output aria-label="location">{useLocation().pathname}</output>
      <button type="button" onClick={() => navigate(-1)}>
        browser back
      </button>
      <button type="button" onClick={() => navigate(1)}>
        browser forward
      </button>
    </>
  );
};

// The history the page opens on: the room's lobby over the home screen, as after joining from it
let entries: InitialEntry[] = [];

// A new tree every time, so a render picks up the hooks' new state
const page = () => (
  <LocaleProvider>
    <BackgroundMusicProvider>
      <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/join/:roomCode" element={<Index />} />
          <Route path="/join/:roomCode/:screen" element={<Index />} />
        </Routes>
        <Browser />
      </MemoryRouter>
    </BackgroundMusicProvider>
  </LocaleProvider>
);

const renderPage = () => {
  const view = render(page());
  return { rerender: () => view.rerender(page()) };
};

// In the room's game, past the lobby
const renderInGame = () => {
  const view = renderPage();
  fireEvent.click(screen.getByRole("button", { name: "lobby" }));
  return view;
};

const setStatus = (status: "idle" | "playing" | "finished") => {
  mocks.quiz.gameState = { ...(mocks.quiz.gameState as object), status };
};

const showQuestion = (id: string) => {
  mocks.quiz.currentQuestion = { ...(mocks.quiz.currentQuestion as object), id };
};

const getLobby = () => screen.getByRole("button", { name: "lobby" });
// The browser's, not the page's: the page's dialogs don't hide them
const getLocation = () => screen.getByRole("status", { name: "location", hidden: true });
const clickBrowser = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name, hidden: true }));
const goBack = () => clickBrowser("browser back");
const goForward = () => clickBrowser("browser forward");

// eslint-disable-next-line max-lines-per-function
describe("Index", () => {
  beforeEach(() => {
    entries = ["/", { pathname: "/join/ABC123", state: { depth: 1 } }];
    mocks.lobbyRoomCodes = [];
    mocks.socket = {
      currentChannel: "ABC123",
      selfRole: "guest",
      isGameStarted: true,
      isResumingChannel: false,
      channelError: null,
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
      // As the socket does, the device is out of the room at once
      leaveChannel: vi.fn(() => {
        mocks.socket.currentChannel = null;
        mocks.socket.isGameStarted = false;
      }),
      clearDeviceSession: vi.fn(),
      connect: vi.fn(),
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
      questions: [],
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

    it("leaves a guest's back from a question to it, rather than asking over it", () => {
      mocks.socket.adminAway = adminAway();
      renderInGame();

      goBack();

      expect(screen.getAllByRole("alertdialog")).toHaveLength(1);
      expect(screen.getByRole("alertdialog", { name: strings.title })).toBeInTheDocument();
      expect(getLocation()).toHaveTextContent("/join/ABC123/q1");
    });
  });

  describe("out of the room during the game", () => {
    it("goes back to the home screen, away from the room's link", () => {
      const { rerender } = renderInGame();
      expect(screen.getByText("game")).toBeInTheDocument();
      mocks.lobbyRoomCodes = [];
      vi.mocked(mocks.quiz.resetGame as () => void).mockClear();

      // The room closed (or the player left it)
      mocks.socket.currentChannel = null;
      mocks.socket.isGameStarted = false;
      rerender();

      expect(getLobby()).toBeInTheDocument();
      expect(getLocation()).toHaveTextContent(/^\/$/);
      expect(mocks.quiz.resetGame).toHaveBeenCalled();
      // The home screen never sees the room's code, so it doesn't join the room again
      expect(mocks.lobbyRoomCodes).not.toHaveLength(0);
      expect(mocks.lobbyRoomCodes.every((code) => code === undefined)).toBe(true);
    });
  });

  // eslint-disable-next-line max-lines-per-function
  describe("routes", () => {
    it("shows each screen of the game at its own path", () => {
      setStatus("idle");
      const { rerender } = renderInGame();
      expect(getLocation()).toHaveTextContent("/join/ABC123/start");

      setStatus("playing");
      rerender();
      expect(getLocation()).toHaveTextContent("/join/ABC123/q1");

      showQuestion("q2");
      rerender();
      expect(getLocation()).toHaveTextContent("/join/ABC123/q2");

      setStatus("finished");
      rerender();
      expect(getLocation()).toHaveTextContent("/join/ABC123/ranking");
    });

    it("goes into a room's lobby over the home screen", () => {
      entries = ["/"];
      mocks.socket.currentChannel = null;
      mocks.socket.isGameStarted = false;
      const { rerender } = renderPage();
      expect(getLocation()).toHaveTextContent(/^\/$/);

      // In the room: created, or joined by its code
      mocks.socket.currentChannel = "ABC123";
      rerender();
      expect(getLocation()).toHaveTextContent(/^\/join\/ABC123$/);

      goBack();
      expect(getLocation()).toHaveTextContent(/^\/$/);
    });

    it("keeps a room's link while the device joins the room", () => {
      mocks.socket.currentChannel = null;
      mocks.socket.isGameStarted = false;
      const { rerender } = renderPage();

      expect(getLocation()).toHaveTextContent(/^\/join\/ABC123$/);
      expect(mocks.lobbyRoomCodes).toContain("ABC123");

      mocks.socket.currentChannel = "ABC123";
      rerender();
      expect(getLocation()).toHaveTextContent(/^\/join\/ABC123$/);
    });

    it("goes to the home screen when the room of the link is gone", () => {
      mocks.socket.currentChannel = null;
      mocks.socket.isGameStarted = false;
      const { rerender } = renderPage();

      mocks.socket.channelError = { error: "channel_not_found" };
      rerender();

      expect(getLocation()).toHaveTextContent(/^\/$/);
    });

    it("rejoins the game of a reload at the screen it shows, over the same lobby", () => {
      entries = [
        "/",
        { pathname: "/join/ABC123", state: { depth: 1 } },
        { pathname: "/join/ABC123/q1", state: { depth: 2 } },
      ];
      setStatus("finished");
      mocks.socket.currentChannel = null;
      mocks.socket.isResumingChannel = true;
      const { rerender } = renderPage();
      expect(getLocation()).toHaveTextContent("/join/ABC123/q1");

      // Back in the room, whose game is over: the lobby takes the device in
      mocks.socket.currentChannel = "ABC123";
      mocks.socket.isResumingChannel = false;
      rerender();
      expect(getLocation()).toHaveTextContent("/join/ABC123/q1");
      fireEvent.click(getLobby());
      expect(getLocation()).toHaveTextContent("/join/ABC123/ranking");

      goBack();
      expect(getLocation()).toHaveTextContent(/^\/join\/ABC123$/);
    });
  });

  // eslint-disable-next-line max-lines-per-function
  describe("back", () => {
    it("leaves the room for the home screen from the lobby", () => {
      mocks.socket.isGameStarted = false;
      const { rerender } = renderPage();

      goBack();
      rerender();

      expect(getLocation()).toHaveTextContent(/^\/$/);
      expect(mocks.socket.leaveChannel).toHaveBeenCalledTimes(1);
      expect(mocks.socket.clearDeviceSession).toHaveBeenCalledTimes(1);
    });

    it("asks a guest who goes back from a question whether they give up the game", () => {
      renderInGame();

      goBack();

      expect(screen.getByRole("alertdialog", { name: quitStrings.title })).toBeInTheDocument();
      // The question stays on meanwhile, and its URL with it
      expect(screen.getByText("game")).toBeInTheDocument();
      expect(getLocation()).toHaveTextContent("/join/ABC123/q1");
    });

    it("keeps a guest who doesn't give up on the question", () => {
      renderInGame();
      goBack();

      fireEvent.click(screen.getByRole("button", { name: quitStrings.stay }));

      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(screen.getByText("game")).toBeInTheDocument();
      expect(mocks.socket.leaveChannel).not.toHaveBeenCalled();
    });

    it("takes a guest who gives up the game out of the room, to the home screen", () => {
      const { rerender } = renderInGame();
      goBack();

      fireEvent.click(screen.getByRole("button", { name: quitStrings.quit }));
      rerender();

      expect(mocks.socket.leaveChannel).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(getLobby()).toBeInTheDocument();
      expect(getLocation()).toHaveTextContent(/^\/$/);
    });

    it("takes a guest from the ranking to the lobby, and forward back to it", () => {
      setStatus("finished");
      renderInGame();

      goBack();
      expect(getLobby()).toBeInTheDocument();
      expect(getLocation()).toHaveTextContent(/^\/join\/ABC123$/);
      // The lobby doesn't take them back to the game that's over
      fireEvent.click(getLobby());
      expect(screen.queryByText("results")).not.toBeInTheDocument();

      goForward();
      expect(screen.getByText("results")).toBeInTheDocument();
      expect(getLocation()).toHaveTextContent("/join/ABC123/ranking");
    });

    it("takes a guest from the rules to the lobby, until the questions start", () => {
      setStatus("idle");
      const { rerender } = renderInGame();

      goBack();
      expect(getLobby()).toBeInTheDocument();
      expect(getLocation()).toHaveTextContent(/^\/join\/ABC123$/);
      expect(mocks.socket.leaveChannel).not.toHaveBeenCalled();

      setStatus("playing");
      rerender();
      expect(screen.getByText("game")).toBeInTheDocument();
      expect(getLocation()).toHaveTextContent("/join/ABC123/q1");
    });

    it("ends the game for the room when the admin goes back from it", () => {
      mocks.socket.selfRole = "admin";
      const { rerender } = renderInGame();

      goBack();
      expect(mocks.socket.resetGameState).toHaveBeenCalledTimes(1);
      expect(getLobby()).toBeInTheDocument();
      expect(getLocation()).toHaveTextContent(/^\/join\/ABC123$/);
      // Until the server ends the game, the lobby doesn't take the admin back in
      fireEvent.click(getLobby());
      expect(screen.queryByText("game")).not.toBeInTheDocument();

      // The server ends it, and the next game takes the admin in
      mocks.socket.isGameStarted = false;
      rerender();
      mocks.socket.isGameStarted = true;
      rerender();
      fireEvent.click(getLobby());
      expect(screen.getByText("game")).toBeInTheDocument();
      expect(getLocation()).toHaveTextContent("/join/ABC123/q1");
    });

    it("takes a guest from the ranking's button to the lobby, as their back does", () => {
      setStatus("finished");
      renderInGame();
      vi.mocked(mocks.quiz.resetGame as () => void).mockClear();

      fireEvent.click(screen.getByRole("button", { name: "ranking back to lobby" }));

      expect(getLobby()).toBeInTheDocument();
      expect(getLocation()).toHaveTextContent(/^\/join\/ABC123$/);
      expect(mocks.socket.resetGameState).not.toHaveBeenCalled();
      expect(mocks.quiz.resetGame).not.toHaveBeenCalled();
      // The game stays as it is: forward goes back to its ranking
      goForward();
      expect(screen.getByText("results")).toBeInTheDocument();
    });

    it("ends the game for the room from the admin's button on the ranking", () => {
      mocks.socket.selfRole = "admin";
      setStatus("finished");
      const { rerender } = renderInGame();

      fireEvent.click(screen.getByRole("button", { name: "ranking back to lobby" }));

      expect(mocks.socket.resetGameState).toHaveBeenCalledTimes(1);
      expect(getLocation()).toHaveTextContent(/^\/join\/ABC123$/);
      // Nothing piled up: back from the lobby leads home
      goBack();
      rerender();
      expect(getLocation()).toHaveTextContent(/^\/$/);
    });

    it("goes back through the history from the admin's button back to the lobby", () => {
      mocks.socket.selfRole = "admin";
      setStatus("idle");
      const { rerender } = renderInGame();

      fireEvent.click(screen.getByRole("button", { name: "rules back to lobby" }));
      expect(mocks.socket.resetGameState).toHaveBeenCalledTimes(1);
      expect(getLocation()).toHaveTextContent(/^\/join\/ABC123$/);

      // Nothing piled up: back from the lobby leads home
      goBack();
      rerender();
      expect(getLocation()).toHaveTextContent(/^\/$/);
      expect(mocks.socket.leaveChannel).toHaveBeenCalledTimes(1);
    });
  });

  describe("admin session", () => {
    beforeEach(() => {
      mocks.session = null;
      mocks.socketOptions = undefined;
      mocks.tryRefreshSession.mockClear();
    });

    it("gives the realtime server the signed-in admin's session", () => {
      mocks.session = { access_token: "access-token" };

      renderPage();

      expect(mocks.socketOptions?.accessToken).toBe("access-token");
    });

    it("gives it no session when nobody is signed in", () => {
      renderPage();

      expect(mocks.socketOptions?.accessToken).toBeUndefined();
    });

    it("renews the session when the realtime server says it expired", () => {
      renderPage();
      expect(mocks.tryRefreshSession).not.toHaveBeenCalled();

      mocks.socketOptions?.onSessionExpired?.();

      expect(mocks.tryRefreshSession).toHaveBeenCalledTimes(1);
    });
  });
});
