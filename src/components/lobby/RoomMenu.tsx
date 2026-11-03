import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronRight, EllipsisVertical, ListChecks, Settings, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { LOCALES } from "@/types/i18n";

import { LanguageOptions } from "./LanguageMenu";

type RoomMenuProps = {
  isCategoryPanelOpen: boolean;
  onOpenSettings: () => void;
  onOpenPowerUps: () => void;
  onToggleCategoryPanel: () => void;
};

const itemClassName =
  "menu-item-game flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium outline-none transition-colors";

/*
 * The admin's room tools (settings, power-ups, categories and the language) behind one button in
 * the lobby's header, instead of one button for each.
 */
export const RoomMenu = ({
  isCategoryPanelOpen,
  onOpenSettings,
  onOpenPowerUps,
  onToggleCategoryPanel,
}: RoomMenuProps) => {
  const { locale, t } = useLocale();
  const { flag } = LOCALES[locale];

  return (
    // Not modal, for the same reason as the language menu: the body's scroll lock unsticks the header
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          title={t.lobby.roomMenu.open}
          aria-label={t.lobby.roomMenu.open}
        >
          <EllipsisVertical className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="glass-card z-50 min-w-[220px] p-1.5 text-sm"
        >
          <DropdownMenu.Item className={itemClassName} onSelect={onOpenSettings}>
            <Settings className="h-4 w-4" aria-hidden="true" />
            {t.lobby.gameSettings.title}
          </DropdownMenu.Item>
          <DropdownMenu.Item className={itemClassName} onSelect={onOpenPowerUps}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t.lobby.powerUpSettings.open}
          </DropdownMenu.Item>
          <DropdownMenu.Item className={itemClassName} onSelect={onToggleCategoryPanel}>
            <ListChecks className="h-4 w-4" aria-hidden="true" />
            {isCategoryPanelOpen ? t.lobby.categoryPanel.close : t.lobby.categoryPanel.open}
          </DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className={`${itemClassName} justify-between`}>
              <span className="flex items-center gap-2.5">
                <span className="text-base leading-none" aria-hidden="true">
                  {flag}
                </span>
                {t.language.change}
              </span>
              <ChevronRight className="h-4 w-4 opacity-70" aria-hidden="true" />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent
                sideOffset={6}
                className="glass-card z-50 min-w-[200px] p-1.5 text-sm"
              >
                <LanguageOptions />
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
