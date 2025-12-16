import { Check, Clock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";

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
  selfRole: "admin" | "guest";
  isCurrentDevice: boolean;
};

const ReadyStatusIcon = ({ isReady }: { isReady: boolean }) => {
  return isReady ? (
    <Check className="h-4 w-4 text-success" />
  ) : (
    <Clock className="h-4 w-4 text-muted-foreground" />
  );
};

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
      variant={device.isReady ? "default" : "outline"}
      size="icon"
      disabled={!canToggleReady}
      title={getTitle()}
      className="h-7 w-7"
    >
      {device.isReady ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
    </Button>
  );
};

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
    <Button
      onClick={() => onRemoveGuest(device.id)}
      variant="ghost"
      size="icon"
      title={t.lobby.removeGuest}
      className="h-7 w-7 text-destructive hover:bg-destructive/10"
    >
      <X className="h-4 w-4" />
    </Button>
  ) : null;
};

const ActiveStatusText = ({
  isActive,
  selfRole,
}: {
  isActive: boolean;
  selfRole: "admin" | "guest";
}) => {
  const { t } = useLocale();
  if (selfRole !== "admin") return null;
  return <span>{isActive ? t.lobby.active : t.lobby.background}</span>;
};

const OtherUserReadyStatus = ({
  isReady,
  showReadyBadge,
  isCurrentDevice,
}: {
  isReady: boolean;
  showReadyBadge: boolean;
  isCurrentDevice: boolean;
}) => {
  if (!showReadyBadge || isCurrentDevice) return null;
  return <ReadyStatusIcon isReady={isReady} />;
};

export const DeviceReadyControls = ({
  device,
  canRemoveGuest,
  onRemoveGuest,
  onToggleReadyState,
  isGameStarted,
  showReadyToggle = true,
  canToggleReady,
  showReadyBadge = true,
  selfRole,
  isCurrentDevice,
}: DeviceReadyControlsProps) => {
  const shouldShowToggleButton = showReadyToggle && isCurrentDevice;

  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ActiveStatusText isActive={device.isActive} selfRole={selfRole} />
        <OtherUserReadyStatus
          isReady={!!device.isReady}
          showReadyBadge={showReadyBadge}
          isCurrentDevice={isCurrentDevice}
        />
      </div>
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
