import { useState } from "react";

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchQuestionsByCategories } from "@/services/questionService";
import { DEFAULT_GAME_SETTINGS } from "@/types/gameSettings";
import type { Question } from "@/types/quiz";

import { useQuiz } from "../useQuiz";

import type { useSocket } from "../useSocket";

vi.mock("@/services/questionService", () => ({
  fetchQuestionsByCategories: vi.fn(),
  fetchQuestionsInAllLocales: vi.fn(),
}));

type Socket = ReturnType<typeof useSocket>;

const QUESTIONS: Question[] = Array.from({ length: 6 }, (_, index) => ({
  id: `q${index + 1}`,
  question: `Question ${index + 1}`,
  options: ["A", "B", "C", "D"],
  correctAnswer: 0,
  difficulty: "level3",
  points: 30,
}));

const CORRECT = 0;
const WRONG = 1;

// Streak threshold 3: the 4th correct answer in a row is worth x1.5, the 5th x2...
const createSocket = (overrides: Partial<Socket> = {}) =>
  ({
    currentChannel: null,
    selfRole: "guest",
    gameSettings: { ...DEFAULT_GAME_SETTINGS, streakThreshold: 3 },
    gameState: null,
    isGameStarted: false,
    isShowingFeedback: false,
    setIsShowingFeedback: vi.fn(),
    submitAnswer: vi.fn(),
    notifyAnswerSelection: vi.fn(),
    ...overrides,
  }) as unknown as Socket;

// eslint-disable-next-line max-lines-per-function
describe("useQuiz scoring", () => {
  beforeEach(() => {
    vi.mocked(fetchQuestionsByCategories).mockResolvedValue(QUESTIONS);
  });

  it("multiplies correct answers by the player's streak and resets it on a miss", async () => {
    const { result } = renderHook(() => useQuiz({ socket: createSocket() }));
    await act(async () => {
      await result.current.startGame("Ana");
    });
    const answer = (answerIndex: number) => {
      act(() => result.current.selectAnswer(answerIndex));
      act(() => result.current.submitAnswer(5));
    };
    const next = () => act(() => result.current.nextQuestion());

    [1, 2, 3].forEach(() => {
      answer(CORRECT);
      next();
    });
    expect(result.current.gameState.score).toBe(90);
    expect(result.current.streak.count).toBe(3);
    expect(result.current.streak.questionMultiplier).toBe(1.5);

    answer(CORRECT);
    expect(result.current.gameState.score).toBe(135);
    // The answered question keeps its multiplier, the next one gets the new one
    expect(result.current.streak.questionMultiplier).toBe(1.5);
    next();
    expect(result.current.streak.questionMultiplier).toBe(2);

    answer(WRONG);
    expect(result.current.streak.count).toBe(0);
    next();
    expect(result.current.streak.questionMultiplier).toBe(1);

    answer(CORRECT);
    expect(result.current.gameState.score).toBe(165);
    expect(result.current.gameState.answers.map((record) => record.pointsEarned)).toEqual([
      30, 30, 30, 45, 0, 30,
    ]);
  });

  it("scores a guest's answers, sent when the admin reveals them, with the guest's streak", () => {
    const submitAnswer = vi.fn();
    const socketAt = (questionIndex: number, isShowingFeedback: boolean) =>
      createSocket({
        currentChannel: "room",
        isGameStarted: true,
        gameState: {
          questions: QUESTIONS,
          currentQuestionIndex: questionIndex,
          timerRemaining: 60,
          isShowingResults: false,
        },
        isShowingFeedback,
        submitAnswer,
      });
    const { result, rerender } = renderHook(
      ({ socket }) => useQuiz({ socket, playerName: "Bia" }),
      { initialProps: { socket: socketAt(0, false) } }
    );
    expect(result.current.gameState.status).toBe("playing");

    [0, 1, 2, 3].forEach((questionIndex) => {
      rerender({ socket: socketAt(questionIndex, false) });
      act(() => result.current.selectAnswer(CORRECT));
      rerender({ socket: socketAt(questionIndex, true) });
    });

    expect(submitAnswer).toHaveBeenCalledTimes(4);
    expect(submitAnswer).toHaveBeenLastCalledWith(3, CORRECT, 30);
    expect(result.current.gameState.score).toBe(135);
    expect(result.current.streak.count).toBe(4);
  });

  it("uses the default streak threshold when the game has no settings", async () => {
    const { result } = renderHook(() => useQuiz({ socket: createSocket({ gameSettings: null }) }));
    await act(async () => {
      await result.current.startGame("Ana");
    });

    expect(result.current.streak.threshold).toBe(DEFAULT_GAME_SETTINGS.streakThreshold);
  });
});

// What the device's `useSocket` holds in a room's game, which the tests drive like the realtime
// server does: it shows the answer to the whole room, and moves the room on to the next question
const useFakeRoom = (selfRole: "admin" | "guest") => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isShowingFeedback, setIsShowingFeedback] = useState(false);
  const [calls] = useState(() => ({ submitAnswer: vi.fn(), nextQuestion: vi.fn() }));

  return {
    calls,
    socket: createSocket({
      currentChannel: "room",
      selfRole,
      isGameStarted: true,
      gameState: {
        questions: QUESTIONS,
        currentQuestionIndex,
        timerRemaining: 60,
        isShowingResults: false,
      },
      isShowingFeedback,
      setIsShowingFeedback,
      ...calls,
    }),
    server: {
      showAnswer: () => setIsShowingFeedback(true),
      moveOn: () => setCurrentQuestionIndex((index) => index + 1),
    },
  };
};

// eslint-disable-next-line max-lines-per-function
describe("useQuiz in a room's game", () => {
  const renderRoom = (selfRole: "admin" | "guest") => {
    // What every render showed, so that a flash of an answer can't go unnoticed
    const shown: { questionId?: string; isShowingFeedback: boolean }[] = [];
    const view = renderHook(() => {
      const room = useFakeRoom(selfRole);
      const quiz = useQuiz({
        socket: room.socket,
        isAdmin: selfRole === "admin",
        playerName: "Ana",
      });
      shown.push({
        questionId: quiz.currentQuestion?.id,
        isShowingFeedback: quiz.isShowingFeedback,
      });
      return { room, quiz };
    });
    return { ...view, shown };
  };

  it("shows the admin's answer when the server shows it, without flashing it before", () => {
    const { result, shown } = renderRoom("admin");
    shown.length = 0;

    act(() => result.current.quiz.submitAnswer(5));
    expect(result.current.room.calls.submitAnswer).toHaveBeenCalledWith(0, -1, 5);
    expect(result.current.quiz.isShowingFeedback).toBe(false);

    act(() => result.current.room.server.showAnswer());
    expect(result.current.quiz.isShowingFeedback).toBe(true);
    // Never shown, hidden and shown again
    const values = shown.map((render) => render.isShowingFeedback);
    expect(values.join()).toBe([...values].sort().join());
  });

  it("keeps the answered question on screen when the admin moves on, until the next one comes", () => {
    const { result, shown } = renderRoom("admin");
    act(() => result.current.quiz.selectAnswer(1));
    act(() => result.current.quiz.submitAnswer(5));
    act(() => result.current.room.server.showAnswer());
    shown.length = 0;

    act(() => result.current.quiz.nextQuestion());
    expect(result.current.room.calls.nextQuestion).toHaveBeenCalledTimes(1);
    expect(result.current.quiz.currentQuestion?.id).toBe("q1");
    expect(result.current.quiz.isShowingFeedback).toBe(true);
    expect(result.current.quiz.selectedAnswer).toBe(1);

    act(() => result.current.room.server.moveOn());
    expect(result.current.quiz.currentQuestion?.id).toBe("q2");
    expect(result.current.quiz.isShowingFeedback).toBe(false);
    expect(result.current.quiz.selectedAnswer).toBeNull();
    // The answer stayed on the answered question, and the next one never showed it
    expect(shown).not.toContainEqual({ questionId: "q1", isShowingFeedback: false });
    expect(shown).not.toContainEqual({ questionId: "q2", isShowingFeedback: true });
  });

  it("sends a guest's pick once, when the room shows the answer, and clears it on the next question", () => {
    const { result, shown } = renderRoom("guest");
    act(() => result.current.quiz.selectAnswer(CORRECT));
    shown.length = 0;

    act(() => result.current.room.server.showAnswer());
    expect(result.current.room.calls.submitAnswer).toHaveBeenCalledWith(0, CORRECT, 30);
    expect(result.current.quiz.isShowingFeedback).toBe(true);
    expect(result.current.quiz.gameState.score).toBe(30);

    // Every other answer of the room shows it again
    act(() => result.current.room.server.showAnswer());
    expect(result.current.room.calls.submitAnswer).toHaveBeenCalledTimes(1);
    expect(result.current.quiz.gameState.answers).toHaveLength(1);

    act(() => result.current.room.server.moveOn());
    expect(result.current.quiz.currentQuestion?.id).toBe("q2");
    expect(result.current.quiz.isShowingFeedback).toBe(false);
    expect(result.current.quiz.selectedAnswer).toBeNull();
    expect(shown).not.toContainEqual({ questionId: "q2", isShowingFeedback: true });
  });

  it("shows a guest's answer when the server does, after the guest sent it as the time ran out", () => {
    const { result } = renderRoom("guest");
    act(() => result.current.quiz.selectAnswer(WRONG));

    act(() => result.current.quiz.submitAnswer(60));
    expect(result.current.room.calls.submitAnswer).toHaveBeenCalledWith(0, WRONG, 60);
    expect(result.current.quiz.isShowingFeedback).toBe(false);

    act(() => result.current.room.server.showAnswer());
    expect(result.current.quiz.isShowingFeedback).toBe(true);
    // The pick had gone to the server: the room showing the answer doesn't send it again
    expect(result.current.room.calls.submitAnswer).toHaveBeenCalledTimes(1);
    expect(result.current.quiz.gameState.answers).toHaveLength(1);
  });

  it("shows a standalone game's answer at once, and hides it on the next question", async () => {
    vi.mocked(fetchQuestionsByCategories).mockResolvedValue(QUESTIONS);
    const { result } = renderHook(() => useQuiz({ socket: createSocket() }));
    await act(async () => {
      await result.current.startGame("Ana");
    });

    act(() => result.current.selectAnswer(CORRECT));
    act(() => result.current.submitAnswer(5));
    expect(result.current.isShowingFeedback).toBe(true);

    act(() => result.current.nextQuestion());
    expect(result.current.isShowingFeedback).toBe(false);
    expect(result.current.selectedAnswer).toBeNull();
  });
});
