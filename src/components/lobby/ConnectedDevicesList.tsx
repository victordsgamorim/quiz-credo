import { Pencil, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";

import { DeviceAvatar } from "./DeviceAvatar";
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
 * The room's players in the lobby, as rows sunk into the panel like the rankings': each one's
 * avatar, name and readiness, the player's own row in gold. The admin also sees themselves, the
 * players' roles and whether each device is on screen or in the background.
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
    <Card className="glass-card p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-lg font-extrabold">
          <Users aria-hidden="true" className="h-5 w-5 text-primary" />
          {t.lobby.connectedDevices}
        </h3>
        <span className="badge-game badge-game-navy rounded-full px-2.5 py-0.5 font-display text-sm font-black tabular-nums">
          {visibleDevices.length}
        </span>
      </div>
      <ul className="space-y-2">
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
      </ul>
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

  return (
    // Gold for the current user, navy for the others
    <li
      className={cn(
        "row-game flex items-center justify-between gap-3 rounded-xl px-3 py-2.5",
        isCurrentDevice && "row-game-me"
      )}
    >
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
      />
    </li>
  );
};

// The realtime server names a device without a name after its id: the admin then goes by their
// role, a guest by the start of their id
const getDeviceName = (device: Device, adminName: string) => {
  const name = device.displayName?.trim();
  if (name && name !== device.id) return name;
  return device.role === "admin" ? adminName : device.id.substring(0, 8);
};

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
  const isAdminView = selfRole === "admin";
  const name = getDeviceName(device, t.lobby.admin);
  // Only a guest's role is worth naming under the name: the admin's crown already says it
  const isNamedByRole = device.role === "admin" && name === t.lobby.admin;

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <DeviceAvatar device={device} name={name} isStatusShown={isAdminView} />
      <div className="min-w-0">
        <DeviceName
          name={name}
          onEdit={isCurrentDevice && onEditName ? () => onEditName(device.id) : undefined}
        />
        {isAdminView && !isNamedByRole && (
          <span
            className={cn(
              "badge-game mt-1 inline-block rounded-full px-2 py-px text-[0.6875rem] font-extrabold",
              device.role === "admin" ? "badge-game-gold" : "badge-game-outline [text-shadow:none]"
            )}
          >
            {device.role === "admin" ? t.lobby.admin : t.lobby.guest}
          </span>
        )}
      </div>
    </div>
  );
};

// Up to two lines, so the phones' narrow rows still show the whole name
const NAME_CLASS = "rank-name font-display text-base font-extrabold leading-tight sm:leading-tight";

// The player's own name can be changed: it's a button, with a pencil beside it
const DeviceName = ({ name, onEdit }: { name: string; onEdit?: () => void }) => {
  const { t } = useLocale();

  if (!onEdit) return <span className={NAME_CLASS}>{name}</span>;

  return (
    <button
      type="button"
      onClick={onEdit}
      title={t.lobby.editName}
      className="group flex max-w-full items-center gap-1.5 text-left transition-colors hover:text-primary"
    >
      <span className={NAME_CLASS}>{name}</span>
      <Pencil
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0 text-primary/80 transition-transform group-hover:-rotate-12"
      />
    </button>
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
}: {
  device: Device;
  canRemoveGuest: boolean;
  onRemoveGuest: (deviceId: string) => void;
  onToggleReadyState: (deviceId: string, nextState: boolean) => void;
  isCurrentDevice: boolean;
  isGameStarted: boolean;
  canSelfToggleReady: boolean;
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
      isCurrentDevice={isCurrentDevice}
    />
  );
};
