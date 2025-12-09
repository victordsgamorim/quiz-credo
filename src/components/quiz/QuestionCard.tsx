import { Question } from "@/types/quiz";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

const difficultyConfig = {
  easy: { label: "Fácil", color: "text-success" },
  medium: { label: "Médio", color: "text-primary" },
  hard: { label: "Difícil", color: "text-destructive" },
};

export const QuestionCard = ({ question, questionNumber, totalQuestions }: QuestionCardProps) => {
  const difficulty = difficultyConfig[question.difficulty];

  return (
    <div className="glass-card p-5 sm:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm sm:text-base text-muted-foreground">
            Pergunta <span className="gold-text font-bold">{questionNumber}</span> de{" "}
            {totalQuestions}
          </span>
          <span className={cn("text-sm font-medium", difficulty.color)}>{difficulty.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Vale</span>
          <span className="gold-text font-bold text-lg sm:text-xl">{question.points}</span>
          <span className="text-sm text-muted-foreground">pts</span>
        </div>
      </div>
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-semibold leading-relaxed">
        {question.question}
      </h2>
    </div>
  );
};
