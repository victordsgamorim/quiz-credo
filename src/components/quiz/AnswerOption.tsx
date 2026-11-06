import type { CSSProperties } from "react";

import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

type AnswerOptionProps = {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  isShowingFeedback: boolean;
  correctAnswerIndex: number;
  onSelect: (index: number) => void;
  disabled: boolean;
  // Shown without being answered (the admin's screen, which the room watches): off, but at full
  // strength, never dimmed
  isReadOnly?: boolean;
};

type OptionVisualState = {
  isSelected: boolean;
  isShowingFeedback: boolean;
  isCorrect: boolean;
  isIndicatorCorrect: boolean;
  disabled: boolean;
  isReadOnly: boolean;
};

const optionLabels = ["A", "B", "C", "D"];

const buildVisualState = ({
  isSelected,
  isCorrect,
  isShowingFeedback,
  isIndicatorCorrect,
  disabled,
  isReadOnly,
}: OptionVisualState) => {
  const shouldShowAsCorrect = isShowingFeedback && isIndicatorCorrect;
  return {
    isSelected,
    shouldShowAsCorrect,
    shouldShowAsIncorrect: isShowingFeedback && isSelected && !isCorrect,
    // The player's own right answer celebrates; a correct answer they missed is only revealed
    isPicked: shouldShowAsCorrect && isSelected,
    // Keep the chosen and the revealed-correct options at full strength while locked
    isDimmed: disabled && !isReadOnly && !isSelected && !shouldShowAsCorrect,
    isBlocked: disabled && !isReadOnly,
  };
};

const getButtonClasses = (state: ReturnType<typeof buildVisualState>) =>
  cn(
    "option-card w-full min-h-14 px-3 py-3 sm:p-5 text-left flex items-center gap-3 sm:gap-4",
    // A phone on its side: the four in a column beside the question, the phones' size or smaller
    "phone-landscape:min-h-12 phone-landscape:px-3 phone-landscape:py-1.5 phone-landscape:gap-3",
    "touch-manipulation",
    {
      selected: state.isSelected && !state.shouldShowAsCorrect && !state.shouldShowAsIncorrect,
      correct: state.shouldShowAsCorrect,
      picked: state.isPicked,
      incorrect: state.shouldShowAsIncorrect,
      "cursor-not-allowed": state.isBlocked,
      "opacity-70": state.isDimmed,
    }
  );

const getIndicatorClasses = (state: ReturnType<typeof buildVisualState>) =>
  cn(
    "option-badge relative flex-shrink-0 w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center",
    "font-display font-extrabold text-lg sm:text-xl transition-all duration-300",
    "phone-landscape:h-8 phone-landscape:w-8 phone-landscape:text-base",
    state.shouldShowAsCorrect
      ? "bg-success text-success-foreground"
      : state.shouldShowAsIncorrect
        ? "bg-destructive text-destructive-foreground"
        : state.isSelected
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground"
  );

// The check or the cross the letter turns into
const MARK_CLASS = "option-mark h-5 w-5 sm:h-7 sm:w-7 phone-landscape:h-5 phone-landscape:w-5";

// Sparks that fly off the letter when the player gets it right, one every 30 degrees
const SPARK_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

const OptionSparks = () => (
  <>
    {SPARK_ANGLES.map((angle) => (
      <span
        key={angle}
        className="option-spark"
        style={{ "--spark-angle": `${angle}deg` } as CSSProperties}
      />
    ))}
  </>
);

/*
 * Answer option button component for quiz questions. It pops when selected, celebrates when it's
 * the player's right answer and shakes when it's wrong (the .option-card styles in index.css).
 */
export const AnswerOption = ({
  option,
  index,
  isSelected,
  isCorrect,
  isShowingFeedback,
  correctAnswerIndex,
  onSelect,
  disabled,
  isReadOnly = false,
}: AnswerOptionProps) => {
  const optionState = buildVisualState({
    isSelected,
    isCorrect,
    isShowingFeedback,
    isIndicatorCorrect: index === correctAnswerIndex,
    disabled,
    isReadOnly,
  });

  return (
    <button
      onClick={() => onSelect(index)}
      disabled={disabled}
      aria-pressed={isSelected}
      className={getButtonClasses(optionState)}
    >
      <span aria-hidden="true" className={getIndicatorClasses(optionState)}>
        {/* During feedback the letter turns into a check or a cross */}
        {optionState.shouldShowAsCorrect ? (
          <Check className={MARK_CLASS} strokeWidth={3.5} />
        ) : optionState.shouldShowAsIncorrect ? (
          <X className={MARK_CLASS} strokeWidth={3.5} />
        ) : (
          optionLabels[index]
        )}
        {optionState.isPicked && <OptionSparks />}
      </span>
      <span className="min-w-0 break-words text-base sm:text-lg font-bold leading-snug phone-landscape:text-[clamp(0.875rem,2.3vw,1rem)] phone-landscape:leading-snug">
        {option}
      </span>
    </button>
  );
};
