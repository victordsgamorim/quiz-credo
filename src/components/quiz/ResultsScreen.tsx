import { useId } from "react";

import { Button } from "@/components/ui/button";
import { interpolate, useLocale } from "@/contexts/LocaleContext";
import type { useSocket, RankingEntry } from "@/hooks/useSocket";

import { RankingCorrect, RankingPodium, RankingPoints } from "./RankingPodium";

type ResultsScreenProps = {
  // How many questions the game had, which every player's right answers are counted out of
  totalQuestions: number;
  // The room's final ranking (the realtime server's), most points first
  ranking: RankingEntry[];
  socket: ReturnType<typeof useSocket>;
  onBackToLobby: () => void;
};

// A place on the podium takes points, as in the live ranking: a player who didn't score is listed
// with the others
const isOnPodium = ({ position, totalPoints }: RankingEntry) => position <= 3 && totalPoints > 0;

/*
 * The room's final ranking, when the game ends: the top 3 on a podium, and the other players
 * below it, each with their right answers and points. The player's own place is lit in the live
 * ranking's blue. Everyone's button back to the lobby floats at the bottom of the screen.
 */
export const ResultsScreen = ({
  totalQuestions,
  ranking,
  socket,
  onBackToLobby,
}: ResultsScreenProps) => {
  const { t } = useLocale();
  const headingId = useId();
  // Filter out admin from ranking display
  const players = ranking.filter((entry) => entry.role !== "admin");
  const others = players.filter((entry) => !isOnPodium(entry));

  return (
    <div className="min-h-dvh flex flex-col">
      <ResultsHeader />

      {/* Room under the ranking for the floating button, so the last rows scroll out from under it */}
      <main className="flex-1 px-4 pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:pt-10 sm:pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
        <section aria-labelledby={headingId} className="mx-auto w-full max-w-3xl">
          <h3 id={headingId} className="sr-only">
            {t.quiz.results.ranking}
          </h3>
          {players.length > 0 ? (
            <>
              <RankingPodium
                entries={players.filter(isOnPodium)}
                totalQuestions={totalQuestions}
                selfId={socket.deviceId}
              />
              {others.length > 0 && (
                <OtherPlayers
                  entries={others}
                  totalQuestions={totalQuestions}
                  selfId={socket.deviceId}
                />
              )}
            </>
          ) : (
            <p className="glass-card p-6 text-center text-sm text-muted-foreground">
              {t.quiz.results.noRanking}
            </p>
          )}
        </section>
      </main>

      <BackToLobbyButton onClick={onBackToLobby} />
    </div>
  );
};

const ResultsHeader = () => {
  const { t } = useLocale();

  return (
    <div className="sticky top-0 z-20 border-b border-primary/10 bg-background/80 backdrop-blur pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex min-h-16 w-full max-w-3xl items-center justify-center px-4 py-3">
        <h2 className="text-center text-xl font-extrabold gold-text font-display truncate">
          {t.quiz.results.title}
        </h2>
      </div>
    </div>
  );
};

type OtherPlayersProps = {
  entries: RankingEntry[];
  totalQuestions: number;
  selfId?: string | null;
};

// The players past the podium, in the ranking's rows
const OtherPlayers = ({ entries, totalQuestions, selfId }: OtherPlayersProps) => {
  const { t } = useLocale();

  return (
    <ol className="mt-8 space-y-2 sm:mt-10">
      {entries.map((entry) => {
        const isSelf = entry.deviceId === selfId;
        return (
          <li
            key={entry.deviceId}
            aria-current={isSelf ? "true" : undefined}
            data-self={isSelf || undefined}
            className="row-game result-row relative flex min-h-14 items-center gap-3 rounded-xl px-3 py-2 sm:px-4"
          >
            <span className="sr-only">
              {interpolate(t.quiz.results.place, { position: entry.position })}
            </span>
            <span
              aria-hidden="true"
              className="badge-game badge-game-navy grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-sm font-black tabular-nums"
            >
              {entry.position}
            </span>
            <span className="result-name min-w-0 flex-1 truncate font-display font-extrabold">
              {entry.displayName}
              {isSelf && <span className="sr-only"> {t.quiz.gameScreen.ranking.you}</span>}
            </span>
            <RankingCorrect
              correct={entry.correctAnswers}
              total={totalQuestions}
              className="shrink-0 text-sm text-muted-foreground"
            />
            <RankingPoints
              points={entry.totalPoints}
              className="w-[4.5rem] shrink-0 justify-end text-base sm:w-20 sm:text-lg"
            />
          </li>
        );
      })}
    </ol>
  );
};

// Everyone's way back to the lobby, floating at the bottom of the screen in the middle, over the
// ranking as it scrolls: the admin's ends the game for the room, as their browser's back does.
// Centered by its row, not a transform, which the button's press uses
const BackToLobbyButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useLocale();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] [filter:drop-shadow(0_0.75rem_1.25rem_hsl(225_60%_2%/0.8))]">
      <Button
        onClick={onClick}
        className="pointer-events-auto h-12 w-full max-w-[16rem] text-base font-display font-extrabold sm:h-14 sm:max-w-[18rem] sm:text-lg"
      >
        {t.quiz.results.backToLobby}
      </Button>
    </div>
  );
};
