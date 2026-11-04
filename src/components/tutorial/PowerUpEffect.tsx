import type { ReactNode } from "react";

import { ArrowDown } from "lucide-react";

import { PowerUpEmblem } from "@/components/quiz/PowerUpEmblem";
import { getPowerUp } from "@/components/quiz/powerUps";
import { StreakBar } from "@/components/quiz/StreakBar";
import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";
import type { PowerUpId } from "@/types/quiz";

type EffectProps = {
  // Correct answers in a row that start the multiplier
  threshold: number;
};

const EffectRow = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("flex flex-wrap items-center gap-2 pt-1", className)}>{children}</div>
);

// The disadvantages it blocks, grayed out
const ShieldEffect = () => {
  const { t } = useLocale();

  return (
    <EffectRow>
      {(["steal", "break"] as const).map((attackId) => {
        const attack = getPowerUp(attackId);
        return (
          <PowerUpEmblem
            key={attackId}
            palette={attack.palette}
            art={attack.renderArt(attack.palette)}
            className="h-8 w-8 opacity-60 grayscale"
          />
        );
      })}
      <span className="badge-game badge-game-success rounded-full px-2.5 py-0.5 text-xs font-extrabold">
        {t.tutorial.powerUps.blocked}
      </span>
    </EffectRow>
  );
};

// A streak on its way to the multiplier, kept through a wrong answer
const FreezeEffect = ({ threshold }: EffectProps) => (
  <StreakBar
    streak={Math.max(1, threshold - 2)}
    threshold={threshold}
    isFrozen
    className="max-w-sm pt-1"
  />
);

// A supercharged streak, back to empty
const BreakEffect = ({ threshold }: EffectProps) => (
  <div className="max-w-sm space-y-1 pt-1">
    <StreakBar streak={threshold + 2} threshold={threshold} />
    <ArrowDown aria-hidden="true" className="mx-auto h-4 w-4 text-muted-foreground" />
    <StreakBar streak={0} threshold={threshold} />
  </div>
);

// Steal and Bonus have none: their points are the admin's to set
const EFFECTS: Partial<Record<PowerUpId, (props: EffectProps) => ReactNode>> = {
  shield: ShieldEffect,
  freeze: FreezeEffect,
  break: BreakEffect,
};

/*
 * A power-up's effect in the tutorial, shown on the game's pieces it changes: the streak bar, or the
 * disadvantages a shield blocks.
 */
export const PowerUpEffect = ({ id, threshold }: EffectProps & { id: PowerUpId }) => {
  const Effect = EFFECTS[id];
  return Effect ? <Effect threshold={threshold} /> : null;
};
