export const ERROR_TEXTS = {
  pt: {
    title: "Sem conexão",
    message: "Não foi possível abrir o Quiz Credo.",
    retry: "Tentar de novo",
  },
  en: { title: "No connection", message: "Quiz Credo could not be opened.", retry: "Try again" },
  es: {
    title: "Sin conexión",
    message: "No se pudo abrir Quiz Credo.",
    retry: "Intentar de nuevo",
  },
};

function phoneLocale() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return "";
  }
}

/** The texts of the "no connection" screen, in the phone's language when the site has it, else Portuguese */
export function getErrorTexts(locale = phoneLocale()) {
  const language = locale.slice(0, 2).toLowerCase();
  if (language === "en" || language === "es") return ERROR_TEXTS[language];
  return ERROR_TEXTS.pt;
}
