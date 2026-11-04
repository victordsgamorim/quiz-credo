import { getMultiplierLevel } from "@/lib/scoring";
import { cn } from "@/lib/utils";

type PointsPopupProps = {
  // Points the right answer earned, the multiplier included (getAnswerPoints)
  points: number;
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
export const PointsPopup = ({ points, multiplier, className }: PointsPopupProps) => (
  <span
    aria-hidden="true"
    className={cn("points-popup", className)}
    data-level={getMultiplierLevel(multiplier)}
  >
    +{points}
  </span>
);
