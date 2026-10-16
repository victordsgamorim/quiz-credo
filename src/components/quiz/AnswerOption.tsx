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
};

type OptionVisualState = {
  isSelected: boolean;
  isShowingFeedback: boolean;
  isCorrect: boolean;
  isIndicatorCorrect: boolean;
  disabled: boolean;
};

const optionLabels = ["A", "B", "C", "D"];

const buildVisualState = ({
  isSelected,
  isCorrect,
  isShowingFeedback,
  isIndicatorCorrect,
  disabled,
}: OptionVisualState) => {
  return {
    isSelected,
    shouldShowAsCorrect: isShowingFeedback && isIndicatorCorrect,
    shouldShowAsIncorrect: isShowingFeedback && isSelected && !isCorrect,
    // Keep the chosen and the revealed-correct options at full strength while locked
    isDimmed: disabled && !isSelected && !(isShowingFeedback && isIndicatorCorrect),
    disabled,
  };
};

const getButtonClasses = (state: ReturnType<typeof buildVisualState>) =>
  cn(
    "option-card w-full min-h-14 px-3 py-3 sm:p-5 text-left flex items-center gap-3 sm:gap-4",
    "motion-safe:active:scale-[0.98] touch-manipulation",
    state.isSelected && !state.shouldShowAsCorrect && !state.shouldShowAsIncorrect && "selected",
    state.shouldShowAsCorrect && "correct animate-bounce-in",
    state.shouldShowAsIncorrect && "incorrect animate-shake",
    state.disabled && "cursor-not-allowed",
    state.isDimmed && "opacity-70"
  );

const getIndicatorClasses = (state: ReturnType<typeof buildVisualState>) =>
  cn(
    "flex-shrink-0 w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center",
    "font-display font-bold text-lg sm:text-xl transition-all duration-300",
    state.shouldShowAsCorrect
      ? "bg-success text-success-foreground"
      : state.shouldShowAsIncorrect
        ? "bg-destructive text-destructive-foreground"
        : state.isSelected
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground"
  );

/*
 * Answer option button component for quiz questions.
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
}: AnswerOptionProps) => {
  const optionState = buildVisualState({
    isSelected,
    isCorrect,
    isShowingFeedback,
    isIndicatorCorrect: index === correctAnswerIndex,
    disabled,
  });

  return (
    <button
      onClick={() => onSelect(index)}
      disabled={disabled}
      aria-pressed={isSelected}
      className={getButtonClasses(optionState)}
    >
      <span aria-hidden="true" className={getIndicatorClasses(optionState)}>
        {optionLabels[index]}
      </span>
      <span className="min-w-0 break-words text-base sm:text-lg font-medium leading-snug">
        {option}
      </span>
    </button>
  );
};
