import { useCallback, useState } from "react";

import { LobbyScreen } from "@/components/lobby/LobbyScreen";
import { GameScreen } from "@/components/quiz/GameScreen";
import { ResultScreen } from "@/components/quiz/ResultScreen";
import { StartScreen } from "@/components/quiz/StartScreen";
import { useQuiz } from "@/hooks/useQuiz";

const Index = () => {
  const [isInLobby, setIsInLobby] = useState(true);
  const quiz = useQuiz();

  const handleBackToLobby = useCallback(() => {
    quiz.resetGame();
    setIsInLobby(true);
  }, [quiz]);

  return renderGameView({
    isInLobby,
    onLobbyReady: () => setIsInLobby(false),
    onBackToLobby: handleBackToLobby,
    quiz,
  });
};

type RenderGameViewParams = {
  isInLobby: boolean;
  onLobbyReady: () => void;
  onBackToLobby: () => void;
  quiz: ReturnType<typeof useQuiz>;
};

const renderGameView = ({ isInLobby, onLobbyReady, onBackToLobby, quiz }: RenderGameViewParams) => {
  if (isInLobby) {
    return <LobbyScreen onReady={onLobbyReady} />;
  }

  return renderActiveGameView({ quiz, onBackToLobby });
};

const renderActiveGameView = ({
  quiz,
  onBackToLobby,
}: Pick<RenderGameViewParams, "quiz" | "onBackToLobby">) => {
  const { gameState } = quiz;

  switch (gameState.status) {
    case "idle":
      return <StartScreen onStart={quiz.startGame} onBackToLobby={onBackToLobby} />;
    case "playing":
      return renderPlayingGame({ quiz, onBackToLobby });
    case "finished":
      return renderFinishedGame({ quiz, onBackToLobby });
    default:
      return null;
  }
};

const renderPlayingGame = ({
  quiz,
  onBackToLobby,
}: Pick<RenderGameViewParams, "quiz" | "onBackToLobby">) => {
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
    />
  );
};

const renderFinishedGame = ({
  quiz,
  onBackToLobby,
}: Pick<RenderGameViewParams, "quiz" | "onBackToLobby">) => {
  const { gameState, getPlayerStats, getRanking, resetGame } = quiz;

  return (
    <ResultScreen
      gameState={gameState}
      playerStats={getPlayerStats(gameState.playerName)}
      ranking={getRanking()}
      onPlayAgain={resetGame}
      onBackToLobby={onBackToLobby}
    />
  );
};

export default Index;
