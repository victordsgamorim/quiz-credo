import type { CSSProperties } from "react";

import { Check } from "lucide-react";

import { interpolate, useLocale } from "@/contexts/LocaleContext";
import type { RankingEntry } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

type Place = 1 | 2 | 3;

type RankingPodiumProps = {
  // The players on the podium: the final ranking's first three, the ones who scored
  entries: RankingEntry[];
  // How many questions the game had, which the right answers are counted out of
  totalQuestions: number;
  // The player's own device, picked out on the podium
  selfId?: string | null;
  className?: string;
};

type PlaceStyle = {
  trophy: string;
  column: string;
  badge: string;
  trophySize: string;
  name: string;
  step: string;
  numeral: string;
};

const PLACES: Place[] = [1, 2, 3];

// Each place's trophy, its column (the 1st in the middle, the 2nd on its left, the 3rd on its
// right) and its sizes: the higher the place, the taller the step and the bigger its trophy. A phone
// on its side gets the smallest podium, to fit under the header and over the back button
const PLACE_STYLES: Record<Place, PlaceStyle> = {
  1: {
    trophy: "/assets/images/trophies/trophy-1st.png",
    column: "col-start-2",
    badge: "badge-game-gold",
    trophySize:
      "h-[4.75rem] w-[4.75rem] sm:h-28 sm:w-28 lg:h-32 lg:w-32 phone-landscape:h-11 phone-landscape:w-11",
    name: "text-base sm:text-xl lg:text-2xl phone-landscape:text-base",
    step: "h-[9.25rem] sm:h-48 lg:h-56 phone-landscape:h-24",
    numeral: "text-[3.75rem] sm:text-[5rem] lg:text-[6rem] phone-landscape:text-[2.75rem]",
  },
  2: {
    trophy: "/assets/images/trophies/throphy-2nd.png",
    column: "col-start-1",
    badge: "badge-game-silver",
    trophySize:
      "h-[3.75rem] w-[3.75rem] sm:h-[5.5rem] sm:w-[5.5rem] lg:h-24 lg:w-24 phone-landscape:h-9 phone-landscape:w-9",
    name: "text-sm sm:text-lg lg:text-xl phone-landscape:text-sm",
    step: "h-[7.5rem] sm:h-[9.75rem] lg:h-[11.5rem] phone-landscape:h-20",
    numeral: "text-[3rem] sm:text-[4rem] lg:text-[4.75rem] phone-landscape:text-[2.25rem]",
  },
  3: {
    trophy: "/assets/images/trophies/throphy-3rd.png",
    column: "col-start-3",
    badge: "badge-game-bronze",
    trophySize:
      "h-[3.75rem] w-[3.75rem] sm:h-[5.5rem] sm:w-[5.5rem] lg:h-24 lg:w-24 phone-landscape:h-9 phone-landscape:w-9",
    name: "text-sm sm:text-lg lg:text-xl phone-landscape:text-sm",
    step: "h-24 sm:h-[7.75rem] lg:h-[9.25rem] phone-landscape:h-[4.25rem]",
    numeral: "text-[2.625rem] sm:text-[3.5rem] lg:text-[4rem] phone-landscape:text-[1.875rem]",
  },
};

// The 1st's confetti: thrown up in a fan from their trophy as it lands, then falling
const CONFETTI = Array.from({ length: 28 }, (_, index) => {
  const angle = -Math.PI / 2 + ((index % 14) - 6.5) * 0.17;
  const reach = 6 + (index % 4) * 1.6;
  return {
    x: `${(Math.cos(angle) * reach * 1.5).toFixed(2)}rem`,
    y: `${(Math.sin(angle) * reach).toFixed(2)}rem`,
    spin: `${(index % 2 === 0 ? 1 : -1) * (280 + index * 17)}deg`,
    delay: `${(1.8 + (index % 7) * 0.035).toFixed(3)}s`,
    color: ["#FFC928", "#FFFFFF", "hsl(50 100% 72%)", "hsl(205 100% 66%)"][index % 4],
  };
});

/*
 * The top 3 of the final ranking on a podium (ResultsScreen): the 1st in the middle on the
 * tallest step, the 2nd on its left and the 3rd on its right. Each step has the player's trophy
 * and name on top, their points on a tab over its edge and their right answers. The steps rise
 * one by one when the podium shows, the 1st last, in a burst of confetti. A place nobody reached
 * stays a bare step, so the podium keeps its shape.
 */
export const RankingPodium = ({
  entries,
  totalQuestions,
  selfId,
  className,
}: RankingPodiumProps) => {
  const { t } = useLocale();
  const hasWinner = entries.some((entry) => entry.position === 1);

  return (
    // Bigger on wide screens, like the admin's, which the room watches
    <div className={cn("relative mx-auto w-full max-w-xl lg:max-w-2xl", className)}>
      <ol
        aria-label={t.quiz.results.podium}
        className="podium grid grid-cols-[1fr_1.2fr_1fr] items-end gap-2 sm:gap-3"
      >
        {PLACES.map((place) => {
          const entry = entries.find((candidate) => candidate.position === place);
          return (
            <PodiumPlace
              key={place}
              place={place}
              entry={entry}
              totalQuestions={totalQuestions}
              isSelf={entry !== undefined && entry.deviceId === selfId}
            />
          );
        })}
      </ol>
      <div aria-hidden="true" className="podium-floor" />
      {hasWinner && <PodiumConfetti />}
    </div>
  );
};

type PodiumPlaceProps = {
  place: Place;
  // The player in this place; none when fewer players scored
  entry?: RankingEntry;
  totalQuestions: number;
  isSelf: boolean;
};

const PodiumPlace = ({ place, entry, totalQuestions, isSelf }: PodiumPlaceProps) => (
  <li
    // A place nobody reached is only the podium's shape
    aria-hidden={entry ? undefined : true}
    aria-current={isSelf ? "true" : undefined}
    data-place={place}
    data-empty={entry ? undefined : true}
    data-self={isSelf || undefined}
    className={cn(
      "podium-place row-start-1 flex min-w-0 flex-col items-center",
      PLACE_STYLES[place].column
    )}
  >
    {entry && <PodiumPlayer place={place} entry={entry} isSelf={isSelf} />}
    <PodiumStep place={place} entry={entry} totalQuestions={totalQuestions} />
  </li>
);

type PodiumPlayerProps = Pick<PodiumPlaceProps, "place" | "isSelf"> & { entry: RankingEntry };

// The player standing on the step: their trophy and their name
const PodiumPlayer = ({ place, entry, isSelf }: PodiumPlayerProps) => {
  const { t } = useLocale();
  const styles = PLACE_STYLES[place];

  return (
    <>
      <span className="sr-only">{interpolate(t.quiz.results.place, { position: place })}</span>
      <img
        src={styles.trophy}
        alt=""
        className={cn("podium-trophy object-contain", styles.trophySize)}
      />
      <p
        className={cn(
          "podium-name mb-4 mt-1 max-w-full text-center font-display font-extrabold phone-landscape:mb-3",
          // After the size, which would take the line height away (cn merges them)
          styles.name,
          "leading-tight phone-landscape:leading-tight"
        )}
      >
        {entry.displayName}
        {isSelf && <span className="sr-only"> {t.quiz.gameScreen.ranking.you}</span>}
      </p>
    </>
  );
};

// The step: the player's points on its tab, the place, and the player's right answers
const PodiumStep = ({ place, entry, totalQuestions }: Omit<PodiumPlaceProps, "isSelf">) => {
  const styles = PLACE_STYLES[place];

  return (
    <div
      className={cn(
        "podium-step flex w-full flex-col items-center justify-center gap-1 pt-2",
        styles.step
      )}
    >
      {entry && (
        <RankingPoints
          points={entry.totalPoints}
          className={cn(
            "podium-tab badge-game rounded-full px-2.5 py-0.5 text-sm sm:text-base lg:text-lg phone-landscape:text-sm",
            styles.badge
          )}
        />
      )}
      <span
        aria-hidden="true"
        className={cn("podium-numeral font-display font-black", styles.numeral, "leading-none")}
      >
        {place}
      </span>
      {entry && (
        <RankingCorrect
          correct={entry.correctAnswers}
          total={totalQuestions}
          className="text-xs text-foreground/80 sm:text-sm lg:text-base phone-landscape:text-xs"
        />
      )}
    </div>
  );
};

const PodiumConfetti = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10">
    {CONFETTI.map(({ x, y, spin, delay, color }, index) => (
      <span
        key={index}
        className="podium-confetti"
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
  </div>
);

type RankingPointsProps = {
  points: number;
  className?: string;
};

// A player's points, with the coin of the game's score
export const RankingPoints = ({ points, className }: RankingPointsProps) => {
  const { t } = useLocale();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-display font-black tabular-nums",
        className
      )}
    >
      {points}
      <img src="/assets/coin/points.png" alt="" className="h-[1.15em] w-[1.15em]" />
      <span className="sr-only"> {t.quiz.results.points}</span>
    </span>
  );
};

type RankingCorrectProps = {
  correct: number;
  total: number;
  className?: string;
};

// A player's right answers out of the game's questions, after a check
export const RankingCorrect = ({ correct, total, className }: RankingCorrectProps) => {
  const { t } = useLocale();

  return (
    <span className={cn("inline-flex items-center gap-1 font-bold tabular-nums", className)}>
      <Check aria-hidden="true" className="h-[1em] w-[1em] text-success" strokeWidth={3.5} />
      <span aria-hidden="true">
        {correct}/{total}
      </span>
      <span className="sr-only">{interpolate(t.quiz.results.correctOf, { correct, total })}</span>
    </span>
  );
};
