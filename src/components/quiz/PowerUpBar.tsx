import { useState, type ReactNode } from "react";

import { HandCoins, ShieldCheck, Snowflake } from "lucide-react";

import { Button } from "@/components/ui/button";
import { interpolate, useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";

export type PowerUpId = "freeze" | "steal" | "shield";

type PowerUp = {
  id: PowerUpId;
  icon: ReactNode;
  // Attacks hurt another player, boosts help the player who uses them
  kind: "attack" | "boost";
  variant: "secondary" | "destructive" | "success";
};

const POWER_UPS: PowerUp[] = [
  { id: "freeze", icon: <Snowflake aria-hidden="true" />, kind: "attack", variant: "secondary" },
  { id: "steal", icon: <HandCoins aria-hidden="true" />, kind: "attack", variant: "destructive" },
  { id: "shield", icon: <ShieldCheck aria-hidden="true" />, kind: "boost", variant: "success" },
];

type PowerUpBarProps = {
  // Uses left of each power-up: one each without them
  charges?: Partial<Record<PowerUpId, number>>;
  disabled?: boolean;
  className?: string;
};

// Phones: a navigation bar along the bottom of the screen, within thumb reach; wider screens: the
// power-ups beside the countdown
const BAR_CLASS = [
  "fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 gap-3",
  "border-t border-primary/10 bg-background/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur",
  "sm:static sm:z-auto sm:flex sm:gap-3 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none",
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
      {POWER_UPS.map(({ id, icon, kind, variant }) => {
        const count = charges[id] ?? 1;
        const isPicked = pickedId === id && !disabled;

        return (
          <div key={id} className="relative">
            <Button
              variant={variant}
              data-kind={kind}
              aria-pressed={isPicked}
              aria-label={`${strings[id].name}, ${interpolate(strings.charges, { count })}`}
              title={strings[id].hint}
              disabled={disabled || count === 0}
              onClick={() => setPickedId(isPicked ? null : id)}
              className={cn(
                "h-16 w-full flex-col gap-1 rounded-2xl text-sm font-display font-extrabold [&_svg]:size-6",
                "sm:h-12 sm:w-12 sm:rounded-xl sm:p-0",
                // The game button's shadows would hide a ring, so the picked one gets an outline
                "aria-pressed:-translate-y-1 aria-pressed:outline aria-pressed:outline-2 aria-pressed:outline-offset-2 aria-pressed:outline-primary"
              )}
            >
              {icon}
              <span className="sm:sr-only">{strings[id].name}</span>
            </Button>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-2 -right-1.5 grid h-6 min-w-6 place-items-center rounded-full border-2 border-primary bg-background px-1 text-xs font-extrabold text-primary tabular-nums sm:-top-2 sm:-right-2 sm:h-5 sm:min-w-5 sm:text-[11px]"
            >
              {count}
            </span>
          </div>
        );
      })}
    </nav>
  );
};
