import { Wifi, WifiOff, Radio, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/contexts/LocaleContext";

type ConnectionStatusCardProps = {
  isConnected: boolean;
  isPageVisible: boolean;
  isReturningUser: boolean;
  currentChannel: string | null;
  deviceId: string | null;
  isAdmin: boolean;
  onResetSession: () => void;
};

/*
 * Card component displaying WebSocket connection status.
 */
// eslint-disable-next-line max-lines-per-function, complexity
export const ConnectionStatusCard = ({
  isConnected,
  isPageVisible,
  isReturningUser,
  currentChannel,
  deviceId,
  isAdmin,
  onResetSession,
}: ConnectionStatusCardProps) => {
  const { t } = useLocale();
  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <div className="p-2 rounded-lg bg-success/10">
                <Wifi className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium">{t.lobby.connected}</p>
                <p className="text-xs text-muted-foreground">
                  {isPageVisible ? t.lobby.active : t.lobby.background}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-2 rounded-lg bg-destructive/10">
                <WifiOff className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium">{t.lobby.disconnected}</p>
                <p className="text-xs text-muted-foreground">{t.lobby.tryingToReconnect}</p>
              </div>
            </>
          )}
        </div>
        {isConnected && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {deviceId ? `${t.lobby.deviceId}: ${deviceId.substring(0, 12)}` : t.lobby.deviceId}
            </Badge>
            <Badge
              variant={isAdmin ? "default" : "secondary"}
              className="text-xs uppercase tracking-wide"
            >
              {isAdmin ? t.lobby.admin.toUpperCase() : t.lobby.guest.toUpperCase()}
            </Badge>
            <Button
              onClick={onResetSession}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              title={t.lobby.resetSessionTooltip}
            >
              {t.common.reset}
            </Button>
          </div>
        )}
      </div>

      {isReturningUser && !currentChannel && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-3">
          <CheckCircle2 className="w-4 h-4 text-blue-500" />
          <p className="text-sm text-blue-700 dark:text-blue-400">{t.lobby.sessionRestored}</p>
        </div>
      )}

      {!isPageVisible && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Radio className="w-4 h-4 text-amber-500" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {t.lobby.backgroundConnectionMessage}
          </p>
        </div>
      )}
    </Card>
  );
};
