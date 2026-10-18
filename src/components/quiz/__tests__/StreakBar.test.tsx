import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import { StreakBar } from "../StreakBar";

const streakStrings = translations["pt-BR"].quiz.gameScreen.streak;

const renderStreakBar = (streak: number, threshold = 5) =>
  render(
    <LocaleProvider>
      <StreakBar streak={streak} threshold={threshold} />
    </LocaleProvider>
  );

describe("StreakBar", () => {
  it("shows the streak building up towards the threshold", () => {
    const { container } = renderStreakBar(3);

    const bar = screen.getByRole("progressbar", { name: streakStrings.label });
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuemax", "5");
    expect(bar).toHaveAttribute("aria-valuetext", "3 de 5 acertos seguidos");
    expect(screen.getByText("3/5")).toBeInTheDocument();
    expect(container.querySelector(".streak-fill")).toHaveStyle({ width: "60%" });
  });

  it("keeps the multiplier hidden until the player earns it", () => {
    const { container } = renderStreakBar(4);

    expect(container.querySelector("[data-supercharged]")).toHaveAttribute(
      "data-supercharged",
      "false"
    );
    expect(screen.queryByText(/×/)).not.toBeInTheDocument();
    expect(container.querySelectorAll(".streak-bolt")).toHaveLength(0);
  });

  it("supercharges the bar with lightning and the multiplier once the streak reaches the threshold", () => {
    const { container } = renderStreakBar(5);

    expect(container.querySelector("[data-supercharged]")).toHaveAttribute(
      "data-supercharged",
      "true"
    );
    expect(container.querySelectorAll(".streak-bolt")).toHaveLength(3);
    expect(screen.getByText("×1,5")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuetext",
      "Multiplicador ×1,5 ativo"
    );
    expect(screen.getByText("Multiplicador ×1,5 ativo")).toHaveAttribute("aria-live", "polite");
  });

  it("keeps the bar full while the multiplier grows up to x3", () => {
    const { container } = renderStreakBar(12);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "5");
    expect(container.querySelector(".streak-fill")).toHaveStyle({ width: "100%" });
    expect(screen.getByText("×3")).toBeInTheDocument();
  });

  it("follows the configured threshold", () => {
    renderStreakBar(3, 3);

    expect(screen.getByText("×1,5")).toBeInTheDocument();
  });
});
