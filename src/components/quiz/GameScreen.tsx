import { useCallback, useEffect, useRef } from "react";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { interpolate, useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";
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
  // Debug mode lets the admin answer like a guest
  isDebugMode?: boolean;
  isSynced: boolean;
  timerDuration: number | null;
  lowTimeThreshold: number;
  criticalTimeThreshold: number;
  answeredGuestsCount?: number;
  totalGuests?: number;
  selectedGuestsCount?: number;
};

/*
 * Main game screen component that displays the current question and handles answers.
 */
export const GameScreen = (props: GameScreenProps) => {
  const {
    onSubmitAnswer,
    timerRemaining,
    isAdmin,
    isDebugMode = false,
    isSynced,
    timerDuration,
    lowTimeThreshold,
    criticalTimeThreshold,
    ...sharedProps
  } = props;
  const canAnswer = !isAdmin || isDebugMode;
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
  // A non-answering admin always sees the "saying" avatar expression (no feedback animations)
  const avatarState = !canAnswer
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
      canAnswer={canAnswer}
      isSynced={isSynced}
      isSelectionLocked={isSelectionLocked}
      avatarSrc={avatarMap[avatarState]}
      avatarAlt={avatarAltMap[avatarState]}
      totalGuests={props.totalGuests}
      selectedGuestsCount={props.selectedGuestsCount}
    />
  );
};

type GameLayoutProps = Omit<
  GameScreenProps,
  | "onSubmitAnswer"
  | "isDebugMode"
  | "timerRemaining"
  | "timerDuration"
  | "lowTimeThreshold"
  | "criticalTimeThreshold"
> & {
  timerState: TimerState;
  isCorrect: boolean;
  onSubmit: () => void;
  canAnswer: boolean;
  isSelectionLocked: boolean;
  avatarSrc: string;
  avatarAlt: string;
  totalGuests?: number;
  selectedGuestsCount?: number;
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
  canAnswer,
  isSynced,
  isSelectionLocked,
  avatarSrc,
  avatarAlt,
  totalGuests,
  selectedGuestsCount,
}: GameLayoutProps) => (
  <div className="min-h-dvh flex flex-col items-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:pt-6">
    <div className="w-full max-w-5xl">
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
        totalGuests={totalGuests}
        selectedGuestsCount={selectedGuestsCount}
      />
    </div>
    <main className="flex-1 flex items-center justify-center w-full max-w-[60rem] py-4 sm:py-8">
      <div className="w-full space-y-4 sm:space-y-8">
        <QuestionSection
          question={question}
          questionsRemaining={totalQuestions - questionNumber}
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
          canAnswer={canAnswer}
        />
      </div>
    </main>
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
  totalGuests,
  selectedGuestsCount,
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
  totalGuests?: number;
  selectedGuestsCount?: number;
}) => {
  const { t } = useLocale();
  const coinSrc = `${import.meta.env.BASE_URL}assets/coin/coin.png`;
  const pointsSrc = `${import.meta.env.BASE_URL}assets/coin/points.png`;
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasPlayedRef = useRef(false);

  // Play audio when all guests have selected
  useEffect(() => {
    if (
      isAdmin &&
      isSynced &&
      !isShowingFeedback &&
      selectedGuestsCount !== undefined &&
      totalGuests !== undefined &&
      totalGuests > 0 &&
      selectedGuestsCount === totalGuests &&
      !hasPlayedRef.current
    ) {
      // All guests have selected - play audio
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        void audioRef.current.play();
        hasPlayedRef.current = true;
      }
    }
  }, [isAdmin, isSynced, isShowingFeedback, selectedGuestsCount, totalGuests]);

  // Reset the flag when question changes or when showing feedback
  useEffect(() => {
    hasPlayedRef.current = false;
  }, [questionNumber, isShowingFeedback]);

  const canShowActions = isAdmin || !isSynced;
  const canShowSelectedCount =
    isAdmin && isSynced && totalGuests !== undefined && totalGuests > 0 && !isShowingFeedback;

  return (
    <header className="space-y-3 sm:space-y-4">
      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}assets/audios/ask.mp3`} />
      <div className="flex items-center gap-3">
        {isAdmin && (
          <Button
            onClick={onBackToLobby}
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 -ml-2 text-muted-foreground hover:text-foreground"
            title={t.lobby.backToLobbyTooltip}
            aria-label={t.lobby.backToLobbyTooltip}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex flex-1 items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground">{t.quiz.gameScreen.scoreLabel}</span>
            <span className="gold-text font-bold text-xl sm:text-2xl font-display tabular-nums">
              {score}
            </span>
            <img src={pointsSrc} alt="" className="h-5 w-5 self-center sm:h-6 sm:w-6" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground">{t.quiz.gameScreen.worthLabel}</span>
            <span className="gold-text font-bold text-lg sm:text-xl font-display tabular-nums">
              {questionPoints}
            </span>
            <img src={coinSrc} alt="" className="h-5 w-5 self-center sm:h-6 sm:w-6" />
          </div>
        </div>
      </div>
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6",
          canShowActions ? "sm:justify-between" : "sm:justify-center"
        )}
      >
        <div className="w-full min-w-0 sm:max-w-md sm:flex-1">
          <Timer {...timerState} />
        </div>
        {canShowActions && (
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            {canShowSelectedCount ? (
              <span className="text-sm text-muted-foreground tabular-nums">
                {interpolate(t.quiz.gameScreen.guestsSelected, {
                  selected: selectedGuestsCount ?? 0,
                  total: totalGuests ?? 0,
                })}
              </span>
            ) : (
              <span />
            )}
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

// Not keyed by question: the card deck stays mounted and animates from one question to the next
const QuestionSection = ({
  question,
  questionsRemaining,
  avatarSrc,
  avatarAlt,
  isAdmin,
}: Pick<GameScreenProps, "question"> & {
  questionsRemaining: number;
  avatarSrc: string;
  avatarAlt: string;
  isAdmin: boolean;
}) => (
  <div className="animate-question-enter">
    <QuestionCard
      question={question}
      questionsRemaining={questionsRemaining}
      avatarSrc={avatarSrc}
      avatarAlt={avatarAlt}
      isAdmin={isAdmin}
    />
  </div>
);

const AnswerOptionsGrid = ({
  question,
  selectedAnswer,
  isShowingFeedback,
  isCorrect,
  onSelectAnswer,
  isSelectionLocked,
  canAnswer,
}: {
  question: Question;
  selectedAnswer: number | null;
  isShowingFeedback: boolean;
  isCorrect: boolean;
  onSelectAnswer: (index: number) => void;
  isSelectionLocked: boolean;
  canAnswer: boolean;
}) => (
  <div className="mx-auto w-full max-w-[52rem]">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
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
            disabled={isSelectionLocked || !canAnswer}
          />
        </div>
      ))}
    </div>
  </div>
);
