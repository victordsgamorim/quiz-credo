import { useState } from "react";

import { RotateCcw } from "lucide-react";

import { AnswerOption } from "@/components/quiz/AnswerOption";
import { PointsPopup } from "@/components/quiz/PointsPopup";
import { Button } from "@/components/ui/button";
import { CardStack } from "@/components/ui/card-stack";
import { useLocale } from "@/contexts/LocaleContext";
import { LEVEL_POINTS } from "@/lib/scoring";

import { TutorialSection, TutorialStage } from "./TutorialSection";

const OPTION_IDS = ["a", "b", "c", "d"] as const;
// Mars, the red planet
const CORRECT_INDEX = 1;
// A level 2 question
const QUESTION_POINTS = LEVEL_POINTS[2];
// How far each card behind peeks out, like the game's question deck (QuestionCard)
const CARD_OFFSET = 14;

/*
 * A question to answer, as the game shows it: on top of the deck of the questions to come, with its
 * four options. Picking one and revealing the answer plays the game's feedback, the points of a
 * right answer included.
 */
export const QuestionDemo = () => {
  const { t } = useLocale();
  const strings = t.tutorial.game.question;
  const [selected, setSelected] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const isCorrect = selected === CORRECT_INDEX;
  const status = isRevealed ? (isCorrect ? strings.correct : strings.wrong) : strings.pick;

  const restart = () => {
    setSelected(null);
    setIsRevealed(false);
  };

  return (
    <TutorialSection title={strings.title} description={strings.description}>
      <TutorialStage className="space-y-4 pt-7 sm:space-y-5 sm:pt-9">
        <QuestionDeck label={strings.label} text={strings.text} />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
          {OPTION_IDS.map((id, index) => (
            <div key={id} className="relative">
              <AnswerOption
                option={strings.options[id]}
                index={index}
                isSelected={selected === index}
                isCorrect={isCorrect}
                isShowingFeedback={isRevealed}
                correctAnswerIndex={CORRECT_INDEX}
                onSelect={setSelected}
                disabled={isRevealed}
              />
              {isRevealed && isCorrect && index === CORRECT_INDEX && (
                <PointsPopup questionPoints={QUESTION_POINTS} multiplier={1} />
              )}
            </div>
          ))}
        </div>
        <RevealControls
          status={status}
          isRevealed={isRevealed}
          canReveal={selected !== null}
          onReveal={() => setIsRevealed(true)}
          onRestart={restart}
        />
      </TutorialStage>
    </TutorialSection>
  );
};

type RevealControlsProps = {
  status: string;
  isRevealed: boolean;
  canReveal: boolean;
  onReveal: () => void;
  onRestart: () => void;
};

// How the answer went, and the button to reveal it, or to try again
const RevealControls = ({
  status,
  isRevealed,
  canReveal,
  onReveal,
  onRestart,
}: RevealControlsProps) => {
  const { t } = useLocale();

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p aria-live="polite" className="text-center text-sm text-muted-foreground sm:text-left">
        {status}
      </p>
      {isRevealed ? (
        <Button variant="outline" onClick={onRestart} className="shrink-0">
          <RotateCcw aria-hidden="true" />
          {t.tutorial.game.question.again}
        </Button>
      ) : (
        <Button onClick={onReveal} disabled={!canReveal} className="shrink-0">
          {t.tutorial.game.question.reveal}
        </Button>
      )}
    </div>
  );
};

// The question on top of the deck of the questions to come, as the game shows it (QuestionCard)
const QuestionDeck = ({ label, text }: { label: string; text: string }) => (
  <CardStack
    cardClassName="deck-card p-4 pt-6 sm:p-8"
    offset={CARD_OFFSET}
    visibleCount={3}
    items={[
      {
        id: "question",
        content: (
          <>
            <span className="deck-card-tab badge-game badge-game-gold rounded-full px-3 py-0.5 text-xs font-extrabold sm:text-sm">
              {label}
            </span>
            <h3 className="deck-card-question font-display text-lg font-extrabold leading-snug text-balance sm:text-2xl">
              {text}
            </h3>
          </>
        ),
      },
      { id: "next", content: null },
      { id: "later", content: null },
    ]}
  />
);
