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
  const joinUrl = `${baseUrl}/?room=${roomCode}`;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t.lobby.qrCode}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none"
                aria-label={t.common.close}
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <QRCodeCanvas value={joinUrl} size={250} level="H" includeMargin />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">{t.lobby.shareCodeDescription}</p>
              <p className="font-mono text-lg font-bold text-primary">{roomCode}</p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
