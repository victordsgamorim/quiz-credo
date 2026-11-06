import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

import { useLocale } from "@/contexts/LocaleContext";

type RoomQRCodeDialogProps = {
  isOpen: boolean;
  roomCode: string;
  onClose: () => void;
};

export const RoomQRCodeDialog = ({ isOpen, roomCode, onClose }: RoomQRCodeDialogProps) => {
  const { t } = useLocale();

  // Generate URL with room parameter
  const baseUrl = window.location.origin;
  const joinUrl = `${baseUrl}/join/${encodeURIComponent(roomCode)}`;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-game fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        {/* A phone on its side: the code beside its text, smaller, so they fit the screen's
            height */}
        <Dialog.Content className="dialog-game z-50 max-h-[calc(100dvh-1rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto overscroll-contain glass-card rounded-2xl p-6 phone-landscape:max-w-lg phone-landscape:p-5">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold text-foreground">
              {t.lobby.qrCode}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="close-game disabled:pointer-events-none"
                aria-label={t.common.close}
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex flex-col items-center gap-4 phone-landscape:flex-row phone-landscape:gap-5">
            {/* The canvas sizes itself inline: the smaller size has to be important */}
            <div className="row-game row-game-me shrink-0 rounded-xl p-4 phone-landscape:p-2 phone-landscape:[&_canvas]:!size-40">
              <QRCodeCanvas value={joinUrl} size={250} level="H" includeMargin />
            </div>
            <div className="text-center phone-landscape:text-left">
              <p className="text-sm text-muted-foreground mb-2">{t.lobby.shareCodeDescription}</p>
              <p className="font-mono text-lg font-bold text-foreground">{roomCode}</p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
