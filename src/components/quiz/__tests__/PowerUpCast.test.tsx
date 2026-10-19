import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import { PowerUpCast } from "../PowerUpCast";
import { CAST_DURATION_MS } from "../usePowerUpCast";

const strings = translations["pt-BR"].quiz.gameScreen.powerUps;

const renderCast = (props: React.ComponentProps<typeof PowerUpCast>) =>
  render(
    <LocaleProvider>
      <PowerUpCast {...props} />
    </LocaleProvider>
  );

describe("PowerUpCast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows nothing without a power-up being used", () => {
    const { container } = renderCast({ cast: null, onDone: vi.fn() });
    expect(container.querySelector(".power-up-cast")).not.toBeInTheDocument();
  });

  it.each([
    ["shield", ".power-up-cast-field"],
    ["freeze", ".power-up-cast-snow"],
    ["steal", ".power-up-cast-coin"],
    ["break", ".power-up-cast-shard"],
  ] as const)("covers the screen with the %s's own effect and name", (id, effect) => {
    const { container } = renderCast({ cast: { id, key: 1 }, onDone: vi.fn() });

    const cast = container.querySelector(".power-up-cast");
    expect(cast).toHaveAttribute("data-power-up", id);
    expect(cast).toHaveClass("fixed", "inset-0", "pointer-events-none");
    expect(cast).toHaveAttribute("aria-hidden", "true");
    expect(cast).toHaveTextContent(`${strings[id].name}!`);
    expect(container.querySelector(effect)).toBeInTheDocument();
  });

  it("ends once the animation is over", () => {
    const onDone = vi.fn();
    renderCast({ cast: { id: "shield", key: 1 }, onDone });

    act(() => {
      vi.advanceTimersByTime(CAST_DURATION_MS - 1);
    });
    expect(onDone).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
