import { useState } from "react";

import { Check, RotateCcw, X } from "lucide-react";

import { LiveRanking } from "@/components/quiz/LiveRanking";
import { StreakBar } from "@/components/quiz/StreakBar";
import { Button } from "@/components/ui/button";
import { interpolate, useLocale } from "@/contexts/LocaleContext";
import type { LiveRankingEntry } from "@/hooks/useSocket";
import {
  applyMultiplier,
  getStreakMultiplier,
  LEVEL_POINTS,
  MAX_STREAK_MULTIPLIER,
} from "@/lib/scoring";
import { DEFAULT_GAME_SETTINGS } from "@/types/gameSettings";

import { TutorialSection, TutorialStage } from "./TutorialSection";

/*
 * The game's points: what a question is worth, the streak bar's multiplier and the ranking.
 */
export const PointsTab = () => (
  <div className="space-y-12 sm:space-y-14">
    <QuestionWorth />
    <StreakDemo />
    <RankingDemo />
  </div>
);

// A level 3 question
const QUESTION_POINTS = LEVEL_POINTS[3];
const SAMPLE_SCORE = 120;

// The answers in a row that fill the bar, by default: the demo shows them, the text doesn't name
// them (the admin sets them)
const { streakThreshold: threshold } = DEFAULT_GAME_SETTINGS;

// The score and the question's worth, as the top of the game screen shows them
const QuestionWorth = () => {
  const { t } = useLocale();
  const strings = t.tutorial.points.worth;
  const labels = t.quiz.gameScreen;

  return (
    <TutorialSection title={strings.title} description={strings.description}>
      <TutorialStage className="flex items-center justify-between gap-4">
        <ScoreStat label={labels.scoreLabel} value={SAMPLE_SCORE} icon="points" />
        <ScoreStat label={labels.worthLabel} value={QUESTION_POINTS} icon="coin" />
      </TutorialStage>
    </TutorialSection>
  );
};

const ScoreStat = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: "points" | "coin";
}) => (
  <div className="flex items-baseline gap-2">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="gold-text font-display text-2xl font-extrabold tabular-nums">{value}</span>
    <img
      src={`${import.meta.env.BASE_URL}assets/coin/${icon}.png`}
      alt=""
      className="h-6 w-6 self-center"
    />
  </div>
);

/*
 * The streak bar, to fill with right answers and empty with a wrong one: it supercharges once full,
 * and the worth of the next question follows its multiplier.
 */
const StreakDemo = () => {
  const { t } = useLocale();
  const strings = t.tutorial.points.streak;
  const [streak, setStreak] = useState(0);
  const multiplier = getStreakMultiplier(streak, threshold);
  // The worth in gold, inside the sentence
  const [worthBefore, worthAfter = ""] = interpolate(strings.worth, {
    points: QUESTION_POINTS,
  }).split("{total}");
  const description = interpolate(strings.description, { max: MAX_STREAK_MULTIPLIER });

  return (
    <TutorialSection title={strings.title} description={description}>
      <TutorialStage className="space-y-4 sm:space-y-5">
        <StreakBar streak={streak} threshold={threshold} />
        <p aria-live="polite" className="text-center text-sm font-bold sm:text-base">
          {worthBefore}
          <span className="gold-text font-display text-lg font-black tabular-nums sm:text-xl">
            {applyMultiplier(QUESTION_POINTS, multiplier)}
          </span>
          {worthAfter}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="success" onClick={() => setStreak((count) => count + 1)}>
            <Check aria-hidden="true" />
            {strings.hit}
          </Button>
          <Button variant="destructive" onClick={() => setStreak(0)}>
            <X aria-hidden="true" />
            {strings.miss}
          </Button>
        </div>
      </TutorialStage>
    </TutorialSection>
  );
};

const SELF_ID = "you";
// The other players, "Jogador 1" in the lead
const RIVAL_POINTS = [150, 110, 80];
const CLIMB_POINTS = 40;

// The players by points, most first, with their places (the realtime server's ranking)
const rankPlayers = (players: Omit<LiveRankingEntry, "position">[]): LiveRankingEntry[] =>
  [...players]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((player, index) => ({ ...player, position: index + 1 }));

/*
 * The live ranking, with the player at the bottom: every right answer adds points, and the player
 * climbs past the others.
 */
const RankingDemo = () => {
  const { t } = useLocale();
  const strings = t.tutorial.points.ranking;
  const [selfPoints, setSelfPoints] = useState(40);
  const ranking = rankPlayers([
    ...RIVAL_POINTS.map((totalPoints, index) => ({
      deviceId: `player-${index + 1}`,
      displayName: interpolate(t.tutorial.player, { number: index + 1 }),
      totalPoints,
    })),
    { deviceId: SELF_ID, displayName: t.lobby.you, totalPoints: selfPoints },
  ]);
  const isFirst = ranking[0].deviceId === SELF_ID;

  return (
    <TutorialSection title={strings.title} description={strings.description}>
      <TutorialStage className="space-y-4">
        <LiveRanking ranking={ranking} selfId={SELF_ID} className="mx-auto w-full max-w-sm" />
        <div className="flex justify-center">
          {isFirst ? (
            <Button variant="outline" onClick={() => setSelfPoints(40)}>
              <RotateCcw aria-hidden="true" />
              {strings.reset}
            </Button>
          ) : (
            <Button onClick={() => setSelfPoints((points) => points + CLIMB_POINTS)}>
              {interpolate(strings.climb, { points: CLIMB_POINTS })}
            </Button>
          )}
        </div>
      </TutorialStage>
    </TutorialSection>
  );
};
