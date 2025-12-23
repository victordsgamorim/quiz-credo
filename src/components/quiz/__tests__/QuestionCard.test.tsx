import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Question } from "@/types/quiz";

import { QuestionCard } from "../QuestionCard";

// Mock the useQuizPresenter hook
const mockReplay = vi.fn();
const mockStop = vi.fn();
const mockSpeak = vi.fn();

const createMockHook = (overrides = {}) => ({
  speak: mockSpeak,
  stop: mockStop,
  pause: vi.fn(),
  resume: vi.fn(),
  replay: mockReplay,
  state: "idle" as const,
  isSupported: true,
  ...overrides,
});

vi.mock("@/hooks/useQuizPresenter", () => ({
  useQuizPresenter: vi.fn(() => createMockHook()),
}));

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

  it("renders the speech button when Web Speech API is supported and isAdmin is true", () => {
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

  it("renders the speech button when Web Speech API is supported (default isAdmin)", () => {
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
      />
    );
    expect(screen.getByRole("button", { name: /repetir pergunta/i })).toBeInTheDocument();
  });

  it("calls replay when speech button is clicked in idle state", async () => {
    const user = userEvent.setup();
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
      />
    );

    const button = screen.getByRole("button", { name: /repetir pergunta/i });
    await user.click(button);

    expect(mockReplay).toHaveBeenCalledTimes(1);
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
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useQuizPresenter } = await import("@/hooks/useQuizPresenter");
    vi.mocked(useQuizPresenter).mockReturnValue(createMockHook({ state: "speaking" }));
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

describe("QuestionCard - unsupported speech", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useQuizPresenter } = await import("@/hooks/useQuizPresenter");
    vi.mocked(useQuizPresenter).mockReturnValue(createMockHook({ isSupported: false }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does not render speech button when Web Speech API is not supported", () => {
    render(
      <QuestionCard
        question={mockQuestion}
        avatarSrc="/assets/characters/ss-saying.png"
        avatarAlt="Host"
      />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("QuestionCard - guest role", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does not render speech button when isAdmin is false", () => {
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
});
