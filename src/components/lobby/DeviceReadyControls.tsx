import { Badge } from "@/components/ui/badge";
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
};

const ReadyBadge = ({ device }: { device: ReadyDevice }) => {
  const { t } = useLocale();
  return (
    <Badge
      variant="outline"
      className={`text-[10px] uppercase ${
        device.isReady ? "border-success text-success" : "border-border text-muted-foreground"
      }`}
    >
      {device.isReady ? t.lobby.ready : t.lobby.notReady}
    </Badge>
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
      size="sm"
      disabled={!canToggleReady}
      title={getTitle()}
      className="h-7 px-3 text-xs"
    >
      {device.isReady ? t.lobby.readyToggle.cancelReady : t.lobby.readyToggle.markReady}
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
      size="sm"
      className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
    >
      {t.lobby.removeGuest}
    </Button>
  ) : null;
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
}: DeviceReadyControlsProps) => {
  const { t } = useLocale();
  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{device.isActive ? t.lobby.active : t.lobby.background}</span>
        {showReadyBadge && <ReadyBadge device={device} />}
      </div>
      {showReadyToggle && (
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
