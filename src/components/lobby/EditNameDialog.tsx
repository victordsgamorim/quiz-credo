import { useState, useEffect } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/contexts/LocaleContext";

type EditNameDialogProps = {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
};

// eslint-disable-next-line max-lines-per-function
export const EditNameDialog = ({ isOpen, currentName, onClose, onSave }: EditNameDialogProps) => {
  const { t } = useLocale();
  const [newName, setNewName] = useState(currentName);

  // Reset name when dialog opens with new current name
  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSave = () => {
    const trimmedName = newName.trim();
    if (trimmedName && trimmedName !== currentName) {
      onSave(trimmedName);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-game fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="dialog-game z-50 w-[calc(100%-2rem)] max-w-md glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold text-foreground">
              {t.lobby.editYourName}
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

          <div className="space-y-4">
            <div>
              <label
                htmlFor="new-name-input"
                className="block text-sm font-medium text-muted-foreground mb-2"
              >
                {t.lobby.enterNewName}
              </label>
              <Input
                id="new-name-input"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={30}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleSave} disabled={!newName.trim()}>
                {t.common.save}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
