import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";

import { useAudioManager } from "../useAudioManager";

// The audio elements the hook creates: the jingle first, then the suspense music
let elements: HTMLAudioElement[] = [];
let play: MockInstance<HTMLMediaElement["play"]>;
let pause: MockInstance<HTMLMediaElement["pause"]>;

const getJingle = () => elements[0];
const getSuspenseMusic = () => elements[1];

const flush = () =>
  act(async () => {
    for (let index = 0; index < 3; index++) await Promise.resolve();
  });

// eslint-disable-next-line max-lines-per-function
describe("useAudioManager", () => {
  beforeEach(() => {
    elements = [];
    vi.stubGlobal("Audio", function (src?: string) {
      const audio = document.createElement("audio");
      if (src) audio.src = src;
      elements.push(audio);
      return audio;
    });
    play = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() => Promise.resolve());
    pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Unmounted while the mocks still stand in for the browser's audio
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("plays the jingle, then the suspense music once it ends", () => {
    const { result } = renderHook(() => useAudioManager());

    act(() => result.current.startNewQuestion());
    expect(play.mock.contexts).toEqual([getJingle()]);
    expect(result.current.state).toBe("question-start");

    act(() => {
      getJingle().dispatchEvent(new Event("ended"));
    });
    expect(play.mock.contexts).toEqual([getJingle(), getSuspenseMusic()]);
    expect(getSuspenseMusic().src).toMatch(/question-suspense-[12]\.mp3$/);
    expect(result.current.state).toBe("suspense");
  });

  it("starts the host's reading when the jingle ends", () => {
    const onQuestionStartEnd = vi.fn();
    const { result } = renderHook(() => useAudioManager({ onQuestionStartEnd }));
    act(() => result.current.startNewQuestion());
    expect(onQuestionStartEnd).not.toHaveBeenCalled();

    act(() => {
      getJingle().dispatchEvent(new Event("ended"));
    });

    expect(onQuestionStartEnd).toHaveBeenCalledTimes(1);
  });

  it("starts the reading even when the suspense music can't play", async () => {
    const onQuestionStartEnd = vi.fn();
    const { result } = renderHook(() => useAudioManager({ onQuestionStartEnd }));
    act(() => result.current.startNewQuestion());
    play.mockRejectedValueOnce(new DOMException("Not found", "NotSupportedError"));

    act(() => {
      getJingle().dispatchEvent(new Event("ended"));
    });
    await flush();

    expect(onQuestionStartEnd).toHaveBeenCalledTimes(1);
  });

  it("starts the reading right away when the browser doesn't let the jingle play", async () => {
    const onQuestionStartEnd = vi.fn();
    const { result } = renderHook(() => useAudioManager({ onQuestionStartEnd }));
    play.mockRejectedValueOnce(new DOMException("No tap yet", "NotAllowedError"));

    act(() => result.current.startNewQuestion());
    await flush();

    expect(onQuestionStartEnd).toHaveBeenCalledTimes(1);
  });

  it("doesn't start the reading when the jingle was stopped before it played", async () => {
    const onQuestionStartEnd = vi.fn();
    const { result } = renderHook(() => useAudioManager({ onQuestionStartEnd }));
    play.mockRejectedValueOnce(new DOMException("Interrupted", "AbortError"));

    act(() => result.current.startNewQuestion());
    await flush();

    expect(onQuestionStartEnd).not.toHaveBeenCalled();
  });

  it("starts the reading with the latest callback", () => {
    const first = vi.fn();
    const latest = vi.fn();
    const { result, rerender } = renderHook(
      ({ onQuestionStartEnd }) => useAudioManager({ onQuestionStartEnd }),
      { initialProps: { onQuestionStartEnd: first } }
    );
    rerender({ onQuestionStartEnd: latest });
    act(() => result.current.startNewQuestion());

    act(() => {
      getJingle().dispatchEvent(new Event("ended"));
    });

    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });

  it("stops the jingle and the music", () => {
    const { result } = renderHook(() => useAudioManager());
    act(() => result.current.startNewQuestion());

    act(() => result.current.stopAllAudio());

    expect(pause.mock.contexts).toEqual(expect.arrayContaining([getJingle(), getSuspenseMusic()]));
    expect(result.current.state).toBe("idle");
  });
});
