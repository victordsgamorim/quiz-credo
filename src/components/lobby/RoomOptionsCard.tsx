import { ArrowLeft, Radio, Users, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StaggerCards } from "@/components/ui/stagger-cards";
import type { CategoryId } from "@/constants/categories";
import { useLocale } from "@/contexts/LocaleContext";

type RoomOptionsCardProps = {
  isConnected: boolean;
  canCreateRoom: boolean;
  isShowingJoinInput: boolean;
  channelInput: string;
  guestName: string;
  onCreateRoom: () => void;
  onShowJoinInput: () => void;
  onHideJoinInput: () => void;
  onJoinChannel: () => void;
  onChannelInputChange: (value: string) => void;
  onGuestNameChange: (value: string) => void;
};

// The categories of the sample questions on the home screen's cards, the first one in the center
const SAMPLE_CATEGORIES = [
  "geography",
  "astronomy",
  "history",
  "music",
  "mathematics",
  "cinema",
  "biology",
  "art",
  "sports",
  "mythology",
  "literature",
  "chemistry",
] as const satisfies readonly CategoryId[];

const AUTO_ADVANCE_MS = 3500;

/*
 * Room creation and joining options: a spread of sample question cards with the room buttons
 * resting on the center card, or the form to join a room.
 */
// eslint-disable-next-line max-lines-per-function
export const RoomOptionsCard = ({
  isConnected,
  canCreateRoom,
  isShowingJoinInput,
  channelInput,
  guestName,
  onCreateRoom,
  onShowJoinInput,
  onHideJoinInput,
  onJoinChannel,
  onChannelInputChange,
  onGuestNameChange,
}: RoomOptionsCardProps) => {
  const { t } = useLocale();
  const handleChannelInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/\s/g, "");
    value = value.replace(/[OI01]/g, "");
    onChannelInputChange(value);
  };

  if (!isShowingJoinInput) {
    return (
      <div>
        <StaggerCards
          items={SAMPLE_CATEGORIES}
          getKey={(category) => category}
          renderCard={(category) => <SampleQuestion question={t.lobby.deck.questions[category]} />}
          label={t.lobby.deck.label}
          previousLabel={t.lobby.deck.previous}
          nextLabel={t.lobby.deck.next}
          autoAdvanceMs={AUTO_ADVANCE_MS}
          cardClassName="deck-card rounded-3xl p-5 sm:p-7"
        />

        {/* The room buttons rest on the foot of the center card */}
        <div className="room-actions relative z-30 mx-auto -mt-16 grid w-full max-w-[26rem] grid-cols-2 gap-3 sm:-mt-[4.75rem] sm:max-w-[32rem]">
          <Button
            onClick={onCreateRoom}
            disabled={!isConnected || !canCreateRoom}
            className="h-auto min-h-14 whitespace-normal px-3 py-2 text-base leading-tight sm:text-lg font-display font-extrabold [&_svg]:size-5"
          >
            <Radio aria-hidden="true" />
            {t.lobby.createRoom}
          </Button>

          <Button
            onClick={onShowJoinInput}
            disabled={!isConnected}
            variant="outline"
            className="h-auto min-h-14 whitespace-normal px-3 py-2 text-base leading-tight sm:text-lg font-display font-extrabold [&_svg]:size-5"
          >
            <Users aria-hidden="true" />
            {t.lobby.joinRoom}
          </Button>
        </div>

        {isConnected ? (
          <p className="mt-4 text-center text-sm text-muted-foreground">{t.lobby.subtitle}</p>
        ) : (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t.lobby.connectingToServer}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="glass-card p-4 sm:p-6">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onJoinChannel();
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t.lobby.joinRoom}</h2>
          <Button
            type="button"
            onClick={onHideJoinInput}
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" />
            {t.common.back}
          </Button>
        </div>
        <div className="space-y-2">
          <label htmlFor="join-guest-name" className="text-sm font-medium text-muted-foreground">
            {t.lobby.yourName}
          </label>
          <Input
            id="join-guest-name"
            type="text"
            placeholder={t.lobby.yourNamePlaceholder}
            value={guestName}
            onChange={(e) => onGuestNameChange(e.target.value)}
            className="h-12 text-base font-medium bg-secondary border-border/50 focus:border-primary focus:ring-primary"
            maxLength={30}
            autoComplete="nickname"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="join-room-code" className="text-sm font-medium text-muted-foreground">
            {t.lobby.enterRoomCode}
          </label>
          <Input
            id="join-room-code"
            type="text"
            placeholder={t.lobby.typeCode}
            value={channelInput}
            onChange={handleChannelInputChange}
            className="h-12 text-lg font-mono uppercase tracking-[0.3em] placeholder:font-sans placeholder:text-base placeholder:normal-case placeholder:tracking-normal bg-secondary border-border/50 focus:border-primary focus:ring-primary"
            disabled={!isConnected}
            maxLength={6}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
          />
        </div>

        <Button
          type="submit"
          disabled={!isConnected || !channelInput.trim() || !guestName.trim()}
          className="w-full h-12 text-lg font-display font-extrabold"
        >
          {!isConnected ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
              {t.lobby.reconnecting}
            </>
          ) : (
            <>
              <Radio className="w-5 h-5 mr-2" aria-hidden="true" />
              {t.lobby.joinRoom}
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};

// A sample question card: lit in the center, dimmed elsewhere (index.css). The bottom of the card
// is left clear for the room buttons resting on it.
const SampleQuestion = ({ question }: { question: string }) => (
  <p className="deck-card-question flex h-full items-center justify-center pb-10 text-center font-display text-lg font-extrabold leading-snug text-balance sm:pb-12 sm:text-2xl">
    {question}
  </p>
);
