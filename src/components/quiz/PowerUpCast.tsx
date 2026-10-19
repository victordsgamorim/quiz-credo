/* eslint-disable max-lines */
import { useEffect, type CSSProperties } from "react";

import { useLocale } from "@/contexts/LocaleContext";
import type { PowerUpId } from "@/types/quiz";

import { PowerUpEmblem } from "./PowerUpEmblem";
import { getPowerUp } from "./powerUps";
import { CAST_DURATION_MS, type Cast } from "./usePowerUpCast";
import { usePowerUpSettings } from "./usePowerUpSettings";

// Shield: a force field of hexagons closing in from the edges, and waves of protection
const ShieldEffect = () => (
  <>
    <svg className="power-up-cast-field absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id="power-up-cast-hex" width="27.71" height="48" patternUnits="userSpaceOnUse">
          <path
            d="M13.86 0 L27.71 8 V24 L13.86 32 L0 24 V8 Z M13.86 32 V48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </pattern>
        <radialGradient id="power-up-cast-field-fade">
          <stop offset="0.35" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </radialGradient>
        <mask id="power-up-cast-field-mask">
          <rect width="100%" height="100%" fill="url(#power-up-cast-field-fade)" />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#power-up-cast-hex)"
        mask="url(#power-up-cast-field-mask)"
      />
    </svg>
    <span className="power-up-cast-ring" />
    <span className="power-up-cast-ring [animation-delay:0.55s]" />
    <span className="power-up-cast-edge absolute inset-0" />
  </>
);

// Frost from the corners
const FROST_PATH =
  "M0 0 L150 150 M0 0 L170 70 M0 0 L70 170 M45 45 L80 20 M45 45 L20 80 M95 95 L135 75 M95 95 L75 135 M85 35 L110 10 M85 35 L95 65 M35 85 L10 110 M35 85 L65 95 M130 55 L160 40 M55 130 L40 160";

const CORNERS = [
  "top-0 left-0",
  "top-0 right-0 -scale-x-100",
  "bottom-0 left-0 -scale-y-100",
  "bottom-0 right-0 -scale-100",
];

// Snowflakes falling over the screen: where, when, how big and how fast
const SNOWFLAKES = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 37 + 5) % 100}%`,
  delay: `${((index * 0.13) % 0.9).toFixed(2)}s`,
  size: `${0.75 + ((index * 7) % 10) / 10}rem`,
  duration: `${1.1 + (index % 4) * 0.15}s`,
}));

// Freeze: frost creeping in from the corners, and snow
const FreezeEffect = () => (
  <>
    <span className="power-up-cast-frost absolute inset-0" />
    {CORNERS.map((corner) => (
      <svg
        key={corner}
        viewBox="0 0 170 170"
        className={`power-up-cast-frost-corner absolute h-48 w-48 sm:h-72 sm:w-72 ${corner}`}
        aria-hidden="true"
      >
        <path
          d={FROST_PATH}
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
      </svg>
    ))}
    {SNOWFLAKES.map(({ left, delay, size, duration }) => (
      <svg
        key={`${left}-${delay}`}
        viewBox="-10 -10 20 20"
        className="power-up-cast-snow absolute top-0"
        style={{
          left,
          width: size,
          height: size,
          animationDelay: delay,
          animationDuration: duration,
        }}
        aria-hidden="true"
      >
        <path
          d="M0 -9 V9 M-7.8 -4.5 L7.8 4.5 M-7.8 4.5 L7.8 -4.5 M-2.5 -7 L0 -4.5 L2.5 -7 M-2.5 7 L0 4.5 L2.5 7"
          fill="none"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ))}
  </>
);

// Coins pulled in from all around the screen
const COINS = Array.from({ length: 14 }, (_, index) => {
  const angle = (2 * Math.PI * index) / 14 + 0.3;
  return {
    x: `${(Math.cos(angle) * 60).toFixed(1)}vw`,
    y: `${(Math.sin(angle) * 60).toFixed(1)}vh`,
    delay: `${(0.25 + (index % 5) * 0.09).toFixed(2)}s`,
  };
});

// Steal: the other players' coins pulled into the magnet
const StealEffect = () => (
  <>
    <span className="power-up-cast-edge absolute inset-0" />
    {COINS.map(({ x, y, delay }) => (
      <span
        key={`${x}-${y}`}
        className="power-up-cast-coin"
        style={{ "--from-x": x, "--from-y": y, animationDelay: delay } as CSSProperties}
      />
    ))}
  </>
);

// Cracks shooting out from the middle of the screen, like a smashed window
const CRACKS = Array.from({ length: 9 }, (_, index) => {
  const angle = (2 * Math.PI * index) / 9 + 0.2;
  const point = (radius: number, turn: number) =>
    `${(50 + Math.cos(angle + turn) * radius).toFixed(1)} ${(50 + Math.sin(angle + turn) * radius).toFixed(1)}`;
  return `M${point(6, 0)} L${point(22, 0.12)} L${point(38, -0.06)} L${point(75, 0.08)}`;
});

// Pieces of the streak's bolt thrown out to the edges of the screen
const SHARDS = Array.from({ length: 12 }, (_, index) => {
  const angle = (2 * Math.PI * index) / 12 + 0.5;
  return {
    x: `${(Math.cos(angle) * 55).toFixed(1)}vw`,
    y: `${(Math.sin(angle) * 55).toFixed(1)}vh`,
    spin: `${(index % 2 === 0 ? 1 : -1) * (160 + index * 25)}deg`,
    delay: `${(0.3 + (index % 4) * 0.05).toFixed(2)}s`,
  };
});

// Break: the screen cracks and the pieces of the streak fly apart
const BreakEffect = () => (
  <>
    <span className="power-up-cast-edge absolute inset-0" />
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="power-up-cast-cracks absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {CRACKS.map((crack) => (
        <path
          key={crack}
          d={crack}
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
    {SHARDS.map(({ x, y, spin, delay }) => (
      <span
        key={`${x}-${y}`}
        className="power-up-cast-shard"
        style={{ "--to-x": x, "--to-y": y, "--spin": spin, animationDelay: delay } as CSSProperties}
      />
    ))}
  </>
);

// Confetti thrown up from the middle, falling back down: where to, how it turns, when and its color
const CONFETTI = Array.from({ length: 24 }, (_, index) => {
  const angle = -Math.PI / 2 + ((index % 12) - 5.5) * 0.24;
  const reach = 38 + (index % 3) * 9;
  return {
    x: `${(Math.cos(angle) * reach).toFixed(1)}vw`,
    y: `${(Math.sin(angle) * reach * 0.8).toFixed(1)}vh`,
    spin: `${(index % 2 === 0 ? 1 : -1) * (300 + index * 20)}deg`,
    delay: `${(0.25 + (index % 5) * 0.04).toFixed(2)}s`,
    color: ["#FFC928", "#FFFFFF", "var(--cast-light)", "var(--cast-color)"][index % 4],
  };
});

// Bonus: the points it gives rising over the emblem, in a burst of confetti
const BonusEffect = () => {
  const { bonusPoints } = usePowerUpSettings();
  return (
    <>
      <span className="power-up-cast-edge absolute inset-0" />
      {CONFETTI.map(({ x, y, spin, delay, color }) => (
        <span
          key={`${x}-${y}`}
          className="power-up-cast-confetti"
          style={
            {
              "--to-x": x,
              "--to-y": y,
              "--spin": spin,
              animationDelay: delay,
              background: color,
            } as CSSProperties
          }
        />
      ))}
      <span className="power-up-cast-points font-display text-5xl font-black sm:text-7xl">
        +{bonusPoints}
      </span>
    </>
  );
};

const EFFECTS: Record<PowerUpId, () => JSX.Element> = {
  freeze: FreezeEffect,
  steal: StealEffect,
  shield: ShieldEffect,
  break: BreakEffect,
  bonus: BonusEffect,
};

type PowerUpCastProps = {
  cast: Cast | null;
  onDone: () => void;
};

/*
 * A power-up's animation over the whole screen when it is used: its emblem pops up in the middle
 * with its name, over an effect of its own (a force field for the shield, frost and snow for the
 * freeze, coins pulled in for the steal, the screen cracking for the break, confetti and the points for the bonus). It doesn't block the game: the answers can still be
 * picked through it. Decorative, so screen readers skip it.
 */
export const PowerUpCast = ({ cast, onDone }: PowerUpCastProps) => {
  const { t } = useLocale();

  useEffect(() => {
    if (!cast) return;
    const timer = setTimeout(onDone, CAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [cast, onDone]);

  if (!cast) return null;

  const { palette, renderArt } = getPowerUp(cast.id);
  const Effect = EFFECTS[cast.id];

  return (
    <div
      key={cast.key}
      aria-hidden="true"
      data-power-up={cast.id}
      className="power-up-cast pointer-events-none fixed inset-0 z-50 overflow-hidden"
      style={
        {
          "--cast-light": palette.light,
          "--cast-color": palette.mid,
          "--cast-dark": palette.dark,
          color: palette.light,
        } as CSSProperties
      }
    >
      <span className="power-up-cast-backdrop absolute inset-0" />
      <Effect />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="power-up-cast-emblem h-40 w-40 sm:h-56 sm:w-56">
          <div className="power-up-cast-art h-full w-full">
            <PowerUpEmblem palette={palette} art={renderArt(palette)} className="h-full w-full" />
          </div>
        </div>
        <p className="power-up-cast-name font-display text-4xl font-black uppercase sm:text-6xl">
          {t.quiz.gameScreen.powerUps[cast.id].name}!
        </p>
      </div>
    </div>
  );
};
