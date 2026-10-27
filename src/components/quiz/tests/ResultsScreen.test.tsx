import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import type { RankingEntry, useSocket } from "@/hooks/useSocket";
import { translations } from "@/locales";

import { ResultsScreen } from "../ResultsScreen";

const quizStrings = translations["pt-BR"].quiz;
const lobbyStrings = translations["pt-BR"].lobby;

const renderWithLocale = (component: React.ReactElement) => {
  return render(<LocaleProvider>{component}</LocaleProvider>);
};

// The guests by points, most first, with their positions and right answers
const rank = (...players: [string, number, number][]): RankingEntry[] =>
  players.map(([name, totalPoints, correctAnswers], index) => ({
    position: index + 1,
    deviceId: `device-${name.toLowerCase()}`,
    displayName: name,
    role: "guest",
    totalPoints,
    correctAnswers,
    totalAnswers: 10,
    accuracy: correctAnswers * 10,
  }));

const FIVE_PLAYERS = rank(
  ["Ana", 420, 9],
  ["Bruno", 385, 8],
  ["Carla", 350, 8],
  ["Davi", 290, 7],
  ["Elisa", 260, 6]
);

const createMockSocket = (overrides: Partial<ReturnType<typeof useSocket>> = {}) =>
  ({
    selfRole: "admin",
    deviceId: "device-admin",
    ...overrides,
  }) as unknown as ReturnType<typeof useSocket>;

const renderResults = (
  ranking: RankingEntry[],
  socket = createMockSocket(),
  onBackToLobby = vi.fn()
) =>
  renderWithLocale(
    <ResultsScreen
      totalQuestions={10}
      ranking={ranking}
      socket={socket}
      onBackToLobby={onBackToLobby}
    />
  );

const podium = () => screen.getByRole("list", { name: quizStrings.results.podium });
const podiumNames = () =>
  within(podium())
    .getAllByRole("listitem")
    .map((place) => place.querySelector(".podium-name")?.textContent);
// The players past the podium, in their rows
const rows = () =>
  screen
    .getAllByRole("listitem")
    .filter((item) => item.classList.contains("result-row"))
    .map((row) => row.querySelector(".result-name")?.textContent);
// A player's place: their row, or their step on the podium
const itemOf = (name: string) => {
  const item = screen.getByText(name).closest("li");
  if (!item) throw new Error(`${name} isn't in the ranking`);
  return item;
};

// eslint-disable-next-line max-lines-per-function
describe("ResultsScreen", () => {
  it("puts the top 3 on the podium and lists the other players below it", () => {
    renderResults(FIVE_PLAYERS);

    expect(podiumNames()).toEqual(["Ana", "Bruno", "Carla"]);
    expect(rows()).toEqual(["Davi", "Elisa"]);
  });

  it("shows each player past the podium with their position, right answers and points", () => {
    renderResults(FIVE_PLAYERS);

    const row = itemOf("Davi");
    expect(within(row).getByText("4º lugar")).toBeInTheDocument();
    expect(within(row).getByText("7 de 10 acertos")).toBeInTheDocument();
    expect(within(row).getByText("290")).toBeInTheDocument();
  });

  it("leaves the players without points off the podium", () => {
    renderResults(rank(["Ana", 420, 9], ["Bruno", 385, 8], ["Carla", 0, 0]));

    expect(podiumNames()).toEqual(["Ana", "Bruno"]);
    expect(rows()).toEqual(["Carla"]);
  });

  it("renders the ranking excluding admin", () => {
    // Debug mode lets the admin answer, and the server ranks them then
    const [admin, guest] = rank(["Admin Player", 500, 9], ["Guest Player", 350, 6]);
    renderResults(
      [{ ...admin, role: "admin" }, guest],
      createMockSocket({ selfRole: "guest", deviceId: guest.deviceId })
    );

    expect(screen.queryByText("Admin Player")).not.toBeInTheDocument();
    expect(screen.getByText("Guest Player")).toBeInTheDocument();
  });

  it("lights the player's own row", () => {
    renderResults(FIVE_PLAYERS, createMockSocket({ selfRole: "guest", deviceId: "device-elisa" }));

    expect(itemOf("Elisa")).toHaveAttribute("aria-current", "true");
    expect(itemOf("Elisa")).toHaveAttribute("data-self", "true");
    expect(itemOf("Davi")).not.toHaveAttribute("aria-current");
  });

  it("lights the player's own place on the podium", () => {
    renderResults(FIVE_PLAYERS, createMockSocket({ selfRole: "guest", deviceId: "device-bruno" }));

    expect(itemOf("Bruno")).toHaveAttribute("aria-current", "true");
  });

  it("shows guests and admins a button back to the lobby", () => {
    for (const selfRole of ["guest", "admin"] as const) {
      const onBackToLobby = vi.fn();
      const { unmount } = renderResults(
        FIVE_PLAYERS,
        createMockSocket({ selfRole }),
        onBackToLobby
      );

      fireEvent.click(screen.getByRole("button", { name: quizStrings.results.backToLobby }));

      expect(onBackToLobby).toHaveBeenCalledTimes(1);
      unmount();
    }
  });

  it("has no back arrow at the top: the button back to the lobby is the only one, for admins too", () => {
    renderResults(FIVE_PLAYERS);

    expect(screen.queryByTitle(lobbyStrings.backToLobbyTooltip)).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("floats the button back to the lobby at the bottom of the screen, in the middle, without an icon", () => {
    renderResults(FIVE_PLAYERS);

    const button = screen.getByRole("button", { name: quizStrings.results.backToLobby });
    expect(button.parentElement).toHaveClass("fixed", "bottom-0", "inset-x-0", "justify-center");
    expect(button.querySelector("svg")).toBeNull();
  });

  it("shows fallback text when no ranking is available, and still the way back to the lobby", () => {
    const onBackToLobby = vi.fn();
    renderResults([], createMockSocket(), onBackToLobby);

    expect(screen.getByText(quizStrings.results.noRanking)).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: quizStrings.results.podium })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: quizStrings.results.backToLobby }));
    expect(onBackToLobby).toHaveBeenCalledTimes(1);
  });
});
