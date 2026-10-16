import { useEffect, type ReactNode } from "react";

import {
  animate,
  domAnimation,
  LazyMotion,
  m,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Transition,
} from "framer-motion";

import { cn } from "@/lib/utils";

export type CardStackItem = {
  id: string | number;
  content: ReactNode;
};

type CardStackProps = {
  /** Cards ordered from front to back. Reordering them animates the cards to their new places. */
  items: CardStackItem[];
  /** How far, in px, each card peeks out above the card in front of it. */
  offset?: number;
  /** How much smaller each card is than the card in front of it. */
  scaleFactor?: number;
  /** How many cards, counted from the front, are shown. The rest fade out. */
  visibleCount?: number;
  className?: string;
  cardClassName?: string;
};

type CardState = "front" | "behind" | "hidden";

// framer-motion's default timing for `top` and `zIndex`, which the original stack animated
const STACK_EASE: Transition = { duration: 0.3, ease: [0.25, 0.1, 0.35, 1] };
const STACK_TRANSITION: Transition = {
  default: STACK_EASE,
  scale: { type: "spring", stiffness: 550, damping: 30, restSpeed: 10 },
};
const FADE: Transition = { duration: 0.12 };
// A card leaving the stack stays opaque until it has moved behind the others
const FADE_OUT_AFTER_MOVE: Transition = { duration: 0.15, delay: 0.3 };
const INSTANT_TRANSITION: Transition = { duration: 0 };

const getCardState = (index: number, visibleCount: number): CardState => {
  if (index >= visibleCount) return "hidden";
  return index === 0 ? "front" : "behind";
};

/*
 * Stack of cards where each card behind the front one is smaller and peeks out above it.
 * The front card sets the stack's height and is the only one showing its content; the cards
 * behind match its size. Moving the last item to the front draws the back card forward,
 * like flipping through a deck.
 */
export const CardStack = ({
  items,
  offset = 10,
  scaleFactor = 0.06,
  visibleCount = items.length,
  className,
  cardClassName,
}: CardStackProps) => (
  // `m` components with LazyMotion bundle only the DOM animation features instead of all of framer-motion
  <LazyMotion features={domAnimation}>
    <div className={cn("relative", className)} style={{ paddingTop: (items.length - 1) * offset }}>
      <div className="relative">
        {items.map((item, index) => (
          <StackCard
            key={item.id}
            state={getCardState(index, visibleCount)}
            layer={items.length - index}
            target={{ y: index * -offset, scale: 1 - index * scaleFactor }}
            className={cardClassName}
          >
            {item.content}
          </StackCard>
        ))}
      </div>
    </div>
  </LazyMotion>
);

type StackCardProps = {
  state: CardState;
  layer: number;
  target: { y: number; scale: number };
  className?: string;
  children: ReactNode;
};

const StackCard = ({ state, layer, target, className, children }: StackCardProps) => {
  const shouldReduceMotion = useReducedMotion();
  // framer-motion sets zIndex instantly, so tween it here: a card drawn from the back passes
  // the cards in between on its way to the front instead of jumping on top of them
  const animatedLayer = useMotionValue(layer);
  const zIndex = useTransform(animatedLayer, Math.round);

  useEffect(() => {
    const controls = animate(
      animatedLayer,
      layer,
      shouldReduceMotion ? INSTANT_TRANSITION : STACK_EASE
    );
    return () => controls.stop();
  }, [animatedLayer, layer, shouldReduceMotion]);

  const isFront = state === "front";
  const isHidden = state === "hidden";

  return (
    <m.div
      data-state={state}
      aria-hidden={isFront ? undefined : true}
      className={cn(
        "rounded-3xl border bg-card p-4 text-card-foreground shadow-xl",
        isFront ? "relative" : "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      style={{ transformOrigin: "top center", zIndex }}
      initial={false}
      animate={{ ...target, opacity: isHidden ? 0 : 1 }}
      transition={
        shouldReduceMotion
          ? INSTANT_TRANSITION
          : { ...STACK_TRANSITION, opacity: isHidden ? FADE_OUT_AFTER_MOVE : FADE }
      }
    >
      {/* Cards behind take the front card's size, so their own content fades out instead of being cut off */}
      <m.div
        initial={false}
        animate={{ opacity: isFront ? 1 : 0 }}
        transition={shouldReduceMotion ? INSTANT_TRANSITION : FADE}
      >
        {children}
      </m.div>
    </m.div>
  );
};
