import { Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/contexts/LocaleContext";

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
  onEditName?: (deviceId: string) => void;
  isGameStarted: boolean;
  canSelfToggleReady: boolean;
  selfRole: "admin" | "guest";
};

type DeviceRowProps = {
  device: Device;
  currentDeviceId: string | null;
  isAdmin: boolean;
  onRemoveGuest: (deviceId: string) => void;
  onToggleReadyState: (deviceId: string, nextState: boolean) => void;
  onEditName?: (deviceId: string) => void;
  isGameStarted: boolean;
  canSelfToggleReady: boolean;
  selfRole: "admin" | "guest";
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
  onEditName,
  isGameStarted,
  canSelfToggleReady,
  selfRole,
}: ConnectedDevicesListProps) => {
  const { t } = useLocale();

  // Filter out admin devices when the viewer is a guest
  const visibleDevices = selfRole === "guest" ? devices.filter((d) => d.role === "guest") : devices;

  if (visibleDevices.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        {t.lobby.connectedDevices}
      </h3>
      <div className="space-y-2">
        {visibleDevices.map((device) => (
          <ConnectedDeviceRow
            key={device.id}
            device={device}
            currentDeviceId={currentDeviceId}
            isAdmin={isAdmin}
            onRemoveGuest={onRemoveGuest}
            onToggleReadyState={onToggleReadyState}
            onEditName={onEditName}
            isGameStarted={isGameStarted}
            canSelfToggleReady={canSelfToggleReady}
            selfRole={selfRole}
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
  onEditName,
  isGameStarted,
  canSelfToggleReady,
  selfRole,
}: DeviceRowProps) => {
  const isCurrentDevice = device.id === currentDeviceId;
  const canRemoveGuest = isAdmin && device.role === "guest" && !isCurrentDevice;

  // Yellow/amber for current user, blue/slate for others
  const tileClassName = isCurrentDevice
    ? "flex items-center justify-between p-3 rounded-lg bg-amber-500/20 border border-amber-500/30"
    : "flex items-center justify-between p-3 rounded-lg bg-slate-800/50";

  return (
    <div className={tileClassName}>
      <ConnectedDeviceInfo
        device={device}
        selfRole={selfRole}
        isCurrentDevice={isCurrentDevice}
        onEditName={onEditName}
      />
      <ConnectedDeviceActions
        device={device}
        canRemoveGuest={canRemoveGuest}
        onRemoveGuest={onRemoveGuest}
        onToggleReadyState={onToggleReadyState}
        isCurrentDevice={isCurrentDevice}
        isGameStarted={isGameStarted}
        canSelfToggleReady={canSelfToggleReady}
        selfRole={selfRole}
      />
    </div>
  );
};

// eslint-disable-next-line max-lines-per-function
const ConnectedDeviceInfo = ({
  device,
  selfRole,
  isCurrentDevice,
  onEditName,
}: {
  device: Device;
  selfRole: "admin" | "guest";
  isCurrentDevice: boolean;
  onEditName?: (deviceId: string) => void;
}) => {
  const { t } = useLocale();
  const isAdmin = selfRole === "admin";

  const handleNameClick = () => {
    if (isCurrentDevice && onEditName) {
      onEditName(device.id);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {isAdmin && (
        <span
          className={`w-2 h-2 rounded-full ${device.isActive ? "bg-success" : "bg-amber-500"}`}
        />
      )}
      <div>
        <button
          onClick={handleNameClick}
          disabled={!isCurrentDevice || !onEditName}
          className={`font-semibold text-sm block text-left ${
            isCurrentDevice && onEditName
              ? "cursor-pointer hover:underline hover:text-blue-500 transition-colors"
              : "cursor-default"
          }`}
          title={isCurrentDevice && onEditName ? t.lobby.editName : undefined}
        >
          {device.displayName || device.id.substring(0, 8)}
        </button>
        {isAdmin && (
          <>
            <span className="font-mono text-[11px] text-muted-foreground block">
              #{device.id.substring(0, 8)}
            </span>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge
                variant={device.role === "admin" ? "default" : "outline"}
                className="text-[10px] uppercase tracking-wide"
              >
                {device.role === "admin" ? t.lobby.admin : t.lobby.guest}
              </Badge>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ConnectedDeviceActions = ({
  device,
  canRemoveGuest,
  onRemoveGuest,
  onToggleReadyState,
  isCurrentDevice,
  isGameStarted,
  canSelfToggleReady,
  selfRole,
}: {
  device: Device;
  canRemoveGuest: boolean;
  onRemoveGuest: (deviceId: string) => void;
  onToggleReadyState: (deviceId: string, nextState: boolean) => void;
  isCurrentDevice: boolean;
  isGameStarted: boolean;
  canSelfToggleReady: boolean;
  selfRole: "admin" | "guest";
}) => {
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
      selfRole={selfRole}
      isCurrentDevice={isCurrentDevice}
    />
  );
};
