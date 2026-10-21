import { act, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import type { LiveRankingEntry } from "@/hooks/useSocket";

import { LiveRanking } from "../LiveRanking";

// The players by points, most first, with their positions
const rank = (...players: [string, number][]): LiveRankingEntry[] =>
  players.map(([name, totalPoints], index) => ({
    position: index + 1,
    deviceId: name.toLowerCase(),
    displayName: name,
    totalPoints,
  }));

const renderRanking = (ranking: LiveRankingEntry[], selfId?: string) => {
  const view = render(
    <LocaleProvider>
      <LiveRanking ranking={ranking} selfId={selfId} />
    </LocaleProvider>
  );
  const rerank = (next: LiveRankingEntry[]) =>
    view.rerender(
      <LocaleProvider>
        <LiveRanking ranking={next} selfId={selfId} />
      </LocaleProvider>
    );
  return { ...view, rerank };
};

const rows = () => within(screen.getByRole("region", { name: "Ranking" })).getAllByRole("listitem");
const names = () => rows().map((row) => row.querySelector(".rank-name")?.textContent);
const rowOf = (name: string) => rows().find((row) => row.textContent?.includes(name));
const moveOf = (name: string) =>
  rowOf(name)?.querySelector(".rank-move")?.getAttribute("data-direction") ?? null;

// eslint-disable-next-line max-lines-per-function
describe("LiveRanking", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("lists the players by points, each with their position and not their points", () => {
    renderRanking(rank(["Ana", 150], ["Bruno", 120], ["Carla", 90]));

    expect(rows().map((row) => row.textContent)).toEqual(["1Ana", "2Bruno", "3Carla"]);
  });

  it("shows the top 10 only", () => {
    renderRanking(
      rank(
        ...Array.from({ length: 12 }, (_, index): [string, number] => [`P${index}`, 120 - index])
      )
    );

    expect(rows()).toHaveLength(10);
    expect(rowOf("P10")).toBeUndefined();
  });

  it("gives the 1st, 2nd and 3rd places the podium, and the others the same row", () => {
    renderRanking(rank(["Ana", 150], ["Bruno", 120], ["Carla", 90], ["Davi", 80], ["Eva", 60]));

    const podium = rows().map((row) => row.firstElementChild?.getAttribute("data-podium") ?? null);
    expect(podium).toEqual(["1", "2", "3", null, null]);
  });

  it("keeps the podium off until the players score", () => {
    renderRanking(rank(["Ana", 30], ["Bruno", 0], ["Carla", 0]));

    const podium = rows().map((row) => row.firstElementChild?.getAttribute("data-podium") ?? null);
    expect(podium).toEqual(["1", null, null]);
  });

  it("picks out the player's own row", () => {
    renderRanking(rank(["Ana", 150], ["Bruno", 120]), "bruno");

    expect(rowOf("Bruno")).toHaveAttribute("aria-current", "true");
    expect(rowOf("Bruno")).toContainElement(screen.getByText("(você)"));
    expect(screen.getByText("(você)")).toHaveClass("sr-only");
    expect(rowOf("Ana")).not.toHaveAttribute("aria-current");
  });

  it("points out who moved up and who moved down, for a few seconds", () => {
    vi.useFakeTimers();
    const { rerank } = renderRanking(rank(["Ana", 150], ["Bruno", 120], ["Carla", 90]));
    expect(moveOf("Ana")).toBeNull();

    rerank(rank(["Carla", 190], ["Ana", 150], ["Bruno", 120]));

    expect(names()).toEqual(["Carla", "Ana", "Bruno"]);
    expect(moveOf("Carla")).toBe("up");
    expect(moveOf("Ana")).toBe("down");
    expect(moveOf("Bruno")).toBe("down");

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(rows().some((row) => row.querySelector(".rank-move"))).toBe(false);
  });

  it("leaves the places alone when only the points change", () => {
    const { rerank } = renderRanking(rank(["Ana", 0], ["Bruno", 0]));

    rerank(rank(["Ana", 20], ["Bruno", 0]));

    expect(moveOf("Ana")).toBeNull();
    expect(rowOf("Ana")?.firstElementChild).toHaveAttribute("data-podium", "1");
  });
});
