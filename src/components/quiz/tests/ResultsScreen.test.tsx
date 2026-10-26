import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import type { useSocket } from "@/hooks/useSocket";
import { translations } from "@/locales";

import { ResultsScreen } from "../ResultsScreen";

const quizStrings = translations["pt-BR"].quiz;
const lobbyStrings = translations["pt-BR"].lobby;

const renderWithLocale = (component: React.ReactElement) => {
  return render(<LocaleProvider>{component}</LocaleProvider>);
};

const createMockRanking = () => [
  {
    position: 1,
    deviceId: "device-admin",
    displayName: "Admin Player",
    role: "admin",
    totalPoints: 500,
    correctAnswers: 8,
    totalAnswers: 10,
    accuracy: 80,
  },
  {
    position: 2,
    deviceId: "device-guest",
    displayName: "Guest Player",
    role: "guest",
    totalPoints: 350,
    correctAnswers: 6,
    totalAnswers: 10,
    accuracy: 60,
  },
];

const createMockSocket = (overrides: Partial<ReturnType<typeof useSocket>> = {}) =>
  ({
    selfRole: "admin",
    deviceId: "device-admin",
    ...overrides,
  }) as unknown as ReturnType<typeof useSocket>;

// eslint-disable-next-line max-lines-per-function
describe("ResultsScreen", () => {
  it("shows the player summary for guest", () => {
    renderWithLocale(
      <ResultsScreen
        playerName="Test Player"
        score={420}
        correctAnswers={7}
        totalQuestions={10}
        ranking={[]}
        socket={createMockSocket({ selfRole: "guest" })}
        onBackToLobby={vi.fn()}
      />
    );

    expect(screen.getByText("420")).toBeInTheDocument();
    expect(screen.getByText("7/10")).toBeInTheDocument();
    expect(screen.getByText(quizStrings.results.points)).toBeInTheDocument();
  });

  it("hides player summary for admin", () => {
    renderWithLocale(
      <ResultsScreen
        playerName="Admin Player"
        score={500}
        correctAnswers={8}
        totalQuestions={10}
        ranking={[]}
        socket={createMockSocket({ selfRole: "admin" })}
        onBackToLobby={vi.fn()}
      />
    );

    expect(screen.queryByText("500")).not.toBeInTheDocument();
    expect(screen.queryByText("8/10")).not.toBeInTheDocument();
  });

  it("renders the ranking list excluding admin", () => {
    const ranking = createMockRanking();

    renderWithLocale(
      <ResultsScreen
        playerName="Test Player"
        score={420}
        correctAnswers={7}
        totalQuestions={10}
        ranking={ranking}
        socket={createMockSocket({ selfRole: "guest", deviceId: "device-guest" })}
        onBackToLobby={vi.fn()}
      />
    );

    expect(screen.queryByText("Admin Player")).not.toBeInTheDocument();
    expect(screen.getByText("Guest Player")).toBeInTheDocument();
  });

  it("shows guests and admins a button back to the lobby", () => {
    for (const selfRole of ["guest", "admin"] as const) {
      const onBackToLobby = vi.fn();
      const { unmount } = renderWithLocale(
        <ResultsScreen
          playerName="Test Player"
          score={420}
          correctAnswers={7}
          totalQuestions={10}
          ranking={[]}
          socket={createMockSocket({ selfRole })}
          onBackToLobby={onBackToLobby}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: quizStrings.results.backToLobby }));

      expect(onBackToLobby).toHaveBeenCalledTimes(1);
      unmount();
    }
  });

  it("only shows the back arrow to admins", () => {
    const onBackToLobby = vi.fn();

    const { unmount } = renderWithLocale(
      <ResultsScreen
        playerName="Test Player"
        score={420}
        correctAnswers={7}
        totalQuestions={10}
        ranking={[]}
        socket={createMockSocket()}
        onBackToLobby={onBackToLobby}
      />
    );

    expect(screen.getByTitle(lobbyStrings.backToLobbyTooltip)).toBeInTheDocument();
    unmount();

    renderWithLocale(
      <ResultsScreen
        playerName="Test Player"
        score={420}
        correctAnswers={7}
        totalQuestions={10}
        ranking={[]}
        socket={createMockSocket({ selfRole: "guest" })}
        onBackToLobby={onBackToLobby}
      />
    );

    expect(screen.queryByTitle(lobbyStrings.backToLobbyTooltip)).toBeNull();
  });

  it("shows fallback text when no ranking is available", () => {
    renderWithLocale(
      <ResultsScreen
        playerName="Test Player"
        score={420}
        correctAnswers={7}
        totalQuestions={10}
        ranking={[]}
        socket={createMockSocket()}
        onBackToLobby={vi.fn()}
      />
    );

    expect(screen.getByText(quizStrings.results.noRanking)).toBeInTheDocument();
  });

  it("highlights the current device in the ranking list", () => {
    const ranking = createMockRanking();

    const { container } = renderWithLocale(
      <ResultsScreen
        playerName="Test Player"
        score={420}
        correctAnswers={7}
        totalQuestions={10}
        ranking={ranking}
        socket={createMockSocket({ selfRole: "guest", deviceId: "device-guest" })}
        onBackToLobby={vi.fn()}
      />
    );

    const highlightedRow = container.querySelector(".row-game-me");
    expect(highlightedRow).not.toBeNull();
    expect(highlightedRow).toHaveAttribute("aria-current", "true");
  });
});
