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
          {/* Like the lobby's header: the way out on the right */}
          <TutorialContent
            end={
              <Dialog.Close
                className="close-game"
                title={t.tutorial.close}
                aria-label={t.tutorial.close}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Dialog.Close>
            }
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
