import { Check, Copy, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";

type RoomCodePillProps = {
  code: string;
  // The code was just copied: the copy button shows a check for a moment
  hasCopied: boolean;
  onCopy: () => void;
  onShowQRCode: () => void;
  className?: string;
};

/*
 * The room's code, for the others to join: copied with a tap, or shown as a QR code to scan. Under
 * the lobby's header on a phone held upright; in the header's middle on a phone on its side.
 */
export const RoomCodePill = ({
  code,
  hasCopied,
  onCopy,
  onShowQRCode,
  className,
}: RoomCodePillProps) => {
  const { t } = useLocale();

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-background/80 py-1.5 pl-4 pr-1.5 text-xs text-muted-foreground shadow-sm sm:gap-3",
        className
      )}
    >
      <span className="whitespace-nowrap">{t.lobby.roomCode}</span>
      <span className="font-mono text-lg font-bold tracking-[0.2em] text-primary">{code}</span>
      <Button
        onClick={onCopy}
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        title={t.lobby.copyCode}
        aria-label={t.lobby.copyCode}
      >
        {hasCopied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={onShowQRCode}
        title={t.lobby.qrCode}
        aria-label={t.lobby.qrCode}
      >
        <QrCode className="h-4 w-4" />
      </Button>
    </div>
  );
};
