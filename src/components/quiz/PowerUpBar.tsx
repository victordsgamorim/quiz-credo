import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";
import type { PowerUpId } from "@/types/quiz";

import { FreezeArt, ShieldArt, StealArt, type PowerUpPalette } from "./PowerUpArt";
import { PowerUpEmblem, PowerUpRibbon } from "./PowerUpEmblem";

type PowerUp = {
  id: PowerUpId;
  // Attacks hurt another player, boosts help the player who uses them
  kind: "attack" | "boost";
  palette: PowerUpPalette;
  renderArt: (palette: PowerUpPalette) => React.ReactNode;
};

// In the colors of the countdown and the streak bar: ice blue, red and green
const POWER_UPS: PowerUp[] = [
  {
    id: "freeze",
    kind: "attack",
    palette: { light: "#7FDBFF", mid: "#1A8CFF", dark: "#0A2E80", ink: "#06205C" },
    renderArt: (palette) => <FreezeArt {...palette} />,
  },
  {
    id: "steal",
    kind: "attack",
    palette: { light: "#FF8A7A", mid: "#E0213A", dark: "#6B0716", ink: "#4A0410" },
    renderArt: (palette) => <StealArt {...palette} />,
  },
  {
    id: "shield",
    kind: "boost",
    palette: { light: "#7EE6A0", mid: "#1FA855", dark: "#0A4D27", ink: "#063A1C" },
    renderArt: (palette) => <ShieldArt {...palette} />,
  },
];

type PowerUpBarProps = {
  // Power-ups already used in this game, for good
  usedIds?: PowerUpId[];
  onUse?: (id: PowerUpId) => void;
  // Locks them all for a while, like once the answer is shown
  disabled?: boolean;
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
 * The player's power-ups during a question: attacks against the other players and boosts for
 * themselves. Each one works once per game: pressed, it's used and stays off until the next game.
 * What each one does comes later.
 */
export const PowerUpBar = ({
  usedIds = [],
  onUse,
  disabled = false,
  className,
}: PowerUpBarProps) => {
  const { t } = useLocale();
  const strings = t.quiz.gameScreen.powerUps;

  return (
    <nav aria-label={strings.label} className={cn(BAR_CLASS, className)}>
      {POWER_UPS.map(({ id, kind, palette, renderArt }) => {
        const isUsed = usedIds.includes(id);

        return (
          <button
            key={id}
            type="button"
            data-kind={kind}
            data-used={isUsed}
            aria-label={isUsed ? `${strings[id].name}, ${strings.used}` : strings[id].name}
            title={strings[id].hint}
            disabled={disabled || isUsed}
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
