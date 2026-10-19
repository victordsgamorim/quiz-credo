import { useEffect, useRef } from "react";

import { toast } from "sonner";

import { interpolate, useLocale } from "@/contexts/LocaleContext";
import type { PowerUpOutcome } from "@/types/quiz";

import { PowerUpEmblem } from "./PowerUpEmblem";
import { getPowerUp } from "./powerUps";

type Strings = ReturnType<typeof useLocale>["t"]["quiz"]["gameScreen"]["powerUps"];

// What the attacker reads about a disadvantage they used. The player it was used on isn't told,
// neither about the disadvantage nor about their shield blocking it
const describeOutcome = (outcome: PowerUpOutcome, selfId: string, strings: Strings) => {
  if (outcome.attacker.id !== selfId) return null;
  const { name } = outcome.target;
  const { outcomes } = strings;

  if (outcome.isBlocked) {
    return interpolate(outcomes.theirShieldBlocked, {
      name,
      power: strings[outcome.powerUpId].name,
    });
  }
  if (outcome.points !== undefined) {
    // A steal that hit says how many points it took
    return interpolate(outcome.points === 0 ? outcomes.stealNothing : outcomes.stealYouHit, {
      name,
      points: outcome.points,
    });
  }
  if (outcome.powerUpId === "break") return interpolate(outcomes.breakYouHit, { name });
  return interpolate(outcomes.youHit, { name, power: strings[outcome.powerUpId].name });
};

// Told again whenever it changes: blocked by a later shield, or a steal taking other points
const outcomeKey = (outcome: PowerUpOutcome) =>
  `${outcome.questionIndex}:${outcome.powerUpId}:${outcome.attacker.id}:${outcome.isBlocked}:${outcome.points ?? ""}`;

/*
 * Tells the player, in a toast, how each disadvantage they used turned out: with the shield's
 * emblem when a shield blocked it, the disadvantage's own when it hit, the points a steal took, and
 * the streak a break reset. A disadvantage blocked by a shield used after it is told again, as
 * blocked. The player a disadvantage was used on gets no toast.
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

      const message = describeOutcome(outcome, selfId, strings);
      if (!message) return;
      const { palette, renderArt } = getPowerUp(outcome.isBlocked ? "shield" : outcome.powerUpId);
      // At the top: the bottom of the phones' screen is the power-ups' and the answers'
      toast(message, {
        id: key,
        position: "top-center",
        classNames: { icon: "!m-0 !h-8 !w-8 shrink-0", title: "font-semibold" },
        icon: <PowerUpEmblem palette={palette} art={renderArt(palette)} className="h-8 w-8" />,
      });
    });
  }, [outcomes, selfId, strings]);
};
