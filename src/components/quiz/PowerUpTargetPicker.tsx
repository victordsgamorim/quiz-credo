import type { CSSProperties } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { interpolate, useLocale } from "@/contexts/LocaleContext";
import type { PowerUpId, PowerUpPlayer } from "@/types/quiz";

import { PowerUpEmblem } from "./PowerUpEmblem";
import { getPowerUp } from "./powerUps";
import { usePowerUpHint } from "./usePowerUpSettings";

import type { PowerUpPalette } from "./PowerUpArt";

type PowerUpTargetPickerProps = {
  // The disadvantage being aimed, or null when the list is closed
  powerUpId: PowerUpId | null;
  targets: PowerUpPlayer[];
  onPick: (targetId: string) => void;
  onClose: () => void;
};

// Phones: a sheet along the bottom of the screen, over the power-ups; wider screens: a dialog
const SHEET_CLASS = [
  "max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:mb-0 max-sm:w-full max-sm:max-w-none",
  "max-sm:rounded-t-2xl max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-md",
].join(" ");

// The players, each one a button with their initial in the power-up's color
const TargetList = ({
  targets,
  palette,
  onPick,
}: Pick<PowerUpTargetPickerProps, "targets" | "onPick"> & { palette: PowerUpPalette }) => (
  <ul className="grid max-h-[50dvh] gap-2 overflow-y-auto">
    {targets.map((target) => (
      <li key={target.id}>
        <button
          type="button"
          onClick={() => onPick(target.id)}
          className="power-up-target flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-semibold"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-base font-black text-white"
            style={{ background: palette.mid }}
          >
            {target.name.trim().charAt(0).toUpperCase()}
          </span>
          <span className="truncate">{target.name}</span>
        </button>
      </li>
    ))}
  </ul>
);

/*
 * The list of the room's other players, to pick who a disadvantage is used on. Picking one uses it;
 * closing the list keeps it for later.
 */
export const PowerUpTargetPicker = ({
  powerUpId,
  targets,
  onPick,
  onClose,
}: PowerUpTargetPickerProps) => {
  const { t } = useLocale();
  const strings = t.quiz.gameScreen.powerUps;
  const getHint = usePowerUpHint();
  const powerUp = powerUpId ? getPowerUp(powerUpId) : null;

  return (
    <Dialog open={powerUp !== null} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {powerUp && (
        <DialogContent
          className={SHEET_CLASS}
          style={{ "--target-color": powerUp.palette.mid } as CSSProperties}
        >
          <DialogHeader className="flex-row items-center gap-3 space-y-0 pr-8 text-left">
            <PowerUpEmblem
              palette={powerUp.palette}
              art={powerUp.renderArt(powerUp.palette)}
              className="h-12 w-12 shrink-0"
            />
            <div className="space-y-1">
              <DialogTitle
                className="font-display text-xl"
                style={{ color: powerUp.palette.light }}
              >
                {interpolate(strings.pickTarget, { power: strings[powerUp.id].name })}
              </DialogTitle>
              <DialogDescription>{getHint(powerUp.id)}</DialogDescription>
            </div>
          </DialogHeader>
          <TargetList targets={targets} palette={powerUp.palette} onPick={onPick} />
        </DialogContent>
      )}
    </Dialog>
  );
};
