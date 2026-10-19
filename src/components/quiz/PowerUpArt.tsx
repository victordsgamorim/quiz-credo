/*
 * The power-ups' own art: drawn for the game instead of taken from an icon set, in a cartoon style
 * with thick outlines, in the 100x100 box of the emblem (PowerUpEmblem).
 */

export type PowerUpPalette = {
  light: string;
  mid: string;
  dark: string;
  // Outline of the drawings, darker than the emblem's core
  ink: string;
};

const GOLD = "#FFC928";
const GOLD_DARK = "#E09000";
const ICE = "#E8F8FF";
const SILVER = "#D5DEE8";

// The points of a star with five arms, around its center
const starPoints = ({ cx, cy, outer, inner }: Record<"cx" | "cy" | "outer" | "inner", number>) =>
  Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 5) * index - Math.PI / 2;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");

// A small four-point sparkle
const Sparkle = ({ x, y, size }: { x: number; y: number; size: number }) => (
  <path
    d={`M${x} ${y - size} L${x + size * 0.25} ${y - size * 0.25} L${x + size} ${y} L${x + size * 0.25} ${y + size * 0.25} L${x} ${y + size} L${x - size * 0.25} ${y + size * 0.25} L${x - size} ${y} L${x - size * 0.25} ${y - size * 0.25} Z`}
    fill="#fff"
  />
);

// Freeze: an hourglass locked in a block of ice, the time stopped
export const FreezeArt = ({ ink }: PowerUpPalette) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <rect
      x="30"
      y="30"
      width="40"
      height="40"
      rx="8"
      fill={ICE}
      fillOpacity="0.5"
      stroke={ink}
      strokeWidth="2.5"
    />
    <path
      d="M43 38 C43 46 50 47 50 50 C50 53 43 54 43 62 H57 C57 54 50 53 50 50 C50 47 57 46 57 38 Z"
      fill="#fff"
      stroke={ink}
      strokeWidth="2"
    />
    <path d="M46 41.5 H54 C53 44.5 51 46 50 47 C49 46 47 44.5 46 41.5 Z" fill={GOLD} />
    <path d="M45.5 60 C46 56.5 49 55.5 50 54 C51 55.5 54 56.5 54.5 60 Z" fill={GOLD} />
    <path d="M40.5 38 H59.5 M40.5 62 H59.5" stroke={ink} strokeWidth="3.5" />
    {/* The ice's shine and cracks */}
    <path d="M34.5 45 V37.5 Q34.5 34.5 37.5 34.5 H44" fill="none" stroke="#fff" strokeWidth="2.5" />
    <path
      d="M70 55 L64 59.5 L67 64"
      fill="none"
      stroke="#fff"
      strokeOpacity="0.75"
      strokeWidth="1.5"
    />
    <Sparkle x={68} y={30} size={6} />
    <Sparkle x={31} y={67} size={3.5} />
  </g>
);

// A gold coin
const Coin = ({ x, y, r, ink }: { x: number; y: number; r: number; ink: string }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={GOLD} stroke={ink} strokeWidth="1.8" />
    <circle cx={x} cy={y} r={r * 0.55} fill="none" stroke={GOLD_DARK} strokeWidth="1.2" />
  </g>
);

// Steal: a magnet pulling in the other players' coins
export const StealArt = ({ ink }: PowerUpPalette) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    {/* Pulled in from the sides */}
    <path
      d="M27 31 Q31 26 29 20 M73 31 Q69 26 71 20"
      fill="none"
      stroke="#fff"
      strokeOpacity="0.8"
      strokeWidth="2"
    />
    <Coin x={36.5} y={25} r={5.5} ink={ink} />
    <Coin x={63.5} y={25} r={5.5} ink={ink} />
    <Coin x={50} y={27.5} r={7} ink={ink} />
    <Magnet ink={ink} />
  </g>
);

// The magnet: an outline, then the body over it, with silver tips
const Magnet = ({ ink }: { ink: string }) => (
  <g>
    <path
      d="M38 46 V56 A12 12 0 0 0 62 56 V46"
      fill="none"
      stroke={ink}
      strokeWidth="15"
      strokeLinecap="butt"
    />
    <path
      d="M38 46 V56 A12 12 0 0 0 62 56 V46"
      fill="none"
      stroke="#fff"
      strokeWidth="10"
      strokeLinecap="butt"
    />
    <path
      d="M35 50 V56 A15 15 0 0 0 42 68"
      fill="none"
      stroke={ink}
      strokeOpacity="0.18"
      strokeWidth="2"
    />
    <rect
      x="30.5"
      y="37"
      width="15"
      height="10"
      rx="2"
      fill={SILVER}
      stroke={ink}
      strokeWidth="2.2"
    />
    <rect
      x="54.5"
      y="37"
      width="15"
      height="10"
      rx="2"
      fill={SILVER}
      stroke={ink}
      strokeWidth="2.2"
    />
    <path d="M33.5 40 H38 M57.5 40 H62" stroke="#fff" strokeWidth="1.8" />
  </g>
);

// Shield: a knight's shield, split like a coat of arms, with a gold star
export const ShieldArt = ({ ink, light }: PowerUpPalette) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path
      d="M50 25 L71 31 V49 C71 62.5 61.5 70.5 50 76 C38.5 70.5 29 62.5 29 49 V31 Z"
      fill="#fff"
      stroke={ink}
      strokeWidth="2.6"
    />
    <path d="M50 29.5 L67 34.3 V49 C67 59.5 59.5 66.2 50 71 Z" fill={light} />
    <path
      d="M50 29.5 L67 34.3 V49 C67 59.5 59.5 66.2 50 71 C40.5 66.2 33 59.5 33 49 V34.3 Z"
      fill="none"
      stroke={ink}
      strokeOpacity="0.35"
      strokeWidth="1.4"
    />
    <polygon
      points={starPoints({ cx: 50, cy: 49.5, outer: 11, inner: 4.8 })}
      fill={GOLD}
      stroke={ink}
      strokeWidth="2"
    />
    <Sparkle x={70} y={70} size={5} />
  </g>
);

// The streak's lightning bolt, and the jagged line Break snaps it along
const BOLT_PATH = "M56 27 L36 54 H48.5 L43 73 L65 44 H53 L59 27 Z";
const SNAP_POINTS = "30,47 40,51 46,45.5 52,52 58,46.5 70,50";

// One half of the snapped bolt: the bolt cut along the snap line, with the outline of its break
const BoltHalf = ({ ink, side }: { ink: string; side: "top" | "bottom" }) => (
  <g clipPath={`url(#power-up-break-${side})`}>
    <path d={BOLT_PATH} fill={GOLD} stroke={ink} strokeWidth="2.4" />
    <polyline
      points={SNAP_POINTS}
      fill="none"
      stroke={ink}
      strokeWidth="4.6"
      clipPath="url(#power-up-break-bolt)"
    />
  </g>
);

// Break: the streak's lightning bolt snapped in two, its pieces flying apart
export const BreakArt = ({ ink }: PowerUpPalette) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <defs>
      <clipPath id="power-up-break-top">
        <polygon points={`18,18 82,18 82,50 ${SNAP_POINTS.split(" ").reverse().join(" ")} 18,47`} />
      </clipPath>
      <clipPath id="power-up-break-bottom">
        <polygon points={`18,47 ${SNAP_POINTS} 82,50 82,82 18,82`} />
      </clipPath>
      <clipPath id="power-up-break-bolt">
        <path d={BOLT_PATH} />
      </clipPath>
    </defs>
    {/* The crack's spark, between the pieces */}
    <path
      d="M50 49 L44 41 M50 49 L58 40 M50 49 L33 46 M50 49 L67 52"
      stroke="#fff"
      strokeOpacity="0.85"
      strokeWidth="1.8"
    />
    <g transform="translate(-2.5 -3) rotate(-9 50 47)">
      <BoltHalf ink={ink} side="top" />
    </g>
    <g transform="translate(2.5 3) rotate(7 50 50)">
      <BoltHalf ink={ink} side="bottom" />
    </g>
    <path d="M53 33 L47 41" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" />
    {/* Shards */}
    <path
      d="M30 56 L35 54 L33 60 Z M68 37 L72 41 L66 42 Z"
      fill="#fff"
      stroke={ink}
      strokeWidth="1.4"
    />
    <Sparkle x={70} y={66} size={5} />
    <Sparkle x={31} y={33} size={3.5} />
  </g>
);

// The gift's bow: two loops and a knot, in gold
const Bow = ({ ink }: { ink: string }) => (
  <g fill={GOLD} stroke={ink} strokeWidth="2.2">
    <path d="M50 38 C44 29 33 29 36 36 C38 40 45 39 50 38 Z" />
    <path d="M50 38 C56 29 67 29 64 36 C62 40 55 39 50 38 Z" />
    <circle cx="50" cy="38" r="3.4" />
  </g>
);

// Bonus: a gift box, the extra points given to the player
export const BonusArt = ({ ink, light }: PowerUpPalette) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <rect x="32" y="48" width="36" height="24" rx="3" fill="#fff" stroke={ink} strokeWidth="2.5" />
    <rect x="35" y="51" width="11" height="18" fill={light} fillOpacity="0.45" />
    <rect x="29" y="40" width="42" height="10" rx="3" fill={light} stroke={ink} strokeWidth="2.5" />
    <path d="M46 40.5 H54 V72 H46 Z" fill={GOLD} stroke={ink} strokeWidth="2.2" />
    <path d="M47.5 52 V70" stroke={GOLD_DARK} strokeWidth="1.6" />
    <Bow ink={ink} />
    <path d="M32 43.5 H44" stroke="#fff" strokeWidth="2" strokeOpacity="0.8" />
    <Sparkle x={70} y={31} size={5.5} />
    <Sparkle x={29} y={70} size={3.5} />
  </g>
);
