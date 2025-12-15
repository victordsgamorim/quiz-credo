import { Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { DeviceReadyControls } from "./DeviceReadyControls";

type Device = {
  id: string;
  displayName?: string;
  role: "admin" | "guest";
  isActive: boolean;
  isReady?: boolean;
};

type ConnectedDevicesListProps = {
  devices: Device[];
  currentDeviceId: string | null;
  isAdmin: boolean;
  onRemoveGuest: (deviceId: string) => void;
  onToggleReadyState: (deviceId: string, nextState: boolean) => void;
  isGameStarted: boolean;
  canSelfToggleReady: boolean;
};

type DeviceRowProps = {
  device: Device;
  currentDeviceId: string | null;
  isAdmin: boolean;
  onRemoveGuest: (deviceId: string) => void;
  onToggleReadyState: (deviceId: string, nextState: boolean) => void;
  isGameStarted: boolean;
  canSelfToggleReady: boolean;
};

/*
 * List component displaying connected devices in a channel.
 */
export const ConnectedDevicesList = ({
  devices,
  currentDeviceId,
  isAdmin,
  onRemoveGuest,
  onToggleReadyState,
  isGameStarted,
  canSelfToggleReady,
}: ConnectedDevicesListProps) => {
  if (devices.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Dispositivos Conectados
      </h3>
      <div className="space-y-2">
        {devices.map((device) => (
          <ConnectedDeviceRow
            key={device.id}
            device={device}
            currentDeviceId={currentDeviceId}
            isAdmin={isAdmin}
            onRemoveGuest={onRemoveGuest}
            onToggleReadyState={onToggleReadyState}
            isGameStarted={isGameStarted}
            canSelfToggleReady={canSelfToggleReady}
          />
        ))}
      </div>
    </Card>
  );
};

const ConnectedDeviceRow = ({
  device,
  currentDeviceId,
  isAdmin,
  onRemoveGuest,
  onToggleReadyState,
  isGameStarted,
  canSelfToggleReady,
}: DeviceRowProps) => {
  const canRemoveGuest = isAdmin && device.role === "guest" && device.id !== currentDeviceId;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
      <ConnectedDeviceInfo device={device} currentDeviceId={currentDeviceId} />
      <ConnectedDeviceActions
        device={device}
        canRemoveGuest={canRemoveGuest}
        onRemoveGuest={onRemoveGuest}
        onToggleReadyState={onToggleReadyState}
        currentDeviceId={currentDeviceId}
        isGameStarted={isGameStarted}
        canSelfToggleReady={canSelfToggleReady}
      />
    </div>
  );
};

const ConnectedDeviceInfo = ({
  device,
  currentDeviceId,
}: {
  device: Device;
  currentDeviceId: string | null;
}) => {
  const isCurrentDevice = device.id === currentDeviceId;

  return (
    <div className="flex items-center gap-3">
      <span className={`w-2 h-2 rounded-full ${device.isActive ? "bg-success" : "bg-amber-500"}`} />
      <div>
        <span className="font-semibold text-sm block">
          {device.displayName || device.id.substring(0, 8)}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground block">
          #{device.id.substring(0, 8)}
        </span>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge
            variant={device.role === "admin" ? "default" : "outline"}
            className="text-[10px] uppercase tracking-wide"
          >
            {device.role === "admin" ? "Admin" : "Guest"}
          </Badge>
          {isCurrentDevice && (
            <Badge variant="secondary" className="text-[10px] uppercase">
              Você
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

const ConnectedDeviceActions = ({
  device,
  canRemoveGuest,
  onRemoveGuest,
  onToggleReadyState,
  currentDeviceId,
  isGameStarted,
  canSelfToggleReady,
}: {
  device: Device;
  canRemoveGuest: boolean;
  onRemoveGuest: (deviceId: string) => void;
  onToggleReadyState: (deviceId: string, nextState: boolean) => void;
  currentDeviceId: string | null;
  isGameStarted: boolean;
  canSelfToggleReady: boolean;
}) => {
  const isCurrentDevice = device.id === currentDeviceId;
  const canShowReadyToggle = isCurrentDevice && device.role === "guest";
  const canToggleReady = canShowReadyToggle && canSelfToggleReady && !isGameStarted;

  return (
    <DeviceReadyControls
      device={device}
      canRemoveGuest={canRemoveGuest}
      onRemoveGuest={onRemoveGuest}
      onToggleReadyState={onToggleReadyState}
      isGameStarted={isGameStarted}
      showReadyToggle={canShowReadyToggle}
      canToggleReady={canToggleReady}
      showReadyBadge={device.role === "guest"}
    />
  );
};
