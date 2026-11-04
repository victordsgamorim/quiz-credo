import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import type { RankingEntry } from "@/hooks/useSocket";
import { translations } from "@/locales";

import { RankingCorrect, RankingPodium, RankingPoints } from "../RankingPodium";

const strings = translations["pt-BR"].quiz;

// The players by points, most first, with their positions and right answers
const rank = (...players: [string, number, number][]): RankingEntry[] =>
  players.map(([name, totalPoints, correctAnswers], index) => ({
    position: index + 1,
    deviceId: name.toLowerCase(),
    displayName: name,
    role: "guest",
    totalPoints,
    correctAnswers,
    totalAnswers: 10,
    accuracy: correctAnswers * 10,
  }));

const renderPodium = (entries: RankingEntry[], selfId?: string) =>
  render(
    <LocaleProvider>
      <RankingPodium entries={entries} totalQuestions={10} selfId={selfId} />
    </LocaleProvider>
  );

const podium = () => screen.getByRole("list", { name: strings.results.podium });
const places = () => within(podium()).getAllByRole("listitem");
const placeOf = (name: string) => {
  const place = places().find((item) => item.textContent?.includes(name));
  if (!place) throw new Error(`${name} isn't on the podium`);
  return place;
};

// eslint-disable-next-line max-lines-per-function
describe("RankingPodium", () => {
  it("lists the places in order, the 1st in the middle, the 2nd on its left, the 3rd on its right", () => {
    renderPodium(rank(["Ana", 420, 9], ["Bruno", 385, 8], ["Carla", 350, 7]));

    expect(places().map((place) => place.querySelector(".podium-name")?.textContent)).toEqual([
      "Ana",
      "Bruno",
      "Carla",
    ]);
    expect(placeOf("Ana")).toHaveClass("col-start-2");
    expect(placeOf("Bruno")).toHaveClass("col-start-1");
    expect(placeOf("Carla")).toHaveClass("col-start-3");
  });

  it("names each place, with the player's points and right answers out of the game's questions", () => {
    renderPodium(rank(["Ana", 420, 9], ["Bruno", 385, 8], ["Carla", 350, 7]));

    const second = within(placeOf("Bruno"));
    expect(second.getByText("2º lugar")).toBeInTheDocument();
    expect(second.getByText("385")).toBeInTheDocument();
    expect(second.getByText("8 de 10 acertos")).toBeInTheDocument();
  });

  it("gives every place its trophy", () => {
    renderPodium(rank(["Ana", 420, 9], ["Bruno", 385, 8], ["Carla", 350, 7]));

    expect(placeOf("Ana").querySelector("img.podium-trophy")).toHaveAttribute(
      "src",
      "/assets/images/trophies/trophy-1st.png"
    );
    expect(placeOf("Bruno").querySelector("img.podium-trophy")).toHaveAttribute(
      "src",
      "/assets/images/trophies/throphy-2nd.png"
    );
    expect(placeOf("Carla").querySelector("img.podium-trophy")).toHaveAttribute(
      "src",
      "/assets/images/trophies/throphy-3rd.png"
    );
  });

  it("keeps the steps of the places nobody reached, out of the list", () => {
    const { container } = renderPodium(rank(["Ana", 420, 9]));

    expect(places()).toHaveLength(1);
    const steps = container.querySelectorAll(".podium-place");
    expect(steps).toHaveLength(3);
    expect(container.querySelector('[data-place="2"]')).toHaveAttribute("data-empty", "true");
    expect(container.querySelector('[data-place="3"]')).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector('[data-place="3"] img')).toBeNull();
  });

  it("picks out the player's own place", () => {
    renderPodium(rank(["Ana", 420, 9], ["Bruno", 385, 8]), "bruno");

    expect(placeOf("Bruno")).toHaveAttribute("aria-current", "true");
    expect(placeOf("Bruno")).toHaveAttribute("data-self", "true");
    expect(within(placeOf("Bruno")).getByText(strings.gameScreen.ranking.you)).toBeInTheDocument();
    expect(placeOf("Ana")).not.toHaveAttribute("aria-current");
  });

  it("throws confetti for the 1st only", () => {
    const { container, unmount } = renderPodium(rank(["Ana", 420, 9]));
    expect(container.querySelectorAll(".podium-confetti").length).toBeGreaterThan(0);
    unmount();

    const empty = renderPodium([]);
    expect(empty.container.querySelector(".podium-confetti")).toBeNull();
  });
});

describe("RankingPoints", () => {
  it("shows the points with the score's coin, and says they're points", () => {
    const { container } = render(
      <LocaleProvider>
        <RankingPoints points={290} />
      </LocaleProvider>
    );

    expect(screen.getByText("290")).toBeInTheDocument();
    expect(screen.getByText(strings.results.points)).toHaveClass("sr-only");
    expect(container.querySelector("img")).toHaveAttribute("src", "/assets/coin/points.png");
  });
});

describe("RankingCorrect", () => {
  it("shows the right answers out of the questions, read out as a sentence", () => {
    render(
      <LocaleProvider>
        <RankingCorrect correct={7} total={10} />
      </LocaleProvider>
    );

    expect(screen.getByText("7/10")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("7 de 10 acertos")).toHaveClass("sr-only");
  });
});
