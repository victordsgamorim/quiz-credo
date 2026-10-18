import { Zap } from "lucide-react";

import { interpolate, useLocale } from "@/contexts/LocaleContext";
import { getStreakMultiplier } from "@/lib/scoring";
import { cn } from "@/lib/utils";

type StreakBarProps = {
  streak: number;
  threshold: number;
  className?: string;
};

// Lightning bolts that crackle around the supercharged bar, one after the other from left to
// right: where they strike, their shape (the bar crosses the middle of their 44x36 box) and when
const BOLTS = [
  { left: "4%", delay: "0s", path: "M3 29 H16 L27 7 L40 13" },
  { left: "38%", delay: "0.55s", path: "M4 8 H17 L26 29 L41 24" },
  { left: "71%", delay: "1.1s", path: "M2 27 H13 L23 5 L30 17 L42 10" },
];

const formatMultiplier = (multiplier: number, locale: string) =>
  `×${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(multiplier)}`;

/*
 * The player's streak of correct answers, only shown on their own screen. It fills up as the
 * streak grows and turns "supercharged" once the streak earns a multiplier: gold, with lightning
 * around it and the multiplier beside it.
 */
export const StreakBar = ({ streak, threshold, className }: StreakBarProps) => {
  const { t, locale } = useLocale();
  const multiplier = getStreakMultiplier(streak, threshold);
  const isSupercharged = multiplier > 1;
  const filled = Math.min(streak, threshold);
  const multiplierLabel = formatMultiplier(multiplier, locale);
  const multiplierText = interpolate(t.quiz.gameScreen.streak.multiplier, {
    multiplier: multiplierLabel,
  });
  const progressText = interpolate(t.quiz.gameScreen.streak.progress, {
    count: filled,
    total: threshold,
  });

  return (
    <div
      className={cn("streak", "flex items-center gap-2.5", className)}
      data-supercharged={isSupercharged}
      data-empty={filled === 0}
    >
      <Zap aria-hidden="true" className="streak-icon h-5 w-5 shrink-0" />
      <StreakMeter
        label={t.quiz.gameScreen.streak.label}
        valueText={isSupercharged ? multiplierText : progressText}
        filled={filled}
        threshold={threshold}
        multiplier={multiplier}
      />
      <span aria-hidden="true" className="w-11 shrink-0 text-center">
        {isSupercharged ? (
          <MultiplierLabel key={multiplier} label={multiplierLabel} />
        ) : (
          <StreakCount filled={filled} threshold={threshold} />
        )}
      </span>
      <span className="sr-only" aria-live="polite">
        {isSupercharged ? multiplierText : ""}
      </span>
    </div>
  );
};

type StreakMeterProps = {
  label: string;
  valueText: string;
  filled: number;
  threshold: number;
  multiplier: number;
};

const StreakMeter = ({ label, valueText, filled, threshold, multiplier }: StreakMeterProps) => (
  <div
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={threshold}
    aria-valuenow={filled}
    aria-valuetext={valueText}
    className="relative h-4 min-w-0 flex-1 sm:h-[1.125rem]"
  >
    <div className="streak-track absolute inset-0 overflow-hidden rounded-full">
      <div
        className="streak-fill h-full rounded-full"
        style={{ width: `${(filled / threshold) * 100}%` }}
      />
    </div>
    {/* Keyed by multiplier: every new multiplier strikes again */}
    {multiplier > 1 && <StreakLightning key={multiplier} />}
  </div>
);

const StreakCount = ({ filled, threshold }: { filled: number; threshold: number }) => (
  <span className="text-xs font-medium text-muted-foreground tabular-nums">
    {filled}/{threshold}
  </span>
);

// Pops in every time the multiplier grows
const MultiplierLabel = ({ label }: { label: string }) => (
  <span className="streak-multiplier inline-block font-display text-lg font-bold gold-text tabular-nums animate-bounce-in sm:text-xl">
    {label}
  </span>
);

const StreakLightning = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0">
    <span className="streak-flash" />
    {BOLTS.map((bolt) => (
      <svg key={bolt.left} className="streak-bolt" viewBox="0 0 44 36" style={{ left: bolt.left }}>
        <path d={bolt.path} pathLength={100} style={{ animationDelay: bolt.delay }} />
      </svg>
    ))}
  </div>
);
