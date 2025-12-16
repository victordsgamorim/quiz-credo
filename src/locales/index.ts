import type { Locale } from "@/types/i18n";

import { enUK } from "./en-UK";
import { esBO } from "./es-BO";
import { ptBR, type TranslationKeys } from "./pt-BR";

export const translations: Record<Locale, TranslationKeys> = {
  "pt-BR": ptBR,
  "en-UK": enUK,
  "es-BO": esBO,
};

export type { TranslationKeys };
