import { useLocale, interpolate } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";
import { Question } from "@/types/quiz";

type QuestionCardProps = {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
};

const difficultyStyles: Record<Question["difficulty"], string> = {
  easy: "text-success",
  medium: "text-primary",
  hard: "text-destructive",
};

/*
 * Card component displaying the current question with difficulty and points.
 */
export const QuestionCard = ({ question, questionNumber, totalQuestions }: QuestionCardProps) => {
  const { t } = useLocale();
  const difficultyLabel = t.quiz.gameScreen.difficulty[question.difficulty];
  const difficultyColor = difficultyStyles[question.difficulty];
  const questionLabel = interpolate(t.quiz.question, {
    current: questionNumber,
    total: totalQuestions,
  });

  return (
    <div className="glass-card p-5 sm:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm sm:text-base text-muted-foreground">{questionLabel}</span>
          <span className={cn("text-sm font-medium", difficultyColor)}>{difficultyLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t.quiz.gameScreen.worthLabel}</span>
          <span className="gold-text font-bold text-lg sm:text-xl">{question.points}</span>
          <span className="text-sm text-muted-foreground">{t.quiz.gameScreen.pointsSuffix}</span>
        </div>
      </div>
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-semibold leading-relaxed">
        {question.question}
      </h2>
    </div>
  );
};
