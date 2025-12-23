import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useQuizPresenter } from "../useQuizPresenter";

// Mock SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  text: string;
  lang: string = "pt-BR";
  rate: number = 1;
  pitch: number = 1;
  volume: number = 1;
  voice: SpeechSynthesisVoice | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

// Mock speechSynthesis
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
const mockPause = vi.fn();
const mockResume = vi.fn();
const mockGetVoices = vi.fn(() => [
  { lang: "pt-BR", name: "Google português do Brasil" } as SpeechSynthesisVoice,
]);

const createMockSpeechSynthesis = () => ({
  speak: mockSpeak,
  cancel: mockCancel,
  pause: mockPause,
  resume: mockResume,
  getVoices: mockGetVoices,
  onvoiceschanged: null as (() => void) | null,
});

// eslint-disable-next-line max-lines-per-function
describe("useQuizPresenter", () => {
  const defaultProps = {
    question: "Qual é a capital do Brasil?",
    options: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
    autoPlay: false,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    // Setup global mocks
    global.SpeechSynthesisUtterance =
      MockSpeechSynthesisUtterance as unknown as typeof SpeechSynthesisUtterance;
    Object.defineProperty(window, "speechSynthesis", {
      value: createMockSpeechSynthesis(),
      writable: true,
      configurable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("returns isSupported as true when Web Speech API is available", () => {
    const { result } = renderHook(() => useQuizPresenter(defaultProps));

    expect(result.current.isSupported).toBe(true);
  });

  it("initializes with idle state", () => {
    const { result } = renderHook(() => useQuizPresenter(defaultProps));

    expect(result.current.state).toBe("idle");
  });

  it("starts speaking when speak is called", () => {
    const { result } = renderHook(() => useQuizPresenter(defaultProps));

    act(() => {
      result.current.speak();
    });

    // Advance timer to allow speech to start
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.state).toBe("speaking");
    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
  });

  it("stops speaking when stop is called", () => {
    const { result } = renderHook(() => useQuizPresenter(defaultProps));

    act(() => {
      result.current.speak();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current.stop();
    });

    expect(result.current.state).toBe("idle");
    expect(mockCancel).toHaveBeenCalled();
  });

  it("pauses speaking when pause is called", () => {
    const { result } = renderHook(() => useQuizPresenter(defaultProps));

    act(() => {
      result.current.speak();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.state).toBe("paused");
    expect(mockPause).toHaveBeenCalled();
  });

  it("resumes speaking when resume is called after pause", () => {
    const { result } = renderHook(() => useQuizPresenter(defaultProps));

    act(() => {
      result.current.speak();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current.pause();
    });

    act(() => {
      result.current.resume();
    });

    expect(result.current.state).toBe("speaking");
    expect(mockResume).toHaveBeenCalled();
  });

  it("replays speech when replay is called", () => {
    const { result } = renderHook(() => useQuizPresenter(defaultProps));

    act(() => {
      result.current.replay();
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.state).toBe("speaking");
    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
  });

  it("auto-plays when autoPlay is true", () => {
    renderHook(() =>
      useQuizPresenter({
        ...defaultProps,
        autoPlay: true,
      })
    );

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(mockSpeak).toHaveBeenCalled();
  });

  it("does not auto-play when autoPlay is false", () => {
    renderHook(() =>
      useQuizPresenter({
        ...defaultProps,
        autoPlay: false,
      })
    );

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(mockSpeak).not.toHaveBeenCalled();
  });

  it("calls onSpeechStart callback when speech starts", () => {
    const onSpeechStart = vi.fn();
    const { result } = renderHook(() =>
      useQuizPresenter({
        ...defaultProps,
        onSpeechStart,
      })
    );

    act(() => {
      result.current.speak();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Simulate utterance onstart
    const utterance = mockSpeak.mock.calls[0][0] as MockSpeechSynthesisUtterance;
    act(() => {
      utterance.onstart?.();
    });

    expect(onSpeechStart).toHaveBeenCalled();
  });

  it("cancels speech on unmount", () => {
    const { unmount } = renderHook(() => useQuizPresenter(defaultProps));

    unmount();

    expect(mockCancel).toHaveBeenCalled();
  });

  it("uses Portuguese language for utterance", () => {
    const { result } = renderHook(() => useQuizPresenter(defaultProps));

    act(() => {
      result.current.speak();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const utterance = mockSpeak.mock.calls[0][0] as MockSpeechSynthesisUtterance;
    expect(utterance.lang).toBe("pt-BR");
  });

  it("speaks question followed by options with labels", () => {
    const { result } = renderHook(() => useQuizPresenter(defaultProps));

    act(() => {
      result.current.speak();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // First utterance should be the question
    const firstUtterance = mockSpeak.mock.calls[0][0] as MockSpeechSynthesisUtterance;
    expect(firstUtterance.text).toBe("Qual é a capital do Brasil?");
  });

  it("provides all expected methods and properties", () => {
    const { result } = renderHook(() => useQuizPresenter(defaultProps));

    expect(result.current).toHaveProperty("speak");
    expect(result.current).toHaveProperty("stop");
    expect(result.current).toHaveProperty("pause");
    expect(result.current).toHaveProperty("resume");
    expect(result.current).toHaveProperty("replay");
    expect(result.current).toHaveProperty("state");
    expect(result.current).toHaveProperty("isSupported");

    expect(typeof result.current.speak).toBe("function");
    expect(typeof result.current.stop).toBe("function");
    expect(typeof result.current.pause).toBe("function");
    expect(typeof result.current.resume).toBe("function");
    expect(typeof result.current.replay).toBe("function");
  });
});
