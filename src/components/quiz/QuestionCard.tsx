import { useEffect } from "react";

import { Loader2, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardStack } from "@/components/ui/card-stack";
import { useAudioManager } from "@/hooks/useAudioManager";
import { useQuizPresenter } from "@/hooks/useQuizPresenter";
import { cn } from "@/lib/utils";
import { unlockNarrationPlayer } from "@/services/narrationPlayer";
import { Question } from "@/types/quiz";

import { QUESTION_DECK_SIZE, useQuestionDeck } from "./useQuestionDeck";

type QuestionCardProps = {
  question: Question;
  avatarSrc: string;
  avatarAlt: string;
  // The admin's screen, the one the room watches, has the host beside the question and the
  // narration; a guest's has only the question
  isAdmin?: boolean;
  questionsRemaining?: number;
  // The question's number in the game, on a tab over the card (e.g. "Pergunta 2 de 5")
  label?: string;
  // The game's next question, whose narration gets ready meanwhile
  upcomingQuestion?: Pick<Question, "question" | "options">;
};

const MAX_CARDS_BEHIND = QUESTION_DECK_SIZE - 1;
// How far each card behind peeks out, enough to show the pattern on its back
const CARD_OFFSET = 14;

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
  label,
  upcomingQuestion,
}: QuestionCardProps) => {
  const deck = useQuestionDeck(question);
  const cardsBehind = Math.min(Math.max(questionsRemaining, 0), MAX_CARDS_BEHIND);
  // Every card keeps room for the narration button, so a question doesn't reflow as its card moves back
  const cardClassName = cn("deck-card p-4 pt-6 sm:p-8", { "pb-14 sm:pb-8 sm:pr-16": isAdmin });

  return (
    // Phones: host above the deck, so the question card gets the full width
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
      {isAdmin && (
        <div className="pointer-events-none shrink-0">
          <img
            src={avatarSrc}
            alt={avatarAlt}
            className="w-[clamp(64px,min(22vw,11dvh),112px)] sm:w-[clamp(140px,16vw,210px)] h-auto select-none image-glow-soft"
          />
        </div>
      )}
      <CardStack
        className="w-full min-w-0 sm:flex-1"
        cardClassName={cardClassName}
        offset={CARD_OFFSET}
        visibleCount={1 + cardsBehind}
        items={deck.map((card, index) => ({
          id: card.id,
          content:
            index === 0 ? (
              <QuestionFront
                key={question.id}
                question={question}
                isAdmin={isAdmin}
                label={label}
                upcomingQuestion={upcomingQuestion}
              />
            ) : (
              card.question && <QuestionText text={card.question.question} />
            ),
        }))}
      />
    </div>
  );
};

// The question's number, on a gold tab over the card's top edge
const QuestionTab = ({ label }: { label: string }) => (
  <span className="deck-card-tab badge-game badge-game-gold rounded-full px-3 py-0.5 text-xs font-extrabold sm:text-sm">
    {label}
  </span>
);

const QuestionText = ({ text }: { text: string }) => (
  <h2 className="deck-card-question text-lg sm:text-2xl lg:text-3xl font-display font-extrabold leading-snug sm:leading-normal text-balance break-words">
    {text}
  </h2>
);

/*
 * Front card content: the question, read aloud on the admin's screen like a TV quiz host, by the
 * room's narrator (a voice that runs in the browser). Mounted once per question, so a new question
 * stops the reading of the last one and the audio sequence and narration start fresh.
 */
const QuestionFront = ({
  question,
  isAdmin,
  label,
  upcomingQuestion,
}: {
  question: Question;
  isAdmin: boolean;
  label?: string;
  upcomingQuestion?: Pick<Question, "question" | "options">;
}) => {
  const { speak, stop, isSpeaking, voice } = useQuizPresenter({
    question: question.question,
    options: question.options,
    upcoming: upcomingQuestion,
  });

  // The question's jingle, then the suspense music; the host reads the question once the jingle ends
  const { startNewQuestion, stopAllAudio } = useAudioManager({ onQuestionStartEnd: speak });

  const canNarrate = isAdmin && (voice.state === "loading" || voice.state === "ready");

  // Start audio sequence when question changes
  useEffect(() => {
    if (isAdmin) {
      startNewQuestion();
    }
  }, [question.id, isAdmin, startNewQuestion]);

  const handleSpeechToggle = () => {
    if (isSpeaking) {
      stop();
      stopAllAudio();
    } else {
      // The tap lets Safari on iPhone play the narration
      unlockNarrationPlayer();
      startNewQuestion(); // The jingle again, then the narration from the start
    }
  };

  return (
    <>
      {label && <QuestionTab label={label} />}
      <QuestionText text={question.question} />
      {canNarrate && (
        <NarrationButton
          isSpeaking={isSpeaking}
          loadingPercent={voice.state === "loading" ? (voice.percent ?? 0) : null}
          onToggle={handleSpeechToggle}
        />
      )}
    </>
  );
};

const getNarrationLabel = (isSpeaking: boolean, loadingPercent: number | null) => {
  if (loadingPercent !== null) return `Carregando a voz (${loadingPercent}%)`;
  return isSpeaking ? "Parar narração" : "Repetir pergunta";
};

// While the voice loads (the first time, it downloads), the button waits with a spinner
const NarrationButton = ({
  isSpeaking,
  loadingPercent,
  onToggle,
}: {
  isSpeaking: boolean;
  loadingPercent: number | null;
  onToggle: () => void;
}) => {
  const isLoading = loadingPercent !== null;
  const label = getNarrationLabel(isSpeaking, loadingPercent);

  return (
    <Button
      onClick={onToggle}
      disabled={isLoading}
      variant="outline"
      size="icon"
      className={cn(
        "absolute bottom-3 right-3 sm:bottom-4 sm:right-4",
        "h-10 w-10 rounded-full text-primary",
        isSpeaking && !isLoading && "animate-pulse"
      )}
      title={label}
      aria-label={label}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isSpeaking ? (
        <VolumeX className="h-5 w-5" />
      ) : (
        <Volume2 className="h-5 w-5" />
      )}
    </Button>
  );
};
