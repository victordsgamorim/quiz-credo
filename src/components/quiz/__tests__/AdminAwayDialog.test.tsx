import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import type { AdminAway } from "@/hooks/useSocket";
import { translations } from "@/locales";

import { AdminAwayDialog } from "../AdminAwayDialog";

const strings = translations["pt-BR"].quiz.adminAway;
const NOW = new Date("2026-10-23T12:00:00Z").getTime();

// The admin away for a while: the room closes in secondsLeft seconds, out of a minute
const awayFor = (secondsLeft: number): AdminAway => ({
  closesAt: NOW + secondsLeft * 1000,
  timeoutMs: 60000,
});

const renderDialog = (adminAway: AdminAway | null, onLeave = vi.fn()) =>
  render(
    <LocaleProvider>
      <AdminAwayDialog adminAway={adminAway} onLeave={onLeave} />
    </LocaleProvider>
  );

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

const getClock = () => document.querySelector(".room-clock");

// eslint-disable-next-line max-lines-per-function
describe("AdminAwayDialog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows nothing while the admin is here", () => {
    renderDialog(null);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("tells the player the admin disconnected and the game is paused", () => {
    renderDialog(awayFor(47));

    const dialog = screen.getByRole("alertdialog", { name: strings.title });
    expect(dialog).toHaveAccessibleDescription(strings.description);
  });

  it("counts down the time until the room closes", () => {
    renderDialog(awayFor(47));
    expect(screen.getByRole("timer")).toHaveAccessibleName("A sala será encerrada em 0:47");
    expect(screen.getByRole("timer")).toHaveTextContent("0:47");

    advance(2000);

    expect(screen.getByRole("timer")).toHaveTextContent("0:45");
  });

  it("stops at zero", () => {
    renderDialog(awayFor(1));

    advance(3000);

    expect(screen.getByRole("timer")).toHaveTextContent("0:00");
  });

  it.each([
    [47, "normal"],
    [20, "low"],
    [10, "critical"],
  ])("with %i seconds left, shows the countdown's %s colors", (secondsLeft, state) => {
    renderDialog(awayFor(secondsLeft));
    expect(getClock()).toHaveAttribute("data-state", state);
  });

  it("turns gold, then red, as the time runs out", () => {
    renderDialog(awayFor(21));
    expect(getClock()).toHaveAttribute("data-state", "normal");

    advance(1000);
    expect(getClock()).toHaveAttribute("data-state", "low");

    advance(10000);
    expect(getClock()).toHaveAttribute("data-state", "critical");
  });

  it("drains the ring with the time left", () => {
    renderDialog(awayFor(30));

    const fill = document.querySelector(".room-clock-fill");
    const length = Number(fill?.getAttribute("stroke-dasharray"));
    expect(Number(fill?.getAttribute("stroke-dashoffset"))).toBeCloseTo(length / 2);
  });

  it("leaves the room from its button", () => {
    const onLeave = vi.fn();
    renderDialog(awayFor(47), onLeave);

    fireEvent.click(screen.getByRole("button", { name: strings.leave }));

    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("can't be closed: only the admin coming back or the room closing ends it", () => {
    const onLeave = vi.fn();
    renderDialog(awayFor(47), onLeave);
    const dialog = screen.getByRole("alertdialog");

    fireEvent.keyDown(dialog, { key: "Escape" });
    fireEvent.pointerDown(document.body);

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(onLeave).not.toHaveBeenCalled();
  });

  it("takes the focus itself, not the leave button", () => {
    renderDialog(awayFor(47));
    expect(screen.getByRole("alertdialog")).toHaveFocus();
  });

  it("closes once the admin is back", () => {
    const { rerender } = renderDialog(awayFor(47));

    rerender(
      <LocaleProvider>
        <AdminAwayDialog adminAway={null} onLeave={vi.fn()} />
      </LocaleProvider>
    );

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
