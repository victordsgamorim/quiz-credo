import { useCallback, useState, useEffect, useRef } from "react";

import { LobbyScreen } from "@/components/lobby/LobbyScreen";
import { GameScreen } from "@/components/quiz/GameScreen";
import { ResultScreen } from "@/components/quiz/ResultScreen";
import { StartScreen } from "@/components/quiz/StartScreen";
import { useQuiz } from "@/hooks/useQuiz";
import { useSocket } from "@/hooks/useSocket";

const Index = () => {
  const [isInLobby, setIsInLobby] = useState(true);
  const quiz = useQuiz();
  const socket = useSocket();
  const previousGameStartedRef = useRef<boolean | null>(null);

  const handleBackToLobby = useCallback(() => {
    quiz.resetGame();
    socket.resetGameState();
    setIsInLobby(true);
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

  return renderGameView({
    isInLobby,
    onLobbyReady: () => setIsInLobby(false),
    onBackToLobby: handleBackToLobby,
    quiz,
    socket,
  });
};

type RenderGameViewParams = {
  isInLobby: boolean;
  onLobbyReady: () => void;
  onBackToLobby: () => void;
  quiz: ReturnType<typeof useQuiz>;
  socket: ReturnType<typeof useSocket>;
};

const renderGameView = ({
  isInLobby,
  onLobbyReady,
  onBackToLobby,
  quiz,
  socket,
}: RenderGameViewParams) => {
  if (isInLobby) {
    return <LobbyScreen onReady={onLobbyReady} socket={socket} />;
  }

  return renderActiveGameView({ quiz, onBackToLobby, socket });
};

const renderActiveGameView = ({
  quiz,
  onBackToLobby,
  socket,
}: Pick<RenderGameViewParams, "quiz" | "onBackToLobby" | "socket">) => {
  const { gameState } = quiz;

  switch (gameState.status) {
    case "idle":
      return <StartScreen onStart={quiz.startGame} onBackToLobby={onBackToLobby} socket={socket} />;
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
