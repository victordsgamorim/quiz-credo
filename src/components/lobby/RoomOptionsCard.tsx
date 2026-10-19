import { ArrowLeft, Radio, Users, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

/*
 * Card component with room creation and joining options.
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
      <Card className="glass-card p-4 sm:p-6">
        <div className="space-y-4">
          <div className="text-center mb-2">
            <p className="text-sm text-muted-foreground">{t.lobby.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={onCreateRoom}
              disabled={!isConnected || !canCreateRoom}
              className="h-auto min-h-24 whitespace-normal py-4 text-lg font-display font-semibold flex flex-col gap-1.5"
            >
              <Radio className="w-7 h-7" aria-hidden="true" />
              {t.lobby.createRoom}
              <span className="font-sans text-xs font-normal opacity-80">
                {t.lobby.createRoomDescription}
              </span>
            </Button>

            <Button
              onClick={onShowJoinInput}
              disabled={!isConnected}
              variant="outline"
              className="h-auto min-h-24 whitespace-normal py-4 text-lg font-display font-semibold flex flex-col gap-1.5"
            >
              <Users className="w-7 h-7" aria-hidden="true" />
              {t.lobby.joinRoom}
              <span className="font-sans text-xs font-normal opacity-80">
                {t.lobby.joinRoomDescription}
              </span>
            </Button>
          </div>

          {!isConnected && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.lobby.connectingToServer}
            </div>
          )}
        </div>
      </Card>
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
            autoFocus
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
          className="w-full h-12 text-lg font-display font-semibold"
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
