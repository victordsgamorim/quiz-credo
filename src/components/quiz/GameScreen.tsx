import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { Question } from "@/types/quiz";

import { AnswerOption } from "./AnswerOption";
import { ActionPanel } from "./GameScreenActions";
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
  onBackToLobby: () => void;
  timerRemaining: number;
  isAdmin: boolean;
  isSynced: boolean;
};

const TIMER_DURATION = 60; // 1 minute

/*
 * Main game screen component that displays the current question and handles answers.
 */
export const GameScreen = (props: GameScreenProps) => {
  const { onSubmitAnswer, timerRemaining, isAdmin, isSynced, ...sharedProps } = props;
  const { timerState: localTimerState, handleSubmit: handleLocalSubmit } = useGameTimerState({
    isShowingFeedback: props.isShowingFeedback,
    onSubmitAnswer,
    duration: TIMER_DURATION,
    isTimerEnabled: !isSynced,
  });
  const isCorrect = props.selectedAnswer === props.question.correctAnswer;

  const clampedTimerRemaining = Math.max(0, Math.min(TIMER_DURATION, timerRemaining));

  const serverTimerState: TimerState = {
    timeLeft: clampedTimerRemaining,
    progress: (clampedTimerRemaining / TIMER_DURATION) * 100,
    isLowTime: clampedTimerRemaining <= 10,
    isCriticalTime: clampedTimerRemaining <= 5,
  };

  const effectiveTimerState = isSynced ? serverTimerState : localTimerState;

  const handleSubmit = () => {
    if (isSynced) {
      const elapsedTime = Math.max(0, TIMER_DURATION - clampedTimerRemaining);
      onSubmitAnswer(elapsedTime);
    } else {
      handleLocalSubmit();
    }
  };

  return (
    <GameLayout
      {...sharedProps}
      timerState={effectiveTimerState}
      isCorrect={isCorrect}
      onSubmit={handleSubmit}
      isAdmin={isAdmin}
      isSynced={isSynced}
    />
  );
};

type GameLayoutProps = Omit<GameScreenProps, "onSubmitAnswer"> & {
  timerState: TimerState;
  isCorrect: boolean;
  onSubmit: () => void;
};

const GameLayout = ({
  question,
  questionNumber,
  totalQuestions,
  score,
  selectedAnswer,
  isShowingFeedback,
  onSelectAnswer,
  onNextQuestion,
  onBackToLobby,
  timerState,
  onSubmit,
  isCorrect,
  isAdmin,
  isSynced,
}: GameLayoutProps) => (
  <div className="min-h-screen flex flex-col p-4 pb-8">
    <GameHeader
      score={score}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      timerState={timerState}
      onBackToLobby={onBackToLobby}
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
      onSubmit={onSubmit}
      onNextQuestion={onNextQuestion}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      isAdmin={isAdmin}
      isSocketMode={isSynced}
    />
  </div>
);

const GameHeader = ({
  score,
  questionNumber,
  totalQuestions,
  timerState,
  onBackToLobby,
}: {
  score: number;
  questionNumber: number;
  totalQuestions: number;
  timerState: TimerState;
  onBackToLobby: () => void;
}) => {
  const { t } = useLocale();

  return (
    <header className="mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-4">
        <Button
          onClick={onBackToLobby}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title={t.lobby.backToLobbyTooltip}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t.quiz.gameScreen.scoreLabel}</span>
          <span className="gold-text font-bold text-xl font-display">{score}</span>
        </div>
        <ProgressBar current={questionNumber - 1} total={totalQuestions} />
      </div>
      <Timer {...timerState} />
    </header>
  );
};

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
