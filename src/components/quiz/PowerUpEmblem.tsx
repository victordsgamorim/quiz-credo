import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { PowerUpPalette } from "./PowerUpArt";

type PowerUpEmblemProps = {
  palette: PowerUpPalette;
  art: ReactNode;
  className?: string;
};

const CENTER = 50;
const LOBES = 16;

// The emblem's gold rim: a circle with a wavy edge, like a medal's
const RIM_PATH = (() => {
  const steps = LOBES * 8;
  const points = Array.from({ length: steps }, (_, index) => {
    const angle = (2 * Math.PI * index) / steps;
    const radius = 45.5 + 2.5 * Math.cos(LOBES * angle);
    return `${(CENTER + radius * Math.cos(angle)).toFixed(2)} ${(CENTER + radius * Math.sin(angle)).toFixed(2)}`;
  });
  return `M${points.join(" L")} Z`;
})();

const polar = (radius: number, angle: number) => [
  CENTER + radius * Math.cos(angle),
  CENTER + radius * Math.sin(angle),
];

// Rivets along the rim, on every other wave
const RIVETS = Array.from({ length: LOBES / 2 }, (_, index) =>
  polar(43.2, (2 * Math.PI * index) / (LOBES / 2) + Math.PI / LOBES)
);

// Rays coming out of the middle of the core
const RAYS = Array.from({ length: 12 }, (_, index) => {
  const start = (2 * Math.PI * index) / 12;
  const [x1, y1] = polar(40, start);
  const [x2, y2] = polar(40, start + Math.PI / 12);
  return `M${CENTER} ${CENTER} L${x1.toFixed(2)} ${y1.toFixed(2)} A40 40 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
});

// The emblem's gradients, the clip of its core and the shadow of its art
const EmblemDefs = ({ id, palette }: { id: string; palette: PowerUpPalette }) => (
  <defs>
    <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FFF1A8" />
      <stop offset="0.45" stopColor="#FFC928" />
      <stop offset="0.75" stopColor="#E09000" />
      <stop offset="1" stopColor="#8A4B00" />
    </linearGradient>
    <radialGradient id={`${id}-core`} cx="0.38" cy="0.3" r="0.8">
      <stop offset="0" stopColor={palette.light} />
      <stop offset="0.55" stopColor={palette.mid} />
      <stop offset="1" stopColor={palette.dark} />
    </radialGradient>
    <clipPath id={`${id}-clip`}>
      <circle cx={CENTER} cy={CENTER} r="36.5" />
    </clipPath>
    <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow
        dx="0"
        dy="1.6"
        stdDeviation="0.6"
        floodColor={palette.ink}
        floodOpacity="0.7"
      />
    </filter>
  </defs>
);

/*
 * A power-up's emblem: a gold medal with a wavy, riveted rim around a glossy core in the
 * power-up's colors, with rays out of its middle (they spin while it is picked, the .power-up styles
 * in index.css) and the power-up's art over it.
 */
export const PowerUpEmblem = ({ palette, art, className }: PowerUpEmblemProps) => {
  // Each emblem needs its own ids for its gradients; React's have colons, which urls don't like
  const id = useId().replace(/:/g, "");

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={cn("power-up-medal", className)}>
      <EmblemDefs id={id} palette={palette} />
      <path
        d={RIM_PATH}
        fill={`url(#${id}-rim)`}
        stroke="#5A3000"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r="39.5"
        fill={palette.dark}
        stroke="#FFE58A"
        strokeWidth="1.2"
      />
      {RIVETS.map(([x, y]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="1.5"
          fill="#FFF1A8"
          stroke="#8A4B00"
          strokeWidth="0.6"
        />
      ))}
      <g clipPath={`url(#${id}-clip)`}>
        <circle cx={CENTER} cy={CENTER} r="36.5" fill={`url(#${id}-core)`} />
        <g className="power-up-rays" fill="#fff" fillOpacity="0.1">
          {RAYS.map((ray) => (
            <path key={ray} d={ray} />
          ))}
        </g>
        <ellipse cx={CENTER} cy="27" rx="27" ry="13" fill="#fff" fillOpacity="0.2" />
      </g>
      <g filter={`url(#${id}-shadow)`}>{art}</g>
    </svg>
  );
};

type PowerUpRibbonProps = {
  palette: PowerUpPalette;
  children: ReactNode;
  className?: string;
};

// The banner under the emblem with the power-up's name, its tails folded behind it
export const PowerUpRibbon = ({ palette, children, className }: PowerUpRibbonProps) => (
  <span className={cn("relative block", className)}>
    <svg
      viewBox="0 0 100 26"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full overflow-visible"
    >
      <path
        d="M0 8 H16 V25 H0 L6 16.5 Z"
        fill={palette.dark}
        stroke="#8A4B00"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M100 8 H84 V25 H100 L94 16.5 Z"
        fill={palette.dark}
        stroke="#8A4B00"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <path d="M10 20 H16 V25 Z M90 20 H84 V25 Z" fill="#000" fillOpacity="0.45" />
      <path
        d="M10 1.5 H90 V20 H10 Z"
        fill={palette.mid}
        stroke="#FFC928"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <path d="M10 1.5 H90 V8 H10 Z" fill="#fff" fillOpacity="0.2" />
    </svg>
    <span className="relative flex h-[77%] items-center justify-center px-3 font-display text-xs font-extrabold leading-none text-white [text-shadow:0_1px_0_rgb(0_0_0/0.55)]">
      {children}
    </span>
  </span>
);
