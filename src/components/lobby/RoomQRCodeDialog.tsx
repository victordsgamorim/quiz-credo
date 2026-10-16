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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-primary/10 bg-background p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold text-foreground">
              {t.lobby.qrCode}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                aria-label={t.common.close}
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="rounded-lg border border-primary/10 bg-background/80 p-4 shadow-sm">
              <QRCodeCanvas value={joinUrl} size={250} level="H" includeMargin />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">{t.lobby.shareCodeDescription}</p>
              <p className="font-mono text-lg font-bold text-foreground">{roomCode}</p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
