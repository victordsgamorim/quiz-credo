import { useState } from "react";

import { Trophy, Clock, Target, Zap, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import type { useSocket } from "@/hooks/useSocket";

type GameRulesScreenProps = {
  onStart: () => Promise<void>;
  onBackToLobby: () => void;
  socket: ReturnType<typeof useSocket>;
  playerName: string;
};

/*
 * Game rules screen component showing pre-game instructions, selected categories, and player welcome message.
 */
// eslint-disable-next-line max-lines-per-function
export const GameRulesScreen = ({
  onStart,
  onBackToLobby,
  socket,
  playerName,
}: GameRulesScreenProps) => {
  const { selfRole, categoryTotals } = socket;
  const isAdmin = selfRole === "admin";
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  const topCategories = categoryTotals.slice(0, 10);
  const hasCategories = topCategories.length > 0;

  const handleStart = async () => {
    setIsLoading(true);
    try {
      if (typeof socket.startGame === "function") {
        socket.startGame();
      }
      await onStart();
    } catch (error) {
      console.error("[GameRulesScreen] Error starting game:", error);
      const errorMessage = error instanceof Error ? error.message : t.quiz.errors.fetchQuestions;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Back to Lobby Button */}
        {isAdmin && (
          <Button
            onClick={onBackToLobby}
            variant="ghost"
            className="mb-4 text-muted-foreground hover:text-foreground"
            title={t.lobby.backToLobbyTooltip}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.lobby.backToLobby}
          </Button>
        )}

        {/* Logo/Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-4">
            <span className="gold-text">QuizCredo</span>
          </h1>
          <p className="text-muted-foreground text-lg">{t.quiz.rulesScreen.subtitle}</p>
        </div>

        {/* Welcome Message */}
        <div className="glass-card p-6 mb-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-primary mr-2" />
            <h2 className="font-display text-2xl font-semibold gold-text">{playerName}</h2>
            <Sparkles className="w-6 h-6 text-primary ml-2" />
          </div>
          <p className="text-lg font-medium text-foreground">{t.quiz.rulesScreen.welcomeMessage}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t.quiz.rulesScreen.challengeMessage}
          </p>
        </div>

        {/* Selected Categories */}
        {hasCategories && (
          <div className="glass-card p-6 mb-6">
            <h3 className="font-display text-lg font-semibold mb-3 text-center">
              {t.quiz.rulesScreen.selectedCategories}
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {topCategories.map((category) => (
                <Badge
                  key={category.name}
                  variant="secondary"
                  className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20"
                >
                  {t.lobby.categoryNames[category.name as keyof typeof t.lobby.categoryNames] ||
                    category.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Game Rules */}
        <div className="glass-card p-6 mb-8">
          <h2 className="font-display text-xl font-semibold mb-4 text-center">
            {t.quiz.rulesScreen.howToPlay}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{t.quiz.rulesScreen.stats.questions.value}</p>
                <p className="text-xs text-muted-foreground">
                  {t.quiz.rulesScreen.stats.questions.description}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-sm">{t.quiz.rulesScreen.stats.timer.value}</p>
                <p className="text-xs text-muted-foreground">
                  {t.quiz.rulesScreen.stats.timer.description}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Trophy className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-sm">{t.quiz.rulesScreen.stats.points.value}</p>
                <p className="text-xs text-muted-foreground">
                  {t.quiz.rulesScreen.stats.points.description}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Zap className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-sm">{t.quiz.rulesScreen.stats.difficulty.value}</p>
                <p className="text-xs text-muted-foreground">
                  {t.quiz.rulesScreen.stats.difficulty.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button - Only for Admin */}
        {isAdmin && (
          <Button
            onClick={() => void handleStart()}
            disabled={isLoading}
            className="w-full h-14 text-lg font-display font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gold-glow animate-pulse-glow disabled:opacity-50 disabled:animate-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t.common.loading}
              </>
            ) : (
              t.quiz.rulesScreen.startButton
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
