import { useEffect, useId, useState } from "react";

import { AnimatePresence, LazyMotion, m, useReducedMotion, type Transition } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

import { interpolate, useLocale } from "@/contexts/LocaleContext";
import type { LiveRankingEntry } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

import { useRankMoves, type RankMove } from "./useRankMoves";

type LiveRankingProps = {
  // The game's players by points, most first (the realtime server's live ranking)
  ranking: LiveRankingEntry[];
  // The player's own device, picked out in the ranking
  selfId?: string | null;
  className?: string;
};

// The podium's places stand out, each one less than the place above it. From the 4th place on, and
// for players without points yet, every row is the same
type Tier = 1 | 2 | 3 | "rest";

const MAX_ROWS = 10;
// How long the arrow of a player who changed places stays on their position
const MOVE_BADGE_MS = 4000;

// Each place's sizes, from phones (small chips) to wider screens (rows on one line). The 1st is the
// tallest, so side by side they line up at the bottom like a podium
const TIER_CLASS: Record<Tier, { row: string; position: string; name: string; points: string }> = {
  1: {
    row: "h-12 sm:h-14",
    position: "badge-game badge-game-gold h-5 w-5 text-xs sm:h-9 sm:w-9 sm:text-lg",
    name: "text-sm font-extrabold sm:text-lg",
    points: "text-sm font-extrabold sm:text-xl",
  },
  2: {
    row: "h-11 sm:h-12",
    position:
      "badge-game badge-game-silver h-[1.125rem] w-[1.125rem] text-[0.6875rem] sm:h-8 sm:w-8 sm:text-base",
    name: "text-xs font-bold sm:text-base",
    points: "text-xs font-bold sm:text-lg",
  },
  3: {
    row: "h-10 sm:h-11",
    position:
      "badge-game badge-game-bronze h-[1.125rem] w-[1.125rem] text-[0.6875rem] sm:h-7 sm:w-7 sm:text-sm",
    name: "text-xs font-bold sm:text-[0.9375rem]",
    points: "text-xs font-bold sm:text-base",
  },
  rest: {
    row: "h-10 sm:h-9",
    position: "h-[1.125rem] w-[1.125rem] text-xs text-muted-foreground sm:h-7 sm:w-7 sm:text-sm",
    name: "text-xs font-semibold sm:text-sm",
    points: "text-xs font-semibold text-muted-foreground sm:text-sm",
  },
};

const MOVE_TRANSITION: Transition = {
  layout: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  default: { duration: 0.25 },
};
const INSTANT_TRANSITION: Transition = { duration: 0 };

const POINTS_SRC = `${import.meta.env.BASE_URL}assets/coin/points.png`;

// framer-motion's layout animations, loaded apart from the rest of the app
const loadLayoutFeatures = () => import("./rankingFeatures").then((features) => features.default);

const getTier = ({ position, totalPoints }: LiveRankingEntry): Tier =>
  totalPoints > 0 && position <= 3 ? (position as 1 | 2 | 3) : "rest";

/*
 * The game's live ranking: the top 10 players by points, the podium in gold, silver and bronze.
 * Wide screens list it beside the question; smaller ones show the top 3 side by side, with the
 * others waiting past the right edge. The points come from the realtime server, every time they
 * change: a player who passes another glides to their new place, rising over the others on the way
 * up, and gets an arrow on their position for a few seconds.
 */
export const LiveRanking = ({ ranking, selfId, className }: LiveRankingProps) => {
  const { t } = useLocale();
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={cn("flex flex-col lg:gap-2", className)}>
      {/* Wider screens: the points coin heads the column of points */}
      <div className="flex items-center justify-between lg:px-3">
        <h2 id={headingId} className="sr-only text-sm text-muted-foreground lg:not-sr-only">
          {t.quiz.gameScreen.ranking.title}
        </h2>
        <img src={POINTS_SRC} alt="" className="hidden h-5 w-5 lg:block" />
      </div>
      <LazyMotion features={loadLayoutFeatures}>
        <RankList ranking={ranking} selfId={selfId} />
      </LazyMotion>
    </section>
  );
};

const RankList = ({ ranking, selfId }: Pick<LiveRankingProps, "ranking" | "selfId">) => {
  const moves = useRankMoves(ranking);
  const shouldReduceMotion = useReducedMotion();

  return (
    <ol
      className={cn(
        // Smaller screens: the top 3 side by side, the others past the right edge, where the list
        // stops showing them (its padding leaves room for the podium's glow)
        "relative -mx-2 grid auto-cols-[calc((100%_-_1rem)/3)] grid-flow-col items-end gap-2 overflow-x-clip px-2",
        "lg:mx-0 lg:grid-flow-row lg:grid-cols-1 lg:items-stretch lg:gap-1.5 lg:overflow-x-visible lg:px-0"
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {ranking.slice(0, MAX_ROWS).map((entry) => {
          const move = moves.get(entry.deviceId);
          return (
            <m.li
              key={entry.deviceId}
              layout="position"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={shouldReduceMotion ? INSTANT_TRANSITION : MOVE_TRANSITION}
              // On the way up, a player passes over the others
              style={{ zIndex: move?.direction === "up" ? 2 : 1 }}
              aria-current={entry.deviceId === selfId ? "true" : undefined}
              className="relative"
            >
              {/* Keyed by the player's last move: every new one plays again */}
              <RankRow
                key={move ? `${move.direction}${move.position}` : "still"}
                entry={entry}
                move={move}
                isSelf={entry.deviceId === selfId}
              />
            </m.li>
          );
        })}
      </AnimatePresence>
    </ol>
  );
};

type RankRowProps = {
  entry: LiveRankingEntry;
  move?: RankMove;
  isSelf: boolean;
};

// Phones: the name across the chip, over the position and the points; wider screens: the position,
// the name and the points on one line
const RankRow = ({ entry, move, isSelf }: RankRowProps) => {
  const { t } = useLocale();
  const strings = t.quiz.gameScreen.ranking;
  const tier = getTier(entry);
  const styles = TIER_CLASS[tier];

  return (
    <div
      data-podium={tier === "rest" ? undefined : tier}
      data-move={move?.direction}
      data-self={isSelf || undefined}
      className={cn(
        "row-game rank-row relative grid grid-cols-[auto_minmax(0,1fr)] content-center items-center gap-x-1.5 rounded-xl px-2 leading-tight",
        "sm:flex sm:gap-3 sm:px-3",
        styles.row
      )}
    >
      <span
        className={cn(
          "relative grid shrink-0 place-items-center rounded-full font-display font-black tabular-nums",
          styles.position
        )}
      >
        {entry.position}
        {move && <RankMoveBadge direction={move.direction} />}
      </span>
      <span
        title={entry.displayName}
        className={cn(
          "rank-name order-first col-span-2 truncate sm:order-none sm:flex-1",
          styles.name
        )}
      >
        {entry.displayName}
        {isSelf && <span className="sr-only"> {strings.you}</span>}
      </span>
      <span className={cn("flex items-center gap-1", styles.points)}>
        <span aria-hidden="true" className={cn("tabular-nums", tier === 1 && "gold-text")}>
          {entry.totalPoints}
        </span>
        <span className="sr-only">
          {interpolate(strings.points, { points: entry.totalPoints })}
        </span>
        {/* Until the list has its heading (wide screens), the coin goes with every score */}
        <img src={POINTS_SRC} alt="" className="h-3.5 w-3.5 lg:hidden" />
      </span>
    </div>
  );
};

// The arrow of a player who just changed places, up or down, on their position for a few seconds
const RankMoveBadge = ({ direction }: { direction: RankMove["direction"] }) => {
  const [isShown, setIsShown] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsShown(false), MOVE_BADGE_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!isShown) return null;
  const Icon = direction === "up" ? ChevronUp : ChevronDown;
  return (
    <span aria-hidden="true" data-direction={direction} className="rank-move">
      <Icon className="h-2.5 w-2.5" strokeWidth={4} />
    </span>
  );
};
