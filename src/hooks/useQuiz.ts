import { useState, useCallback, useEffect, type Dispatch, type SetStateAction } from "react";

import type { CategoryId } from "@/constants/categories";
import { fetchQuestionsByCategories, fetchQuestionsInAllLocales } from "@/services/questionService";
import type { Locale } from "@/types/i18n";
import { GameState, AnswerRecord, PlayerHistory, GameResult, Question } from "@/types/quiz";

import type { useSocket } from "./useSocket";

const STORAGE_KEY = "quiz-player-history";

type UseQuizOptions = {
  socket?: ReturnType<typeof useSocket>;
  isAdmin?: boolean;
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
  const { socket, isAdmin = false } = options;
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isShowingFeedback, setIsShowingFeedback] = useState(false);

  // Use socket gameState if connected, otherwise use local questions
  const socketQuestions = socket?.gameState?.questions || [];
  const effectiveQuestions = socketQuestions.length > 0 ? socketQuestions : questions;
  const currentQuestion = effectiveQuestions[gameState.currentQuestionIndex];

  const startGame = useStartGameHandler({
    setQuestions,
    setGameState,
    setSelectedAnswer,
    setIsShowingFeedback,
    socket,
    isAdmin,
  });
  const selectAnswer = useSelectAnswerHandler({
    isShowingFeedback,
    selectedAnswer,
    setSelectedAnswer,
  });
  const submitAnswer = useSubmitAnswerHandler({
    currentQuestion,
    selectedAnswer,
    setGameState,
    setIsShowingFeedback,
    socket,
    gameState,
  });
  const nextQuestion = useNextQuestionHandler({
    gameState,
    questionsLength: effectiveQuestions.length,
    setGameState,
    setSelectedAnswer,
    setIsShowingFeedback,
    socket,
    isAdmin,
  });
  const resetGame = useResetGameHandler({
    setGameState,
    setQuestions,
    setSelectedAnswer,
    setIsShowingFeedback,
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
        setIsShowingFeedback(false);
        // Reset socket's isShowingFeedback when question changes
        if (socket.setIsShowingFeedback) {
          socket.setIsShowingFeedback(false);
        }
      }
    }
  }, [socket?.gameState?.currentQuestionIndex, socket?.currentChannel]);

  useEffect(() => {
    const hasQuestions = Boolean(socket?.gameState?.questions?.length);
    if (socket?.isGameStarted && hasQuestions && gameState.status === "idle") {
      setGameState((prev) => ({
        ...prev,
        status: "playing",
      }));
      setSelectedAnswer(null);
      setIsShowingFeedback(false);
    }
  }, [socket?.isGameStarted, socket?.gameState?.questions?.length, gameState.status]);

  // Sync isShowingFeedback from socket (when admin submits answer)
  // When ADMIN submits, GUESTS should also submit their selected answers
  useEffect(() => {
    if (socket?.currentChannel && socket?.isShowingFeedback !== undefined) {
      const wasNotShowingFeedback = !isShowingFeedback;
      const isNowShowingFeedback = socket.isShowingFeedback;

      // Detect transition from not showing feedback -> showing feedback
      if (wasNotShowingFeedback && isNowShowingFeedback) {
        // GUEST auto-submit their answer when ADMIN submits
        if (socket.selfRole === "guest" && selectedAnswer !== null && currentQuestion) {
          console.log(
            `[useQuiz] GUEST auto-submitting answer ${selectedAnswer} for question ${gameState.currentQuestionIndex}`
          );
          // Calculate time spent (we'll use a default since guests don't track time)
          const timeSpent = 30; // Default time for guests
          socket.submitAnswer(gameState.currentQuestionIndex, selectedAnswer, timeSpent);

          // Update local state
          const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
          const pointsEarned = isCorrect ? currentQuestion.points : 0;

          const answerRecord: AnswerRecord = {
            questionId: currentQuestion.id,
            selectedAnswer,
            isCorrect,
            timeSpent,
            pointsEarned,
          };

          setGameState((prev) => ({
            ...prev,
            score: prev.score + pointsEarned,
            answers: [...prev.answers, answerRecord],
          }));
        } else if (socket.selfRole === "guest" && selectedAnswer === null) {
          console.warn(
            `[useQuiz] GUEST has no answer selected when ADMIN submitted for question ${gameState.currentQuestionIndex}`
          );
        }
      }

      setIsShowingFeedback(socket.isShowingFeedback);
    }
  }, [
    socket?.isShowingFeedback,
    socket?.currentChannel,
    socket?.selfRole,
    selectedAnswer,
    currentQuestion,
    isShowingFeedback,
    gameState,
    setGameState,
  ]);

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
    getRanking,
    getPlayerStats,
    totalQuestions: effectiveQuestions.length,
  };
};

const createInitialGameState = (): GameState => ({
  status: "idle",
  currentQuestionIndex: 0,
  score: 0,
  answers: [],
  playerName: "",
});

const useStartGameHandler = ({
  setQuestions,
  setGameState,
  setSelectedAnswer,
  setIsShowingFeedback,
  socket,
  isAdmin,
}: {
  setQuestions: Dispatch<SetStateAction<Question[]>>;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setSelectedAnswer: Dispatch<SetStateAction<number | null>>;
  setIsShowingFeedback: Dispatch<SetStateAction<boolean>>;
  socket?: ReturnType<typeof useSocket>;
  isAdmin: boolean;
}) =>
  useCallback(
    async (playerName: string, categories: CategoryId[] = [], locale: Locale = "pt-BR") => {
      // Get question count from game settings (default 10)
      const questionCount = socket?.gameSettings?.questionCount || 10;

      // If ADMIN and socket connected, fetch questions in ALL locales and load to server
      if (isAdmin && socket?.currentChannel) {
        const questionsByLocale = await fetchQuestionsInAllLocales(categories, questionCount);
        // Set local questions to admin's preferred locale
        setQuestions(questionsByLocale[locale]);
        // Load multilingual questions to socket server for all users
        socket.loadQuestions(questionsByLocale);
      } else if (!socket?.currentChannel) {
        // Standalone mode (no socket) - fetch questions locally in user's locale
        const questions = await fetchQuestionsByCategories(categories, locale, questionCount);
        setQuestions(questions);
      }
      // For GUEST users, questions will come from socket.gameState

      setGameState({
        status: "playing",
        currentQuestionIndex: 0,
        score: 0,
        answers: [],
        playerName,
      });
      setSelectedAnswer(null);
      setIsShowingFeedback(false);
    },
    [setGameState, setIsShowingFeedback, setQuestions, setSelectedAnswer, socket, isAdmin]
  );

const useSelectAnswerHandler = ({
  isShowingFeedback,
  selectedAnswer,
  setSelectedAnswer,
}: {
  isShowingFeedback: boolean;
  selectedAnswer: number | null;
  setSelectedAnswer: Dispatch<SetStateAction<number | null>>;
}) =>
  useCallback(
    (answerIndex: number) => {
      if (isShowingFeedback) return;
      setSelectedAnswer(answerIndex);
    },
    [isShowingFeedback, selectedAnswer, setSelectedAnswer]
  );

const useSubmitAnswerHandler = ({
  currentQuestion,
  selectedAnswer,
  setGameState,
  setIsShowingFeedback,
  socket,
  gameState,
}: {
  currentQuestion: Question | undefined;
  selectedAnswer: number | null;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setIsShowingFeedback: Dispatch<SetStateAction<boolean>>;
  socket?: ReturnType<typeof useSocket>;
  gameState: GameState;
}) =>
  useCallback(
    (elapsedTime: number) => {
      if (!currentQuestion || selectedAnswer === null) return;

      setIsShowingFeedback(true);

      // If socket connected, submit to server for validation
      if (socket?.currentChannel) {
        socket.submitAnswer(gameState.currentQuestionIndex, selectedAnswer, elapsedTime);
        // Server will respond with answer-result event
        // For now, we'll handle local state update (server validates and returns result)
      }

      // Local answer validation (for standalone mode or immediate feedback)
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      const pointsEarned = isCorrect ? currentQuestion.points : 0;

      const answerRecord: AnswerRecord = {
        questionId: currentQuestion.id,
        selectedAnswer,
        isCorrect,
        timeSpent: elapsedTime,
        pointsEarned,
      };

      setGameState((prev) => ({
        ...prev,
        score: prev.score + pointsEarned,
        answers: [...prev.answers, answerRecord],
      }));
    },
    [currentQuestion, selectedAnswer, setGameState, setIsShowingFeedback, socket, gameState]
  );

const useNextQuestionHandler = ({
  gameState,
  questionsLength,
  setGameState,
  setSelectedAnswer,
  setIsShowingFeedback,
  socket,
  isAdmin,
}: {
  gameState: GameState;
  questionsLength: number;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setSelectedAnswer: Dispatch<SetStateAction<number | null>>;
  setIsShowingFeedback: Dispatch<SetStateAction<boolean>>;
  socket?: ReturnType<typeof useSocket>;
  isAdmin: boolean;
}) =>
  useCallback(() => {
    // If ADMIN and socket connected, use socket to advance (server controls)
    if (isAdmin && socket?.currentChannel) {
      socket.nextQuestion();
      // Server will emit events and all clients will advance together
      // Local state update will happen via socket events
    } else {
      // Standalone mode or guest (local state only)
      if (gameState.currentQuestionIndex >= questionsLength - 1) {
        setGameState((prev) => ({ ...prev, status: "finished" }));
        return;
      }

      setGameState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    }

    setSelectedAnswer(null);
    setIsShowingFeedback(false);
  }, [
    gameState.currentQuestionIndex,
    questionsLength,
    setGameState,
    setIsShowingFeedback,
    setSelectedAnswer,
    socket,
    isAdmin,
  ]);

const useResetGameHandler = ({
  setGameState,
  setQuestions,
  setSelectedAnswer,
  setIsShowingFeedback,
}: {
  setGameState: Dispatch<SetStateAction<GameState>>;
  setQuestions: Dispatch<SetStateAction<Question[]>>;
  setSelectedAnswer: Dispatch<SetStateAction<number | null>>;
  setIsShowingFeedback: Dispatch<SetStateAction<boolean>>;
}) =>
  useCallback(() => {
    setGameState(createInitialGameState());
    setQuestions([]);
    setSelectedAnswer(null);
    setIsShowingFeedback(false);
  }, [setGameState, setIsShowingFeedback, setQuestions, setSelectedAnswer]);

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
