import { useEffect } from "react";

import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAudioManager } from "@/hooks/useAudioManager";
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
  // Initialize audio manager with callback to trigger speech when question-start ends
  const handleQuestionStartEnd = () => {
    // Trigger Web Speech to start
    if (isSupported) {
      speak();
    }
  };

  const { startNewQuestion, stopAllAudio } = useAudioManager({
    onQuestionStartEnd: handleQuestionStartEnd,
  });

  const { replay, stop, speak, state, isSupported } = useQuizPresenter({
    question: question.question,
    options: question.options,
    autoPlay: false, // Manual control via audio manager
    delayBeforeSpeech: 0, // No delay since audio manager controls timing
  });

  const isSpeaking = state === "speaking";
  const canNarrate = isSupported && isAdmin;

  // Start audio sequence when question changes
  useEffect(() => {
    if (isAdmin && isSupported) {
      startNewQuestion();
    }
  }, [question.id, isAdmin, isSupported, startNewQuestion]);

  const handleSpeechToggle = () => {
    if (isSpeaking) {
      stop();
      stopAllAudio();
    } else {
      replay();
      startNewQuestion(); // Restart audio sequence on manual replay
    }
  };

  return (
    <div className="flex items-end gap-3 sm:items-center sm:gap-6">
      <div className="pointer-events-none shrink-0">
        <img
          src={avatarSrc}
          alt={avatarAlt}
          className="w-[clamp(72px,22vw,112px)] sm:w-[clamp(140px,16vw,210px)] h-auto select-none image-glow-soft"
        />
      </div>
      <div
        className={cn(
          "glass-card overflow-visible p-4 sm:p-8 animate-fade-in flex-1 min-w-0 relative",
          { "pb-14 sm:pb-8 sm:pr-16": canNarrate }
        )}
      >
        <h2 className="text-lg sm:text-2xl lg:text-3xl font-display font-semibold leading-snug sm:leading-normal text-balance break-words">
          {question.question}
        </h2>
        {canNarrate && (
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
