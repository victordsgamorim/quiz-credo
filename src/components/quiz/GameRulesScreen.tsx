import { useState, type ReactNode } from "react";

import { ArrowLeft, Hourglass, Loader2, Play, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StaggerCards } from "@/components/ui/stagger-cards";
import { useBackgroundMusicContext } from "@/contexts/BackgroundMusicContext";
import { useLocale } from "@/contexts/LocaleContext";
import type { useSocket } from "@/hooks/useSocket";
import { DEFAULT_GAME_SETTINGS, type GameSettings } from "@/types/gameSettings";
import { getPowerUpSettings } from "@/types/powerUpSettings";

import {
  CategoriesRule,
  DifficultyRule,
  PowerUpsRule,
  QuestionsRule,
  StreakRule,
  TimerRule,
} from "./GameRuleCards";

type GameRulesScreenProps = {
  onStart: () => Promise<void>;
  onBackToLobby: () => void;
  socket: ReturnType<typeof useSocket>;
  playerName: string;
};

const RULE_IDS = ["questions", "timer", "streak", "difficulty", "categories", "powerUps"] as const;
type RuleId = (typeof RULE_IDS)[number];
type DeckCard = { ruleId: RuleId; round: number };

// Every rule twice: 12 cards like the home's deck, enough to fill the row on wide screens, so the
// card StaggerCards moves from one end of the row to the other makes the jump off-screen
const DECK: DeckCard[] = [0, 1].flatMap((round) => RULE_IDS.map((ruleId) => ({ ruleId, round })));

// A little slower than the home's deck: a rule takes longer to read than a sample question
const AUTO_ADVANCE_MS = 5000;

const getRuleCards = (
  settings: GameSettings,
  categoryIds: string[]
): Record<RuleId, ReactNode> => ({
  questions: <QuestionsRule count={settings.questionCount} />,
  timer: <TimerRule seconds={settings.timerDuration} />,
  streak: <StreakRule threshold={settings.streakThreshold} />,
  difficulty: <DifficultyRule />,
  categories: <CategoriesRule categoryIds={categoryIds} />,
  powerUps: <PowerUpsRule settings={getPowerUpSettings(settings)} />,
});

/*
 * The screen between the lobby and the first question: the host over a deck of the game's rules,
 * one card each, with the room's settings, in the home screen's staggered cards. The admin's start
 * button rests on the foot of the center card, like the home's room buttons; the guests see there
 * that they're waiting for it.
 */
export const GameRulesScreen = ({
  onStart,
  onBackToLobby,
  socket,
  playerName,
}: GameRulesScreenProps) => {
  const isAdmin = socket.selfRole === "admin";
  const { t } = useLocale();
  // StaggerCards keeps the items it got first, so the deck only names the rules and their cards
  // come from the latest settings on every render
  const cards = getRuleCards(
    socket.gameSettings ?? DEFAULT_GAME_SETTINGS,
    // The questions come from the room's 10 most voted categories (Index)
    socket.categoryTotals.slice(0, 10).map((category) => category.name)
  );

  return (
    <div className="min-h-dvh flex flex-col">
      <RulesHeader isAdmin={isAdmin} playerName={playerName} onBackToLobby={onBackToLobby} />

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] animate-fade-in">
        <h1 className="sr-only">{t.quiz.rulesScreen.howToPlay}</h1>
        <img
          src="/assets/characters/ss-question.png"
          alt="Quiz character"
          className="mb-2 h-[clamp(7rem,calc(100dvh-26.5rem),20rem)] w-auto max-w-full object-contain image-glow sm:mb-4 sm:h-[clamp(9rem,calc(100dvh-31rem),22rem)]"
        />

        <div className="w-full max-w-2xl">
          <StaggerCards
            items={DECK}
            getKey={(card) => `${card.ruleId}-${card.round}`}
            renderCard={(card) => cards[card.ruleId]}
            label={t.quiz.rulesScreen.howToPlay}
            previousLabel={t.quiz.rulesScreen.previous}
            nextLabel={t.quiz.rulesScreen.next}
            autoAdvanceMs={AUTO_ADVANCE_MS}
            className="rule-deck"
            cardClassName="deck-card rounded-3xl px-4 pb-12 pt-7 sm:px-6 sm:pb-14 sm:pt-9"
          />

          {/* Resting on the foot of the center card, like the home's room buttons */}
          <div className="relative z-30 -mt-16 flex min-h-14 items-center justify-center sm:-mt-[4.75rem]">
            {isAdmin ? <StartButton socket={socket} onStart={onStart} /> : <WaitingForAdmin />}
          </div>
        </div>
      </main>
    </div>
  );
};

type RulesHeaderProps = {
  isAdmin: boolean;
  playerName: string;
  onBackToLobby: () => void;
};

// The admin's way back to the lobby, and the player's name in a gold slot, like their own row in
// the rankings
const RulesHeader = ({ isAdmin, playerName, onBackToLobby }: RulesHeaderProps) => {
  const { t } = useLocale();

  return (
    <header className="mx-auto grid w-full max-w-3xl grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="justify-self-start">
        {isAdmin && (
          <Button
            onClick={onBackToLobby}
            variant="outline"
            size="icon"
            className="h-9 w-9"
            title={t.lobby.backToLobbyTooltip}
            aria-label={t.lobby.backToLobby}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex min-w-0 justify-center">
        {playerName && (
          <p className="row-game row-game-me flex min-w-0 items-center gap-2 rounded-full px-4 py-1.5">
            <UserRound className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate font-display text-base font-extrabold">{playerName}</span>
          </p>
        )}
      </div>
      <div aria-hidden="true" />
    </header>
  );
};

type StartButtonProps = Pick<GameRulesScreenProps, "socket" | "onStart">;

const StartButton = ({ socket, onStart }: StartButtonProps) => {
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const { stopIntroMusic } = useBackgroundMusicContext();

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
    // Busy while the game loads: disabled, but solid gold over the card, with its spinner
    <Button
      onClick={() => void handleStart()}
      disabled={isLoading}
      aria-busy={isLoading}
      className="h-14 w-full max-w-[17rem] text-lg font-display font-extrabold sm:max-w-[20rem] [&_svg]:size-5"
    >
      {isLoading ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <Play aria-hidden="true" />
      )}
      {t.quiz.rulesScreen.startButton}
    </Button>
  );
};

// A pill sunk into the table like the rankings' rows, so it doesn't read as a button
const WaitingForAdmin = () => {
  const { t } = useLocale();

  return (
    <p className="row-game flex items-center gap-2 rounded-full px-4 py-2 text-center text-sm font-bold text-balance">
      <Hourglass className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      {t.quiz.rulesScreen.waitingForAdmin}
    </p>
  );
};
