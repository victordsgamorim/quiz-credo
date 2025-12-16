import { useState } from "react";

import { CheckCircle2, Copy, Check, Users, Shield } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/contexts/LocaleContext";

type ActiveRoomCardProps = {
  currentChannel: string | null;
  channelInput: string;
  totalDevices: number;
  isAdmin: boolean;
  onLeaveChannel: () => void;
};

/*
 * Card component displaying active room information and controls.
 */
// eslint-disable-next-line max-lines-per-function
export const ActiveRoomCard = ({
  currentChannel,
  channelInput,
  totalDevices,
  isAdmin,
  onLeaveChannel,
}: ActiveRoomCardProps) => {
  const [hasCopied, setHasCopied] = useState(false);

  const { t } = useLocale();

  const handleCopyChannelId = () => {
    if (currentChannel) {
      void navigator.clipboard.writeText(currentChannel);
      setHasCopied(true);
      toast.success(t.lobby.codeCopied);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <Card className="glass-card p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium">{t.lobby.roomCreated}</p>
              <p className="text-xs text-muted-foreground">{t.lobby.shareCodeDescription}</p>
            </div>
          </div>
          <Button onClick={onLeaveChannel} variant="ghost" size="sm">
            {t.lobby.leaveRoom}
          </Button>
        </div>

        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 rounded-xl p-6">
          <div className="text-center space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{t.lobby.roomCode}</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-5xl font-bold tracking-[0.3em] gold-text select-all">
                {currentChannel || channelInput}
              </span>
              <Button
                onClick={handleCopyChannelId}
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0"
                title={t.lobby.copyCode}
              >
                {hasCopied ? (
                  <Check className="w-5 h-5 text-success" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t.lobby.shareCodeDescription}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center p-3 rounded-lg bg-secondary/50">
          <Users className="w-4 h-4" />
          <span>
            {totalDevices} {totalDevices === 1 ? t.lobby.device : t.lobby.devices}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
          <Shield className="w-4 h-4" />
          <span>{isAdmin ? t.lobby.adminInfo : t.lobby.guestInfo}</span>
        </div>
      </div>
    </Card>
  );
};
