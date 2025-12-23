import { Medal } from "lucide-react";

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

const renderMedalIcon = (position: number) => {
  if (position === 1) {
    return (
      <img
        src="/assets/images/trophies/trophy-1st.png"
        alt="1st place trophy"
        className="w-10 h-10 object-contain"
      />
    );
  }
  if (position === 2) {
    return (
      <img
        src="/assets/images/trophies/throphy-2nd.png"
        alt="2nd place trophy"
        className="w-10 h-10 object-contain"
      />
    );
  }
  if (position === 3) {
    return (
      <img
        src="/assets/images/trophies/throphy-3rd.png"
        alt="3rd place trophy"
        className="w-10 h-10 object-contain"
      />
    );
  }
  return <Medal className="w-7 h-7 text-gray-400" />;
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
  const hasRanking = ranking.length > 0;

  return (
    <div className="min-h-screen game-background p-4 overflow-y-auto">
      <div className="glass-card p-6 mb-6">
        <h2 className="text-3xl font-bold text-center mb-4 gold-text">{t.quiz.results.title}</h2>

        {myRanking && (
          <div className="text-center mb-6">
            <div className="flex justify-center items-center gap-2 mb-2">
              {renderMedalIcon(myRanking.position)}
              <span className="text-4xl font-bold">#{myRanking.position}</span>
            </div>
            <p className="text-xl">{playerName}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{score}</p>
            <p className="text-sm text-gray-400">{t.quiz.results.points}</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {correctAnswers}/{totalQuestions}
            </p>
            <p className="text-sm text-gray-400">{t.quiz.results.correct}</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 mb-6">
        <h3 className="text-2xl font-bold mb-4 text-center">{t.quiz.results.ranking}</h3>

        {hasRanking ? (
          <div className="space-y-2">
            {ranking.map((entry) => (
              <div
                key={entry.deviceId}
                className={`p-4 rounded-lg ${
                  entry.deviceId === socket.deviceId
                    ? "bg-primary/20 border-2 border-primary"
                    : "bg-black/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold w-8">#{entry.position}</span>
                    {renderMedalIcon(entry.position)}
                    <div>
                      <p className="font-semibold">{entry.displayName}</p>
                      <p className="text-sm text-gray-400">
                        {entry.correctAnswers}/{entry.totalAnswers} • {entry.accuracy}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{entry.totalPoints}</p>
                    <p className="text-xs text-gray-400">{t.quiz.results.points}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center text-muted-foreground">{t.quiz.results.noRanking}</p>
        )}
      </div>

      {isAdmin && (
        <div className="flex gap-4">
          <Button onClick={onBackToLobby} className="flex-1">
            {t.quiz.results.backToLobby}
          </Button>
        </div>
      )}
    </div>
  );
};
