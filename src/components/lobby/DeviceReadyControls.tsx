import { Check, Clock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";

type ReadyDevice = {
  id: string;
  isReady?: boolean;
  isActive: boolean;
};

type DeviceReadyControlsProps = {
  device: ReadyDevice;
  canRemoveGuest: boolean;
  onRemoveGuest: (deviceId: string) => void;
  onToggleReadyState: (deviceId: string, nextState: boolean) => void;
  isGameStarted: boolean;
  showReadyToggle?: boolean;
  canToggleReady: boolean;
  showReadyBadge?: boolean;
  isCurrentDevice: boolean;
};

// Another player's readiness, in a pill like the game's badges: green once ready
const ReadyStatusBadge = ({ isReady }: { isReady: boolean }) => {
  const { t } = useLocale();
  const Icon = isReady ? Check : Clock;

  return (
    <span
      className={cn(
        "badge-game flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold",
        isReady ? "badge-game-success" : "badge-game-navy text-muted-foreground"
      )}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={3} />
      {isReady ? t.lobby.ready : t.lobby.notReady}
    </span>
  );
};

// The player's own readiness: "Estou pronto" until they are, then green "Pronto"
const ReadyToggleButton = ({
  device,
  canToggleReady,
  isGameStarted,
  onToggleReadyState,
}: {
  device: ReadyDevice;
  canToggleReady: boolean;
  isGameStarted: boolean;
  onToggleReadyState: (deviceId: string, nextState: boolean) => void;
}) => {
  const { t } = useLocale();
  const getTitle = () => {
    if (canToggleReady) {
      return t.lobby.readyToggle.tooltip.changeStatus;
    }
    if (isGameStarted) {
      return t.lobby.readyToggle.tooltip.gameStarted;
    }
    return t.lobby.readyToggle.tooltip.onlySelf;
  };

  return (
    <Button
      onClick={() => onToggleReadyState(device.id, !device.isReady)}
      variant={device.isReady ? "success" : "outline"}
      size="sm"
      disabled={!canToggleReady}
      title={getTitle()}
      aria-pressed={!!device.isReady}
      className="font-display font-extrabold"
    >
      <Check aria-hidden="true" strokeWidth={3} />
      {device.isReady ? t.lobby.ready : t.lobby.readyToggle.markReady}
    </Button>
  );
};

// Round like the dialogs' close button, in red
const RemoveGuestButton = ({
  device,
  canRemoveGuest,
  onRemoveGuest,
}: {
  device: ReadyDevice;
  canRemoveGuest: boolean;
  onRemoveGuest: (deviceId: string) => void;
}) => {
  const { t } = useLocale();
  return canRemoveGuest ? (
    <button
      type="button"
      onClick={() => onRemoveGuest(device.id)}
      title={t.lobby.removeGuest}
      aria-label={t.lobby.removeGuest}
      className="close-game shrink-0 text-destructive hover:!text-destructive"
    >
      <X aria-hidden="true" className="h-4 w-4" strokeWidth={3} />
    </button>
  ) : null;
};

/*
 * A player's readiness at the end of their row: a button for the player's own, a pill for the
 * others'; and, for the admin, the button that removes a guest from the room.
 */
export const DeviceReadyControls = ({
  device,
  canRemoveGuest,
  onRemoveGuest,
  onToggleReadyState,
  isGameStarted,
  showReadyToggle = true,
  canToggleReady,
  showReadyBadge = true,
  isCurrentDevice,
}: DeviceReadyControlsProps) => {
  const shouldShowToggleButton = showReadyToggle && isCurrentDevice;

  return (
    <div className="flex shrink-0 items-center gap-2">
      {showReadyBadge && !isCurrentDevice && <ReadyStatusBadge isReady={!!device.isReady} />}
      {shouldShowToggleButton && (
        <ReadyToggleButton
          device={device}
          canToggleReady={canToggleReady}
          isGameStarted={isGameStarted}
          onToggleReadyState={onToggleReadyState}
        />
      )}
      <RemoveGuestButton
        device={device}
        canRemoveGuest={canRemoveGuest}
        onRemoveGuest={onRemoveGuest}
      />
    </div>
  );
};
