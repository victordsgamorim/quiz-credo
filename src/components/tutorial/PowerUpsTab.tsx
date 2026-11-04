import { useCallback, useState } from "react";

import { Check, Play } from "lucide-react";

import { PowerUpCast } from "@/components/quiz/PowerUpCast";
import { PowerUpEmblem } from "@/components/quiz/PowerUpEmblem";
import { getPowerUp, POWER_UPS, type PowerUp } from "@/components/quiz/powerUps";
import { PowerUpTargetPicker } from "@/components/quiz/PowerUpTargetPicker";
import { usePowerUpCast } from "@/components/quiz/usePowerUpCast";
import { PowerUpHintsContext, usePowerUpHint } from "@/components/quiz/usePowerUpSettings";
import { Button } from "@/components/ui/button";
import { interpolate, useLocale } from "@/contexts/LocaleContext";
import { DEFAULT_GAME_SETTINGS } from "@/types/gameSettings";
import type { PowerUpId, PowerUpPlayer } from "@/types/quiz";

import { PowerUpEffect } from "./PowerUpEffect";
import { TutorialSection } from "./TutorialSection";

// The players a disadvantage can be tried on: "Jogador 1", "Jogador 2"...
const getSampleTargets = (playerName: string): PowerUpPlayer[] =>
  [1, 2, 3].map((number) => ({
    id: `player-${number}`,
    name: interpolate(playerName, { number }),
  }));

/*
 * The power-ups, in a tab of their own: their rules, and what each one does, the advantages apart
 * from the disadvantages. Each one can be tried out from its own card: an advantage plays its
 * animation at once, a disadvantage first opens the list of players, like in the game. Their hints,
 * in the list of players too, leave out the numbers the admin sets (points, questions).
 */
export const PowerUpsTab = () => {
  const { t } = useLocale();
  const strings = t.tutorial.powerUps;
  const [aimedId, setAimedId] = useState<PowerUpId | null>(null);
  const { cast, use: castPowerUp, clear } = usePowerUpCast();

  const handleTry = useCallback(
    (id: PowerUpId) => {
      if (getPowerUp(id).kind === "attack") {
        setAimedId(id);
      } else {
        castPowerUp(id);
      }
    },
    [castPowerUp]
  );

  const handlePick = () => {
    if (aimedId) castPowerUp(aimedId);
    setAimedId(null);
  };

  return (
    <PowerUpHintsContext.Provider value={strings.summaries}>
      <div className="space-y-12 sm:space-y-14">
        <PowerUpRules />
        <PowerUpGroup
          title={strings.advantages.title}
          description={strings.advantages.description}
          powerUps={POWER_UPS.filter((powerUp) => powerUp.kind === "boost")}
          onTry={handleTry}
        />
        <PowerUpGroup
          title={strings.disadvantages.title}
          description={strings.disadvantages.description}
          powerUps={POWER_UPS.filter((powerUp) => powerUp.kind === "attack")}
          onTry={handleTry}
        />
      </div>
      <PowerUpTargetPicker
        powerUpId={aimedId}
        targets={getSampleTargets(t.tutorial.player)}
        onPick={handlePick}
        onClose={() => setAimedId(null)}
      />
      <PowerUpCast cast={cast} onDone={clear} />
    </PowerUpHintsContext.Provider>
  );
};

const RULE_IDS = ["hand", "once", "onePerQuestion", "open", "lastQuestion", "players"] as const;

// The rules every power-up follows, starting with the hand each player is dealt
const PowerUpRules = () => {
  const { t } = useLocale();
  const strings = t.tutorial.powerUps.rules;

  return (
    <TutorialSection title={strings.title}>
      <ul className="space-y-2">
        {RULE_IDS.map((id) => (
          <li key={id} className="flex items-start gap-2.5 text-sm leading-snug sm:text-base">
            <Check
              aria-hidden="true"
              strokeWidth={3}
              className="mt-0.5 h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5"
            />
            {strings[id]}
          </li>
        ))}
      </ul>
    </TutorialSection>
  );
};

// Plays a power-up's animation, through the list of players for a disadvantage
type TryPowerUp = (id: PowerUpId) => void;

type PowerUpGroupProps = {
  title: string;
  description: string;
  powerUps: PowerUp[];
  onTry: TryPowerUp;
};

// The answers in a row that fill the streak bar, by default: the effects show them, the text doesn't
// name them (the admin sets them)
const { streakThreshold } = DEFAULT_GAME_SETTINGS;

// The advantages, or the disadvantages, one after the other
const PowerUpGroup = ({ title, description, powerUps, onTry }: PowerUpGroupProps) => (
  <TutorialSection title={title} description={description}>
    <ul className="space-y-3">
      {powerUps.map((powerUp) => (
        <PowerUpDetail key={powerUp.id} powerUp={powerUp} onTry={onTry} />
      ))}
    </ul>
  </TutorialSection>
);

// What a power-up does: its emblem and name in its colors, its hint as on the bar, the details,
// its effect on the game's pieces, and the button to try it. The emblem tries it too, pressed like
// the bar's
const PowerUpDetail = ({ powerUp, onTry }: { powerUp: PowerUp; onTry: TryPowerUp }) => {
  const { t } = useLocale();
  const getHint = usePowerUpHint();
  const { id, palette, renderArt } = powerUp;
  const name = t.quiz.gameScreen.powerUps[id].name;
  const tryLabel = interpolate(t.tutorial.powerUps.tryLabel, { power: name });

  return (
    <li
      className="row-game flex gap-3 rounded-2xl p-4 sm:gap-5 sm:p-5"
      style={{ borderColor: `${palette.mid}80` }}
    >
      <button
        type="button"
        onClick={() => onTry(id)}
        title={tryLabel}
        aria-label={tryLabel}
        className="power-up h-fit shrink-0 rounded-full"
      >
        <PowerUpEmblem
          palette={palette}
          art={renderArt(palette)}
          className="h-14 w-14 sm:h-16 sm:w-16"
        />
      </button>
      <div className="min-w-0 flex-1 space-y-2">
        <h3 className="font-display text-lg font-black sm:text-xl" style={{ color: palette.light }}>
          {name}
        </h3>
        <p className="text-sm font-bold leading-snug sm:text-base">{getHint(id)}</p>
        <p className="text-sm leading-relaxed text-foreground/75">
          {t.tutorial.powerUps.details[id]}
        </p>
        <PowerUpEffect id={id} threshold={streakThreshold} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTry(id)}
          aria-label={tryLabel}
          className="!mt-3"
        >
          <Play aria-hidden="true" />
          {t.tutorial.powerUps.try}
        </Button>
      </div>
    </li>
  );
};
