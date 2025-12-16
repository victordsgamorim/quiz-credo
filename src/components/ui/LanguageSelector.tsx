import { Globe } from "lucide-react";

import { useLocale } from "@/contexts/LocaleContext";
import { LOCALES } from "@/types/i18n";

import { Button } from "./button";
import { Card } from "./card";

/*
 * Language selector component for choosing application locale.
 */
export const LanguageSelector = () => {
  const { locale, setLocale, t } = useLocale();

  return (
    <Card className="glass-card p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{t.language.select}</p>
            <p className="text-xs text-muted-foreground">
              {t.language.current}: {LOCALES[locale].name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.values(LOCALES).map((localeConfig) => (
            <Button
              key={localeConfig.code}
              onClick={() => setLocale(localeConfig.code)}
              variant={locale === localeConfig.code ? "default" : "outline"}
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-3xl">{localeConfig.flag}</span>
              <span className="text-sm font-medium">{localeConfig.name.split(" ")[0]}</span>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};
