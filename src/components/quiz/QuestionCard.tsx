import { useEffect } from "react";

import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardStack } from "@/components/ui/card-stack";
import { useAudioManager } from "@/hooks/useAudioManager";
import { useQuizPresenter } from "@/hooks/useQuizPresenter";
import { cn } from "@/lib/utils";
import { Question } from "@/types/quiz";

import { QUESTION_DECK_SIZE, useQuestionDeck } from "./useQuestionDeck";

type QuestionCardProps = {
  question: Question;
  avatarSrc: string;
  avatarAlt: string;
  isAdmin?: boolean;
  questionsRemaining?: number;
};

const MAX_CARDS_BEHIND = QUESTION_DECK_SIZE - 1;

/*
 * Card component displaying the current question on top of a deck of question cards.
 * The cards behind it stand for the questions still to come, so the deck thins out on the
 * last questions. Each new question is drawn from the back of the deck.
 */
export const QuestionCard = ({
  question,
  avatarSrc,
  avatarAlt,
  isAdmin = true,
  questionsRemaining = MAX_CARDS_BEHIND,
}: QuestionCardProps) => {
  const deck = useQuestionDeck(question);
  const cardsBehind = Math.min(Math.max(questionsRemaining, 0), MAX_CARDS_BEHIND);
  // Every card keeps room for the narration button, so a question doesn't reflow as its card moves back
  const cardClassName = cn("deck-card p-4 sm:p-8", { "pb-14 sm:pb-8 sm:pr-16": isAdmin });

  return (
    <div className="flex items-end gap-3 sm:items-center sm:gap-6">
      <div className="pointer-events-none shrink-0">
        <img
          src={avatarSrc}
          alt={avatarAlt}
          className="w-[clamp(72px,22vw,112px)] sm:w-[clamp(140px,16vw,210px)] h-auto select-none image-glow-soft"
        />
      </div>
      <CardStack
        className="flex-1 min-w-0"
        cardClassName={cardClassName}
        visibleCount={1 + cardsBehind}
        items={deck.map((card, index) => ({
          id: card.id,
          content:
            index === 0 ? (
              <QuestionFront key={question.id} question={question} isAdmin={isAdmin} />
            ) : (
              card.question && <QuestionText text={card.question.question} />
            ),
        }))}
      />
    </div>
  );
};

const QuestionText = ({ text }: { text: string }) => (
  <h2 className="text-lg sm:text-2xl lg:text-3xl font-display font-semibold leading-snug sm:leading-normal text-balance break-words">
    {text}
  </h2>
);

/*
 * Front card content: the question plus Web Speech API integration for TV quiz host style presentation.
 * Mounted once per question so the audio sequence and narration start fresh.
 */
const QuestionFront = ({ question, isAdmin }: { question: Question; isAdmin: boolean }) => {
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
    <>
      <QuestionText text={question.question} />
      {canNarrate && <NarrationButton isSpeaking={isSpeaking} onToggle={handleSpeechToggle} />}
    </>
  );
};

const NarrationButton = ({
  isSpeaking,
  onToggle,
}: {
  isSpeaking: boolean;
  onToggle: () => void;
}) => (
  <Button
    onClick={onToggle}
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
);
