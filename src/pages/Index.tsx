import { useCallback, useState, useEffect, useRef } from "react";

import { LobbyScreen } from "@/components/lobby/LobbyScreen";
import { GameRulesScreen } from "@/components/quiz/GameRulesScreen";
import { GameScreen } from "@/components/quiz/GameScreen";
import { ResultScreen } from "@/components/quiz/ResultScreen";
import { useQuiz } from "@/hooks/useQuiz";
import { useSocket } from "@/hooks/useSocket";

const Index = () => {
  const [isInLobby, setIsInLobby] = useState(true);
  const [playerName, setPlayerName] = useState("");
  const quiz = useQuiz();
  const socket = useSocket();
  const previousGameStartedRef = useRef<boolean | null>(null);

  const handleBackToLobby = useCallback(() => {
    quiz.resetGame();
    socket.resetGameState();
    setIsInLobby(true);
    setPlayerName("");
  }, [quiz, socket]);

  // Listen for game reset from server (when admin resets)
  useEffect(() => {
    const wasGameStarted = previousGameStartedRef.current;
    const isGameNowStopped = !socket.isGameStarted;

    // Detect transition from game started (true) to game stopped (false)
    if (wasGameStarted === true && isGameNowStopped && socket.currentChannel) {
      // Game was reset by server, return all to lobby
      quiz.resetGame();
      setIsInLobby(true);
    }

    // Update ref to current state
    previousGameStartedRef.current = socket.isGameStarted;
  }, [socket.isGameStarted, socket.currentChannel, isInLobby, quiz]);

  const handleLobbyReady = useCallback((name: string) => {
    setPlayerName(name);
    setIsInLobby(false);
  }, []);

  return renderGameView({
    isInLobby,
    onLobbyReady: handleLobbyReady,
    onBackToLobby: handleBackToLobby,
    playerName,
    quiz,
    socket,
  });
};

type RenderGameViewParams = {
  isInLobby: boolean;
  onLobbyReady: (playerName: string) => void;
  onBackToLobby: () => void;
  playerName: string;
  quiz: ReturnType<typeof useQuiz>;
  socket: ReturnType<typeof useSocket>;
};

const renderGameView = ({
  isInLobby,
  onLobbyReady,
  onBackToLobby,
  playerName,
  quiz,
  socket,
}: RenderGameViewParams) => {
  if (isInLobby) {
    return <LobbyScreen onReady={onLobbyReady} socket={socket} />;
  }

  return renderActiveGameView({ quiz, onBackToLobby, playerName, socket });
};

const renderActiveGameView = ({
  quiz,
  onBackToLobby,
  playerName,
  socket,
}: Pick<RenderGameViewParams, "quiz" | "onBackToLobby" | "playerName" | "socket">) => {
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
            await quiz.startGame(playerName, selectedCategories);
          }}
          onBackToLobby={onBackToLobby}
          playerName={playerName}
          socket={socket}
        />
      );
    case "playing":
      return renderPlayingGame({ quiz, onBackToLobby, socket });
    case "finished":
      return renderFinishedGame({ quiz, onBackToLobby, socket });
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
      socket={socket}
    />
  );
};

const renderFinishedGame = ({
  quiz,
  onBackToLobby,
  socket,
}: Pick<RenderGameViewParams, "quiz" | "onBackToLobby" | "socket">) => {
  const { gameState, getPlayerStats, getRanking, resetGame } = quiz;

  return (
    <ResultScreen
      gameState={gameState}
      playerStats={getPlayerStats(gameState.playerName)}
      ranking={getRanking()}
      onPlayAgain={resetGame}
      onBackToLobby={onBackToLobby}
      socket={socket}
    />
  );
};

export default Index;
