import { useState } from "react";

import { Trophy, Clock, Target, Zap, ArrowLeft, Sparkles, Loader2, Play } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBackgroundMusicContext } from "@/contexts/BackgroundMusicContext";
import { interpolate, useLocale } from "@/contexts/LocaleContext";
import type { useSocket } from "@/hooks/useSocket";
import { MAX_STREAK_MULTIPLIER } from "@/lib/scoring";
import { DEFAULT_GAME_SETTINGS } from "@/types/gameSettings";

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
  const streakThreshold =
    socket.gameSettings?.streakThreshold ?? DEFAULT_GAME_SETTINGS.streakThreshold;
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const { stopIntroMusic } = useBackgroundMusicContext();

  const topCategories = categoryTotals.slice(0, 10);
  const hasCategories = topCategories.length > 0;

  const handleStart = async () => {
    setIsLoading(true);
    stopIntroMusic();
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
    <div className="min-h-dvh flex flex-col">
      <div className="sticky top-0 z-20 border-b border-primary/10 bg-background/80 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="mx-auto w-full max-w-lg px-4 py-3 grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 min-h-16">
          <div className="flex items-center justify-self-start">
            {isAdmin && (
              <Button
                onClick={onBackToLobby}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                title={t.lobby.backToLobbyTooltip}
                aria-label={t.lobby.backToLobby}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="flex min-w-0 items-center justify-center justify-self-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate font-display text-base font-semibold gold-text">
              {playerName}
            </span>
            <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          </div>
          <div aria-hidden="true" />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-4 pb-6">
        <div className="w-full max-w-lg animate-fade-in">
          {/* Logo/Title */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex w-full justify-center">
              <img
                src="/assets/characters/ss-question.png"
                alt="Quiz character"
                className="w-auto max-w-[min(100%,360px)] max-h-[32dvh] sm:max-h-[36dvh] h-auto object-contain image-glow"
              />
            </div>
          </div>

          {/* Selected Categories */}
          {hasCategories && (
            <div className="glass-card p-5 sm:p-6 mb-4 sm:mb-6">
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
          <div className="glass-card p-5 sm:p-6">
            <h2 className="font-display text-xl font-semibold mb-4 text-center">
              {t.quiz.rulesScreen.howToPlay}
            </h2>
            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-4">
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
                    {interpolate(t.quiz.rulesScreen.stats.points.description, {
                      count: streakThreshold,
                      max: MAX_STREAK_MULTIPLIER,
                    })}
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
        </div>
      </div>

      {isAdmin && (
        <div className="sticky bottom-0 z-20 border-t border-primary/10 bg-background/85 backdrop-blur px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto w-full max-w-lg">
            <Button
              onClick={() => void handleStart()}
              disabled={isLoading}
              aria-label={t.quiz.rulesScreen.startButton}
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-display font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gold-glow"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <Play className="h-5 w-5" aria-hidden="true" />
              )}
              {t.quiz.rulesScreen.startButton}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
