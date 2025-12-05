import { useState, useCallback, useEffect } from 'react';
import { GameState, AnswerRecord, PlayerHistory, GameResult, Question } from '@/types/quiz';
import { getShuffledQuestions } from '@/data/questions';

const STORAGE_KEY = 'quiz-player-history';

export const useQuiz = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: 'idle',
    currentQuestionIndex: 0,
    score: 0,
    answers: [],
    playerName: '',
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  const currentQuestion = questions[gameState.currentQuestionIndex];

  const startGame = useCallback((playerName: string) => {
    const shuffledQuestions = getShuffledQuestions();
    setQuestions(shuffledQuestions);
    setGameState({
      status: 'playing',
      currentQuestionIndex: 0,
      score: 0,
      answers: [],
      playerName,
    });
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeSpent(0);
  }, []);

  const selectAnswer = useCallback((answerIndex: number) => {
    if (showFeedback || selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
  }, [showFeedback, selectedAnswer]);

  const submitAnswer = useCallback((elapsedTime: number) => {
    if (!currentQuestion) return;

    setTimeSpent(elapsedTime);
    setShowFeedback(true);

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const pointsEarned = isCorrect ? currentQuestion.points : 0;

    const answerRecord: AnswerRecord = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timeSpent: elapsedTime,
      pointsEarned,
    };

    setGameState(prev => ({
      ...prev,
      score: prev.score + pointsEarned,
      answers: [...prev.answers, answerRecord],
    }));
  }, [currentQuestion, selectedAnswer]);

  const nextQuestion = useCallback(() => {
    if (gameState.currentQuestionIndex >= questions.length - 1) {
      setGameState(prev => ({ ...prev, status: 'finished' }));
      return;
    }

    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
    }));
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeSpent(0);
  }, [gameState.currentQuestionIndex, questions.length]);

  const resetGame = useCallback(() => {
    setGameState({
      status: 'idle',
      currentQuestionIndex: 0,
      score: 0,
      answers: [],
      playerName: '',
    });
    setQuestions([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeSpent(0);
  }, []);

  // Save game result to history
  useEffect(() => {
    if (gameState.status === 'finished' && gameState.playerName) {
      saveGameResult(gameState);
    }
  }, [gameState.status]);

  const saveGameResult = (state: GameState) => {
    const history = getPlayerHistory();
    const playerHistory = history[state.playerName] || {
      playerName: state.playerName,
      totalGames: 0,
      totalScore: 0,
      bestScore: 0,
      averageScore: 0,
      questionsAnswered: 0,
      questionsCorrect: 0,
      lastPlayed: '',
      gameHistory: [],
    };

    const gameResult: GameResult = {
      date: new Date().toISOString(),
      score: state.score,
      correctAnswers: state.answers.filter(a => a.isCorrect).length,
      totalQuestions: state.answers.length,
      answers: state.answers,
    };

    playerHistory.totalGames += 1;
    playerHistory.totalScore += state.score;
    playerHistory.bestScore = Math.max(playerHistory.bestScore, state.score);
    playerHistory.averageScore = playerHistory.totalScore / playerHistory.totalGames;
    playerHistory.questionsAnswered += state.answers.length;
    playerHistory.questionsCorrect += state.answers.filter(a => a.isCorrect).length;
    playerHistory.lastPlayed = new Date().toISOString();
    playerHistory.gameHistory.push(gameResult);

    history[state.playerName] = playerHistory;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  };

  const getPlayerHistory = (): Record<string, PlayerHistory> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
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

  return {
    gameState,
    currentQuestion,
    selectedAnswer,
    showFeedback,
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
