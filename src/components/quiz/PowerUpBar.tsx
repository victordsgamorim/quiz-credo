import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";
import type { PowerUpId } from "@/types/quiz";

import { PowerUpEmblem, PowerUpRibbon } from "./PowerUpEmblem";
import { getPowerUp, POWER_UPS } from "./powerUps";

type PowerUpBarProps = {
  // The power-ups dealt to the player for this game, in the hand's order; all of them when not given
  ids?: PowerUpId[];
  // Power-ups already used in this game, for good
  usedIds?: PowerUpId[];
  onUse?: (id: PowerUpId) => void;
  // Locks them all for a while, like once the answer is shown
  disabled?: boolean;
  // Whether another player is in the game: the disadvantages need one to be used on
  hasTargets?: boolean;
  className?: string;
};

// Phones: a navigation bar along the bottom of the screen, within thumb reach; wider screens: the
// emblems alone, beside the countdown
const BAR_CLASS = [
  "fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 items-start gap-2",
  "border-t border-primary/10 bg-background/85 px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur",
  "sm:static sm:z-auto sm:flex sm:gap-2 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none",
].join(" ");

/*
 * The player's power-ups during a question: disadvantages against the other players and advantages
 * for themselves, the 3 dealt to the player for the game. Each one works once per game: once used, it stays off until the next game.
 * Without another player in the game, the disadvantages are off, with a hint saying why.
 */
export const PowerUpBar = ({
  ids,
  usedIds = [],
  onUse,
  disabled = false,
  hasTargets = true,
  className,
}: PowerUpBarProps) => {
  const { t } = useLocale();
  const strings = t.quiz.gameScreen.powerUps;
  const powerUps = ids ? ids.map(getPowerUp) : POWER_UPS;

  return (
    <nav aria-label={strings.label} className={cn(BAR_CLASS, className)}>
      {powerUps.map(({ id, kind, palette, renderArt }) => {
        const isUsed = usedIds.includes(id);
        const isMissingTarget = kind === "attack" && !hasTargets;

        return (
          <button
            key={id}
            type="button"
            data-kind={kind}
            data-used={isUsed}
            aria-label={isUsed ? `${strings[id].name}, ${strings.used}` : strings[id].name}
            title={isMissingTarget ? strings.noTargets : strings[id].hint}
            disabled={disabled || isUsed || isMissingTarget}
            onClick={() => onUse?.(id)}
            className="power-up flex flex-col items-center rounded-xl"
          >
            <PowerUpEmblem
              palette={palette}
              art={renderArt(palette)}
              className="h-[4.5rem] w-[4.5rem] sm:h-[3.25rem] sm:w-[3.25rem]"
            />
            <PowerUpRibbon
              palette={palette}
              className="power-up-ribbon -mt-2 h-6 w-[6.75rem] max-w-full sm:sr-only"
            >
              {strings[id].name}
            </PowerUpRibbon>
          </button>
        );
      })}
    </nav>
  );
};
