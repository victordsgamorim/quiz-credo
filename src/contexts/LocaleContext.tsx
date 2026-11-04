import { createContext, useContext, useState, useCallback, useMemo } from "react";

import { translations, type TranslationKeys } from "@/locales";
import { DEFAULT_LOCALE, type Locale } from "@/types/i18n";

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = "app-locale";

type LocaleProviderProps = {
  children: React.ReactNode;
};

/*
 * Provider for managing application locale and translations. The language can change at any time,
 * in a room too: the realtime server sends each device the game's questions in its own language.
 */
export const LocaleProvider = ({ children }: LocaleProviderProps) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored && (stored === "pt-BR" || stored === "en-UK" || stored === "es-BO")) {
        return stored as Locale;
      }
    } catch {
      // Ignore localStorage errors
    }
    return DEFAULT_LOCALE;
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch (error) {
      console.error("[LocaleContext] Failed to save locale:", error);
    }
  }, []);

  const t = useMemo(() => translations[locale], [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

/*
 * Hook to access locale context.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
};

/*
 * Helper function to interpolate translation strings with variables.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const interpolate = (str: string, params: Record<string, string | number>): string => {
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
    str
  );
};
