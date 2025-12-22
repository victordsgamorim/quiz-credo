import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import type { useSocket } from "@/hooks/useSocket";
import { translations } from "@/locales";

import { ResultsScreen } from "../ResultsScreen";

const quizStrings = translations["pt-BR"].quiz;

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

describe("ResultsScreen", () => {
  it("shows the player summary", () => {
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

    expect(screen.getByText("420")).toBeInTheDocument();
    expect(screen.getByText("7/10")).toBeInTheDocument();
    expect(screen.getByText(quizStrings.results.points)).toBeInTheDocument();
  });

  it("renders the ranking list", () => {
    const ranking = createMockRanking();

    renderWithLocale(
      <ResultsScreen
        playerName="Test Player"
        score={420}
        correctAnswers={7}
        totalQuestions={10}
        ranking={ranking}
        socket={createMockSocket()}
        onBackToLobby={vi.fn()}
      />
    );

    expect(screen.getByText("Admin Player")).toBeInTheDocument();
    expect(screen.getByText("Guest Player")).toBeInTheDocument();
    expect(screen.getAllByText(quizStrings.results.points).length).toBeGreaterThan(1);
  });

  it("only shows the back to lobby button for admins", () => {
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

    expect(screen.getByText(quizStrings.results.backToLobby)).toBeInTheDocument();
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

    expect(screen.queryByText(quizStrings.results.backToLobby)).toBeNull();
  });
});
