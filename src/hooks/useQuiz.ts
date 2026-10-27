import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { CategoryId } from "@/constants/categories";
import { dealPowerUps, POWER_UP_IDS } from "@/lib/powerUpHand";
import {
  applyMultiplier,
  countStreak,
  getFrozenQuestions,
  getQuestionMultiplier,
  sinceStreakBreak,
  withoutFrozenMisses,
} from "@/lib/scoring";
import { fetchQuestionsByCategories, fetchQuestionsInAllLocales } from "@/services/questionService";
import { DEFAULT_GAME_SETTINGS, type GameSettings } from "@/types/gameSettings";
import type { Locale } from "@/types/i18n";
import { getEnabledPowerUps, getPowerUpSettings } from "@/types/powerUpSettings";
import {
  GameState,
  AnswerRecord,
  PlayerHistory,
  GameResult,
  PlayerStreak,
  PowerUpId,
  Question,
  UsedPowerUp,
} from "@/types/quiz";

import type { useSocket } from "./useSocket";

const STORAGE_KEY = "quiz-player-history";

// Until the server deals the player's hand
const NO_HAND: PowerUpId[] = [];

type UseQuizOptions = {
  socket?: ReturnType<typeof useSocket>;
  isAdmin?: boolean;
  playerName?: string;
};

/**
 * Hook for managing quiz game state, questions, answers, and player history.
 * Supports both local (standalone) and synchronized (socket-based) gameplay.
 *
 * @param options - Configuration options including socket connection and admin status
 * @returns Quiz state and control functions
 */
// eslint-disable-next-line max-lines-per-function
export const useQuiz = (options: UseQuizOptions = {}) => {
  const { socket, isAdmin = false, playerName } = options;
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  // A standalone game shows the answer as soon as the player submits it
  const [isShowingLocalFeedback, setIsShowingLocalFeedback] = useState(false);
  // A room's game shows it when the realtime server does, to every device at once: the admin
  // submitted it, or the time is up. Showing it before the server does would hide it again
  const isShowingFeedback = socket?.currentChannel
    ? Boolean(socket.isShowingFeedback)
    : isShowingLocalFeedback;

  // Use socket gameState if connected, otherwise use local questions
  const socketQuestions = socket?.gameState?.questions || [];
  const effectiveQuestions = socketQuestions.length > 0 ? socketQuestions : questions;
  const currentQuestion = effectiveQuestions[gameState.currentQuestionIndex];
  const streakThreshold =
    socket?.gameSettings?.streakThreshold ?? DEFAULT_GAME_SETTINGS.streakThreshold;
  // The admin's power-up settings in a room's game, the defaults otherwise
  const powerUpSettings = getPowerUpSettings(socket?.gameSettings);
  const { freezeQuestions, bonusPoints } = powerUpSettings;
  // Freeze keeps the streak through wrong answers on the question it's used on and the next ones
  const frozenQuestions = useMemo(
    () =>
      getFrozenQuestions(
        gameState.usedPowerUps
          .filter((used) => used.id === "freeze")
          .map((used) => used.questionId),
        effectiveQuestions.map((question) => question.id),
        freezeQuestions
      ),
    [gameState.usedPowerUps, effectiveQuestions, freezeQuestions]
  );
  // Break, used on the player by another one and not blocked by their shield, resets the streak
  const breakQuestionIds = useMemo(
    () =>
      (socket?.powerUpOutcomes ?? [])
        .filter(
          (outcome) =>
            outcome.powerUpId === "break" &&
            outcome.target.id === socket?.deviceId &&
            !outcome.isBlocked
        )
        .flatMap((outcome): string[] => {
          const question = effectiveQuestions[outcome.questionIndex];
          return question ? [question.id] : [];
        }),
    [socket?.powerUpOutcomes, socket?.deviceId, effectiveQuestions]
  );
  // The answers the streak counts: since the last Break, without the misses Freeze kept
  const toStreakAnswers = useCallback(
    (answers: AnswerRecord[]) =>
      withoutFrozenMisses(
        sinceStreakBreak(
          answers,
          breakQuestionIds,
          effectiveQuestions.map((question) => question.id)
        ),
        frozenQuestions
      ),
    [breakQuestionIds, effectiveQuestions, frozenQuestions]
  );
  // A room's game plays the hand the server dealt the player; a standalone one, its own
  const powerUpHand = useMemo(
    () => (socket?.currentChannel ? (socket.powerUpHand ?? NO_HAND) : gameState.powerUpHand),
    [socket?.currentChannel, socket?.powerUpHand, gameState.powerUpHand]
  );

  const startGame = useStartGameHandler({
    setQuestions,
    setGameState,
    setSelectedAnswer,
    setIsShowingLocalFeedback,
    socket,
    isAdmin,
  });
  const selectAnswer = useSelectAnswerHandler({
    isShowingFeedback,
    selectedAnswer,
    setSelectedAnswer,
    socket,
    gameState,
  });
  const submitAnswer = useSubmitAnswerHandler({
    currentQuestion,
    selectedAnswer,
    setGameState,
    setIsShowingLocalFeedback,
    socket,
    gameState,
    streakThreshold,
    toStreakAnswers,
  });
  const nextQuestion = useNextQuestionHandler({
    gameState,
    questionsLength: effectiveQuestions.length,
    setGameState,
    setSelectedAnswer,
    setIsShowingLocalFeedback,
    socket,
    isAdmin,
  });
  const resetGame = useResetGameHandler({
    setGameState,
    setQuestions,
    setSelectedAnswer,
    setIsShowingLocalFeedback,
  });

  useEffect(() => {
    if (gameState.status === "finished" && gameState.playerName) {
      persistGameResult(gameState);
    }
  }, [gameState]);

  useEffect(() => {
    if (socket?.gameState?.isShowingResults && gameState.status !== "finished") {
      setGameState((prev) => ({ ...prev, status: "finished" }));
    }
  }, [socket?.gameState?.isShowingResults, gameState.status, setGameState]);

  useEffect(() => {
    if (playerName !== undefined && playerName !== gameState.playerName) {
      setGameState((prev) => ({
        ...prev,
        playerName,
      }));
    }
  }, [playerName, gameState.playerName]);

  // Sync currentQuestionIndex with socket when server advances
  useEffect(() => {
    if (socket?.gameState && socket.currentChannel) {
      const serverIndex = socket.gameState.currentQuestionIndex;
      if (serverIndex !== gameState.currentQuestionIndex) {
        setGameState((prev) => ({
          ...prev,
          currentQuestionIndex: serverIndex,
        }));
        setSelectedAnswer(null);
        // Reset socket's isShowingFeedback when question changes
        if (socket.setIsShowingFeedback) {
          socket.setIsShowingFeedback(false);
        }
      }
    }
  }, [socket?.gameState?.currentQuestionIndex, socket?.currentChannel]);

  useEffect(() => {
    const hasQuestions = Boolean(socket?.gameState?.questions?.length);
    const hasPlayerName = Boolean(gameState.playerName);
    // Only auto-start if we have a playerName (meaning we went through GameRulesScreen)
    if (socket?.isGameStarted && hasQuestions && gameState.status === "idle" && hasPlayerName) {
      setGameState((prev) => ({
        ...prev,
        status: "playing",
      }));
      setSelectedAnswer(null);
      setIsShowingLocalFeedback(false);
    }
  }, [
    socket?.isGameStarted,
    socket?.gameState?.questions?.length,
    gameState.status,
    gameState.playerName,
  ]);

  // When the room shows the answer (the admin submitted it, or the time is up), the guests' picks
  // go to the server too, even the ones they never confirmed
  const isRoomShowingFeedback = Boolean(socket?.currentChannel && socket.isShowingFeedback);
  const selfRole = socket?.selfRole;
  const submitToRoom = socket?.submitAnswer;
  useEffect(() => {
    if (!isRoomShowingFeedback || selfRole !== "guest" || !currentQuestion || !submitToRoom) return;

    const hasSubmitted = gameState.answers.some(
      (answer) => answer.questionId === currentQuestion.id
    );
    if (hasSubmitted) return;

    // Guests don't track the time they took: a default for all
    const timeSpent = 30;
    submitToRoom(gameState.currentQuestionIndex, selectedAnswer ?? -1, timeSpent);
    setGameState((prev) =>
      recordAnswer(prev, {
        question: currentQuestion,
        selectedAnswer,
        timeSpent,
        streakThreshold,
        toStreakAnswers,
      })
    );
  }, [
    isRoomShowingFeedback,
    selfRole,
    submitToRoom,
    selectedAnswer,
    currentQuestion,
    gameState,
    streakThreshold,
    toStreakAnswers,
  ]);

  // A power-up works once per game, and only one works per question, up to the second-to-last
  // question. A disadvantage goes with the player it's used on; in a room's game the server decides
  // how it turns out
  const powerUpQuestion =
    gameState.currentQuestionIndex < effectiveQuestions.length - 1 ? currentQuestion : undefined;
  const spendPowerUp = useCallback(
    (id: PowerUpId, targetId?: string) => {
      if (!powerUpQuestion || !powerUpHand.includes(id)) return;
      const questionId = powerUpQuestion.id;
      const isSpent = (used: UsedPowerUp) => used.id === id || used.questionId === questionId;
      if (gameState.usedPowerUps.some(isSpent)) return;

      const use: UsedPowerUp = targetId ? { id, questionId, targetId } : { id, questionId };
      // Bonus adds its points at once, whatever the answer
      const bonus = id === "bonus" ? bonusPoints : 0;
      setGameState((prev) =>
        prev.usedPowerUps.some(isSpent)
          ? prev
          : { ...prev, score: prev.score + bonus, usedPowerUps: [...prev.usedPowerUps, use] }
      );
      if (socket?.currentChannel) {
        socket.sendPowerUp(id, targetId);
      }
    },
    [powerUpQuestion, gameState.usedPowerUps, socket, powerUpHand, bonusPoints]
  );

  const streakAnswers = toStreakAnswers(gameState.answers);

  return {
    gameState,
    currentQuestion,
    selectedAnswer,
    isShowingFeedback,
    questions: effectiveQuestions,
    startGame,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    resetGame,
    spendPowerUp,
    powerUpHand,
    powerUpSettings,
    getRanking,
    getPlayerStats,
    totalQuestions: effectiveQuestions.length,
    streak: {
      count: countStreak(streakAnswers),
      threshold: streakThreshold,
      questionMultiplier: currentQuestion
        ? getQuestionMultiplier(streakAnswers, currentQuestion.id, streakThreshold)
        : 1,
      isFrozen: Boolean(currentQuestion && frozenQuestions.has(currentQuestion.id)),
    } satisfies PlayerStreak,
  };
};

const createInitialGameState = (): GameState => ({
  status: "idle",
  currentQuestionIndex: 0,
  score: 0,
  answers: [],
  playerName: "",
  usedPowerUps: [],
  powerUpHand: [],
});

type AnswerInput = {
  question: Question;
  selectedAnswer: number | null;
  timeSpent: number;
  streakThreshold: number;
  // The answers the player's streak counts (after Break and Freeze)
  toStreakAnswers: (answers: AnswerRecord[]) => AnswerRecord[];
};

/**
 * Adds a player's answer to the game state. A correct answer earns the question's points times
 * the multiplier of the player's streak (the server applies the same rule to the ranking)
 *
 * @param state - Game state before the answer
 * @param input - The answer and the streak threshold of the game
 * @returns Game state with the answer and the updated score
 */
const recordAnswer = (state: GameState, input: AnswerInput): GameState => {
  const { question, selectedAnswer, timeSpent, streakThreshold, toStreakAnswers } = input;
  const isCorrect = selectedAnswer !== null && selectedAnswer === question.correctAnswer;
  const multiplier = getQuestionMultiplier(
    toStreakAnswers(state.answers),
    question.id,
    streakThreshold
  );
  const pointsEarned = isCorrect ? applyMultiplier(question.points, multiplier) : 0;

  const answerRecord: AnswerRecord = {
    questionId: question.id,
    selectedAnswer,
    isCorrect,
    timeSpent,
    pointsEarned,
  };

  return {
    ...state,
    score: state.score + pointsEarned,
    answers: [...state.answers, answerRecord],
  };
};

const useStartGameHandler = ({
  setQuestions,
  setGameState,
  setSelectedAnswer,
  setIsShowingLocalFeedback,
  socket,
  isAdmin,
}: {
  setQuestions: Dispatch<SetStateAction<Question[]>>;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setSelectedAnswer: Dispatch<SetStateAction<number | null>>;
  setIsShowingLocalFeedback: Dispatch<SetStateAction<boolean>>;
  socket?: ReturnType<typeof useSocket>;
  isAdmin: boolean;
}) =>
  useCallback(
    async (
      playerName: string,
      categories: CategoryId[] = [],
      locale: Locale = "pt-BR",
      gameSettings?: GameSettings
    ) => {
      // Use provided settings, fallback to socket settings, or use defaults
      const settings = gameSettings || socket?.gameSettings;
      const questionCount = settings?.questionCount || 10;
      const shouldEnableCache = settings?.enableQuestionCache ?? true;
      const powerUpSettings = getPowerUpSettings(settings);

      // If ADMIN and socket connected, fetch questions in ALL locales and load to server
      if (isAdmin && socket?.currentChannel) {
        const questionsByLocale = await fetchQuestionsInAllLocales(
          categories,
          questionCount,
          shouldEnableCache
        );
        // Set local questions to admin's preferred locale
        setQuestions(questionsByLocale[locale]);
        // Load multilingual questions to socket server for all users
        socket.loadQuestions(questionsByLocale);
      } else if (!socket?.currentChannel) {
        // Standalone mode (no socket) - fetch questions locally in user's locale
        const questions = await fetchQuestionsByCategories(
          categories,
          locale,
          questionCount,
          shouldEnableCache
        );
        setQuestions(questions);
      }
      // For GUEST users, questions will come from socket.gameState

      setGameState({
        status: "playing",
        currentQuestionIndex: 0,
        score: 0,
        answers: [],
        playerName,
        usedPowerUps: [],
        // A standalone game deals its own hand; a room's game gets one from the server
        powerUpHand: dealPowerUps(
          getEnabledPowerUps(powerUpSettings, POWER_UP_IDS),
          powerUpSettings.handSize
        ),
      });
      setSelectedAnswer(null);
      setIsShowingLocalFeedback(false);
    },
    [setGameState, setIsShowingLocalFeedback, setQuestions, setSelectedAnswer, socket, isAdmin]
  );

const useSelectAnswerHandler = ({
  isShowingFeedback,
  selectedAnswer,
  setSelectedAnswer,
  socket,
  gameState,
}: {
  isShowingFeedback: boolean;
  selectedAnswer: number | null;
  setSelectedAnswer: Dispatch<SetStateAction<number | null>>;
  socket: ReturnType<typeof useSocket>;
  gameState: GameState;
}) =>
  useCallback(
    (answerIndex: number) => {
      if (isShowingFeedback) return;
      setSelectedAnswer(answerIndex);

      // Notify server that guest selected an answer (only for guests in socket mode)
      if (socket.currentChannel && socket.selfRole === "guest" && selectedAnswer === null) {
        socket.notifyAnswerSelection(gameState.currentQuestionIndex);
      }
    },
    [isShowingFeedback, selectedAnswer, setSelectedAnswer, socket, gameState]
  );

const useSubmitAnswerHandler = ({
  currentQuestion,
  selectedAnswer,
  setGameState,
  setIsShowingLocalFeedback,
  socket,
  gameState,
  streakThreshold,
  toStreakAnswers,
}: {
  currentQuestion: Question | undefined;
  selectedAnswer: number | null;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setIsShowingLocalFeedback: Dispatch<SetStateAction<boolean>>;
  socket?: ReturnType<typeof useSocket>;
  gameState: GameState;
  streakThreshold: number;
  toStreakAnswers: (answers: AnswerRecord[]) => AnswerRecord[];
}) =>
  useCallback(
    (elapsedTime: number) => {
      if (!currentQuestion) return;

      // If socket connected, submit to server for validation
      if (socket?.currentChannel) {
        const answerIndex = selectedAnswer ?? -1;
        socket.submitAnswer(gameState.currentQuestionIndex, answerIndex, elapsedTime);
        // The room shows the answer when the server answers with answer-result (useSocket)
      } else {
        setIsShowingLocalFeedback(true);
      }

      // Local answer validation (for standalone mode or immediate feedback)
      setGameState((prev) =>
        recordAnswer(prev, {
          question: currentQuestion,
          selectedAnswer,
          timeSpent: elapsedTime,
          streakThreshold,
          toStreakAnswers,
        })
      );
    },
    [
      currentQuestion,
      selectedAnswer,
      setGameState,
      setIsShowingLocalFeedback,
      socket,
      gameState,
      streakThreshold,
      toStreakAnswers,
    ]
  );

const useNextQuestionHandler = ({
  gameState,
  questionsLength,
  setGameState,
  setSelectedAnswer,
  setIsShowingLocalFeedback,
  socket,
  isAdmin,
}: {
  gameState: GameState;
  questionsLength: number;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setSelectedAnswer: Dispatch<SetStateAction<number | null>>;
  setIsShowingLocalFeedback: Dispatch<SetStateAction<boolean>>;
  socket?: ReturnType<typeof useSocket>;
  isAdmin: boolean;
}) =>
  useCallback(() => {
    // If ADMIN and socket connected, use socket to advance (server controls)
    if (isAdmin && socket?.currentChannel) {
      socket.nextQuestion();
      // Server will emit events and all clients will advance together. Local state update will
      // happen via socket events: until the next question comes, this one stays as it is
      return;
    }

    // Standalone mode or guest (local state only)
    if (gameState.currentQuestionIndex >= questionsLength - 1) {
      setGameState((prev) => ({ ...prev, status: "finished" }));
      return;
    }

    setGameState((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
    }));
    setSelectedAnswer(null);
    setIsShowingLocalFeedback(false);
  }, [
    gameState.currentQuestionIndex,
    questionsLength,
    setGameState,
    setIsShowingLocalFeedback,
    setSelectedAnswer,
    socket,
    isAdmin,
  ]);

const useResetGameHandler = ({
  setGameState,
  setQuestions,
  setSelectedAnswer,
  setIsShowingLocalFeedback,
}: {
  setGameState: Dispatch<SetStateAction<GameState>>;
  setQuestions: Dispatch<SetStateAction<Question[]>>;
  setSelectedAnswer: Dispatch<SetStateAction<number | null>>;
  setIsShowingLocalFeedback: Dispatch<SetStateAction<boolean>>;
}) =>
  useCallback(() => {
    setGameState(createInitialGameState());
    setQuestions([]);
    setSelectedAnswer(null);
    setIsShowingLocalFeedback(false);
  }, [setGameState, setIsShowingLocalFeedback, setQuestions, setSelectedAnswer]);

const persistGameResult = (state: GameState) => {
  const history = getPlayerHistory();
  const playerHistory = history[state.playerName] || createEmptyPlayerHistory(state.playerName);

  const gameResult: GameResult = {
    date: new Date().toISOString(),
    score: state.score,
    correctAnswers: state.answers.filter((a) => a.isCorrect).length,
    totalQuestions: state.answers.length,
    answers: state.answers,
  };

  playerHistory.totalGames += 1;
  playerHistory.totalScore += state.score;
  playerHistory.bestScore = Math.max(playerHistory.bestScore, state.score);
  playerHistory.averageScore = playerHistory.totalScore / playerHistory.totalGames;
  playerHistory.questionsAnswered += state.answers.length;
  playerHistory.questionsCorrect += state.answers.filter((a) => a.isCorrect).length;
  playerHistory.lastPlayed = new Date().toISOString();
  playerHistory.gameHistory.push(gameResult);

  history[state.playerName] = playerHistory;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

const createEmptyPlayerHistory = (playerName: string): PlayerHistory => ({
  playerName,
  totalGames: 0,
  totalScore: 0,
  bestScore: 0,
  averageScore: 0,
  questionsAnswered: 0,
  questionsCorrect: 0,
  lastPlayed: "",
  gameHistory: [],
});

const getPlayerHistory = (): Record<string, PlayerHistory> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Record<string, PlayerHistory>) : {};
  } catch {
    return {};
  }
};

const getRanking = (): PlayerHistory[] => {
  const history = getPlayerHistory();
  return Object.values(history).sort((a, b) => b.bestScore - a.bestScore);
};

const getPlayerStats = (playerName: string): PlayerHistory | null => {
  const history = getPlayerHistory();
  return history[playerName] || null;
};
