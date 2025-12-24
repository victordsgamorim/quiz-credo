import { useCallback, useEffect, useRef } from "react";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { Question } from "@/types/quiz";

import { AnswerOption } from "./AnswerOption";
import { ActionPanel } from "./GameScreenActions";
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
  timerDuration: number | null;
  lowTimeThreshold: number;
  criticalTimeThreshold: number;
};

/*
 * Main game screen component that displays the current question and handles answers.
 */
export const GameScreen = (props: GameScreenProps) => {
  const {
    onSubmitAnswer,
    timerRemaining,
    isAdmin,
    isSynced,
    timerDuration,
    lowTimeThreshold,
    criticalTimeThreshold,
    ...sharedProps
  } = props;
  const autoSubmitQuestionRef = useRef<string | null>(null);

  // If timerDuration is null, use unlimited time (disable timer)
  const effectiveDuration = timerDuration ?? 60; // Fallback to 60 for standalone mode
  const isTimerEnabled = timerDuration !== null;

  const { timerState: localTimerState, handleSubmit: handleLocalSubmit } = useGameTimerState({
    isShowingFeedback: props.isShowingFeedback,
    onSubmitAnswer,
    duration: effectiveDuration,
    isTimerEnabled: !isSynced && isTimerEnabled,
  });
  const isCorrect = props.selectedAnswer === props.question.correctAnswer;

  const clampedTimerRemaining = Math.max(0, Math.min(effectiveDuration, timerRemaining));

  const serverTimerState: TimerState = {
    timeLeft: clampedTimerRemaining,
    progress: isTimerEnabled ? (clampedTimerRemaining / effectiveDuration) * 100 : 100,
    isLowTime: clampedTimerRemaining <= lowTimeThreshold,
    isCriticalTime: clampedTimerRemaining <= criticalTimeThreshold,
  };

  // If timer is disabled (unlimited), show full timer with no warnings
  const unlimitedTimerState: TimerState = {
    timeLeft: effectiveDuration,
    progress: 100,
    isLowTime: false,
    isCriticalTime: false,
  };

  const effectiveTimerState = isSynced
    ? isTimerEnabled
      ? serverTimerState
      : unlimitedTimerState
    : localTimerState;

  const handleSubmit = useCallback(() => {
    if (isSynced) {
      const elapsedTime = Math.max(0, effectiveDuration - clampedTimerRemaining);
      onSubmitAnswer(elapsedTime);
    } else {
      handleLocalSubmit();
    }
  }, [clampedTimerRemaining, effectiveDuration, handleLocalSubmit, isSynced, onSubmitAnswer]);

  const isTimeUp = isTimerEnabled && effectiveTimerState.timeLeft <= 0;
  const isSelectionLocked = props.isShowingFeedback || isTimeUp;
  // Admin always sees the "saying" avatar expression (no feedback animations)
  const avatarState = isAdmin
    ? "saying"
    : props.isShowingFeedback
      ? isCorrect
        ? "correct"
        : "wrong"
      : "saying";
  const avatarMap = {
    saying: "/assets/characters/ss-saying.png",
    correct: "/assets/characters/ss-correct.png",
    wrong: "/assets/characters/ss-wrong.png",
  } as const;
  const avatarAltMap = {
    saying: "Quiz host asking",
    correct: "Quiz host celebrating",
    wrong: "Quiz host disappointed",
  } as const;

  useEffect(() => {
    if (!isSynced || !isTimeUp || props.isShowingFeedback) return;
    if (autoSubmitQuestionRef.current === props.question.id) return;

    autoSubmitQuestionRef.current = props.question.id;
    handleSubmit();
  }, [handleSubmit, isSynced, isTimeUp, props.isShowingFeedback, props.question.id]);

  return (
    <GameLayout
      {...sharedProps}
      timerState={effectiveTimerState}
      isCorrect={isCorrect}
      onSubmit={handleSubmit}
      isAdmin={isAdmin}
      isSynced={isSynced}
      isSelectionLocked={isSelectionLocked}
      avatarSrc={avatarMap[avatarState]}
      avatarAlt={avatarAltMap[avatarState]}
    />
  );
};

type GameLayoutProps = Omit<
  GameScreenProps,
  | "onSubmitAnswer"
  | "timerRemaining"
  | "timerDuration"
  | "lowTimeThreshold"
  | "criticalTimeThreshold"
> & {
  timerState: TimerState;
  isCorrect: boolean;
  onSubmit: () => void;
  isSelectionLocked: boolean;
  avatarSrc: string;
  avatarAlt: string;
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
  isSelectionLocked,
  avatarSrc,
  avatarAlt,
}: GameLayoutProps) => (
  <div className="h-dvh flex flex-col items-center justify-center px-4 py-safe">
    <div className="relative w-full max-w-5xl mb-4 sm:mb-6">
      <GameHeader
        score={score}
        questionPoints={question.points}
        onBackToLobby={onBackToLobby}
        isAdmin={isAdmin}
        timerState={timerState}
        isShowingFeedback={isShowingFeedback}
        isCorrect={isCorrect}
        question={question}
        selectedAnswer={selectedAnswer}
        onSubmit={onSubmit}
        onNextQuestion={onNextQuestion}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        isSynced={isSynced}
      />
    </div>
    <div className="flex-1 flex items-center justify-center w-full max-w-[min(100%,60rem)] overflow-y-auto">
      <div className="w-full">
        <div className="space-y-6 sm:space-y-8">
          <QuestionSection
            question={question}
            avatarSrc={avatarSrc}
            avatarAlt={avatarAlt}
            isAdmin={isAdmin}
          />
          <AnswerOptionsGrid
            question={question}
            selectedAnswer={selectedAnswer}
            isShowingFeedback={isShowingFeedback}
            isCorrect={isCorrect}
            onSelectAnswer={onSelectAnswer}
            isSelectionLocked={isSelectionLocked}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </div>
  </div>
);

const GameHeader = ({
  score,
  questionPoints,
  onBackToLobby,
  isAdmin,
  timerState,
  isShowingFeedback,
  isCorrect,
  question,
  selectedAnswer,
  onSubmit,
  onNextQuestion,
  questionNumber,
  totalQuestions,
  isSynced,
}: {
  score: number;
  questionPoints: number;
  onBackToLobby: () => void;
  isAdmin: boolean;
  timerState: TimerState;
  isShowingFeedback: boolean;
  isCorrect: boolean;
  question: Question;
  selectedAnswer: number | null;
  onSubmit: () => void;
  onNextQuestion: () => void;
  questionNumber: number;
  totalQuestions: number;
  isSynced: boolean;
}) => {
  const { t } = useLocale();
  const coinSrc = `${import.meta.env.BASE_URL}assets/coin/coin.png`;
  const pointsSrc = `${import.meta.env.BASE_URL}assets/coin/points.png`;

  return (
    <header className="mb-4 sm:mb-6 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {isAdmin && (
          <Button
            onClick={onBackToLobby}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title={t.lobby.backToLobbyTooltip}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        {!isAdmin && <div className="h-8 w-8" />}
        <div className="flex items-center gap-4 flex-1 justify-between">
          <div className="flex items-center gap-2">
            <span className="gold-text font-bold text-xl font-display">{score}</span>
            <img src={pointsSrc} alt="Coin" className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex items-center gap-2">
            <span className="gold-text font-bold text-base sm:text-lg">{questionPoints}</span>
            <img src={coinSrc} alt="Coin" className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
      </div>
      <div
        className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 ${
          isAdmin || !isSynced ? "sm:justify-between" : "sm:justify-center"
        }`}
      >
        <div className={`w-full ${isAdmin || !isSynced ? "sm:flex-1 sm:max-w-md" : "sm:max-w-lg"}`}>
          <Timer {...timerState} />
        </div>
        {(isAdmin || !isSynced) && (
          <div className="w-full sm:w-auto flex justify-center sm:justify-end">
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
        )}
      </div>
    </header>
  );
};

const QuestionSection = ({
  question,
  avatarSrc,
  avatarAlt,
  isAdmin,
}: Pick<GameScreenProps, "question"> & {
  avatarSrc: string;
  avatarAlt: string;
  isAdmin: boolean;
}) => (
  <div className="mb-6">
    <div key={question.id} className="animate-question-enter">
      <QuestionCard
        question={question}
        avatarSrc={avatarSrc}
        avatarAlt={avatarAlt}
        isAdmin={isAdmin}
      />
    </div>
  </div>
);

const AnswerOptionsGrid = ({
  question,
  selectedAnswer,
  isShowingFeedback,
  isCorrect,
  onSelectAnswer,
  isSelectionLocked,
  isAdmin,
}: {
  question: Question;
  selectedAnswer: number | null;
  isShowingFeedback: boolean;
  isCorrect: boolean;
  onSelectAnswer: (index: number) => void;
  isSelectionLocked: boolean;
  isAdmin: boolean;
}) => (
  <div className="mx-auto w-full max-w-[min(100%,52rem)]">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
      {question.options.map((option, index) => (
        <div
          key={`${question.id}-${index}`}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <AnswerOption
            option={option}
            index={index}
            isSelected={selectedAnswer === index}
            isCorrect={isCorrect}
            isShowingFeedback={isShowingFeedback}
            correctAnswerIndex={question.correctAnswer}
            onSelect={onSelectAnswer}
            disabled={isSelectionLocked || isAdmin}
          />
        </div>
      ))}
    </div>
  </div>
);
