import { Radio, Users, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/contexts/LocaleContext";

type RoomOptionsCardProps = {
  isConnected: boolean;
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
      <Card className="glass-card p-6">
        <div className="space-y-4">
          <div className="text-center mb-2">
            <p className="text-sm text-muted-foreground">{t.lobby.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={onCreateRoom}
              disabled={!isConnected}
              className="h-24 text-lg font-display font-semibold bg-primary text-primary-foreground hover:bg-primary/90 flex flex-col gap-2"
            >
              <Radio className="w-8 h-8" />
              {t.lobby.createRoom}
              <span className="text-xs font-normal opacity-80">
                {t.lobby.createRoomDescription}
              </span>
            </Button>

            <Button
              onClick={onShowJoinInput}
              disabled={!isConnected}
              variant="outline"
              className="h-24 text-lg font-display font-semibold flex flex-col gap-2"
            >
              <Users className="w-8 h-8" />
              {t.lobby.joinRoom}
              <span className="text-xs font-normal opacity-80">{t.lobby.joinRoomDescription}</span>
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
    <Card className="glass-card p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-muted-foreground">
            {t.lobby.enterRoomCode}
          </label>
          <Button onClick={onHideJoinInput} variant="ghost" size="sm" className="h-7 px-2 text-xs">
            {t.common.back}
          </Button>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">{t.lobby.yourName}</label>
          <Input
            type="text"
            placeholder={t.lobby.yourNamePlaceholder}
            value={guestName}
            onChange={(e) => onGuestNameChange(e.target.value)}
            className="h-12 text-base font-medium bg-secondary border-border/50 focus:border-primary focus:ring-primary"
            maxLength={30}
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={t.lobby.typeCode}
            value={channelInput}
            onChange={handleChannelInputChange}
            onKeyDown={(e) => e.key === "Enter" && onJoinChannel()}
            className="h-12 text-lg font-mono tracking-widest bg-secondary border-border/50 focus:border-primary focus:ring-primary"
            disabled={!isConnected}
            maxLength={6}
          />
        </div>

        <Button
          onClick={onJoinChannel}
          disabled={!isConnected || !channelInput.trim() || !guestName.trim()}
          className="w-full h-12 text-lg font-display font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {!isConnected ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {t.lobby.reconnecting}
            </>
          ) : (
            <>
              <Radio className="w-5 h-5 mr-2" />
              {t.lobby.joinRoom}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
