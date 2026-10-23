import type { CSSProperties, ReactNode } from "react";

import { Infinity as InfinityIcon } from "lucide-react";

import { interpolate, useLocale } from "@/contexts/LocaleContext";
import { getCategoryLabel } from "@/lib/categories";
import { POWER_UP_IDS } from "@/lib/powerUpHand";
import { LEVEL_POINTS, MAX_STREAK_MULTIPLIER } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { getEnabledPowerUps, type PowerUpSettings } from "@/types/powerUpSettings";
import type { PowerUpId } from "@/types/quiz";

import { PowerUpEmblem } from "./PowerUpEmblem";
import { getPowerUp } from "./powerUps";

type RuleCardProps = {
  title: string;
  // The rule at a glance: its number, or a small picture of it
  value: ReactNode;
  description?: string;
};

/*
 * A rule of the game on a deck card (GameRulesScreen): its name on a gold tab over the card's top
 * edge, the rule at a glance and a sentence explaining it. The card's foot is left clear for the
 * start button resting on it.
 */
const RuleCard = ({ title, value, description }: RuleCardProps) => (
  <>
    <span className="rule-card-tab badge-game badge-game-gold rounded-full px-3 py-0.5 text-xs font-extrabold sm:text-sm">
      {title}
    </span>
    <div className="deck-card-question flex h-full flex-col items-center justify-center gap-3 text-center sm:gap-4">
      {value}
      {description && (
        <p className="text-sm font-bold leading-snug text-balance sm:text-base">{description}</p>
      )}
    </div>
  </>
);

const RuleNumber = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span
    className={cn(
      "rule-card-number gold-text font-display text-[3.5rem] font-black leading-none tabular-nums sm:text-7xl",
      className
    )}
  >
    {children}
  </span>
);

// The countdown's format (Timer): minutes and seconds
const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

export const QuestionsRule = ({ count }: { count: number }) => {
  const { t } = useLocale();
  const strings = t.quiz.rulesScreen.rules.questions;

  return (
    <RuleCard
      title={strings.title}
      value={<RuleNumber>{count}</RuleNumber>}
      description={strings.description}
    />
  );
};

// Null seconds: no time limit
export const TimerRule = ({ seconds }: { seconds: number | null }) => {
  const { t } = useLocale();
  const strings = t.quiz.rulesScreen.rules.timer;

  if (seconds === null) {
    return (
      <RuleCard
        title={strings.title}
        value={
          <InfinityIcon
            aria-hidden="true"
            strokeWidth={2.75}
            className="rule-card-icon h-14 w-14 text-primary sm:h-[4.5rem] sm:w-[4.5rem]"
          />
        }
        description={strings.unlimited}
      />
    );
  }

  return (
    <RuleCard
      title={strings.title}
      value={<RuleNumber>{formatTime(seconds)}</RuleNumber>}
      description={strings.description}
    />
  );
};

// The top multiplier, in the colors the streak bar has once it gets there
export const StreakRule = ({ threshold }: { threshold: number }) => {
  const { t } = useLocale();
  const strings = t.quiz.rulesScreen.rules.streak;
  // A single correct answer starting the multiplier reads differently from several in a row
  const description = interpolate(threshold === 1 ? strings.descriptionOne : strings.description, {
    count: threshold,
    max: MAX_STREAK_MULTIPLIER,
  });

  return (
    <RuleCard
      title={strings.title}
      value={<RuleNumber className="rule-card-multiplier">×{MAX_STREAK_MULTIPLIER}</RuleNumber>}
      description={description}
    />
  );
};

// The levels from the first question to the last, each a stack of coins as tall as its points
export const DifficultyRule = () => {
  const { t } = useLocale();
  const strings = t.quiz.rulesScreen.rules.difficulty;

  return (
    <RuleCard
      title={strings.title}
      value={
        <ol className="flex items-end gap-1.5 sm:gap-2">
          {Object.values(LEVEL_POINTS).map((points, index) => (
            <li key={points} className="flex w-7 flex-col items-center gap-1 sm:w-9">
              <span className="text-xs font-extrabold tabular-nums sm:text-sm">{points}</span>
              <span
                className="rule-level w-full"
                style={{ "--level": index + 1 } as CSSProperties}
              />
            </li>
          ))}
        </ol>
      }
      description={strings.description}
    />
  );
};

// The room's most voted categories; none voted, the questions come from all of them
export const CategoriesRule = ({ categoryIds }: { categoryIds: string[] }) => {
  const { t } = useLocale();
  const strings = t.quiz.rulesScreen.rules.categories;
  const names = categoryIds.length
    ? categoryIds.map((id) => getCategoryLabel(t, id))
    : [strings.all];

  return (
    <RuleCard
      title={strings.title}
      value={
        // Phones: small enough for the 10 categories to fit, even the longest names
        <ul className="flex flex-wrap justify-center gap-1 sm:gap-1.5">
          {names.map((name) => (
            <li
              key={name}
              className="badge-game badge-game-outline rounded-full px-2 py-px text-[0.75rem] font-bold leading-[1.125rem] [text-shadow:none] sm:px-2.5 sm:py-0.5 sm:text-sm"
            >
              {name}
            </li>
          ))}
        </ul>
      }
    />
  );
};

// The power-ups that can be dealt and how many each player gets; all of them grayed out when the
// game has none
export const PowerUpsRule = ({ settings }: { settings: PowerUpSettings }) => {
  const { t } = useLocale();
  const strings = t.quiz.rulesScreen.rules.powerUps;
  const enabledIds = getEnabledPowerUps(settings, POWER_UP_IDS);
  const isOff = enabledIds.length === 0;
  const handSize = Math.min(settings.handSize, enabledIds.length);
  const description = isOff
    ? strings.off
    : interpolate(handSize === 1 ? strings.descriptionOne : strings.description, {
        count: handSize,
      });

  return (
    <RuleCard
      title={t.quiz.gameScreen.powerUps.label}
      value={<PowerUpMedals ids={isOff ? POWER_UP_IDS : enabledIds} isOff={isOff} />}
      description={description}
    />
  );
};

const PowerUpMedals = ({ ids, isOff }: { ids: readonly PowerUpId[]; isOff: boolean }) => {
  const { t } = useLocale();

  return (
    <ul className={cn("flex justify-center -space-x-1.5", isOff && "opacity-60 grayscale")}>
      {ids.map((id) => {
        const { palette, renderArt } = getPowerUp(id);
        return (
          <li key={id}>
            <PowerUpEmblem
              palette={palette}
              art={renderArt(palette)}
              className="h-10 w-10 sm:h-12 sm:w-12"
            />
            <span className="sr-only">{t.quiz.gameScreen.powerUps[id].name}</span>
          </li>
        );
      })}
    </ul>
  );
};
