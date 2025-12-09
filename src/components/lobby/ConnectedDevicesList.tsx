import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserMinus } from "lucide-react";

interface Device {
  id: string;
  displayName?: string;
  role: "admin" | "guest";
  isActive: boolean;
}

interface ConnectedDevicesListProps {
  devices: Device[];
  currentDeviceId: string | null;
  isAdmin: boolean;
  onRemoveGuest: (deviceId: string) => void;
}

export function ConnectedDevicesList({
  devices,
  currentDeviceId,
  isAdmin,
  onRemoveGuest,
}: ConnectedDevicesListProps) {
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
          <div
            key={device.id}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  device.isActive ? "bg-success" : "bg-amber-500"
                }`}
              />
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
                  {device.id === currentDeviceId && (
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      Você
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {device.isActive ? "Ativo" : "Background"}
              </span>
              {isAdmin && device.role === "guest" && device.id !== currentDeviceId && (
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
          </div>
        ))}
      </div>
    </Card>
  );
}
