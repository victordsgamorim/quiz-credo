import { useState } from "react";

import { LobbyScreen } from "@/components/lobby/LobbyScreen";
import { AdminAwayDialog } from "@/components/quiz/AdminAwayDialog";
import { GameRulesScreen } from "@/components/quiz/GameRulesScreen";
import { GameScreen } from "@/components/quiz/GameScreen";
import { QuitGameDialog } from "@/components/quiz/QuitGameDialog";
import { ResultsScreen } from "@/components/quiz/ResultsScreen";
import { useLocale } from "@/contexts/LocaleContext";
import { useNarratorVoice } from "@/hooks/useNarrator";
import { useQuiz } from "@/hooks/useQuiz";
import { useSocket } from "@/hooks/useSocket";
import { getStealBalance } from "@/lib/powerUpScore";
import type { PowerUpPlayer } from "@/types/quiz";

import { useRoomScreens } from "./useRoomScreens";

const Index = () => {
  const [playerName, setPlayerName] = useState("");
  const { locale } = useLocale();
  const socket = useSocket(locale);
  const quiz = useQuiz({ socket, isAdmin: socket.selfRole === "admin", playerName });
  const screens = useRoomScreens({ socket, quiz, setPlayerName });
  const { isInLobby } = screens;
  // The admin's screen reads the questions aloud: its voice loads in the lobby, ready for the game
  useNarratorVoice(socket.selfRole === "admin" && Boolean(socket.currentChannel), locale);

  // While the admin is away, the players' game is paused: nothing works but leaving the room, until
  // the admin is back or the room closes. Its results stay up
  const isPlayingInRoom =
    !isInLobby && socket.selfRole !== "admin" && quiz.gameState.status !== "finished";

  return (
    <>
      {renderGameView({
        isInLobby,
        onLobbyReady: screens.enterGame,
        onBackToLobby: screens.backToLobby,
        onRestartGame: screens.backToLobby,
        playerName,
        roomCode: screens.linkRoomCode,
        locale,
        quiz,
        socket,
      })}
      <AdminAwayDialog
        adminAway={isPlayingInRoom ? socket.adminAway : null}
        onLeave={socket.leaveChannel}
      />
      <QuitGameDialog
        isOpen={screens.isAskingToQuit}
        onQuit={screens.quitGame}
        onStay={screens.stayInGame}
      />
    </>
  );
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
      upcomingQuestion={quiz.questions[gameState.currentQuestionIndex + 1]}
      questionNumber={gameState.currentQuestionIndex + 1}
      totalQuestions={totalQuestions}
      score={gameState.score + getStealBalance(socket.powerUpOutcomes, socket.deviceId)}
      selectedAnswer={selectedAnswer}
      isShowingFeedback={isShowingFeedback}
      onSelectAnswer={selectAnswer}
      onSubmitAnswer={submitAnswer}
      onNextQuestion={nextQuestion}
      onBackToLobby={onBackToLobby}
      timerRemaining={timerRemaining}
      isAdmin={isAdmin}
      isDebugMode={socket.gameSettings?.enableDebugMode ?? false}
      isSynced={isSocketMode}
      timerDuration={timerDuration}
      lowTimeThreshold={lowTimeThreshold}
      criticalTimeThreshold={criticalTimeThreshold}
      answeredGuestsCount={socket.gameState?.answeredGuestsCount}
      totalGuests={socket.gameState?.totalGuests}
      selectedGuestsCount={socket.gameState?.selectedGuestsCount}
      streak={quiz.streak}
      powerUpHand={quiz.powerUpHand}
      powerUpSettings={quiz.powerUpSettings}
      usedPowerUps={gameState.usedPowerUps}
      onUsePowerUp={quiz.spendPowerUp}
      powerUpTargets={isSocketMode ? getPowerUpTargets(socket) : undefined}
      powerUpOutcomes={socket.powerUpOutcomes.filter(
        (outcome) => outcome.questionIndex === gameState.currentQuestionIndex
      )}
      selfId={socket.deviceId}
      ranking={socket.liveRanking}
    />
  );
};

// The other players of the room's game, the ones a disadvantage can be used on: the guests, and
// the admin when debug mode lets them answer
const getPowerUpTargets = (socket: RenderGameViewParams["socket"]): PowerUpPlayer[] => {
  const isDebugMode = socket.gameSettings?.enableDebugMode ?? false;
  return socket.channelDevices
    .filter(
      (device) =>
        device.id !== socket.deviceId &&
        (device.role === "guest" || (device.role === "admin" && isDebugMode))
    )
    .map((device) => ({ id: device.id, name: device.displayName || device.id }));
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
      score={gameState.score + getStealBalance(socket.powerUpOutcomes, socket.deviceId)}
      correctAnswers={correctAnswers}
      totalQuestions={totalQuestions}
      ranking={socket.channelRanking}
      socket={socket}
      onBackToLobby={onRestartGame}
    />
  );
};

export default Index;
