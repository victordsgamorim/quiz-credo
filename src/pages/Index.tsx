import { useCallback, useState, useEffect, useRef } from "react";

import { useParams } from "react-router-dom";

import { LobbyScreen } from "@/components/lobby/LobbyScreen";
import { GameRulesScreen } from "@/components/quiz/GameRulesScreen";
import { GameScreen } from "@/components/quiz/GameScreen";
import { ResultsScreen } from "@/components/quiz/ResultsScreen";
import { useLocale } from "@/contexts/LocaleContext";
import { useQuiz } from "@/hooks/useQuiz";
import { useSocket } from "@/hooks/useSocket";

const Index = () => {
  const [isInLobby, setIsInLobby] = useState(true);
  const [playerName, setPlayerName] = useState("");
  const { roomCode } = useParams();
  const { locale } = useLocale();
  const socket = useSocket(locale);
  const quiz = useQuiz({ socket, isAdmin: socket.selfRole === "admin", playerName });
  const previousGameStartedRef = useRef<boolean | null>(null);

  const handleRestartGame = useCallback(() => {
    quiz.resetGame();
    if (socket.selfRole === "admin") {
      socket.resetGameState();
    }
    // Keep users in the channel but return to lobby screen
    setIsInLobby(true);
    setPlayerName("");
  }, [quiz, socket]);

  const handleBackToLobby = useCallback(() => {
    quiz.resetGame();
    if (socket.selfRole === "admin") {
      socket.resetGameState();
    }
    setIsInLobby(true);
    setPlayerName("");
  }, [quiz, socket]);

  // Listen for game reset from server (when admin resets)
  useEffect(() => {
    const wasGameStarted = previousGameStartedRef.current;
    const isGameNowStopped = !socket.isGameStarted;

    // Detect transition from game started (true) to game stopped (false)
    if (wasGameStarted === true && isGameNowStopped && socket.currentChannel) {
      // Game was reset by server, return all to lobby (but stay in channel)
      quiz.resetGame();
      setIsInLobby(true);
      setPlayerName("");
    }

    // Update ref to current state
    previousGameStartedRef.current = socket.isGameStarted;
  }, [socket.isGameStarted, socket.currentChannel, quiz]);

  const handleLobbyReady = useCallback((name: string) => {
    console.log("[Index] handleLobbyReady called with name:", name);
    setPlayerName(name);
    setIsInLobby(false);
  }, []);

  return renderGameView({
    isInLobby,
    onLobbyReady: handleLobbyReady,
    onBackToLobby: handleBackToLobby,
    onRestartGame: handleRestartGame,
    playerName,
    roomCode,
    locale,
    quiz,
    socket,
  });
};

type RenderGameViewParams = {
  isInLobby: boolean;
  onLobbyReady: (playerName: string) => void;
  onBackToLobby: () => void;
  onRestartGame: () => void;
  playerName: string;
  roomCode?: string;
  locale: import("@/types/i18n").Locale;
  quiz: ReturnType<typeof useQuiz>;
  socket: ReturnType<typeof useSocket>;
};

const renderGameView = ({
  isInLobby,
  onLobbyReady,
  onBackToLobby,
  onRestartGame,
  playerName,
  roomCode,
  locale,
  quiz,
  socket,
}: RenderGameViewParams) => {
  if (isInLobby) {
    return <LobbyScreen onReady={onLobbyReady} socket={socket} initialRoomCode={roomCode} />;
  }

  return renderActiveGameView({ quiz, onBackToLobby, onRestartGame, playerName, locale, socket });
};

const renderActiveGameView = ({
  quiz,
  onBackToLobby,
  onRestartGame,
  playerName,
  locale,
  socket,
}: Pick<
  RenderGameViewParams,
  "quiz" | "onBackToLobby" | "onRestartGame" | "playerName" | "locale" | "socket"
>) => {
  const { gameState } = quiz;

  // Extract category names from categoryTotals (top 10)
  const selectedCategories = socket.categoryTotals
    .slice(0, 10)
    .map((cat) => cat.name as import("@/constants/categories").CategoryId);

  switch (gameState.status) {
    case "idle":
      return (
        <GameRulesScreen
          onStart={async () => {
            await quiz.startGame(
              playerName,
              selectedCategories,
              locale,
              socket.gameSettings ?? undefined
            );
          }}
          onBackToLobby={onBackToLobby}
          playerName={playerName}
          socket={socket}
        />
      );
    case "playing":
      return renderPlayingGame({ quiz, onBackToLobby, socket });
    case "finished":
      return renderFinishedGame({ quiz, onRestartGame, socket });
    default:
      return null;
  }
};

const renderPlayingGame = ({
  quiz,
  onBackToLobby,
  socket,
}: Pick<RenderGameViewParams, "quiz" | "onBackToLobby" | "socket">) => {
  const {
    gameState,
    currentQuestion,
    selectedAnswer,
    isShowingFeedback,
    totalQuestions,
    selectAnswer,
    submitAnswer,
    nextQuestion,
  } = quiz;

  if (!currentQuestion) {
    return null;
  }

  const isSocketMode = Boolean(socket.currentChannel && socket.gameState);
  const timerRemaining = socket.gameState?.timerRemaining ?? 60;
  const isAdmin = socket.selfRole === "admin";

  // Get timer settings from gameSettings (with fallbacks for standalone mode)
  const timerDuration = socket.gameSettings?.timerDuration ?? 60;
  const lowTimeThreshold = socket.gameSettings?.lowTimeThreshold ?? 10;
  const criticalTimeThreshold = socket.gameSettings?.criticalTimeThreshold ?? 5;

  return (
    <GameScreen
      question={currentQuestion}
      questionNumber={gameState.currentQuestionIndex + 1}
      totalQuestions={totalQuestions}
      score={gameState.score}
      selectedAnswer={selectedAnswer}
      isShowingFeedback={isShowingFeedback}
      onSelectAnswer={selectAnswer}
      onSubmitAnswer={submitAnswer}
      onNextQuestion={nextQuestion}
      onBackToLobby={onBackToLobby}
      timerRemaining={timerRemaining}
      isAdmin={isAdmin}
      isSynced={isSocketMode}
      timerDuration={timerDuration}
      lowTimeThreshold={lowTimeThreshold}
      criticalTimeThreshold={criticalTimeThreshold}
      answeredGuestsCount={socket.gameState?.answeredGuestsCount}
      totalGuests={socket.gameState?.totalGuests}
      selectedGuestsCount={socket.gameState?.selectedGuestsCount}
    />
  );
};

const renderFinishedGame = ({
  quiz,
  onRestartGame,
  socket,
}: Pick<RenderGameViewParams, "quiz" | "onRestartGame" | "socket">) => {
  const { gameState } = quiz;
  const correctAnswers = gameState.answers.filter((answer) => answer.isCorrect).length;
  const totalQuestions = socket.totalQuestions ?? quiz.totalQuestions;

  return (
    <ResultsScreen
      playerName={gameState.playerName}
      score={gameState.score}
      correctAnswers={correctAnswers}
      totalQuestions={totalQuestions}
      ranking={socket.channelRanking}
      socket={socket}
      onBackToLobby={onRestartGame}
    />
  );
};

export default Index;
