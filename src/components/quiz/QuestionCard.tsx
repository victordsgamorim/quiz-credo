import { Question } from "@/types/quiz";

type QuestionCardProps = {
  question: Question;
  avatarSrc: string;
  avatarAlt: string;
};

/*
 * Card component displaying the current question and points.
 */
export const QuestionCard = ({ question, avatarSrc, avatarAlt }: QuestionCardProps) => {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="pointer-events-none shrink-0">
        <img
          src={avatarSrc}
          alt={avatarAlt}
          className="w-[clamp(120px,28vw,180px)] sm:w-[clamp(150px,16vw,210px)] h-auto select-none drop-shadow-[0_16px_35px_rgba(0,0,0,0.25)]"
        />
      </div>
      <div className="glass-card overflow-visible p-5 sm:p-8 animate-fade-in flex-1">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-semibold leading-relaxed">
          {question.question}
        </h2>
      </div>
    </div>
  );
};
