import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import { PowerUpBar } from "../PowerUpBar";

const strings = translations["pt-BR"].quiz.gameScreen.powerUps;

const renderBar = (props: React.ComponentProps<typeof PowerUpBar> = {}) =>
  render(
    <LocaleProvider>
      <PowerUpBar {...props} />
    </LocaleProvider>
  );

const button = (name: string) => screen.getByRole("button", { name: new RegExp(name) });

describe("PowerUpBar", () => {
  it("shows the three power-ups, with one use each by default", () => {
    renderBar();

    expect(screen.getAllByRole("button")).toHaveLength(3);
    [strings.freeze, strings.steal, strings.shield].forEach(({ name, hint }) => {
      expect(button(name)).toHaveAccessibleName(`${name}, 1 restante(s)`);
      expect(button(name)).toHaveAttribute("title", hint);
    });
  });

  it("picks one power-up at a time, and drops it when pressed again", async () => {
    const user = userEvent.setup();
    renderBar();

    await user.click(button(strings.freeze.name));
    expect(button(strings.freeze.name)).toHaveAttribute("aria-pressed", "true");

    await user.click(button(strings.shield.name));
    expect(button(strings.freeze.name)).toHaveAttribute("aria-pressed", "false");
    expect(button(strings.shield.name)).toHaveAttribute("aria-pressed", "true");

    await user.click(button(strings.shield.name));
    expect(button(strings.shield.name)).toHaveAttribute("aria-pressed", "false");
  });

  it("disables the power-ups without uses left", () => {
    renderBar({ charges: { steal: 0, shield: 2 } });

    expect(button(strings.steal.name)).toBeDisabled();
    expect(button(strings.shield.name)).toHaveAccessibleName(
      `${strings.shield.name}, 2 restante(s)`
    );
    expect(button(strings.freeze.name)).toBeEnabled();
  });

  it("disables them all when locked", () => {
    renderBar({ disabled: true });
    screen.getAllByRole("button").forEach((b) => expect(b).toBeDisabled());
  });
});
