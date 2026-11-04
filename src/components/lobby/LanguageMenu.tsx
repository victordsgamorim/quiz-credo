import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { LOCALES } from "@/types/i18n";

type LanguageMenuProps = {
  // The lobby's button shows only the language's flag; the home's, a globe, and the language's
  // name on wider screens
  isFlagOnly?: boolean;
  isMobile?: boolean;
};

/*
 * The interface's languages, in a menu under the header's button: the home's and the lobby's, for
 * guests and admins alike. Each device then gets the game's questions in its own language (the
 * realtime server sends each one its own).
 */
export const LanguageMenu = ({ isFlagOnly = false, isMobile = false }: LanguageMenuProps) => {
  const { locale, t } = useLocale();
  const { name, flag } = LOCALES[locale];

  return (
    // Not modal: a modal menu locks the page's scroll with overflow hidden on the body, which (with
    // the html's overflow-x: clip) makes the body the sticky header's scroll container. In a lobby
    // scrolled down, the header and its button then jump off the screen, and the menu with them
    <DropdownMenu.Root modal={false}>
      {/* The button itself, so the menu gets its ref to open under it */}
      <DropdownMenu.Trigger asChild>
        {isFlagOnly ? (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 text-lg leading-none"
            title={name}
            aria-label={`${t.language.change}: ${name}`}
          >
            <span aria-hidden="true">{flag}</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size={isMobile ? "icon" : "sm"}
            className={isMobile ? "h-9 w-9" : "h-9 gap-2 px-3"}
            title={isMobile ? name : undefined}
            aria-label={name}
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            {!isMobile && (
              <>
                <span className="text-xs font-medium">{name}</span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </>
            )}
          </Button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <LanguageMenuItems />
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

// Every language with its flag, the current one checked
export const LanguageMenuItems = () => {
  return (
    <DropdownMenu.Content
      sideOffset={8}
      align="end"
      className="glass-card z-50 min-w-[200px] p-1.5 text-sm"
    >
      <LanguageOptions />
    </DropdownMenu.Content>
  );
};

// The items alone, for the room menu's submenu
export const LanguageOptions = () => {
  const { locale, setLocale } = useLocale();

  return (
    <>
      {Object.values(LOCALES).map((localeConfig) => (
        <DropdownMenu.Item
          key={localeConfig.code}
          onSelect={() => setLocale(localeConfig.code)}
          className="menu-item-game flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 outline-none transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="text-base">{localeConfig.flag}</span>
            <span className="text-xs font-medium">{localeConfig.name}</span>
          </span>
          {locale === localeConfig.code && <Check className="h-4 w-4 text-success" />}
        </DropdownMenu.Item>
      ))}
    </>
  );
};
