export type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "level1" | "level2" | "level3" | "level4" | "level5";
  points: number;
  category?: string;
};

// The power-ups a player can use against the others, or for themselves: each one once per game,
// and one per question
export type PowerUpId = "freeze" | "steal" | "shield";

export type GameState = {
  status: "idle" | "playing" | "finished";
  currentQuestionIndex: number;
  score: number;
  answers: AnswerRecord[];
  playerName: string;
  // Power-ups already used in this game, and the questions they were used on: a new game gives
  // them back
  usedPowerUps: UsedPowerUp[];
};

export type UsedPowerUp = {
  id: PowerUpId;
  questionId: string;
};

// A player's own streak of correct answers (see src/lib/scoring.ts)
export type PlayerStreak = {
  // Correct answers in a row so far
  count: number;
  // Correct answers in a row that start the multiplier
  threshold: number;
  // Multiplier of a correct answer to the current question
  questionMultiplier: number;
};

export type AnswerRecord = {
  questionId: string;
  selectedAnswer: number | null;
  isCorrect: boolean;
  timeSpent: number;
  pointsEarned: number;
};

export type PlayerHistory = {
  playerName: string;
  totalGames: number;
  totalScore: number;
  bestScore: number;
  averageScore: number;
  questionsAnswered: number;
  questionsCorrect: number;
  lastPlayed: string;
  gameHistory: GameResult[];
};

export type GameResult = {
  date: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  answers: AnswerRecord[];
};
