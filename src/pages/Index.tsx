import { useState } from "react";

import { LobbyScreen } from "@/components/lobby/LobbyScreen";
import { GameScreen } from "@/components/quiz/GameScreen";
import { ResultScreen } from "@/components/quiz/ResultScreen";
import { StartScreen } from "@/components/quiz/StartScreen";
import { useQuiz } from "@/hooks/useQuiz";

const Index = () => {
  const [isInLobby, setIsInLobby] = useState(true);
  const quiz = useQuiz();

  return renderGameView({
    isInLobby,
    onLobbyReady: () => setIsInLobby(false),
    quiz,
  });
};

type RenderGameViewParams = {
  isInLobby: boolean;
  onLobbyReady: () => void;
  quiz: ReturnType<typeof useQuiz>;
};

const renderGameView = ({ isInLobby, onLobbyReady, quiz }: RenderGameViewParams) => {
  const {
    gameState,
    currentQuestion,
    selectedAnswer,
    isShowingFeedback,
    totalQuestions,
    startGame,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    resetGame,
    getRanking,
    getPlayerStats,
  } = quiz;

  if (isInLobby) {
    return <LobbyScreen onReady={onLobbyReady} />;
  }

  switch (gameState.status) {
    case "idle":
      return <StartScreen onStart={startGame} />;
    case "playing":
      if (!currentQuestion) return null;
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
        />
      );
    case "finished":
      return (
        <ResultScreen
          gameState={gameState}
          playerStats={getPlayerStats(gameState.playerName)}
          ranking={getRanking()}
          onPlayAgain={resetGame}
        />
      );
    default:
      return null;
  }
};

export default Index;
