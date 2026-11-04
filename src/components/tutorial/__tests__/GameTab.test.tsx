import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

import { CATEGORY_IDS } from "@/constants/categories";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import { GameTab } from "../GameTab";

const strings = translations["pt-BR"].tutorial.game;
const timerLabel = translations["pt-BR"].quiz.timer.label;

const renderTab = () =>
  render(
    <LocaleProvider>
      <GameTab />
    </LocaleProvider>
  );

const countdown = () => screen.getByRole("timer");

// The countdown sets its next second once the last one shows, so the seconds pass one by one
const passSeconds = (seconds: number) => {
  for (let second = 0; second < seconds; second += 1) {
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  }
};

// eslint-disable-next-line max-lines-per-function
describe("GameTab", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("lists the room's steps in order", () => {
    renderTab();

    const steps = screen.getAllByRole("listitem").slice(0, 5);
    expect(steps.map((step) => step.textContent)).toEqual([
      `1${strings.room.steps.create}`,
      `2${strings.room.steps.join}`,
      `3${strings.room.steps.vote}`,
      `4${strings.room.steps.ready}`,
      `5${strings.room.steps.start}`,
    ]);
  });

  it("runs the countdown down to the end, a second at a time", () => {
    renderTab();
    expect(countdown()).toHaveAccessibleName(`${timerLabel}: 0:15`);

    passSeconds(1);
    expect(countdown()).toHaveAccessibleName(`${timerLabel}: 0:14`);

    passSeconds(20);
    expect(countdown()).toHaveAccessibleName(`${timerLabel}: 0:00`);
  });

  it("goes through the countdown's colors", () => {
    const { container } = renderTab();
    const state = () => container.querySelector(".countdown")?.getAttribute("data-state");

    expect(state()).toBe("normal");
    passSeconds(5);
    expect(state()).toBe("low");
    passSeconds(5);
    expect(state()).toBe("critical");
  });

  it("starts the countdown over", () => {
    renderTab();
    passSeconds(20);

    fireEvent.click(screen.getByRole("button", { name: strings.timer.replay }));

    expect(countdown()).toHaveAccessibleName(`${timerLabel}: 0:15`);
  });

  it("shows the five levels with their points and names", () => {
    renderTab();
    const levels = translations["pt-BR"].quiz.gameScreen.difficulty;

    for (const points of ["10", "20", "30", "40", "50"]) {
      expect(screen.getByText(points)).toBeInTheDocument();
    }
    expect(screen.getByText(levels.level1)).toBeInTheDocument();
    expect(screen.getByText(levels.level5)).toBeInTheDocument();
  });

  it("shows every category", () => {
    renderTab();
    const names = translations["pt-BR"].lobby.categoryNames;

    for (const id of CATEGORY_IDS) {
      expect(screen.getByText(names[id])).toBeInTheDocument();
    }
  });
});
