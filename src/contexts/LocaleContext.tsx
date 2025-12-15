import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";

import { translations, type TranslationKeys } from "@/locales";
import { DEFAULT_LOCALE, type Locale } from "@/types/i18n";

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
  isLockedFromChange: boolean;
  lockLocaleChange: () => void;
  unlockLocaleChange: () => void;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = "app-locale";
const LOCALE_LOCK_KEY = "locale-locked";

type LocaleProviderProps = {
  children: React.ReactNode;
};

/*
 * Provider for managing application locale and translations.
 */
// eslint-disable-next-line max-lines-per-function
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

  const [isLockedFromChange, setIsLockedFromChange] = useState<boolean>(() => {
    try {
      const locked = localStorage.getItem(LOCALE_LOCK_KEY);
      return locked === "true";
    } catch {
      return false;
    }
  });

  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (isLockedFromChange) {
        console.warn("[LocaleContext] Locale change is locked");
        return;
      }
      setLocaleState(newLocale);
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      } catch (error) {
        console.error("[LocaleContext] Failed to save locale:", error);
      }
    },
    [isLockedFromChange]
  );

  const lockLocaleChange = useCallback(() => {
    setIsLockedFromChange(true);
    try {
      localStorage.setItem(LOCALE_LOCK_KEY, "true");
    } catch (error) {
      console.error("[LocaleContext] Failed to lock locale:", error);
    }
  }, []);

  const unlockLocaleChange = useCallback(() => {
    setIsLockedFromChange(false);
    try {
      localStorage.removeItem(LOCALE_LOCK_KEY);
    } catch (error) {
      console.error("[LocaleContext] Failed to unlock locale:", error);
    }
  }, []);

  // Clear lock on unmount (for development)
  useEffect(() => {
    return () => {
      // Don't clear lock on unmount in production
      if (import.meta.env.DEV) {
        try {
          localStorage.removeItem(LOCALE_LOCK_KEY);
        } catch {
          // Ignore errors
        }
      }
    };
  }, []);

  const t = useMemo(() => translations[locale], [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      isLockedFromChange,
      lockLocaleChange,
      unlockLocaleChange,
    }),
    [locale, setLocale, t, isLockedFromChange, lockLocaleChange, unlockLocaleChange]
  );

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
