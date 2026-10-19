import { useState } from "react";

import { interpolate, useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";

import { FreezeArt, ShieldArt, StealArt, type PowerUpPalette } from "./PowerUpArt";
import { PowerUpEmblem, PowerUpRibbon } from "./PowerUpEmblem";

export type PowerUpId = "freeze" | "steal" | "shield";

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
  // Uses left of each power-up: one each without them
  charges?: Partial<Record<PowerUpId, number>>;
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
 * themselves. Only the UI for now: a power-up is picked (pressed) and how each one works comes
 * later.
 */
export const PowerUpBar = ({ charges = {}, disabled = false, className }: PowerUpBarProps) => {
  const { t } = useLocale();
  const strings = t.quiz.gameScreen.powerUps;
  const [pickedId, setPickedId] = useState<PowerUpId | null>(null);

  return (
    <nav aria-label={strings.label} className={cn(BAR_CLASS, className)}>
      {POWER_UPS.map(({ id, kind, palette, renderArt }) => {
        const count = charges[id] ?? 1;
        const isPicked = pickedId === id && !disabled;

        return (
          <button
            key={id}
            type="button"
            data-kind={kind}
            aria-pressed={isPicked}
            aria-label={`${strings[id].name}, ${interpolate(strings.charges, { count })}`}
            title={strings[id].hint}
            disabled={disabled || count === 0}
            onClick={() => setPickedId(isPicked ? null : id)}
            className="power-up flex flex-col items-center rounded-xl"
            style={{ "--power-up-glow": palette.mid } as React.CSSProperties}
          >
            <span className="relative block h-[4.5rem] w-[4.5rem] sm:h-[3.25rem] sm:w-[3.25rem]">
              <PowerUpEmblem palette={palette} art={renderArt(palette)} className="h-full w-full" />
              <span
                aria-hidden="true"
                className="absolute -right-1 top-0 grid h-5 min-w-5 place-items-center rounded-full border-2 border-[#5A3000] bg-gradient-to-b from-[#FFF1A8] to-[#E09000] px-1 text-[11px] font-black leading-none text-[#3A1F00] tabular-nums sm:-right-1.5 sm:-top-1"
              >
                {count}
              </span>
            </span>
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
