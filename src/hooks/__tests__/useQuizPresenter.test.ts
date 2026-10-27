/* eslint-disable max-lines */
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { NarratorStatus } from "@/services/narrator";

import { useQuizPresenter } from "../useQuizPresenter";

type Pending<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  signal: AbortSignal;
};

const { synthesized, played, voice, createAbortError } = vi.hoisted(() => ({
  // Every line asked to the narrator, and every clip played, waiting for the test to finish them
  synthesized: [] as (Pending<Blob> & { text: string })[],
  played: [] as (Pending<void> & { clip: Blob })[],
  voice: { status: { state: "ready" } as { state: string; percent?: number | null } },
  createAbortError: () => new DOMException("The narration stopped", "AbortError"),
}));

// A promise for the test to settle, which the signal rejects as a stopped narration does
const createPending = <T>(signal: AbortSignal) => {
  let resolve: (value: T) => void = () => {};
  let reject: (error: Error) => void = () => {};
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  signal.addEventListener("abort", () => reject(createAbortError()));
  return { promise, resolve, reject, signal };
};

vi.mock("@/services/narrator", () => ({
  createAbortError,
  narrator: {
    synthesize: vi.fn((text: string, signal: AbortSignal) => {
      const pending = { ...createPending<Blob>(signal), text };
      synthesized.push(pending);
      return pending.promise;
    }),
  },
}));

vi.mock("@/services/narrationPlayer", () => ({
  setNarrationReading: vi.fn(),
  playNarration: vi.fn((clip: Blob, signal: AbortSignal) => {
    const pending = { ...createPending<void>(signal), clip };
    played.push(pending);
    return pending.promise;
  }),
}));

vi.mock("../useNarrator", () => ({
  useNarratorStatus: () => voice.status,
}));

const QUESTION = {
  question: "Qual é a capital do Brasil?",
  options: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
};
const SCRIPT = [
  "Qual é a capital do Brasil?",
  "A. São Paulo",
  "B. Rio de Janeiro",
  "C. Brasília",
  "D. Salvador",
];
const NEXT_QUESTION = {
  question: "Quantos planetas existem no Sistema Solar?",
  options: ["Sete", "Oito", "Nove", "Dez"],
};

const flush = () =>
  act(async () => {
    for (let index = 0; index < 5; index++) await Promise.resolve();
  });

const advance = (ms: number) =>
  act(async () => {
    vi.advanceTimersByTime(ms);
    for (let index = 0; index < 5; index++) await Promise.resolve();
  });

// The speech of each line, as the narrator gives it, and the line of each clip played
const textOfClip = new Map<Blob, string>();
const clipOf = (text: string) => {
  const clip = new Blob([text]);
  textOfClip.set(clip, text);
  return clip;
};

const synthesizeAll = async () => {
  synthesized.forEach((line) => line.resolve(clipOf(line.text)));
  await flush();
};

const finishPlaying = async () => {
  played[played.length - 1].resolve();
  await flush();
};

const playedTexts = () => played.map((clip) => textOfClip.get(clip.clip));

// eslint-disable-next-line max-lines-per-function
describe("useQuizPresenter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    synthesized.length = 0;
    played.length = 0;
    voice.status = { state: "ready" };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("synthesizes the question and its labelled options as soon as it shows", () => {
    renderHook(() => useQuizPresenter(QUESTION));

    expect(synthesized.map((line) => line.text)).toEqual(SCRIPT);
  });

  it("waits for the voice to load before synthesizing", () => {
    voice.status = { state: "loading", percent: 40 };
    const { rerender } = renderHook(() => useQuizPresenter(QUESTION));
    expect(synthesized).toHaveLength(0);

    voice.status = { state: "ready" };
    rerender();

    expect(synthesized.map((line) => line.text)).toEqual(SCRIPT);
  });

  it("reads the lines in order, with a pause after the question and between the options", async () => {
    const { result } = renderHook(() => useQuizPresenter(QUESTION));
    await synthesizeAll();

    act(() => result.current.speak());
    await flush();
    expect(result.current.isSpeaking).toBe(true);
    expect(playedTexts()).toEqual(["Qual é a capital do Brasil?"]);

    await finishPlaying();
    await advance(1199);
    expect(played).toHaveLength(1);
    await advance(1);
    expect(played).toHaveLength(2);

    await finishPlaying();
    await advance(300);
    expect(played).toHaveLength(3);
    await finishPlaying();
    await advance(300);
    await finishPlaying();
    await advance(300);
    expect(playedTexts()).toEqual(SCRIPT);

    await finishPlaying();
    expect(result.current.isSpeaking).toBe(false);
  });

  it("reads a line once its speech is ready", async () => {
    const { result } = renderHook(() => useQuizPresenter(QUESTION));

    act(() => result.current.speak());
    await flush();
    expect(played).toHaveLength(0);

    synthesized[0].resolve(clipOf(SCRIPT[0]));
    await flush();
    expect(playedTexts()).toEqual([SCRIPT[0]]);
  });

  it("stops reading on stop", async () => {
    const { result } = renderHook(() => useQuizPresenter(QUESTION));
    await synthesizeAll();
    act(() => result.current.speak());
    await flush();

    act(() => result.current.stop());
    await flush();
    await advance(5000);

    expect(played[0].signal.aborted).toBe(true);
    expect(played).toHaveLength(1);
    expect(result.current.isSpeaking).toBe(false);
  });

  it("reads from the start again after a stop", async () => {
    const { result } = renderHook(() => useQuizPresenter(QUESTION));
    await synthesizeAll();
    act(() => result.current.speak());
    await flush();
    await finishPlaying();
    await advance(1200);
    act(() => result.current.stop());

    act(() => result.current.speak());
    await flush();

    expect(playedTexts()).toEqual([SCRIPT[0], SCRIPT[1], SCRIPT[0]]);
  });

  it("stops reading, and drops the speech still to come, when it unmounts (the game left)", async () => {
    const { result, unmount } = renderHook(() => useQuizPresenter(QUESTION));
    synthesized[0].resolve(clipOf(SCRIPT[0]));
    act(() => result.current.speak());
    await flush();

    unmount();
    await advance(5000);

    expect(played[0].signal.aborted).toBe(true);
    expect(synthesized.every((line) => line.signal.aborted)).toBe(true);
    expect(played).toHaveLength(1);
  });

  it("drops the speech of the last question, and reads the new one, when the question changes", async () => {
    const { result, rerender } = renderHook((question) => useQuizPresenter(question), {
      initialProps: QUESTION,
    });
    await synthesizeAll();
    act(() => result.current.speak());
    await flush();
    const lastQuestionLines = [...synthesized];

    rerender(NEXT_QUESTION);
    await flush();

    expect(played[0].signal.aborted).toBe(true);
    expect(lastQuestionLines.every((line) => line.signal.aborted)).toBe(true);
    expect(synthesized.slice(5).map((line) => line.text)).toEqual([
      "Quantos planetas existem no Sistema Solar?",
      "A. Sete",
      "B. Oito",
      "C. Nove",
      "D. Dez",
    ]);
    synthesized[5].resolve(clipOf(NEXT_QUESTION.question));
    await flush();
    expect(playedTexts()).toEqual([SCRIPT[0], NEXT_QUESTION.question]);
  });

  it("doesn't synthesize the question again when the room sends it again", () => {
    const { rerender } = renderHook((question) => useQuizPresenter(question), {
      initialProps: QUESTION,
    });

    rerender({ ...QUESTION, options: [...QUESTION.options] });

    expect(synthesized).toHaveLength(5);
  });

  it("synthesizes the next question after its own, and drops it when it unmounts", () => {
    const { unmount } = renderHook(() =>
      useQuizPresenter({ ...QUESTION, upcoming: NEXT_QUESTION })
    );

    expect(synthesized.map((line) => line.text)).toEqual([
      ...SCRIPT,
      "Quantos planetas existem no Sistema Solar?",
      "A. Sete",
      "B. Oito",
      "C. Nove",
      "D. Dez",
    ]);
    unmount();
    expect(synthesized.every((line) => line.signal.aborted)).toBe(true);
  });

  it("doesn't read without a voice", async () => {
    voice.status = { state: "failed" };
    const { result } = renderHook(() => useQuizPresenter(QUESTION));

    act(() => result.current.speak());
    await flush();

    expect(result.current.isSpeaking).toBe(false);
    expect(synthesized).toHaveLength(0);
  });

  it("reads once the voice is ready, when asked while it loads", async () => {
    voice.status = { state: "loading", percent: 90 };
    const { result, rerender } = renderHook(() => useQuizPresenter(QUESTION));
    act(() => result.current.speak());
    expect(result.current.isSpeaking).toBe(true);

    voice.status = { state: "ready" };
    rerender();
    await synthesizeAll();

    expect(playedTexts()).toEqual([SCRIPT[0]]);
  });

  it("ends the reading on a line that couldn't be synthesized", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useQuizPresenter(QUESTION));
    act(() => result.current.speak());

    synthesized[0].reject(new Error("broken"));
    await flush();

    expect(result.current.isSpeaking).toBe(false);
    expect(played).toHaveLength(0);
    expect(warn).toHaveBeenCalled();
  });

  it("gives the voice's status", () => {
    voice.status = { state: "loading", percent: 25 };
    const { result } = renderHook(() => useQuizPresenter(QUESTION));

    expect(result.current.voice).toEqual<NarratorStatus>({ state: "loading", percent: 25 });
  });
});
