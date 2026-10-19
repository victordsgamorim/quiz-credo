import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchQuestionsByCategories } from "@/services/questionService";
import { DEFAULT_GAME_SETTINGS } from "@/types/gameSettings";
import type { PowerUpOutcome, Question } from "@/types/quiz";

import { useQuiz } from "../useQuiz";

import type { useSocket } from "../useSocket";

vi.mock("@/services/questionService", () => ({
  fetchQuestionsByCategories: vi.fn(),
  fetchQuestionsInAllLocales: vi.fn(),
}));

// A standalone game's hand is random: these tests play the same one
vi.mock("@/lib/powerUpHand", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/powerUpHand")>()),
  dealPowerUps: () => ["freeze", "steal", "shield"],
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

  it("keeps the streak through the misses of the 2 questions Freeze is used on", async () => {
    const { result } = renderHook(() => useQuiz({ socket: createSocket() }));
    await act(async () => {
      await result.current.startGame("Ana");
    });
    const answer = (answerIndex: number) => {
      act(() => result.current.selectAnswer(answerIndex));
      act(() => result.current.submitAnswer(5));
      act(() => result.current.nextQuestion());
    };

    // Q1-Q3 right: the streak reaches the threshold, Q4 is worth x1.5
    [1, 2, 3].forEach(() => answer(CORRECT));
    act(() => result.current.spendPowerUp("freeze"));
    expect(result.current.streak.isFrozen).toBe(true);

    // Q4 and Q5 wrong, but frozen: no points, and the streak stays
    answer(WRONG);
    expect(result.current.streak.isFrozen).toBe(true);
    answer(WRONG);
    expect(result.current.streak.count).toBe(3);
    expect(result.current.streak.isFrozen).toBe(false);
    expect(result.current.gameState.score).toBe(90);

    // Q6 right keeps the multiplier: 30 x1.5. A miss there would break it
    expect(result.current.streak.questionMultiplier).toBe(1.5);
    act(() => result.current.selectAnswer(CORRECT));
    act(() => result.current.submitAnswer(5));
    expect(result.current.gameState.score).toBe(135);
  });

  it("uses each power-up once per game, one per question, and gives them back in a new game", async () => {
    const { result } = renderHook(() => useQuiz({ socket: createSocket() }));
    await act(async () => {
      await result.current.startGame("Ana");
    });
    const usedIds = () => result.current.gameState.usedPowerUps.map((used) => used.id);
    const nextQuestion = () => {
      act(() => result.current.selectAnswer(CORRECT));
      act(() => result.current.submitAnswer(5));
      act(() => result.current.nextQuestion());
    };
    expect(usedIds()).toEqual([]);

    // Question 1: only the first one used works
    act(() => result.current.spendPowerUp("freeze"));
    act(() => result.current.spendPowerUp("shield"));
    expect(result.current.gameState.usedPowerUps).toEqual([{ id: "freeze", questionId: "q1" }]);

    // Question 2: an used one doesn't work again, another one does
    nextQuestion();
    act(() => result.current.spendPowerUp("freeze"));
    act(() => result.current.spendPowerUp("shield"));
    expect(result.current.gameState.usedPowerUps).toEqual([
      { id: "freeze", questionId: "q1" },
      { id: "shield", questionId: "q2" },
    ]);

    await act(async () => {
      await result.current.startGame("Ana");
    });
    expect(usedIds()).toEqual([]);

    act(() => result.current.spendPowerUp("steal"));
    act(() => result.current.resetGame());
    expect(usedIds()).toEqual([]);
  });

  it("sends the power-ups of a room's game to the server, a disadvantage with its target", () => {
    const sendPowerUp = vi.fn();
    const socket = createSocket({
      currentChannel: "room",
      isGameStarted: true,
      gameState: { questions: QUESTIONS, currentQuestionIndex: 0, timerRemaining: 60 },
      sendPowerUp,
      powerUpHand: ["steal", "shield", "break"],
    } as Partial<Socket>);
    const { result } = renderHook(() => useQuiz({ socket, playerName: "Ana" }));

    act(() => result.current.spendPowerUp("steal", "bia"));
    // One per question: the server isn't asked for a second one
    act(() => result.current.spendPowerUp("shield"));

    expect(sendPowerUp).toHaveBeenCalledTimes(1);
    expect(sendPowerUp).toHaveBeenCalledWith("steal", "bia");
    expect(result.current.gameState.usedPowerUps).toEqual([
      { id: "steal", questionId: "q1", targetId: "bia" },
    ]);
  });

  it("plays only the power-ups of the player's hand", async () => {
    const { result } = renderHook(() => useQuiz({ socket: createSocket() }));
    await act(async () => {
      await result.current.startGame("Ana");
    });
    expect(result.current.powerUpHand).toEqual(["freeze", "steal", "shield"]);

    act(() => result.current.spendPowerUp("break", "bia"));
    expect(result.current.gameState.usedPowerUps).toEqual([]);
  });

  it("resets the streak from the question a Break hit the player on, unless their shield blocked it", () => {
    const breakOn = (questionIndex: number, isBlocked = false): PowerUpOutcome => ({
      questionIndex,
      powerUpId: "break",
      attacker: { id: "bia", name: "Bia" },
      target: { id: "ana", name: "Ana" },
      isBlocked,
    });
    const socketAt = (
      questionIndex: number,
      isShowingFeedback: boolean,
      powerUpOutcomes: PowerUpOutcome[] = []
    ) =>
      createSocket({
        currentChannel: "room",
        isGameStarted: true,
        deviceId: "ana",
        gameState: {
          questions: QUESTIONS,
          currentQuestionIndex: questionIndex,
          timerRemaining: 60,
          isShowingResults: false,
        },
        isShowingFeedback,
        powerUpOutcomes,
      } as Partial<Socket>);
    const { result, rerender } = renderHook(
      ({ socket }) => useQuiz({ socket, playerName: "Ana" }),
      { initialProps: { socket: socketAt(0, false) } }
    );
    const answerRight = (questionIndex: number, outcomes: PowerUpOutcome[] = []) => {
      rerender({ socket: socketAt(questionIndex, false, outcomes) });
      act(() => result.current.selectAnswer(CORRECT));
      rerender({ socket: socketAt(questionIndex, true, outcomes) });
    };

    // Q1-Q3 right: Q4 is worth x1.5
    [0, 1, 2].forEach((questionIndex) => answerRight(questionIndex));
    rerender({ socket: socketAt(3, false) });
    expect(result.current.streak.questionMultiplier).toBe(1.5);

    // A Break blocked by Ana's shield changes nothing
    rerender({ socket: socketAt(3, false, [breakOn(3, true)]) });
    expect(result.current.streak.count).toBe(3);

    // Bia breaks Ana's streak on Q4: x1 on it, and the streak starts again from it
    const hit = [breakOn(3)];
    rerender({ socket: socketAt(3, false, hit) });
    expect(result.current.streak.count).toBe(0);
    expect(result.current.streak.questionMultiplier).toBe(1);
    answerRight(3, hit);
    expect(result.current.gameState.score).toBe(120);
    expect(result.current.streak.count).toBe(1);
  });
});
