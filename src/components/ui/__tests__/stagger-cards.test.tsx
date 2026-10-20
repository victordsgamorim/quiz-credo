import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StaggerCards } from "../stagger-cards";

const ITEMS = ["one", "two", "three", "four", "five"];

const renderCards = (autoAdvanceMs?: number) =>
  render(
    <StaggerCards
      items={ITEMS}
      getKey={(item) => item}
      renderCard={(item, isCenter) => <p>{isCenter ? `${item} face up` : item}</p>}
      label="Sample questions"
      previousLabel="Previous question"
      nextLabel="Next question"
      autoAdvanceMs={autoAdvanceMs}
    />
  );

const getCenterKey = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-state="front"]')?.dataset.key;

// eslint-disable-next-line max-lines-per-function
describe("StaggerCards", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with the first item face up in the center and hides the others from assistive technology", () => {
    const { container } = renderCards();

    expect(getCenterKey(container)).toBe("one");
    expect(screen.getByText("one face up").parentElement).not.toHaveAttribute("aria-hidden");
    expect(screen.getByText("two").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("brings the next and previous cards to the center with the arrows", async () => {
    const user = userEvent.setup();
    const { container } = renderCards();

    await user.click(screen.getByRole("button", { name: "Next question" }));
    expect(getCenterKey(container)).toBe("two");

    await user.click(screen.getByRole("button", { name: "Previous question" }));
    await user.click(screen.getByRole("button", { name: "Previous question" }));
    expect(getCenterKey(container)).toBe("five");
  });

  it("brings a picked card to the center", async () => {
    const user = userEvent.setup();
    const { container } = renderCards();

    await user.click(screen.getByText("three"));

    expect(getCenterKey(container)).toBe("three");
  });

  it("moves the cards with a swipe and the arrow keys", () => {
    const { container } = renderCards();
    const carousel = screen.getByRole("region", { name: "Sample questions" });

    fireEvent.touchStart(carousel, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 100, clientY: 110 }] });
    expect(getCenterKey(container)).toBe("two");

    fireEvent.keyDown(carousel, { key: "ArrowLeft" });
    expect(getCenterKey(container)).toBe("one");
  });

  it("moves on by itself until someone moves the cards", () => {
    vi.useFakeTimers({ toFake: [
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "requestAnimationFrame",
        "cancelAnimationFrame",
      ] });
    const { container } = renderCards(1000);

    // The cards are dealt out first, then move on every second
    for (const ms of [100, 1000, 1000]) {
      act(() => {
        vi.advanceTimersByTime(ms);
      });
    }
    expect(getCenterKey(container)).toBe("two");

    fireEvent.click(screen.getByRole("button", { name: "Next question" }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(getCenterKey(container)).toBe("three");
  });
});
