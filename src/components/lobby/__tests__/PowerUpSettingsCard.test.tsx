import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { interpolate, LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";
import { DEFAULT_POWER_UP_SETTINGS, type PowerUpSettings } from "@/types/powerUpSettings";

import { PowerUpSettingsCard } from "../PowerUpSettingsCard";

const strings = translations["pt-BR"].lobby.powerUpSettings;
const powerUpStrings = translations["pt-BR"].quiz.gameScreen.powerUps;

const renderCard = (settings: PowerUpSettings = DEFAULT_POWER_UP_SETTINGS, disabled = false) => {
  const onChange = vi.fn();
  render(
    <LocaleProvider>
      <PowerUpSettingsCard settings={settings} onChange={onChange} disabled={disabled} />
    </LocaleProvider>
  );
  return onChange;
};

const toggle = (name: string) =>
  screen.getByRole("switch", { name: interpolate(strings.toggle, { power: name }) });

// The row of a power-up, by its name
const row = (name: string) => screen.getByText(name).closest("li") as HTMLElement;

// eslint-disable-next-line max-lines-per-function
describe("PowerUpSettingsCard", () => {
  it("shows every power-up turned on, with its kind and the default values", () => {
    renderCard();

    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    (["freeze", "steal", "shield", "break", "bonus"] as const).forEach((id) =>
      expect(toggle(powerUpStrings[id].name)).toBeChecked()
    );
    expect(within(row(powerUpStrings.steal.name)).getByText(strings.kinds.attack)).toBeVisible();
    expect(within(row(powerUpStrings.bonus.name)).getByText(strings.kinds.boost)).toBeVisible();
    expect(screen.getByText("Rouba até 30 pontos de um adversário")).toBeVisible();
    expect(screen.getByText("Ganha 60 pontos de bônus na hora")).toBeVisible();
    // The hand size, and a value for Freeze, Steal and Bonus
    expect(screen.getAllByRole("slider")).toHaveLength(4);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("turns a power-up off", async () => {
    const onChange = renderCard();

    await userEvent.setup().click(toggle(powerUpStrings.break.name));

    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_POWER_UP_SETTINGS,
      enabled: { ...DEFAULT_POWER_UP_SETTINGS.enabled, break: false },
    });
  });

  it("changes a power-up's value, and tells it in the hint", () => {
    const onChange = renderCard({ ...DEFAULT_POWER_UP_SETTINGS, stealPoints: 50 });

    expect(screen.getByText("Rouba até 50 pontos de um adversário")).toBeVisible();
    fireEvent.keyDown(within(row(powerUpStrings.bonus.name)).getByRole("slider"), {
      key: "ArrowRight",
    });
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_POWER_UP_SETTINGS,
      stealPoints: 50,
      bonusPoints: 70,
    });
  });

  it("changes how many power-ups each player gets", () => {
    const onChange = renderCard();

    fireEvent.keyDown(screen.getAllByRole("slider")[0], { key: "ArrowLeft" });

    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_POWER_UP_SETTINGS, handSize: 2 });
  });

  it("says when fewer power-ups are on than each player should get, or none", () => {
    const enabled = { freeze: false, steal: false, shield: false, break: true, bonus: true };
    renderCard({ ...DEFAULT_POWER_UP_SETTINGS, enabled });

    expect(screen.getByRole("status")).toHaveTextContent(
      interpolate(strings.handSize.limited, { count: 2 })
    );
    // A power-up turned off can't have its value changed
    expect(within(row(powerUpStrings.freeze.name)).getByRole("slider")).toHaveAttribute(
      "data-disabled"
    );
  });

  it("says when every power-up is off", () => {
    const enabled = { freeze: false, steal: false, shield: false, break: false, bonus: false };
    renderCard({ ...DEFAULT_POWER_UP_SETTINGS, enabled });

    expect(screen.getByRole("status")).toHaveTextContent(strings.allOff);
  });

  it("restores the defaults", async () => {
    const onChange = renderCard({ ...DEFAULT_POWER_UP_SETTINGS, handSize: 5, bonusPoints: 200 });

    await userEvent.setup().click(
      screen.getByRole("button", {
        name: translations["pt-BR"].lobby.gameSettings.restoreDefaults,
      })
    );

    expect(onChange).toHaveBeenCalledWith(DEFAULT_POWER_UP_SETTINGS);
  });

  it("turns the game's power-ups off", async () => {
    const onChange = renderCard();

    await userEvent.setup().click(screen.getByRole("switch", { name: strings.isEnabled.label }));

    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_POWER_UP_SETTINGS, isEnabled: false });
  });

  it("locks everything else while the power-ups are off, and says they aren't in the game", () => {
    renderCard({ ...DEFAULT_POWER_UP_SETTINGS, isEnabled: false });

    expect(screen.getByRole("status")).toHaveTextContent(strings.isEnabled.off);
    expect(screen.getByRole("switch", { name: strings.isEnabled.label })).toBeEnabled();
    expect(toggle(powerUpStrings.steal.name)).toBeDisabled();
    screen.getAllByRole("slider").forEach((slider) => {
      expect(slider).toHaveAttribute("data-disabled");
    });
  });

  it("can't be changed once the game started", () => {
    renderCard(DEFAULT_POWER_UP_SETTINGS, true);

    expect(toggle(powerUpStrings.steal.name)).toBeDisabled();
  });
});
