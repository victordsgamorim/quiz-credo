import { Trophy, Target, RotateCcw, Medal, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { GameState, PlayerHistory } from "@/types/quiz";

type ResultScreenProps = {
  gameState: GameState;
  playerStats: PlayerHistory | null;
  ranking: PlayerHistory[];
  onPlayAgain: () => void;
};

/*
 * Result screen component displaying game statistics and ranking.
 */
// eslint-disable-next-line max-lines-per-function
export const ResultScreen = ({
  gameState,
  playerStats,
  ranking,
  onPlayAgain,
}: ResultScreenProps) => {
  const { t } = useLocale();
  const correctAnswers = gameState.answers.filter((a) => a.isCorrect).length;
  const totalQuestions = gameState.answers.length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const playerRank = ranking.findIndex((p) => p.playerName === gameState.playerName) + 1;

  const getPerformanceMessage = () => {
    if (accuracy >= 90)
      return { text: t.quiz.results.performance.excellent, color: "text-success" };
    if (accuracy >= 70) return { text: t.quiz.results.performance.good, color: "text-primary" };
    if (accuracy >= 50) return { text: t.quiz.results.performance.solid, color: "text-accent" };
    return { text: t.quiz.results.performance.keepTrying, color: "text-muted-foreground" };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Score Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4 animate-bounce-in">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">
            {t.quiz.results.finishTitle}
          </h1>
          <p className={`text-lg ${performance.color}`}>{performance.text}</p>
        </div>

        {/* Score Card */}
        <div className="glass-card p-6 mb-6 text-center gold-glow">
          <p className="text-muted-foreground mb-2">{t.quiz.results.yourScore}</p>
          <p className="text-5xl sm:text-6xl font-display font-bold gold-text mb-4">
            {gameState.score}
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-success" />
              <span>
                {correctAnswers}/{totalQuestions} {t.quiz.results.correctAnswers.toLowerCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span>
                {accuracy}% {t.quiz.results.statLabels.accuracy.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Player Stats */}
        {playerStats && (
          <div className="glass-card p-6 mb-6">
            <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <Medal className="w-5 h-5 text-primary" />
              {t.quiz.results.stats}
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t.quiz.results.statLabels.gamesPlayed}</p>
                <p className="font-bold text-lg">{playerStats.totalGames}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t.quiz.results.statLabels.bestScore}</p>
                <p className="font-bold text-lg gold-text">{playerStats.bestScore}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t.quiz.results.statLabels.averageScore}</p>
                <p className="font-bold text-lg">{Math.round(playerStats.averageScore)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t.quiz.results.statLabels.accuracy}</p>
                <p className="font-bold text-lg">
                  {playerStats.questionsAnswered > 0
                    ? Math.round(
                        (playerStats.questionsCorrect / playerStats.questionsAnswered) * 100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ranking */}
        {ranking.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              {t.quiz.results.ranking}
              {playerRank > 0 && (
                <span className="ml-auto text-sm text-muted-foreground">
                  {t.quiz.results.position} #{playerRank}
                </span>
              )}
            </h2>
            <div className="space-y-3">
              {ranking.slice(0, 5).map((player, index) => (
                <div
                  key={player.playerName}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    player.playerName === gameState.playerName
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-secondary/50"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? "bg-primary text-primary-foreground"
                        : index === 1
                          ? "bg-muted-foreground/30 text-foreground"
                          : index === 2
                            ? "bg-orange-600/30 text-orange-400"
                            : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="flex-1 font-medium truncate">{player.playerName}</span>
                  <span className="font-bold gold-text">{player.bestScore}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Play Again Button */}
        <Button
          onClick={onPlayAgain}
          className="w-full h-14 text-lg font-display font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gold-glow animate-pulse-glow"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          {t.quiz.results.playAgain}
        </Button>
      </div>
    </div>
  );
};
