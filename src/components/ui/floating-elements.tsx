import { Children, type ReactNode } from "react";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type FloatingElementsProps = {
  children: ReactNode;
  className?: string;
};

// How far, in px, each element drifts up and down
const DRIFT_PX = 5;

/*
 * A row of elements that bob in place, each at its own pace so they never move in step. Wraps to
 * more rows when there are many; stands still for people who asked for less motion.
 */
export const FloatingElements = ({ children, className }: FloatingElementsProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5", className)}>
      {Children.toArray(children).map((child, index) => (
        <motion.div
          key={index}
          className="min-w-0 max-w-full"
          animate={shouldReduceMotion ? undefined : { y: [0, -DRIFT_PX, 0, DRIFT_PX, 0] }}
          transition={{
            duration: 3.2 + (index % 4) * 0.6,
            delay: (index % 5) * 0.35,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};
