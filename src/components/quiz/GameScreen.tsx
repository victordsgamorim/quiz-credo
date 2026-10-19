import { useCallback, useEffect, useRef, useState } from "react";

import { ArrowLeft, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { interpolate, useLocale } from "@/contexts/LocaleContext";
import { applyMultiplier } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { DEFAULT_GAME_SETTINGS } from "@/types/gameSettings";
import {
  PlayerStreak,
  PowerUpId,
  PowerUpOutcome,
  PowerUpPlayer,
  Question,
  UsedPowerUp,
} from "@/types/quiz";

import { AnswerOption } from "./AnswerOption";
import { ActionPanel } from "./GameScreenActions";
import { PointsPopup } from "./PointsPopup";
import { PowerUpBar } from "./PowerUpBar";
import { PowerUpCast } from "./PowerUpCast";
import { getPowerUp } from "./powerUps";
import { PowerUpTargetPicker } from "./PowerUpTargetPicker";
import { QuestionCard } from "./QuestionCard";
import { StreakBar } from "./StreakBar";
import { Timer } from "./Timer";
import { useGameTimerState, type TimerState } from "./useGameTimerState";
import { usePowerUpCast } from "./usePowerUpCast";
import { usePowerUpNotices } from "./usePowerUpNotices";

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
  // The power-ups dealt to the player for this game; all of them when not given
  powerUpHand?: PowerUpId[];
  // Power-ups the player already used in this game, and the questions they were used on
  usedPowerUps?: UsedPowerUp[];
  // A disadvantage goes with the player it's used on, an advantage acts on the player themselves
  onUsePowerUp?: (id: PowerUpId, targetId?: string) => void;
  // The other players of the room's game, the ones a disadvantage can be used on
  powerUpTargets?: PowerUpPlayer[];
  // How the disadvantages between the player and the others turned out on this question
  powerUpOutcomes?: PowerUpOutcome[];
  // The player's own device in the room's game
  selfId?: string | null;
};

const NO_TARGETS: PowerUpPlayer[] = [];
const NO_OUTCOMES: PowerUpOutcome[] = [];

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
    powerUpTargets = NO_TARGETS,
    powerUpOutcomes = NO_OUTCOMES,
    selfId,
    ...sharedProps
  } = props;
  const canAnswer = !isAdmin || isDebugMode;
  // Using a power-up plays its animation over the whole screen
  const powerUpCast = usePowerUpCast(props.onUsePowerUp);
  // A disadvantage first opens the list of the players to use it on
  const [aimedPowerUpId, setAimedPowerUpId] = useState<PowerUpId | null>(null);
  const { use: castPowerUp } = powerUpCast;
  const handleUsePowerUp = useCallback(
    (id: PowerUpId) => {
      if (getPowerUp(id).kind === "attack") {
        setAimedPowerUpId(id);
      } else {
        castPowerUp(id);
      }
    },
    [castPowerUp]
  );
  const handlePickTarget = useCallback(
    (targetId: string) => {
      if (aimedPowerUpId) castPowerUp(aimedPowerUpId, targetId);
      setAimedPowerUpId(null);
    },
    [aimedPowerUpId, castPowerUp]
  );
  usePowerUpNotices(powerUpOutcomes, selfId);
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

  // The list of players closes, without using the disadvantage, once the question is locked or over
  useEffect(() => {
    if (isSelectionLocked) setAimedPowerUpId(null);
  }, [isSelectionLocked]);
  useEffect(() => {
    setAimedPowerUpId(null);
  }, [props.question.id]);

  useEffect(() => {
    if (!isSynced || !isTimeUp || props.isShowingFeedback) return;
    if (autoSubmitQuestionRef.current === props.question.id) return;

    autoSubmitQuestionRef.current = props.question.id;
    handleSubmit();
  }, [handleSubmit, isSynced, isTimeUp, props.isShowingFeedback, props.question.id]);

  return (
    <>
      <GameLayout
        {...sharedProps}
        onUsePowerUp={handleUsePowerUp}
        hasPowerUpTargets={powerUpTargets.length > 0}
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
      <PowerUpTargetPicker
        powerUpId={aimedPowerUpId}
        targets={powerUpTargets}
        onPick={handlePickTarget}
        onClose={() => setAimedPowerUpId(null)}
      />
      <PowerUpCast cast={powerUpCast.cast} onDone={powerUpCast.clear} />
    </>
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
  | "powerUpTargets"
  | "powerUpOutcomes"
  | "selfId"
> & {
  timerState: TimerState;
  hasPowerUpTargets: boolean;
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
  powerUpHand,
  usedPowerUps,
  onUsePowerUp,
  hasPowerUpTargets,
}: GameLayoutProps) => (
  <div
    className={cn(
      "min-h-dvh flex flex-col items-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-6 sm:pb-[max(1rem,env(safe-area-inset-bottom))]",
      // Phones: room for the power-ups along the bottom of the screen
      canAnswer
        ? "pb-[calc(7.25rem+env(safe-area-inset-bottom))]"
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
        canAnswer={canAnswer}
        isSelectionLocked={isSelectionLocked}
        totalGuests={totalGuests}
        selectedGuestsCount={selectedGuestsCount}
        powerUpHand={powerUpHand}
        usedPowerUps={usedPowerUps}
        onUsePowerUp={onUsePowerUp}
        hasPowerUpTargets={hasPowerUpTargets}
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

// Admins, and players outside a synced game, get the action buttons, beside the countdown: the
// bottom of the phones' screen is the power-ups'
const canShowActions = (isAdmin: boolean, isSynced: boolean) => isAdmin || !isSynced;

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
  canAnswer,
  isSelectionLocked,
  totalGuests,
  selectedGuestsCount,
  powerUpHand,
  usedPowerUps,
  onUsePowerUp,
  hasPowerUpTargets,
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
  canAnswer: boolean;
  isSelectionLocked: boolean;
  totalGuests?: number;
  selectedGuestsCount?: number;
  powerUpHand?: PowerUpId[];
  usedPowerUps?: UsedPowerUp[];
  onUsePowerUp?: (id: PowerUpId) => void;
  hasPowerUpTargets: boolean;
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
    // Phones: the back button beside the countdown, then the score, the streak and the worth;
    // wider screens: the back button beside the score, the streak and the worth, then the countdown
    <header
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-y-3 sm:gap-y-4",
        "[grid-template-areas:'back_timer'_'stats_stats'] sm:[grid-template-areas:'back_stats'_'timer_timer']"
      )}
    >
      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}assets/audios/ask.mp3`} />
      {isAdmin && (
        <Button
          onClick={onBackToLobby}
          variant="ghost"
          size="icon"
          className="mr-2 -ml-2 h-9 w-9 shrink-0 text-muted-foreground [grid-area:back] hover:text-foreground sm:mr-3"
          title={t.lobby.backToLobbyTooltip}
          aria-label={t.lobby.backToLobbyTooltip}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      {/* Phones: only the coins name the score and the worth, so the streak gets more room */}
      <div className="flex min-w-0 items-center justify-between gap-3 [grid-area:stats] sm:gap-4">
        <div className="flex shrink-0 items-baseline gap-2">
          <span className="sr-only text-sm text-muted-foreground sm:not-sr-only">
            {t.quiz.gameScreen.scoreLabel}
          </span>
          <span className="gold-text font-extrabold text-xl sm:text-2xl font-display tabular-nums">
            {score}
          </span>
          <img src={pointsSrc} alt="" className="h-5 w-5 self-center sm:h-6 sm:w-6" />
        </div>
        {streak !== null && (
          <StreakBar
            streak={streak.count}
            threshold={streak.threshold}
            isFrozen={streak.isFrozen}
            className="min-w-0 flex-1 sm:max-w-sm"
          />
        )}
        <div className="flex shrink-0 items-baseline gap-2">
          <span className="sr-only text-sm text-muted-foreground sm:not-sr-only">
            {t.quiz.gameScreen.worthLabel}
          </span>
          <span className="gold-text font-extrabold text-lg sm:text-xl font-display tabular-nums">
            {questionPoints}
          </span>
          <img src={coinSrc} alt="" className="h-5 w-5 self-center sm:h-6 sm:w-6" />
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-3 [grid-area:timer] sm:gap-6">
        {/* The countdown takes all the room the actions leave */}
        <div className="w-full min-w-0 sm:flex-1">
          <Timer {...timerState} isLabelHiddenOnPhones={hasActions} />
        </div>
        {hasActions && (
          <div className="flex shrink-0 items-center gap-3">
            {hasSelectedCount && (
              <SelectedGuestsCount
                selected={selectedGuestsCount ?? 0}
                total={totalGuests ?? 0}
                isHidden={isShowingFeedback}
              />
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
        {canAnswer && (
          <PowerUpBar
            ids={powerUpHand}
            usedIds={usedPowerUps?.map((used) => used.id)}
            onUse={onUsePowerUp}
            hasTargets={hasPowerUpTargets}
            // One power-up per question: once one is used, the others wait for the next question
            disabled={
              isSelectionLocked ||
              Boolean(usedPowerUps?.some((used) => used.questionId === question.id))
            }
          />
        )}
      </div>
    </header>
  );
};

// How many guests picked an answer: only the numbers on phones, to leave the countdown room. Hidden
// but kept during feedback, with a fixed width on wider screens, so the countdown never changes size
const SelectedGuestsCount = ({
  selected,
  total,
  isHidden,
}: {
  selected: number;
  total: number;
  isHidden: boolean;
}) => {
  const { t } = useLocale();
  const label = interpolate(t.quiz.gameScreen.guestsSelected, { selected, total });

  return (
    <span
      title={label}
      className={cn(
        "flex items-center gap-1 text-sm text-muted-foreground tabular-nums sm:w-40 sm:justify-end",
        isHidden && "invisible"
      )}
    >
      <Users aria-hidden="true" className="h-4 w-4 shrink-0 sm:hidden" />
      <span aria-hidden="true" className="sm:hidden">
        {selected}/{total}
      </span>
      <span className="sr-only truncate sm:not-sr-only">{label}</span>
    </span>
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
