import { useEffect, useRef } from "react";

import { toast } from "sonner";

import { interpolate, useLocale } from "@/contexts/LocaleContext";
import type { PowerUpOutcome } from "@/types/quiz";

import { PowerUpEmblem } from "./PowerUpEmblem";
import { getPowerUp } from "./powerUps";

type Strings = ReturnType<typeof useLocale>["t"]["quiz"]["gameScreen"]["powerUps"];

// What the player reads about a disadvantage they used, or that was used on them
const describeOutcome = (outcome: PowerUpOutcome, selfId: string, strings: Strings) => {
  const isTarget = outcome.target.id === selfId;
  const other = isTarget ? outcome.attacker : outcome.target;
  const params = { name: other.name, power: strings[outcome.powerUpId].name };
  const { outcomes } = strings;

  if (outcome.isBlocked) {
    return interpolate(isTarget ? outcomes.yourShieldBlocked : outcomes.theirShieldBlocked, params);
  }
  return interpolate(isTarget ? outcomes.hitYou : outcomes.youHit, params);
};

const outcomeKey = (outcome: PowerUpOutcome) =>
  `${outcome.questionIndex}:${outcome.powerUpId}:${outcome.attacker.id}:${outcome.isBlocked}`;

/*
 * Tells the player, in a toast, how each disadvantage between them and another player turned out:
 * with the shield's emblem when a shield blocked it, the disadvantage's own when it hit. A
 * disadvantage blocked by a shield used after it is told again, as blocked.
 */
export const usePowerUpNotices = (outcomes: PowerUpOutcome[], selfId?: string | null) => {
  const { t } = useLocale();
  const strings = t.quiz.gameScreen.powerUps;
  const toldRef = useRef(new Set<string>());

  useEffect(() => {
    if (!selfId) return;
    outcomes.forEach((outcome) => {
      const key = outcomeKey(outcome);
      if (toldRef.current.has(key)) return;
      toldRef.current.add(key);

      const { palette, renderArt } = getPowerUp(outcome.isBlocked ? "shield" : outcome.powerUpId);
      // At the top: the bottom of the phones' screen is the power-ups' and the answers'
      toast(describeOutcome(outcome, selfId, strings), {
        id: key,
        position: "top-center",
        classNames: { icon: "!m-0 !h-8 !w-8 shrink-0", title: "font-semibold" },
        icon: <PowerUpEmblem palette={palette} art={renderArt(palette)} className="h-8 w-8" />,
      });
    });
  }, [outcomes, selfId, strings]);
};
