import { useState, type ReactNode } from "react";

import { Hourglass, Loader2, Play, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FloatingElements } from "@/components/ui/floating-elements";
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

// The admin's buttons on the foot of the center card, as the home's room buttons
const FOOT_BUTTON_CLASS =
  "h-auto min-h-14 whitespace-normal px-3 py-2 text-base leading-tight sm:text-lg font-display font-extrabold [&_svg]:size-5";

/*
 * The screen between the lobby and the first question: the room's players over a deck of the game's rules,
 * one card each, with the room's settings, in the home screen's staggered cards. The admin's
 * buttons, to start the game or go back to the lobby, rest on the foot of the center card like the
 * home's room buttons; the guests see there that they're waiting for the admin.
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

  const playerNames = getPlayerNames(socket.channelDevices, playerName, isAdmin);

  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] animate-fade-in">
        <h1 className="sr-only">{t.quiz.rulesScreen.howToPlay}</h1>
        <div className="relative mb-2 flex max-w-full justify-center sm:mb-4">
          <img
            src="/assets/characters/ss-question.png"
            alt="Quiz character"
            className="h-[clamp(7rem,calc(100dvh-26.5rem),20rem)] w-auto max-w-full object-contain image-glow sm:h-[clamp(9rem,calc(100dvh-31rem),22rem)]"
          />
          <RoomPlayers names={playerNames} selfName={playerName} />
        </div>

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

          {isAdmin ? (
            <AdminActions socket={socket} onStart={onStart} onBackToLobby={onBackToLobby} />
          ) : (
            // Resting on the foot of the center card, where the admin's buttons are
            <div className="relative z-30 -mt-16 flex min-h-14 items-center justify-center sm:-mt-[4.75rem]">
              <WaitingForAdmin />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// The room's players by name, the player's own first, without the admin (who hosts, not plays);
// the player alone before the room is known
const getPlayerNames = (
  devices: { displayName?: string; role?: string }[] | undefined,
  playerName: string,
  isAdmin: boolean
) => {
  const others = (devices ?? [])
    .filter((device) => device.role !== "admin")
    .map((device) => device.displayName?.trim() ?? "")
    .filter((name) => name && name !== playerName);
  return [...(isAdmin ? [] : [playerName]), ...others].filter(Boolean);
};

// The room's players floating over the foot of the character, each name in a pill like the
// rankings' rows, the player's own in gold
const RoomPlayers = ({ names, selfName }: { names: string[]; selfName: string }) => {
  if (names.length === 0) return null;

  return (
    <FloatingElements className="absolute inset-x-0 bottom-0 z-10 translate-y-1/3 px-1">
      {names.map((name, index) => (
        <p
          key={`${name}-${index}`}
          className={`row-game flex max-w-[11rem] items-center gap-1.5 rounded-full px-3 py-1 ${
            name === selfName ? "row-game-me" : ""
          }`}
        >
          <UserRound className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate font-display text-sm font-extrabold">{name}</span>
        </p>
      ))}
    </FloatingElements>
  );
};

type AdminActionsProps = Pick<GameRulesScreenProps, "socket" | "onStart" | "onBackToLobby">;

// The admin's buttons, resting on the foot of the center card like the home's room buttons: the
// game's start, and the way back to the lobby, red as the lobby's button that closes the room (the
// game ends for the whole room)
const AdminActions = ({ socket, onStart, onBackToLobby }: AdminActionsProps) => {
  const { t } = useLocale();

  return (
    <div className="relative z-30 mx-auto -mt-16 grid w-full max-w-[26rem] grid-cols-2 gap-3 sm:-mt-[4.75rem] sm:max-w-[32rem]">
      <StartButton socket={socket} onStart={onStart} />
      <Button onClick={onBackToLobby} variant="destructive" className={FOOT_BUTTON_CLASS}>
        {t.quiz.rulesScreen.backToLobby}
      </Button>
    </div>
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
      className={FOOT_BUTTON_CLASS}
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
