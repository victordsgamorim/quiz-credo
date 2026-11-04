import { Crown } from "lucide-react";

import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";

type AvatarDevice = {
  role: "admin" | "guest";
  isActive: boolean;
};

/*
 * A round token like the players' in the list a disadvantage is used on: the admin's crown in gold,
 * a guest's initial in navy. The admin sees each device's state on it: green while it's on screen,
 * amber in the background.
 */
export const DeviceAvatar = ({
  device,
  name,
  isStatusShown,
}: {
  device: AvatarDevice;
  name: string;
  isStatusShown: boolean;
}) => {
  const { t } = useLocale();
  const status = device.isActive ? t.lobby.active : t.lobby.background;

  return (
    <span className="relative shrink-0">
      <span
        aria-hidden="true"
        className={cn(
          "badge-game grid h-10 w-10 place-items-center rounded-full font-display text-lg font-black",
          device.role === "admin" ? "badge-game-gold" : "badge-game-navy"
        )}
      >
        {device.role === "admin" ? (
          <Crown className="h-5 w-5" strokeWidth={2.5} />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </span>
      {isStatusShown && (
        <span
          title={status}
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[hsl(225_60%_5%)]",
            device.isActive
              ? "bg-success shadow-[0_0_0.5rem_hsl(var(--success)/0.7)]"
              : "bg-amber-500"
          )}
        >
          <span className="sr-only">{status}</span>
        </span>
      )}
    </span>
  );
};
