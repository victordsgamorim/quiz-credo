export type Locale = "pt-BR" | "en-UK" | "es-BO";

export type LocaleConfig = {
  code: Locale;
  name: string;
  flag: string;
};

export const LOCALES: Record<Locale, LocaleConfig> = {
  "pt-BR": {
    code: "pt-BR",
    name: "Português (Brasil)",
    flag: "🇧🇷",
  },
  "en-UK": {
    code: "en-UK",
    name: "English (UK)",
    flag: "🇬🇧",
  },
  "es-BO": {
    code: "es-BO",
    name: "Español (Bolivia)",
    flag: "🇧🇴",
  },
};

export const DEFAULT_LOCALE: Locale = "pt-BR";
