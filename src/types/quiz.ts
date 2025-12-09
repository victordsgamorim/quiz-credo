export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  points: number;
}

export interface GameState {
  status: "idle" | "playing" | "finished";
  currentQuestionIndex: number;
  score: number;
  answers: AnswerRecord[];
  playerName: string;
}

export interface AnswerRecord {
  questionId: number;
  selectedAnswer: number | null;
  isCorrect: boolean;
  timeSpent: number;
  pointsEarned: number;
}

export interface PlayerHistory {
  playerName: string;
  totalGames: number;
  totalScore: number;
  bestScore: number;
  averageScore: number;
  questionsAnswered: number;
  questionsCorrect: number;
  lastPlayed: string;
  gameHistory: GameResult[];
}

export interface GameResult {
  date: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  answers: AnswerRecord[];
}
