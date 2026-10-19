import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

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
  it("shows every power-up, each with what it does", () => {
    renderBar();

    expect(screen.getAllByRole("button")).toHaveLength(5);
    [strings.freeze, strings.steal, strings.shield, strings.break, strings.bonus].forEach(
      ({ name, hint }) => {
        expect(button(name)).toHaveAccessibleName(name);
        expect(button(name)).toHaveAttribute("title", hint);
        expect(button(name)).toBeEnabled();
      }
    );
  });

  it("shows only the power-ups dealt to the player, in the bar's order", () => {
    renderBar({ ids: ["break", "freeze", "shield"] });

    expect(screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual([
      strings.freeze.name,
      strings.shield.name,
      strings.break.name,
    ]);
  });

  it("uses a power-up when pressed", async () => {
    const user = userEvent.setup();
    const onUse = vi.fn();
    renderBar({ onUse });

    await user.click(button(strings.steal.name));

    expect(onUse).toHaveBeenCalledWith("steal");
  });

  it("turns off the power-ups already used, and only them", () => {
    renderBar({ usedIds: ["freeze"] });

    expect(button(strings.freeze.name)).toBeDisabled();
    expect(button(strings.freeze.name)).toHaveAccessibleName(
      `${strings.freeze.name}, ${strings.used}`
    );
    expect(button(strings.freeze.name)).toHaveAttribute("data-used", "true");
    expect(button(strings.steal.name)).toBeEnabled();
    expect(button(strings.shield.name)).toBeEnabled();
  });

  it("disables them all when locked, without marking them as used", () => {
    renderBar({ disabled: true });

    screen.getAllByRole("button").forEach((b) => {
      expect(b).toBeDisabled();
      expect(b).toHaveAttribute("data-used", "false");
    });
  });
});
