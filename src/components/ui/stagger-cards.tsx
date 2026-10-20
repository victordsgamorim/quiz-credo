import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StaggerCardsProps<T> = {
  items: readonly T[];
  getKey: (item: T) => string;
  renderCard: (item: T, isCenter: boolean) => ReactNode;
  label: string;
  previousLabel: string;
  nextLabel: string;
  /** Moves to the next card every few ms until someone moves the cards themselves. */
  autoAdvanceMs?: number;
  className?: string;
  cardClassName?: string;
};

type Slot<T> = { uid: number; item: T };

// How far a swipe has to travel, in px, to move the cards
const SWIPE_THRESHOLD = 40;
// How long the cards take to deal out from the center when they first show up
const DEAL_DURATION_MS = 900;

// Items ordered so the first one starts in the center
const toSlots = <T,>(items: readonly T[]): Slot<T>[] => {
  const center = Math.floor(items.length / 2);
  return items.map((_, index) => ({
    uid: index,
    item: items[(index - center + items.length) % items.length],
  }));
};

// Steps the cards right (positive) or left (negative): the cards leaving one end come back on
// the other with a new uid, so they jump there instead of sliding across the whole row
const rotateSlots = <T,>(slots: Slot<T>[], steps: number, nextUid: () => number) => {
  const rotated = [...slots];
  for (let step = 0; step < Math.abs(steps); step++) {
    if (steps > 0) {
      const first = rotated.shift();
      if (first) rotated.push({ ...first, uid: nextUid() });
    } else {
      const last = rotated.pop();
      if (last) rotated.unshift({ ...last, uid: nextUid() });
    }
  }
  return rotated;
};

/*
 * Cards fanned out in a staggered row, the center one raised and straight, the others tilting
 * one way and the other. Picking a card, swiping or using the arrows brings a card to the center.
 * Card sizes come from the --card-w and --card-h CSS variables, so they follow the breakpoints.
 */
// eslint-disable-next-line max-lines-per-function
export const StaggerCards = <T,>({
  items,
  getKey,
  renderCard,
  label,
  previousLabel,
  nextLabel,
  autoAdvanceMs,
  className,
  cardClassName,
}: StaggerCardsProps<T>) => {
  const [slots, setSlots] = useState(() => toSlots(items));
  // The cards mount stacked in the center (dealing), spread out, and then have been dealt
  const [isDealing, setIsDealing] = useState(true);
  const [hasDealt, setHasDealt] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const uidRef = useRef(items.length);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const center = Math.floor(slots.length / 2);
  const isAutoAdvancing = Boolean(autoAdvanceMs) && !hasInteracted && !shouldReduceMotion;

  const move = useCallback((steps: number) => {
    setSlots((current) => rotateSlots(current, steps, () => uidRef.current++));
  }, []);

  const moveByUser = (steps: number) => {
    setHasInteracted(true);
    move(steps);
  };

  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setIsDealing(false));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (isDealing) return;
    const timeout = setTimeout(() => setHasDealt(true), DEAL_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [isDealing]);

  useEffect(() => {
    if (!isAutoAdvancing || isPaused || !hasDealt) return;
    const interval = setInterval(() => move(1), autoAdvanceMs);
    return () => clearInterval(interval);
  }, [isAutoAdvancing, isPaused, hasDealt, autoAdvanceMs, move]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("stagger-cards relative", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") moveByUser(-1);
        if (event.key === "ArrowRight") moveByUser(1);
      }}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={(event) => {
        const start = touchStartRef.current;
        touchStartRef.current = null;
        if (!start) return;
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - start.x;
        const deltaY = touch.clientY - start.y;
        if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
          moveByUser(deltaX < 0 ? 1 : -1);
        }
      }}
    >
      <div className="stagger-cards-row" aria-live={isAutoAdvancing ? "off" : "polite"}>
        {slots.map((slot, index) => {
          const position = index - center;
          const isCenter = position === 0;
          return (
            <div
              key={slot.uid}
              data-key={getKey(slot.item)}
              data-state={isCenter ? "front" : "behind"}
              aria-hidden={isCenter ? undefined : true}
              onClick={isCenter ? undefined : () => moveByUser(position)}
              className={cn("stagger-card", !isCenter && "cursor-pointer", cardClassName)}
              style={getCardStyle(isDealing ? 0 : position, position, !hasDealt)}
            >
              {renderCard(slot.item, isCenter)}
            </div>
          );
        })}
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => moveByUser(-1)}
        aria-label={previousLabel}
        title={previousLabel}
        className="stagger-cards-arrow stagger-cards-arrow-left rounded-full"
      >
        <ChevronLeft />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => moveByUser(1)}
        aria-label={nextLabel}
        title={nextLabel}
        className="stagger-cards-arrow stagger-cards-arrow-right rounded-full"
      >
        <ChevronRight />
      </Button>
    </section>
  );
};

// Each card sits a third of a card from its neighbour, the center one raised, the others
// alternating up and down with a tilt. Cards nearer the center are drawn on top.
const getCardStyle = (
  shownPosition: number,
  position: number,
  isDealPhase: boolean
): CSSProperties => {
  const isCenter = shownPosition === 0;
  const isOdd = Math.abs(shownPosition) % 2 === 1;
  const lift = isCenter ? "var(--card-lift)" : isOdd ? "0.5rem" : "-0.25rem";
  const tilt = isCenter ? 0 : isOdd ? 2.5 : -2.5;
  return {
    zIndex: 20 - Math.abs(position),
    transform: `translateX(-50%) translateX(calc(var(--card-w) / 1.5 * ${shownPosition})) translateY(${lift}) rotate(${tilt}deg)`,
    // While dealing, the cards further out leave a little later
    transitionDelay: isDealPhase ? `${Math.abs(position) * 50}ms` : undefined,
  };
};
