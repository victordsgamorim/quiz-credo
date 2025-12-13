import { ArrowRight, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Question } from "@/types/quiz";

import { AnswerOption } from "./AnswerOption";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { Timer } from "./Timer";
import { useGameTimerState, type TimerState } from "./useGameTimerState";

type GameScreenProps = {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  score: number;
  selectedAnswer: number | null;
  isShowingFeedback: boolean;
  onSelectAnswer: (index: number) => void;
  onSubmitAnswer: (elapsedTime: number) => void;
  onNextQuestion: () => void;
};

const TIMER_DURATION = 60; // 1 minute

/*
 * Main game screen component that displays the current question and handles answers.
 */
export const GameScreen = ({
  question,
  questionNumber,
  totalQuestions,
  score,
  selectedAnswer,
  isShowingFeedback,
  onSelectAnswer,
  onSubmitAnswer,
  onNextQuestion,
}: GameScreenProps) => {
  const { timerState, handleSubmit } = useGameTimerState({
    isShowingFeedback,
    onSubmitAnswer,
    duration: TIMER_DURATION,
  });
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="min-h-screen flex flex-col p-4 pb-8">
      <GameHeader
        score={score}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        timerState={timerState}
      />
      <QuestionSection
        question={question}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
      />
      <AnswerOptionsGrid
        question={question}
        selectedAnswer={selectedAnswer}
        isShowingFeedback={isShowingFeedback}
        isCorrect={isCorrect}
        onSelectAnswer={onSelectAnswer}
      />
      <ActionPanel
        isShowingFeedback={isShowingFeedback}
        isCorrect={isCorrect}
        question={question}
        selectedAnswer={selectedAnswer}
        onSubmit={handleSubmit}
        onNextQuestion={onNextQuestion}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
      />
    </div>
  );
};

const GameHeader = ({
  score,
  questionNumber,
  totalQuestions,
  timerState,
}: {
  score: number;
  questionNumber: number;
  totalQuestions: number;
  timerState: TimerState;
}) => (
  <header className="mb-4 sm:mb-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Pontos:</span>
        <span className="gold-text font-bold text-xl font-display">{score}</span>
      </div>
      <ProgressBar current={questionNumber - 1} total={totalQuestions} />
    </div>
    <Timer {...timerState} />
  </header>
);

const QuestionSection = ({
  question,
  questionNumber,
  totalQuestions,
}: Pick<GameScreenProps, "question" | "questionNumber" | "totalQuestions">) => (
  <div className="mb-6">
    <QuestionCard
      question={question}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
    />
  </div>
);

const AnswerOptionsGrid = ({
  question,
  selectedAnswer,
  isShowingFeedback,
  isCorrect,
  onSelectAnswer,
}: {
  question: Question;
  selectedAnswer: number | null;
  isShowingFeedback: boolean;
  isCorrect: boolean;
  onSelectAnswer: (index: number) => void;
}) => (
  <div className="flex-1 grid grid-cols-1 gap-3 sm:gap-4 mb-6">
    {question.options.map((option, index) => (
      <AnswerOption
        key={`${question.id}-${index}`}
        option={option}
        index={index}
        isSelected={selectedAnswer === index}
        isCorrect={isCorrect}
        isShowingFeedback={isShowingFeedback}
        correctAnswerIndex={question.correctAnswer}
        onSelect={onSelectAnswer}
        disabled={isShowingFeedback}
      />
    ))}
  </div>
);

const ActionPanel = ({
  isShowingFeedback,
  isCorrect,
  question,
  selectedAnswer,
  onSubmit,
  onNextQuestion,
  questionNumber,
  totalQuestions,
}: {
  isShowingFeedback: boolean;
  isCorrect: boolean;
  question: Question;
  selectedAnswer: number | null;
  onSubmit: () => void;
  onNextQuestion: () => void;
  questionNumber: number;
  totalQuestions: number;
}) => (
  <div className="mt-auto">
    {isShowingFeedback ? (
      <FeedbackActions
        question={question}
        isCorrect={isCorrect}
        onNextQuestion={onNextQuestion}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
      />
    ) : (
      <SubmitAnswerButton onSubmit={onSubmit} selectedAnswer={selectedAnswer} />
    )}
  </div>
);

const FeedbackBanner = ({ isCorrect, question }: { isCorrect: boolean; question: Question }) => (
  <div
    className={`text-center p-4 rounded-xl animate-scale-in ${
      isCorrect
        ? "bg-success/20 border border-success/50"
        : "bg-destructive/20 border border-destructive/50"
    }`}
  >
    <p
      className={`text-xl font-bold font-display ${isCorrect ? "text-success" : "text-destructive"}`}
    >
      {isCorrect ? "🎉 Correto!" : "❌ Incorreto!"}
    </p>
    {isCorrect ? (
      <p className="text-sm text-muted-foreground mt-1">+{question.points} pontos</p>
    ) : (
      <p className="text-sm text-muted-foreground mt-1">
        Resposta correta: {question.options[question.correctAnswer]}
      </p>
    )}
  </div>
);

const SubmitAnswerButton = ({
  onSubmit,
  selectedAnswer,
}: {
  onSubmit: () => void;
  selectedAnswer: number | null;
}) => (
  <Button
    onClick={onSubmit}
    disabled={selectedAnswer === null}
    className="w-full h-14 text-lg font-display font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gold-glow disabled:opacity-50 disabled:shadow-none"
  >
    <Send className="w-5 h-5 mr-2" />
    Confirmar Resposta
  </Button>
);

const FeedbackActions = ({
  question,
  isCorrect,
  onNextQuestion,
  questionNumber,
  totalQuestions,
}: {
  question: Question;
  isCorrect: boolean;
  onNextQuestion: () => void;
  questionNumber: number;
  totalQuestions: number;
}) => (
  <div className="space-y-4">
    <FeedbackBanner isCorrect={isCorrect} question={question} />
    <Button
      onClick={onNextQuestion}
      className="w-full h-14 text-lg font-display font-semibold bg-accent text-accent-foreground hover:bg-accent/90 blue-glow"
    >
      {questionNumber < totalQuestions ? (
        <>
          Próxima Pergunta
          <ArrowRight className="w-5 h-5 ml-2" />
        </>
      ) : (
        "Ver Resultado"
      )}
    </Button>
  </div>
);
