import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

const getReadinessLabel = (isReady?: boolean) => (isReady ? "Pronto" : "Aguardando");

const getToggleTitle = (canToggleReady: boolean, isGameStarted: boolean) => {
  if (canToggleReady) {
    return "Altere seu status de pronto";
  }
  if (isGameStarted) {
    return "O jogo já foi iniciado";
  }
  return "Apenas o próprio jogador pode alterar este status";
};

const ReadyBadge = ({ device }: { device: ReadyDevice }) => (
  <Badge
    variant="outline"
    className={`text-[10px] uppercase ${
      device.isReady ? "border-success text-success" : "border-border text-muted-foreground"
    }`}
  >
    {getReadinessLabel(device.isReady)}
  </Badge>
);

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
}) => (
  <Button
    onClick={() => onToggleReadyState(device.id, !device.isReady)}
    variant={device.isReady ? "default" : "outline"}
    size="sm"
    disabled={!canToggleReady}
    title={getToggleTitle(canToggleReady, isGameStarted)}
    className="h-7 px-3 text-xs"
  >
    {device.isReady ? "Cancelar pronto" : "Estou pronto"}
  </Button>
);

const RemoveGuestButton = ({
  device,
  canRemoveGuest,
  onRemoveGuest,
}: {
  device: ReadyDevice;
  canRemoveGuest: boolean;
  onRemoveGuest: (deviceId: string) => void;
}) =>
  canRemoveGuest ? (
    <Button
      onClick={() => onRemoveGuest(device.id)}
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
    >
      Remover
    </Button>
  ) : null;

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
  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{device.isActive ? "Ativo" : "Background"}</span>
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
