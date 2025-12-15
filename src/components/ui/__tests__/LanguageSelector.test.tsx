import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import { LanguageSelector } from "../LanguageSelector";

const languageStrings = translations["pt-BR"].language;
const englishLanguageStrings = translations["en-UK"].language;

const renderWithLocale = (component: React.ReactElement) =>
  render(<LocaleProvider>{component}</LocaleProvider>);

beforeEach(() => {
  localStorage.removeItem("app-locale");
  localStorage.removeItem("locale-locked");
});

const findTextContaining = (text: string) =>
  screen.getByText((content) => content.includes(text));

describe("LanguageSelector", () => {
  it("updates the UI when a new language is chosen", async () => {
    const user = userEvent.setup();
    renderWithLocale(<LanguageSelector />);

    expect(screen.getByText(languageStrings.select)).toBeInTheDocument();
    expect(findTextContaining(languageStrings.current)).toBeInTheDocument();
    const englishButton = screen.getByRole("button", { name: /English/i });

    await user.click(englishButton);

    expect(screen.getByText(englishLanguageStrings.select)).toBeInTheDocument();
    expect(findTextContaining(englishLanguageStrings.current)).toBeInTheDocument();
    expect(screen.getByText(/English \(UK\)/i)).toBeInTheDocument();
  });
});
