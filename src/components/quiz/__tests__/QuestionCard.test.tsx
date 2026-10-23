/* eslint-disable max-lines */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAudioManager } from "@/hooks/useAudioManager";
import { useQuizPresenter } from "@/hooks/useQuizPresenter";
import type { NarratorStatus } from "@/services/narrator";
import { Question } from "@/types/quiz";

import { QuestionCard } from "../QuestionCard";

const { mockSpeak, mockStop, mockStartNewQuestion, mockStopAllAudio, mockUnlock } = vi.hoisted(
  () => ({
    mockSpeak: vi.fn(),
    mockStop: vi.fn(),
    mockStartNewQuestion: vi.fn(),
    mockStopAllAudio: vi.fn(),
    mockUnlock: vi.fn(),
  })
);

const createMockHook = (overrides = {}) => ({
  speak: mockSpeak,
  stop: mockStop,
  isSpeaking: false,
  voice: { state: "ready" } as NarratorStatus,
  ...overrides,
});

vi.mock("@/hooks/useQuizPresenter", () => ({
  useQuizPresenter: vi.fn(() => createMockHook()),
}));

vi.mock("@/hooks/useAudioManager", () => ({
  useAudioManager: vi.fn(() => ({
    startNewQuestion: mockStartNewQuestion,
    stopAllAudio: mockStopAllAudio,
    state: "idle",
  })),
}));

vi.mock("@/services/narrationPlayer", () => ({ unlockNarrationPlayer: mockUnlock }));

const mockQuestion: Question = {
  id: "1",
  question: "What is the capital of France?",
  options: ["London", "Berlin", "Paris", "Madrid"],
  correctAnswer: 2,
  difficulty: "level1",
  points: 100,
  category: "Geography",
};

// eslint-disable-next-line max-lines-per-function
describe("QuestionCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the question text", () => {
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
      />
    );
    expect(screen.getByText("What is the capital of France?")).toBeInTheDocument();
  });

  it("renders the avatar image", () => {
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
      />
    );
    expect(screen.getByAltText("Host")).toBeInTheDocument();
  });

  it("leaves the host out of a guest's screen", () => {
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
        isAdmin={false}
      />
    );
    expect(screen.queryByAltText("Host")).not.toBeInTheDocument();
    expect(screen.getByText("What is the capital of France?")).toBeInTheDocument();
  });

  it("renders the narration button on the admin's screen when the voice is ready", () => {
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
        isAdmin={true}
      />
    );
    expect(screen.getByRole("button", { name: /repetir pergunta/i })).toBeInTheDocument();
  });

  it("renders the narration button by default (the admin's screen)", () => {
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
      />
    );
    expect(screen.getByRole("button", { name: /repetir pergunta/i })).toBeInTheDocument();
  });

  it("plays the jingle again, then the narration, when the button is clicked while idle", async () => {
    const user = userEvent.setup();
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
      />
    );
    expect(mockStartNewQuestion).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /repetir pergunta/i }));

    expect(mockUnlock).toHaveBeenCalledTimes(1);
    expect(mockStartNewQuestion).toHaveBeenCalledTimes(2);
    expect(mockStop).not.toHaveBeenCalled();
  });

  it("plays the jingle when the question shows, and reads it once the jingle ends", () => {
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
      />
    );

    expect(mockStartNewQuestion).toHaveBeenCalledTimes(1);
    expect(vi.mocked(useAudioManager)).toHaveBeenCalledWith({ onQuestionStartEnd: mockSpeak });
  });

  it("gives the presenter the question to read and the next one to get ready", () => {
    const upcomingQuestion = {
      question: "Quem pintou a Mona Lisa?",
      options: ["A", "B", "C", "D"],
    };
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
        upcomingQuestion={upcomingQuestion}
      />
    );

    expect(vi.mocked(useQuizPresenter)).toHaveBeenCalledWith({
      question: mockQuestion.question,
      options: mockQuestion.options,
      upcoming: upcomingQuestion,
    });
  });

  it("has correct accessibility attributes on speech button", () => {
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
      />
    );

    const button = screen.getByRole("button", { name: /repetir pergunta/i });
    expect(button).toHaveAttribute("aria-label", "Repetir pergunta");
    expect(button).toHaveAttribute("title", "Repetir pergunta");
  });
});

describe("QuestionCard - speaking state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQuizPresenter).mockReturnValue(createMockHook({ isSpeaking: true }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls stop when speech button is clicked while speaking", async () => {
    const user = userEvent.setup();
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
      />
    );

    const button = screen.getByRole("button", { name: /parar narração/i });
    await user.click(button);

    expect(mockStop).toHaveBeenCalledTimes(1);
    expect(mockStopAllAudio).toHaveBeenCalledTimes(1);
  });

  it("shows VolumeX icon and stop label when speaking", () => {
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
      />
    );

    const button = screen.getByRole("button", { name: /parar narração/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("title", "Parar narração");
    expect(button).toHaveAttribute("aria-label", "Parar narração");
  });
});

describe("QuestionCard - voice not ready", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.mocked(useQuizPresenter).mockReturnValue(createMockHook());
  });

  const renderCard = () =>
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
      />
    );

  it("waits with a spinner while the voice loads", () => {
    vi.mocked(useQuizPresenter).mockReturnValue(
      createMockHook({ voice: { state: "loading", percent: 40 } })
    );
    renderCard();

    const button = screen.getByRole("button", { name: "Carregando a voz (40%)" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("title", "Carregando a voz (40%)");
  });

  it("counts from 0% while the download's size is unknown", () => {
    vi.mocked(useQuizPresenter).mockReturnValue(
      createMockHook({ voice: { state: "loading", percent: null } })
    );
    renderCard();

    expect(screen.getByRole("button", { name: "Carregando a voz (0%)" })).toBeInTheDocument();
  });

  it("does not render the narration button when the voice didn't load", () => {
    vi.mocked(useQuizPresenter).mockReturnValue(createMockHook({ voice: { state: "failed" } }));
    renderCard();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("does not render the narration button without a voice", () => {
    vi.mocked(useQuizPresenter).mockReturnValue(createMockHook({ voice: { state: "off" } }));
    renderCard();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("still plays the jingle without a voice", () => {
    vi.mocked(useQuizPresenter).mockReturnValue(createMockHook({ voice: { state: "failed" } }));
    renderCard();

    expect(mockStartNewQuestion).toHaveBeenCalledTimes(1);
  });
});

// eslint-disable-next-line max-lines-per-function
describe("QuestionCard - question deck", () => {
  const nextQuestion: Question = {
    ...mockQuestion,
    id: "2",
    question: "Which planet is known as the Red Planet?",
  };

  const renderCard = (props: Partial<React.ComponentProps<typeof QuestionCard>> = {}) =>
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
        {...props}
      />
    );

  const getCardStates = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>("[data-state]")).map(
      (card) => card.dataset.state
    );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQuizPresenter).mockReturnValue(createMockHook());
  });

  it("draws the next question onto the front card and moves the previous one behind", () => {
    const { rerender } = renderCard();

    rerender(
      <QuestionCard
        question={nextQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
      />
    );

    expect(screen.getByRole("heading", { name: nextQuestion.question })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: mockQuestion.question })).not.toBeInTheDocument();
    expect(screen.getByText(mockQuestion.question).closest("[data-state]")).toHaveAttribute(
      "data-state",
      "behind"
    );
  });

  it("keeps the narration button on the front card only", () => {
    const { container, rerender } = renderCard();

    rerender(
      <QuestionCard
        question={nextQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
      />
    );

    const buttons = screen.getAllByRole("button", { name: /repetir pergunta/i });
    expect(buttons).toHaveLength(1);
    expect(container.querySelector('[data-state="front"]')).toContainElement(buttons[0]);
  });

  it("shows two cards behind the question while questions remain", () => {
    const { container } = renderCard({ questionsRemaining: 5 });

    expect(getCardStates(container)).toEqual(["front", "behind", "behind"]);
  });

  it("thins the deck out on the last questions", () => {
    const { container, rerender } = renderCard({ questionsRemaining: 1 });
    expect(getCardStates(container)).toEqual(["front", "behind", "hidden"]);

    rerender(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
        questionsRemaining={0}
      />
    );
    expect(getCardStates(container)).toEqual(["front", "hidden", "hidden"]);
  });
});

describe("QuestionCard - guest role", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does not render the narration button when isAdmin is false", () => {
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
        isAdmin={false}
      />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("plays no jingle on a guest's screen", () => {
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
        isAdmin={false}
      />
    );

    expect(mockStartNewQuestion).not.toHaveBeenCalled();
  });
});
