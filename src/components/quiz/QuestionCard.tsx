import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useQuizPresenter } from "@/hooks/useQuizPresenter";
import { cn } from "@/lib/utils";
import { Question } from "@/types/quiz";

type QuestionCardProps = {
  question: Question;
  avatarSrc: string;
  avatarAlt: string;
  isAdmin?: boolean;
};

/*
 * Card component displaying the current question and points.
 * Includes Web Speech API integration for TV quiz host style presentation.
 */
export const QuestionCard = ({
  question,
  avatarSrc,
  avatarAlt,
  isAdmin = true,
}: QuestionCardProps) => {
  const { replay, stop, state, isSupported } = useQuizPresenter({
    question: question.question,
    options: question.options,
    autoPlay: isAdmin,
  });

  const isSpeaking = state === "speaking";

  const handleSpeechToggle = () => {
    if (isSpeaking) {
      stop();
    } else {
      replay();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="pointer-events-none shrink-0">
        <img
          src={avatarSrc}
          alt={avatarAlt}
          className="w-[clamp(120px,28vw,180px)] sm:w-[clamp(150px,16vw,210px)] h-auto select-none drop-shadow-[0_16px_35px_rgba(0,0,0,0.25)]"
        />
      </div>
      <div className="glass-card overflow-visible p-5 sm:p-8 animate-fade-in flex-1 relative">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-semibold leading-relaxed pr-12">
          {question.question}
        </h2>
        {isSupported && isAdmin && (
          <Button
            onClick={handleSpeechToggle}
            variant="ghost"
            size="icon"
            className={cn(
              "absolute bottom-3 right-3 sm:bottom-4 sm:right-4",
              "h-10 w-10 rounded-full",
              "bg-primary/10 hover:bg-primary/20",
              "text-primary hover:text-primary",
              "transition-all duration-200",
              isSpeaking && "animate-pulse bg-primary/20"
            )}
            title={isSpeaking ? "Parar narração" : "Repetir pergunta"}
            aria-label={isSpeaking ? "Parar narração" : "Repetir pergunta"}
          >
            {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        )}
      </div>
    </div>
  );
};
