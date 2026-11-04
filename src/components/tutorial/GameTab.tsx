import { useEffect, useState, type CSSProperties } from "react";

import { RotateCcw } from "lucide-react";

import { Timer } from "@/components/quiz/Timer";
import { Button } from "@/components/ui/button";
import { CATEGORY_IDS } from "@/constants/categories";
import { useLocale } from "@/contexts/LocaleContext";
import { getCategoryLabel } from "@/lib/categories";
import { LEVEL_POINTS } from "@/lib/scoring";
import { DEFAULT_GAME_SETTINGS } from "@/types/gameSettings";

import { QuestionDemo } from "./QuestionDemo";
import { TutorialSection, TutorialStage } from "./TutorialSection";

/*
 * The game itself: from the lobby to the first question, the questions and their answers, the time,
 * the difficulty and the categories.
 */
export const GameTab = () => (
  <div className="space-y-12 sm:space-y-14">
    <RoomSteps />
    <QuestionDemo />
    <TimerDemo />
    <DifficultyLevels />
    <CategoryList />
  </div>
);

const STEP_IDS = ["create", "join", "vote", "ready", "start"] as const;

// The room's steps in order, each with its number on a gold coin
const RoomSteps = () => {
  const { t } = useLocale();
  const strings = t.tutorial.game.room;

  return (
    <TutorialSection title={strings.title}>
      <ol className="space-y-2.5">
        {STEP_IDS.map((id, index) => (
          <li key={id} className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="badge-game badge-game-gold grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-base font-black"
            >
              {index + 1}
            </span>
            <span className="text-sm leading-snug sm:text-base">{strings.steps[id]}</span>
          </li>
        ))}
      </ol>
    </TutorialSection>
  );
};

// The demo's countdown is short: a few seconds of plenty, then the low and the critical time
const DEMO_HEAD_START = 5;

// The times the game's colors change at, by default: the demo only shows them, the text doesn't name
// them (the admin sets them)
const { lowTimeThreshold, criticalTimeThreshold } = DEFAULT_GAME_SETTINGS;

/*
 * The question's countdown, running from a few seconds before the low time to the end, so its
 * colors show one after the other.
 */
const TimerDemo = () => {
  const { t } = useLocale();
  const strings = t.tutorial.game.timer;
  const duration = lowTimeThreshold + DEMO_HEAD_START;
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft((left) => left - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  return (
    <TutorialSection title={strings.title} description={strings.description}>
      <TutorialStage className="flex items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <Timer
            timeLeft={timeLeft}
            progress={(timeLeft / duration) * 100}
            isLowTime={timeLeft <= lowTimeThreshold}
            isCriticalTime={timeLeft <= criticalTimeThreshold}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTimeLeft(duration)}
          title={strings.replay}
          aria-label={strings.replay}
          className="h-9 w-9 shrink-0"
        >
          <RotateCcw aria-hidden="true" />
        </Button>
      </TutorialStage>
    </TutorialSection>
  );
};

const LEVEL_IDS = ["level1", "level2", "level3", "level4", "level5"] as const;

// The levels from the first question to the last, each a stack of coins as tall as its points, as
// on the rules screen (GameRuleCards)
const DifficultyLevels = () => {
  const { t } = useLocale();
  const strings = t.tutorial.game.difficulty;
  const names = t.quiz.gameScreen.difficulty;

  return (
    <TutorialSection title={strings.title} description={strings.description}>
      <TutorialStage>
        <ol className="grid grid-cols-5 items-end gap-2 sm:gap-4">
          {Object.values(LEVEL_POINTS).map((points, index) => (
            <li key={points} className="flex flex-col items-center gap-1.5 text-center">
              <span className="gold-text font-display text-lg font-black tabular-nums sm:text-2xl">
                {points}
              </span>
              <span
                aria-hidden="true"
                className="rule-level w-8 sm:w-12"
                style={{ "--level": index + 1 } as CSSProperties}
              />
              <span className="min-h-[2lh] text-[0.6875rem] font-bold leading-tight sm:text-sm">
                {names[LEVEL_IDS[index]]}
              </span>
            </li>
          ))}
        </ol>
      </TutorialStage>
    </TutorialSection>
  );
};

// Every category, as chips like the rules screen's
const CategoryList = () => {
  const { t } = useLocale();
  const strings = t.tutorial.game.categories;

  return (
    <TutorialSection title={strings.title} description={strings.description}>
      <ul className="flex flex-wrap gap-1.5 sm:gap-2">
        {CATEGORY_IDS.map((id) => (
          <li
            key={id}
            className="badge-game badge-game-outline rounded-full px-2.5 py-0.5 text-xs font-bold [text-shadow:none] sm:text-sm"
          >
            {getCategoryLabel(t, id)}
          </li>
        ))}
      </ul>
    </TutorialSection>
  );
};
