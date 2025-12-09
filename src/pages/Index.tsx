import { useState } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { LobbyScreen } from "@/components/lobby/LobbyScreen";
import { StartScreen } from "@/components/quiz/StartScreen";
import { GameScreen } from "@/components/quiz/GameScreen";
import { ResultScreen } from "@/components/quiz/ResultScreen";

const Index = () => {
  const [isInLobby, setIsInLobby] = useState(true);

  const {
    gameState,
    currentQuestion,
    selectedAnswer,
    showFeedback,
    totalQuestions,
    startGame,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    resetGame,
    getRanking,
    getPlayerStats,
  } = useQuiz();

  const handleLobbyReady = () => {
    setIsInLobby(false);
  };

  if (isInLobby) {
    return <LobbyScreen onReady={handleLobbyReady} />;
  }

  if (gameState.status === "idle") {
    return <StartScreen onStart={startGame} />;
  }

  if (gameState.status === "playing" && currentQuestion) {
    return (
      <GameScreen
        question={currentQuestion}
        questionNumber={gameState.currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        score={gameState.score}
        selectedAnswer={selectedAnswer}
        showFeedback={showFeedback}
        onSelectAnswer={selectAnswer}
        onSubmitAnswer={submitAnswer}
        onNextQuestion={nextQuestion}
      />
    );
  }

  if (gameState.status === "finished") {
    return (
      <ResultScreen
        gameState={gameState}
        playerStats={getPlayerStats(gameState.playerName)}
        ranking={getRanking()}
        onPlayAgain={resetGame}
      />
    );
  }

  return null;
};

export default Index;
