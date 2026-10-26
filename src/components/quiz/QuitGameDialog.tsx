import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { LogOut, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";

type QuitGameDialogProps = {
  isOpen: boolean;
  onQuit: () => void;
  onStay: () => void;
};

// The host asking whether the player means it, as on the rules screen (already cached there)
const HOST_SRC = `${import.meta.env.BASE_URL}assets/characters/ss-question.png`;

/*
 * Asks a player who went back from a question whether they give up the game: giving up takes them
 * out of the room, to the home screen. The game goes on meanwhile, and staying is the button that
 * has the focus, so a key pressed out of habit keeps them in it.
 */
export const QuitGameDialog = ({ isOpen, onQuit, onStay }: QuitGameDialogProps) => {
  const { t } = useLocale();
  const strings = t.quiz.quitGame;

  return (
    // Escape, like the stay button, keeps the player in the game
    <AlertDialog.Root open={isOpen} onOpenChange={(nextOpen) => !nextOpen && onStay()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="overlay-game fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialog.Content className="dialog-game z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col items-center glass-card rounded-2xl px-6 pb-6 pt-7 text-center outline-none">
          <img
            src={HOST_SRC}
            alt=""
            decoding="async"
            className="h-28 w-auto object-contain image-glow sm:h-32"
          />
          <AlertDialog.Title className="mt-4 font-display text-xl font-extrabold text-balance sm:text-2xl">
            {strings.title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground text-pretty">
            {strings.description}
          </AlertDialog.Description>
          <div className="mt-6 flex w-full flex-col gap-3">
            <AlertDialog.Cancel asChild>
              <Button className="h-12 w-full text-base font-display font-extrabold">
                <Play aria-hidden="true" />
                {strings.stay}
              </Button>
            </AlertDialog.Cancel>
            <Button
              variant="destructive"
              onClick={onQuit}
              className="h-12 w-full text-base font-display font-extrabold"
            >
              <LogOut aria-hidden="true" />
              {strings.quit}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
