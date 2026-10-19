import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";
import { DEFAULT_POWER_UP_SETTINGS } from "@/types/powerUpSettings";

import { PowerUpBar } from "../PowerUpBar";
import { PowerUpSettingsContext } from "../usePowerUpSettings";

const strings = translations["pt-BR"].quiz.gameScreen.powerUps;

const renderBar = (props: React.ComponentProps<typeof PowerUpBar> = {}) =>
  render(
    <LocaleProvider>
      <PowerUpBar {...props} />
    </LocaleProvider>
  );

const button = (name: string) => screen.getByRole("button", { name: new RegExp(name) });

// eslint-disable-next-line max-lines-per-function
describe("PowerUpBar", () => {
  it("shows every power-up, each with what it does", () => {
    renderBar();

    expect(screen.getAllByRole("button")).toHaveLength(5);
    [
      [strings.freeze.name, "Congela sua sequência por 2 perguntas: errar não zera"],
      [strings.steal.name, "Rouba até 30 pontos de um adversário"],
      [strings.shield.name, strings.shield.hint],
      [strings.break.name, strings.break.hint],
      [strings.bonus.name, "Ganha 60 pontos de bônus na hora"],
    ].forEach(([name, hint]) => {
      expect(button(name)).toHaveAccessibleName(name);
      expect(button(name)).toHaveAttribute("title", hint);
      expect(button(name)).toBeEnabled();
    });
  });

  it("tells the values of the admin's power-up settings in the hints", () => {
    const settings = {
      ...DEFAULT_POWER_UP_SETTINGS,
      freezeQuestions: 1,
      stealPoints: 50,
      bonusPoints: 120,
    };
    render(
      <LocaleProvider>
        <PowerUpSettingsContext.Provider value={settings}>
          <PowerUpBar />
        </PowerUpSettingsContext.Provider>
      </LocaleProvider>
    );

    expect(button(strings.freeze.name)).toHaveAttribute("title", strings.freeze.hintOne);
    expect(button(strings.steal.name)).toHaveAttribute(
      "title",
      "Rouba até 50 pontos de um adversário"
    );
    expect(button(strings.bonus.name)).toHaveAttribute(
      "title",
      "Ganha 120 pontos de bônus na hora"
    );
  });

  it("shows nothing when the player has no power-up (all of them turned off)", () => {
    renderBar({ ids: [] });

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("shows only the power-ups dealt to the player, in the hand's order", () => {
    renderBar({ ids: ["break", "freeze", "shield"] });

    expect(screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual([
      strings.break.name,
      strings.freeze.name,
      strings.shield.name,
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
