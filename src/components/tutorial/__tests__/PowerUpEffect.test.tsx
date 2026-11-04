import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";
import type { PowerUpId } from "@/types/quiz";

import { PowerUpEffect } from "../PowerUpEffect";

const streakLabel = translations["pt-BR"].quiz.gameScreen.streak.label;

const renderEffect = (id: PowerUpId) =>
  render(
    <LocaleProvider>
      <PowerUpEffect id={id} threshold={5} />
    </LocaleProvider>
  );

describe("PowerUpEffect", () => {
  it("shows the shield blocking the disadvantages", () => {
    renderEffect("shield");

    expect(screen.getByText(translations["pt-BR"].tutorial.powerUps.blocked)).toBeInTheDocument();
  });

  it("shows a frozen streak for Freeze", () => {
    const { container } = renderEffect("freeze");

    expect(screen.getByRole("progressbar", { name: streakLabel })).toBeInTheDocument();
    expect(container.querySelector("[data-frozen]")).toHaveAttribute("data-frozen", "true");
  });

  it("shows a supercharged streak going back to empty for Break", () => {
    renderEffect("break");

    const [before, after] = screen.getAllByRole("progressbar", { name: streakLabel });
    expect(before).toHaveAttribute("aria-valuetext", "Multiplicador ×2,5 ativo");
    expect(after).toHaveAttribute("aria-valuenow", "0");
  });

  it.each<PowerUpId>(["steal", "bonus"])(
    "shows nothing for %s, whose points the admin sets",
    (id) => {
      const { container } = renderEffect(id);

      expect(container).toBeEmptyDOMElement();
    }
  );
});
