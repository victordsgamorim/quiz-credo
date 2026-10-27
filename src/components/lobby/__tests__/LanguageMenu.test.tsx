import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";
import { LOCALES } from "@/types/i18n";

import { LanguageMenu } from "../LanguageMenu";

const portuguese = LOCALES["pt-BR"];
const english = LOCALES["en-UK"];

const renderMenu = (props: Parameters<typeof LanguageMenu>[0] = {}) =>
  render(
    <LocaleProvider>
      <LanguageMenu {...props} />
    </LocaleProvider>
  );

const flagButton = (locale: "pt-BR" | "en-UK") =>
  screen.getByRole("button", {
    name: `${translations[locale].language.change}: ${LOCALES[locale].name}`,
  });

describe("LanguageMenu", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the home's globe on phones, named after the language", () => {
    renderMenu({ isMobile: true });

    const trigger = screen.getByRole("button", { name: portuguese.name });
    expect(trigger.querySelector("svg")).not.toBeNull();
    expect(trigger).not.toHaveTextContent(portuguese.flag);
  });

  it("shows the language's name beside the globe on wider screens", () => {
    renderMenu();

    expect(screen.getByRole("button", { name: portuguese.name })).toHaveTextContent(
      portuguese.name
    );
  });

  it("shows only the language's flag in the lobby", () => {
    renderMenu({ isFlagOnly: true });

    const trigger = flagButton("pt-BR");
    expect(trigger.textContent).toBe(portuguese.flag);
    expect(trigger.querySelector("svg")).toBeNull();
    expect(trigger).toHaveAttribute("title", portuguese.name);
  });

  it("lists every language, the current one checked, and switches to the one chosen", async () => {
    const user = userEvent.setup();
    renderMenu({ isFlagOnly: true });

    await user.click(flagButton("pt-BR"));
    const items = screen.getAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual(
      Object.values(LOCALES).map(({ flag, name }) => `${flag}${name}`)
    );
    expect(items.map((item) => item.querySelector("svg") !== null)).toEqual([true, false, false]);

    await user.click(screen.getByRole("menuitem", { name: /English/ }));

    expect(flagButton("en-UK").textContent).toBe(english.flag);
    expect(localStorage.getItem("app-locale")).toBe("en-UK");
  });

  it("opens without locking the page's scroll, which would unstick the header it sits in", async () => {
    const user = userEvent.setup();
    renderMenu({ isFlagOnly: true });

    await user.click(flagButton("pt-BR"));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(document.body).not.toHaveAttribute("data-scroll-locked");
  });
});
