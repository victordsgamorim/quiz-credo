import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { useLocale } from "@/contexts/LocaleContext";

import { TutorialContent } from "./TutorialContent";

type TutorialDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

/*
 * The tutorial over the whole lobby: the room stays as it is under it, so opening it never takes a
 * player out of their room (the /tutorial page would).
 */
export const TutorialDialog = ({ isOpen, onClose }: TutorialDialogProps) => {
  const { t } = useLocale();

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Content className="tutorial-sheet fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain">
          <Dialog.Title className="sr-only">{t.tutorial.title}</Dialog.Title>
          <Dialog.Description className="sr-only">{t.tutorial.intro}</Dialog.Description>
          <TutorialContent
            header={
              // Like the lobby's header: the logo in the middle, the way out on the right
              <div className="mx-auto grid w-full max-w-3xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3">
                <span />
                <img src="/logo.png" alt="" className="h-6 w-auto object-contain sm:h-7" />
                <Dialog.Close
                  className="close-game justify-self-end"
                  title={t.tutorial.close}
                  aria-label={t.tutorial.close}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Dialog.Close>
              </div>
            }
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
