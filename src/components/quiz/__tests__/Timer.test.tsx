import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import { Timer } from "../Timer";

const timerLabel = translations["pt-BR"].quiz.timer.label;

type TimerProps = Parameters<typeof Timer>[0];

const timerAt = (overrides: Partial<TimerProps> = {}): TimerProps => ({
  timeLeft: 30,
  progress: 50,
  isLowTime: false,
  isCriticalTime: false,
  ...overrides,
});

const renderTimer = (props: TimerProps) => {
  const result = render(
    <LocaleProvider>
      <Timer {...props} />
    </LocaleProvider>
  );
  const rerenderTimer = (next: TimerProps) =>
    result.rerender(
      <LocaleProvider>
        <Timer {...next} />
      </LocaleProvider>
    );
  return { ...result, rerenderTimer, countdown: result.container.querySelector(".countdown") };
};

// eslint-disable-next-line max-lines-per-function
describe("Timer", () => {
  it("shows the label and the time left inside the countdown box", () => {
    const { countdown } = renderTimer(timerAt({ timeLeft: 65 }));

    const box = within(countdown as HTMLElement);
    expect(box.getByText(timerLabel)).toBeInTheDocument();
    expect(box.getByRole("timer", { name: `${timerLabel}: 1:05` })).toHaveTextContent("1:05");
  });

  it("pads the seconds with a leading zero", () => {
    renderTimer(timerAt({ timeLeft: 5 }));

    expect(screen.getByRole("timer")).toHaveTextContent("0:05");
  });

  it("drains the box as the time runs out", () => {
    const { container } = renderTimer(timerAt({ progress: 75 }));

    expect(container.querySelector(".countdown-fill")).toHaveStyle({ width: "75%" });
  });

  it("repeats the content in dark ink on the fill without repeating the text on the page", () => {
    const { container } = renderTimer(timerAt({ timeLeft: 30 }));

    const ink = container.querySelector(".countdown-ink");
    expect(ink).toHaveAttribute("aria-hidden", "true");
    expect(ink?.querySelector(`[data-text="${timerLabel}"]`)).toBeInTheDocument();
    expect(ink?.querySelector('[data-text="0:30"]')).toBeInTheDocument();
    expect(screen.getAllByText(timerLabel)).toHaveLength(1);
    expect(screen.getAllByText("0:30")).toHaveLength(1);
  });

  it("turns from blue to gold to red as the time runs out", () => {
    const states = [
      timerAt({ timeLeft: 30 }),
      timerAt({ timeLeft: 10, isLowTime: true }),
      timerAt({ timeLeft: 5, isLowTime: true, isCriticalTime: true }),
    ].map((props) => {
      const { countdown, unmount } = renderTimer(props);
      const state = countdown?.getAttribute("data-state");
      unmount();
      return state;
    });

    expect(states).toEqual(["normal", "low", "critical"]);
  });

  it("flashes when the time runs low, and not before", () => {
    const { container, rerenderTimer } = renderTimer(timerAt({ timeLeft: 11 }));
    expect(container.querySelector(".countdown-glare")).not.toBeInTheDocument();
    expect(container.querySelector(".countdown-flash")).not.toBeInTheDocument();

    rerenderTimer(timerAt({ timeLeft: 10, isLowTime: true }));
    expect(container.querySelector(".countdown-glare")).toBeInTheDocument();
    expect(container.querySelector(".countdown-flash")).toBeInTheDocument();
  });

  it("flashes again when the time is almost over", () => {
    const { container, rerenderTimer } = renderTimer(timerAt({ timeLeft: 6, isLowTime: true }));
    const lowFlash = container.querySelector(".countdown-flash");

    rerenderTimer(timerAt({ timeLeft: 5, isLowTime: true, isCriticalTime: true }));
    const criticalFlash = container.querySelector(".countdown-flash");
    expect(criticalFlash).toBeInTheDocument();
    expect(criticalFlash).not.toBe(lowFlash);
  });

  it("beats every second at the end", () => {
    const critical = { isLowTime: true, isCriticalTime: true };
    const { container, rerenderTimer } = renderTimer(timerAt({ timeLeft: 6, isLowTime: true }));
    expect(container.querySelector(".countdown-beat")).not.toBeInTheDocument();

    rerenderTimer(timerAt({ timeLeft: 5, ...critical }));
    const firstBeat = container.querySelector(".countdown-beat");
    expect(firstBeat).toBeInTheDocument();

    rerenderTimer(timerAt({ timeLeft: 4, ...critical }));
    expect(container.querySelector(".countdown-beat")).not.toBe(firstBeat);
  });

  it("stops beating when the time is up", () => {
    const { countdown, container } = renderTimer(
      timerAt({ timeLeft: 0, progress: 0, isLowTime: true, isCriticalTime: true })
    );

    expect(countdown).toHaveAttribute("data-over", "true");
    expect(container.querySelector(".countdown-beat")).not.toBeInTheDocument();
    expect(screen.getByRole("timer")).toHaveTextContent("0:00");
  });
});
