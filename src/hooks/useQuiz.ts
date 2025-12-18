import { useState, useCallback, useEffect, type Dispatch, type SetStateAction } from "react";

import type { CategoryId } from "@/constants/categories";
import { fetchQuestionsByCategories } from "@/services/questionService";
import type { Locale } from "@/types/i18n";
import { GameState, AnswerRecord, PlayerHistory, GameResult, Question } from "@/types/quiz";

const STORAGE_KEY = "quiz-player-history";

/**
 * Hook for managing quiz game state, questions, answers, and player history.
 *
 * @returns Quiz state and control functions
 */
// eslint-disable-next-line max-lines-per-function
export const useQuiz = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isShowingFeedback, setIsShowingFeedback] = useState(false);
  const currentQuestion = questions[gameState.currentQuestionIndex];

  const startGame = useStartGameHandler({
    setQuestions,
    setGameState,
    setSelectedAnswer,
    setIsShowingFeedback,
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
  });
  const nextQuestion = useNextQuestionHandler({
    gameState,
    questionsLength: questions.length,
    setGameState,
    setSelectedAnswer,
    setIsShowingFeedback,
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

  return {
    gameState,
    currentQuestion,
    selectedAnswer,
    isShowingFeedback,
    questions,
    startGame,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    resetGame,
    getRanking,
    getPlayerStats,
    totalQuestions: questions.length,
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
}: {
  setQuestions: Dispatch<SetStateAction<Question[]>>;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setSelectedAnswer: Dispatch<SetStateAction<number | null>>;
  setIsShowingFeedback: Dispatch<SetStateAction<boolean>>;
}) =>
  useCallback(
    async (playerName: string, categories: CategoryId[] = [], locale: Locale = "pt-BR") => {
      // Fetch questions from Supabase based on categories and player's locale
      const questions = await fetchQuestionsByCategories(categories, locale);
      setQuestions(questions);
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
    [setGameState, setIsShowingFeedback, setQuestions, setSelectedAnswer]
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
      if (isShowingFeedback || selectedAnswer !== null) return;
      setSelectedAnswer(answerIndex);
    },
    [isShowingFeedback, selectedAnswer, setSelectedAnswer]
  );

const useSubmitAnswerHandler = ({
  currentQuestion,
  selectedAnswer,
  setGameState,
  setIsShowingFeedback,
}: {
  currentQuestion: Question | undefined;
  selectedAnswer: number | null;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setIsShowingFeedback: Dispatch<SetStateAction<boolean>>;
}) =>
  useCallback(
    (elapsedTime: number) => {
      if (!currentQuestion) return;

      setIsShowingFeedback(true);

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
    [currentQuestion, selectedAnswer, setGameState, setIsShowingFeedback]
  );

const useNextQuestionHandler = ({
  gameState,
  questionsLength,
  setGameState,
  setSelectedAnswer,
  setIsShowingFeedback,
}: {
  gameState: GameState;
  questionsLength: number;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setSelectedAnswer: Dispatch<SetStateAction<number | null>>;
  setIsShowingFeedback: Dispatch<SetStateAction<boolean>>;
}) =>
  useCallback(() => {
    if (gameState.currentQuestionIndex >= questionsLength - 1) {
      setGameState((prev) => ({ ...prev, status: "finished" }));
      return;
    }

    setGameState((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
    }));
    setSelectedAnswer(null);
    setIsShowingFeedback(false);
  }, [
    gameState.currentQuestionIndex,
    questionsLength,
    setGameState,
    setIsShowingFeedback,
    setSelectedAnswer,
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
