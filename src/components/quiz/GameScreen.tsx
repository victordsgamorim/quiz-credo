import { useCallback, useEffect, useRef } from "react";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { interpolate, useLocale } from "@/contexts/LocaleContext";
import { applyMultiplier } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { DEFAULT_GAME_SETTINGS } from "@/types/gameSettings";
import { PlayerStreak, Question } from "@/types/quiz";

import { AnswerOption } from "./AnswerOption";
import { ActionPanel } from "./GameScreenActions";
import { PointsPopup } from "./PointsPopup";
import { QuestionCard } from "./QuestionCard";
import { StreakBar } from "./StreakBar";
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
  // The player's own streak of correct answers
  streak?: PlayerStreak;
};

const NO_STREAK: PlayerStreak = {
  count: 0,
  threshold: DEFAULT_GAME_SETTINGS.streakThreshold,
  questionMultiplier: 1,
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
  streak = NO_STREAK,
}: GameLayoutProps) => (
  <div
    className={cn(
      "min-h-dvh flex flex-col items-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-6 sm:pb-[max(1rem,env(safe-area-inset-bottom))]",
      // Phones: room for the action bar along the bottom of the screen
      canShowActions(isAdmin, isSynced)
        ? "pb-[calc(5.25rem+env(safe-area-inset-bottom))]"
        : "pb-[max(1rem,env(safe-area-inset-bottom))]"
    )}
  >
    <div className="w-full max-w-5xl">
      <GameHeader
        score={score}
        questionPoints={applyMultiplier(question.points, streak.questionMultiplier)}
        streak={canAnswer ? streak : null}
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
    {/* Phones: the answers sit at the bottom of the screen, within thumb reach, and the host and
        the question fill the space above them */}
    <main className="flex w-full max-w-[60rem] flex-1 flex-col gap-4 py-4 sm:justify-center sm:gap-8 sm:py-8">
      <div className="flex flex-1 flex-col justify-center sm:flex-none">
        <QuestionSection
          question={question}
          questionsRemaining={totalQuestions - questionNumber}
          avatarSrc={avatarSrc}
          avatarAlt={avatarAlt}
          isAdmin={isAdmin}
        />
      </div>
      <AnswerOptionsGrid
        question={question}
        selectedAnswer={selectedAnswer}
        isShowingFeedback={isShowingFeedback}
        isCorrect={isCorrect}
        onSelectAnswer={onSelectAnswer}
        isSelectionLocked={isSelectionLocked}
        canAnswer={canAnswer}
        multiplier={streak.questionMultiplier}
      />
    </main>
  </div>
);

// Admins, and players outside a synced game, get the action buttons
const canShowActions = (isAdmin: boolean, isSynced: boolean) => isAdmin || !isSynced;

// Phones: a bar along the bottom of the screen, within thumb reach; wider screens: beside the timer
const ACTION_BAR_CLASS = [
  "fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3",
  "border-t border-primary/10 bg-background/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur",
  "sm:static sm:z-auto sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none",
].join(" ");

const GameHeader = ({
  score,
  questionPoints,
  streak,
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
  // Null when the player doesn't answer (admin outside debug mode)
  streak: PlayerStreak | null;
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

  const hasActions = canShowActions(isAdmin, isSynced);
  const hasSelectedCount = isAdmin && isSynced && totalGuests !== undefined && totalGuests > 0;

  return (
    <header className="flex flex-col gap-3 sm:gap-4">
      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}assets/audios/ask.mp3`} />
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
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
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground">{t.quiz.gameScreen.scoreLabel}</span>
            <span className="gold-text font-bold text-xl sm:text-2xl font-display tabular-nums">
              {score}
            </span>
            <img src={pointsSrc} alt="" className="h-5 w-5 self-center sm:h-6 sm:w-6" />
          </div>
        </div>
        {/* Phones: own row under the score; wider screens: between the score and the worth */}
        {streak !== null && (
          <StreakBar
            streak={streak.count}
            threshold={streak.threshold}
            className="order-last w-full sm:order-none sm:w-auto sm:max-w-sm sm:flex-1"
          />
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-muted-foreground">{t.quiz.gameScreen.worthLabel}</span>
          <span className="gold-text font-bold text-lg sm:text-xl font-display tabular-nums">
            {questionPoints}
          </span>
          <img src={coinSrc} alt="" className="h-5 w-5 self-center sm:h-6 sm:w-6" />
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        {/* The countdown takes all the room the actions leave */}
        <div className="w-full min-w-0 sm:flex-1">
          <Timer {...timerState} />
        </div>
        {hasActions && (
          <div className={ACTION_BAR_CLASS}>
            {hasSelectedCount ? (
              // A fixed width on wider screens, and hidden but kept during feedback, so the
              // countdown beside it never changes size
              <span
                className={cn(
                  "truncate text-sm text-muted-foreground tabular-nums sm:w-40 sm:text-right",
                  isShowingFeedback && "invisible"
                )}
              >
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
  multiplier,
}: {
  question: Question;
  selectedAnswer: number | null;
  isShowingFeedback: boolean;
  isCorrect: boolean;
  onSelectAnswer: (index: number) => void;
  isSelectionLocked: boolean;
  canAnswer: boolean;
  // Streak multiplier of the question's points
  multiplier: number;
}) => {
  // The player's right answer shows the points it earned
  const pointsIndex = canAnswer && isShowingFeedback && isCorrect ? selectedAnswer : null;

  return (
    <div className="mx-auto w-full max-w-[52rem]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
        {question.options.map((option, index) => (
          <div
            key={`${question.id}-${index}`}
            className="relative animate-fade-in"
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
            {pointsIndex === index && (
              <PointsPopup questionPoints={question.points} multiplier={multiplier} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
