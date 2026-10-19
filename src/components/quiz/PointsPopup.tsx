import { applyMultiplier, getMultiplierLevel } from "@/lib/scoring";
import { cn } from "@/lib/utils";

type PointsPopupProps = {
  // Points of the question, before the multiplier
  questionPoints: number;
  // Streak multiplier that earned the points: x1 without one
  multiplier: number;
  className?: string;
};

/*
 * The points of a right answer, popping up over it and floating away: "+40". In the project's gold
 * without a multiplier, and in the colors of the multiplier that earned them otherwise, like the
 * streak bar (the .points-popup styles in index.css). The score shows the points too, so screen
 * readers skip it.
 */
export const PointsPopup = ({ questionPoints, multiplier, className }: PointsPopupProps) => (
  <span
    aria-hidden="true"
    className={cn("points-popup", className)}
    data-level={getMultiplierLevel(multiplier)}
  >
    +{applyMultiplier(questionPoints, multiplier)}
  </span>
);
