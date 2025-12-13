import { Users, UserMinus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Device = {
  id: string;
  displayName?: string;
  role: "admin" | "guest";
  isActive: boolean;
};

type ConnectedDevicesListProps = {
  devices: Device[];
  currentDeviceId: string | null;
  isAdmin: boolean;
  onRemoveGuest: (deviceId: string) => void;
};

type DeviceRowProps = {
  device: Device;
  currentDeviceId: string | null;
  isAdmin: boolean;
  onRemoveGuest: (deviceId: string) => void;
};

/*
 * List component displaying connected devices in a channel.
 */
export const ConnectedDevicesList = ({
  devices,
  currentDeviceId,
  isAdmin,
  onRemoveGuest,
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
}: DeviceRowProps) => {
  const canRemoveGuest = isAdmin && device.role === "guest" && device.id !== currentDeviceId;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
      <ConnectedDeviceInfo device={device} currentDeviceId={currentDeviceId} />
      <ConnectedDeviceActions
        device={device}
        canRemoveGuest={canRemoveGuest}
        onRemoveGuest={onRemoveGuest}
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
}: {
  device: Device;
  canRemoveGuest: boolean;
  onRemoveGuest: (deviceId: string) => void;
}) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground">
      {device.isActive ? "Ativo" : "Background"}
    </span>
    {canRemoveGuest && (
      <Button
        onClick={() => onRemoveGuest(device.id)}
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
      >
        <UserMinus className="w-4 h-4 mr-1" />
        Remover
      </Button>
    )}
  </div>
);
