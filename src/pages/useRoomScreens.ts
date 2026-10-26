import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { useParams } from "react-router-dom";

import { useLeaveRoom } from "@/hooks/useLeaveRoom";
import type { useQuiz } from "@/hooks/useQuiz";
import { useRoomHistory } from "@/hooks/useRoomHistory";
import type { useSocket } from "@/hooks/useSocket";
import { RANKING_SCREEN, START_SCREEN, type RoomLayer, type RoomRoute } from "@/lib/roomRoutes";

type Socket = ReturnType<typeof useSocket>;
type Quiz = ReturnType<typeof useQuiz>;

// Where the device is in its room, the lobby or the game, and whether it went back to the lobby on
// its own while the room's game goes on (a guest from the rules or the ranking, the admin until the
// server ends the game): the lobby doesn't take it back in then
type ScreenState = { isInLobby: boolean; hasLeftGame: boolean };
type SetScreen = Dispatch<SetStateAction<ScreenState>>;

const IN_LOBBY: ScreenState = { isInLobby: true, hasLeftGame: false };
const IN_GAME: ScreenState = { isInLobby: false, hasLeftGame: false };
const LEFT_GAME: ScreenState = { isInLobby: true, hasLeftGame: true };

type UseRoomScreensOptions = {
  socket: Socket;
  quiz: Quiz;
  // The player's name in the game, from the lobby; none out of the game
  setPlayerName: (name: string) => void;
};

// The game screen the device shows: the rules until the questions start, then each question, then
// the ranking
const getGameScreen = ({ gameState, currentQuestion }: Quiz) => {
  if (gameState.status === "finished") return RANKING_SCREEN;
  if (gameState.status === "playing" && currentQuestion) return currentQuestion.id;
  return START_SCREEN;
};

// The room of the link the page opened on (a room's QR code, a reload in a room): the lobby joins
// it, once. Done with once the device is in a room, or once the room turns out to be gone
const useLinkRoomCode = (socket: Socket) => {
  const { roomCode } = useParams();
  const [linkRoomCode, setLinkRoomCode] = useState(roomCode);

  useEffect(() => {
    if (socket.currentChannel || socket.channelError) setLinkRoomCode(undefined);
  }, [socket.currentChannel, socket.channelError]);

  return linkRoomCode;
};

type GameSyncOptions = Pick<UseRoomScreensOptions, "socket" | "quiz"> & {
  screen: ScreenState;
  setScreen: SetScreen;
  showLobby: (screen: ScreenState) => void;
};

// The device's screen follows the room's game: a guest back in the lobby from the rules goes back
// in when the questions start. The game's end (the admin went back to the lobby, and the server's
// reset brings every player there) shows the lobby, and so does the room's (it closed, or the
// player left it or gave up the game), for the home screen
const useGameSync = ({ socket, quiz, screen, setScreen, showLobby }: GameSyncOptions) => {
  const previousGameStartedRef = useRef<boolean | null>(null);
  const previousChannelRef = useRef(socket.currentChannel);
  const isAdmin = socket.selfRole === "admin";
  const { status } = quiz.gameState;

  useEffect(() => {
    if (screen.hasLeftGame && !isAdmin && status === "playing") setScreen(IN_GAME);
  }, [screen.hasLeftGame, isAdmin, status, setScreen]);

  useEffect(() => {
    const wasGameStarted = previousGameStartedRef.current;
    previousGameStartedRef.current = socket.isGameStarted;
    if (!socket.isGameStarted) {
      setScreen((current) => (current.hasLeftGame ? { ...current, hasLeftGame: false } : current));
    }
    if (wasGameStarted === true && !socket.isGameStarted && socket.currentChannel) {
      showLobby(IN_LOBBY);
    }
  }, [socket.isGameStarted, socket.currentChannel, setScreen, showLobby]);

  useEffect(() => {
    const wasInRoom = previousChannelRef.current !== null;
    previousChannelRef.current = socket.currentChannel;
    if (wasInRoom && !socket.currentChannel) showLobby(IN_LOBBY);
  }, [socket.currentChannel, showLobby]);
};

type ScreenHistoryOptions = Pick<UseRoomScreensOptions, "socket" | "quiz"> & {
  screen: ScreenState;
  setScreen: SetScreen;
  linkRoomCode?: string;
  // The way back to the lobby, and a guest's question whether they give up the game
  backToLobby: () => void;
  askToQuit: () => void;
};

// The URL of the device's screen, and what the user's own back and forward do (useRoomHistory)
const useScreenHistory = (options: ScreenHistoryOptions) => {
  const { socket, quiz, screen, setScreen, linkRoomCode, backToLobby, askToQuit } = options;
  const leaveRoom = useLeaveRoom(socket);
  const isAdmin = socket.selfRole === "admin";
  const { status } = quiz.gameState;
  const gameScreen = getGameScreen(quiz);
  const route = useMemo((): RoomRoute => {
    const roomCode = socket.currentChannel;
    if (!roomCode) return { layer: "home" };
    if (screen.isInLobby) return { layer: "lobby", roomCode };
    return { layer: "game", roomCode, screen: gameScreen };
  }, [socket.currentChannel, screen.isInLobby, gameScreen]);

  // Back from a game screen, as the screens' own way back to the lobby. A guest's from a question
  // asks first whether they give up the game (the question stays on meanwhile)
  const backFromGame = useCallback(() => {
    if (!isAdmin && status === "playing") {
      askToQuit();
      return false;
    }
    backToLobby();
    return true;
  }, [isAdmin, status, backToLobby, askToQuit]);

  const handleUserNavigation = useCallback(
    (layer: RoomLayer) => {
      if (route.layer === "game") return backFromGame();
      // The home screen's forward, into a room the device left
      if (route.layer === "home") return false;
      if (layer === "home") {
        leaveRoom();
        return true;
      }
      // Forward, back into a game going on that a guest went back from
      if (isAdmin || !socket.isGameStarted) return false;
      setScreen(IN_GAME);
      return true;
    },
    [route.layer, backFromGame, leaveRoom, isAdmin, socket.isGameStarted, setScreen]
  );

  // On its way into the room of the URL (a reload in a room, a room's link), or into its game
  const isArriving = !socket.currentChannel && (socket.isResumingChannel || Boolean(linkRoomCode));
  const isEnteringGame =
    Boolean(socket.currentChannel) &&
    screen.isInLobby &&
    socket.isGameStarted &&
    !screen.hasLeftGame;
  useRoomHistory({
    route,
    isWaiting: isArriving || isEnteringGame,
    onUserNavigation: handleUserNavigation,
  });
};

/*
 * Which screen of the room the device is on, the lobby or the game, and the URL of each: the
 * lobby takes the device into the room's game when it starts, and the end of the game brings it
 * back. Back from a game screen leads to the lobby, and back from the lobby to the home screen,
 * out of the room (see useScreenHistory).
 */
export const useRoomScreens = ({ socket, quiz, setPlayerName }: UseRoomScreensOptions) => {
  const [screen, setScreen] = useState(IN_LOBBY);
  const [isAskingToQuit, setIsAskingToQuit] = useState(false);
  const linkRoomCode = useLinkRoomCode(socket);
  const isAdmin = socket.selfRole === "admin";
  const isOnQuestion = !screen.isInLobby && !isAdmin && quiz.gameState.status === "playing";
  const { resetGame } = quiz;

  // To the lobby, out of the game: the game and the player's name start over
  const showLobby = useCallback(
    (next: ScreenState) => {
      resetGame();
      setPlayerName("");
      setScreen(next);
    },
    [resetGame, setPlayerName]
  );

  // Back to the lobby from the rules or the ranking: the admin's ends the game for the whole room,
  // once the server says so; a guest's leaves the game as it is (forward, or its questions
  // starting, takes them back in)
  const backToLobby = useCallback(() => {
    if (!isAdmin) return setScreen(LEFT_GAME);
    socket.resetGameState();
    showLobby(LEFT_GAME);
  }, [isAdmin, socket, showLobby]);

  // The lobby's way into the room's game, when it starts or when the device joins it going on. A
  // game left behind while its questions loaded starts over first
  const enterGame = useCallback(
    (name: string) => {
      if (screen.hasLeftGame) return;
      resetGame();
      setPlayerName(name);
      setScreen(IN_GAME);
    },
    [screen.hasLeftGame, resetGame, setPlayerName]
  );

  const askToQuit = useCallback(() => setIsAskingToQuit(true), []);
  useEffect(() => {
    if (!isOnQuestion) setIsAskingToQuit(false);
  }, [isOnQuestion]);

  useGameSync({ socket, quiz, screen, setScreen, showLobby });
  useScreenHistory({ socket, quiz, screen, setScreen, linkRoomCode, backToLobby, askToQuit });

  return {
    isInLobby: screen.isInLobby,
    linkRoomCode,
    enterGame,
    backToLobby,
    // Not over the admin's pause, which has its own way out of the room
    isAskingToQuit: isAskingToQuit && isOnQuestion && !socket.adminAway,
    quitGame: () => {
      setIsAskingToQuit(false);
      socket.leaveChannel();
    },
    stayInGame: () => setIsAskingToQuit(false),
  };
};
