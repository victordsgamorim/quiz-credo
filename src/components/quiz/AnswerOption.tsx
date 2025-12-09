import { cn } from "@/lib/utils";

interface AnswerOptionProps {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  showFeedback: boolean;
  correctAnswerIndex: number;
  onSelect: (index: number) => void;
  disabled: boolean;
}

const optionLabels = ["A", "B", "C", "D"];

export const AnswerOption = ({
  option,
  index,
  isSelected,
  isCorrect,
  showFeedback,
  correctAnswerIndex,
  onSelect,
  disabled,
}: AnswerOptionProps) => {
  const isThisCorrect = index === correctAnswerIndex;
  const showAsCorrect = showFeedback && isThisCorrect;
  const showAsIncorrect = showFeedback && isSelected && !isCorrect;

  return (
    <button
      onClick={() => onSelect(index)}
      disabled={disabled}
      className={cn(
        "option-card w-full p-4 sm:p-5 text-left flex items-center gap-3 sm:gap-4",
        "active:scale-[0.98] touch-manipulation",
        isSelected && !showFeedback && "selected",
        showAsCorrect && "correct animate-bounce-in",
        showAsIncorrect && "incorrect animate-shake",
        disabled && "cursor-not-allowed opacity-70"
      )}
    >
      <span
        className={cn(
          "flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center",
          "font-display font-bold text-lg sm:text-xl transition-all duration-300",
          showAsCorrect
            ? "bg-success text-success-foreground"
            : showAsIncorrect
              ? "bg-destructive text-destructive-foreground"
              : isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
        )}
      >
        {optionLabels[index]}
      </span>
      <span className="text-base sm:text-lg font-medium leading-tight">{option}</span>
    </button>
  );
};
