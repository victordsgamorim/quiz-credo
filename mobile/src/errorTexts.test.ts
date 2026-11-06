import { ERROR_TEXTS, getErrorTexts } from "./errorTexts";

describe("getErrorTexts", () => {
  it.each([
    ["en-GB", ERROR_TEXTS.en],
    ["en-US", ERROR_TEXTS.en],
    ["es-BO", ERROR_TEXTS.es],
    ["ES", ERROR_TEXTS.es],
    ["pt-BR", ERROR_TEXTS.pt],
  ])("uses the phone's language for %s", (locale, texts) => {
    expect(getErrorTexts(locale)).toBe(texts);
  });

  it.each(["fr-FR", "de", ""])("falls back to Portuguese for %p", (locale) => {
    expect(getErrorTexts(locale)).toBe(ERROR_TEXTS.pt);
  });

  it("reads the phone's locale when none is given", () => {
    expect(Object.values(ERROR_TEXTS)).toContain(getErrorTexts());
  });

  it("has every text in every language", () => {
    const keys = Object.keys(ERROR_TEXTS.pt).sort();
    for (const texts of Object.values(ERROR_TEXTS)) {
      expect(Object.keys(texts).sort()).toEqual(keys);
      for (const text of Object.values(texts)) expect(text.trim()).not.toBe("");
    }
  });
});
