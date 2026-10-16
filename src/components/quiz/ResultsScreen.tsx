import { Medal, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import type { useSocket, RankingEntry } from "@/hooks/useSocket";

type ResultsScreenProps = {
  playerName: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  ranking: RankingEntry[];
  socket: ReturnType<typeof useSocket>;
  onBackToLobby: () => void;
};

const TROPHY_IMAGES: Record<number, { src: string; alt: string }> = {
  1: { src: "/assets/images/trophies/trophy-1st.png", alt: "1st place trophy" },
  2: { src: "/assets/images/trophies/throphy-2nd.png", alt: "2nd place trophy" },
  3: { src: "/assets/images/trophies/throphy-3rd.png", alt: "3rd place trophy" },
};

const renderMedalIcon = (position: number, className = "w-10 h-10") => {
  const trophy = TROPHY_IMAGES[position];
  if (trophy) {
    return <img src={trophy.src} alt={trophy.alt} className={`${className} object-contain`} />;
  }
  return <Medal className="w-7 h-7 text-muted-foreground" aria-hidden="true" />;
};

export const ResultsScreen = ({
  playerName,
  score,
  correctAnswers,
  totalQuestions,
  ranking,
  socket,
  onBackToLobby,
}: ResultsScreenProps) => {
  const { t } = useLocale();
  const isAdmin = socket.selfRole === "admin";
  const myRanking = ranking.find((entry) => entry.deviceId === socket.deviceId);
  // Filter out admin from ranking display
  const filteredRanking = ranking.filter((entry) => entry.role !== "admin");
  const hasRanking = filteredRanking.length > 0;

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="sticky top-0 z-20 border-b border-primary/10 bg-background/80 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 min-h-16">
          <div>
            {isAdmin && (
              <Button
                onClick={onBackToLobby}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                title={t.lobby.backToLobbyTooltip}
                aria-label={t.lobby.backToLobbyTooltip}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
          </div>
          <h2 className="text-center text-xl font-bold gold-text font-display truncate">
            {t.quiz.results.title}
          </h2>
          <div aria-hidden="true" />
        </div>
      </div>

      <main className="flex-1 px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pt-8">
        <div className="mx-auto w-full max-w-3xl space-y-4 sm:space-y-6">
          {!isAdmin && (
            <section className="glass-card p-5 sm:p-6">
              {myRanking && (
                <div className="text-center mb-5">
                  <div className="flex justify-center items-center gap-2 mb-1">
                    {renderMedalIcon(myRanking.position, "w-12 h-12")}
                    <span className="text-4xl font-bold font-display tabular-nums">
                      #{myRanking.position}
                    </span>
                  </div>
                  <p className="text-lg truncate">{playerName}</p>
                </div>
              )}
              <div className="grid grid-cols-2 divide-x divide-border text-center">
                <div>
                  <p className="text-2xl font-bold tabular-nums">{score}</p>
                  <p className="text-sm text-muted-foreground">{t.quiz.results.points}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {correctAnswers}/{totalQuestions}
                  </p>
                  <p className="text-sm text-muted-foreground">{t.quiz.results.correct}</p>
                </div>
              </div>
            </section>
          )}

          <section className="glass-card p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-center">
              {t.quiz.results.ranking}
            </h3>

            {hasRanking ? (
              <ol className="space-y-2">
                {filteredRanking.map((entry) => {
                  const isMe = entry.deviceId === socket.deviceId;
                  return (
                    <li
                      key={entry.deviceId}
                      aria-current={isMe ? "true" : undefined}
                      className={`flex items-center gap-3 rounded-lg p-3 sm:p-4 ${
                        isMe
                          ? "bg-primary/20 border-2 border-primary"
                          : "bg-black/20 border-2 border-transparent"
                      }`}
                    >
                      <div className="flex w-12 shrink-0 items-center justify-center">
                        {entry.position <= 3 ? (
                          renderMedalIcon(entry.position)
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground tabular-nums">
                            #{entry.position}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{entry.displayName}</p>
                        <p className="text-sm text-muted-foreground tabular-nums">
                          {entry.correctAnswers}/{entry.totalAnswers} ({entry.accuracy}%)
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xl sm:text-2xl font-bold tabular-nums">
                          {entry.totalPoints}
                        </p>
                        <p className="text-xs text-muted-foreground">{t.quiz.results.points}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-sm text-center text-muted-foreground">
                {t.quiz.results.noRanking}
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
