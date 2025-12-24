import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";

import { BackgroundMusicProvider, useBackgroundMusicContext } from "../BackgroundMusicContext";

const audioInstances: MockAudio[] = [];

const flushPromises = () => Promise.resolve();

type ViteImportMeta = ImportMeta & { env: { BASE_URL: string } };

class MockAudio {
  public src: string;
  public loop = false;
  public volume = 1;
  public preload = "";
  public currentTime = 0;
  public playResult: Promise<void> | undefined = Promise.resolve();
  public play = vi.fn(() => this.playResult);
  public pause = vi.fn();

  constructor(src = "") {
    this.src = src;
    audioInstances.push(this);
  }
}

const originalAudio = globalThis.Audio;

// eslint-disable-next-line max-lines-per-function
describe("BackgroundMusicContext", () => {
  beforeAll(() => {
    globalThis.Audio = MockAudio as unknown as typeof Audio;
  });

  afterAll(() => {
    globalThis.Audio = originalAudio;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    audioInstances.length = 0;
  });

  it("throws error when used outside provider", () => {
    expect(() => {
      renderHook(() => useBackgroundMusicContext());
    }).toThrow("useBackgroundMusicContext must be used within BackgroundMusicProvider");
  });

  it("provides playIntroMusic and stopIntroMusic functions", () => {
    const { result } = renderHook(() => useBackgroundMusicContext(), {
      wrapper: BackgroundMusicProvider,
    });

    expect(result.current.playIntroMusic).toBeDefined();
    expect(result.current.stopIntroMusic).toBeDefined();
    expect(typeof result.current.playIntroMusic).toBe("function");
    expect(typeof result.current.stopIntroMusic).toBe("function");
  });

  it("provides isPlaying property", () => {
    const { result } = renderHook(() => useBackgroundMusicContext(), {
      wrapper: BackgroundMusicProvider,
    });

    expect(result.current.isPlaying).toBeDefined();
    expect(typeof result.current.isPlaying).toBe("boolean");
  });

  it("playIntroMusic does not throw error", () => {
    const { result } = renderHook(() => useBackgroundMusicContext(), {
      wrapper: BackgroundMusicProvider,
    });

    expect(() => {
      act(() => {
        result.current.playIntroMusic();
      });
    }).not.toThrow();
  });

  it("stopIntroMusic does not throw error", () => {
    const { result } = renderHook(() => useBackgroundMusicContext(), {
      wrapper: BackgroundMusicProvider,
    });

    expect(() => {
      act(() => {
        result.current.stopIntroMusic();
      });
    }).not.toThrow();
  });

  it("can call playIntroMusic multiple times without error", () => {
    const { result } = renderHook(() => useBackgroundMusicContext(), {
      wrapper: BackgroundMusicProvider,
    });

    expect(() => {
      act(() => {
        result.current.playIntroMusic();
        result.current.playIntroMusic();
        result.current.playIntroMusic();
      });
    }).not.toThrow();
  });

  it("can call stopIntroMusic multiple times without error", () => {
    const { result } = renderHook(() => useBackgroundMusicContext(), {
      wrapper: BackgroundMusicProvider,
    });

    expect(() => {
      act(() => {
        result.current.stopIntroMusic();
        result.current.stopIntroMusic();
        result.current.stopIntroMusic();
      });
    }).not.toThrow();
  });

  it("can alternate between play and stop", () => {
    const { result } = renderHook(() => useBackgroundMusicContext(), {
      wrapper: BackgroundMusicProvider,
    });

    expect(() => {
      act(() => {
        result.current.playIntroMusic();
        result.current.stopIntroMusic();
        result.current.playIntroMusic();
        result.current.stopIntroMusic();
      });
    }).not.toThrow();
  });

  it("initializes the audio element with expected defaults", () => {
    renderHook(() => useBackgroundMusicContext(), {
      wrapper: BackgroundMusicProvider,
    });

    const baseUrl = (import.meta as ViteImportMeta).env.BASE_URL;
    const expectedSrc = `${baseUrl}assets/audios/intro.mp3`;

    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe(expectedSrc);
    expect(audioInstances[0].loop).toBe(true);
    expect(audioInstances[0].volume).toBe(0.3);
    expect(audioInstances[0].preload).toBe("auto");
  });

  it("does not recreate the audio element on rerender", () => {
    const { rerender } = renderHook(() => useBackgroundMusicContext(), {
      wrapper: BackgroundMusicProvider,
    });

    expect(audioInstances).toHaveLength(1);

    rerender();

    expect(audioInstances).toHaveLength(1);
  });

  it("plays from the start and updates playing state after the promise resolves", async () => {
    const { result, rerender } = renderHook(() => useBackgroundMusicContext(), {
      wrapper: BackgroundMusicProvider,
    });

    audioInstances[0].currentTime = 12;

    await act(async () => {
      result.current.playIntroMusic();
      await flushPromises();
    });

    rerender();

    expect(audioInstances[0].play).toHaveBeenCalledTimes(1);
    expect(audioInstances[0].currentTime).toBe(0);
    expect(result.current.isPlaying).toBe(true);
  });

  it("does not call play again when already playing", async () => {
    const { result, rerender } = renderHook(() => useBackgroundMusicContext(), {
      wrapper: BackgroundMusicProvider,
    });

    await act(async () => {
      result.current.playIntroMusic();
      await flushPromises();
    });

    rerender();

    await act(async () => {
      result.current.playIntroMusic();
      await flushPromises();
    });

    expect(audioInstances[0].play).toHaveBeenCalledTimes(1);
  });

  it("stops audio, resets playback, and updates playing state", async () => {
    const { result, rerender } = renderHook(() => useBackgroundMusicContext(), {
      wrapper: BackgroundMusicProvider,
    });

    await act(async () => {
      result.current.playIntroMusic();
      await flushPromises();
    });

    rerender();
    expect(result.current.isPlaying).toBe(true);

    audioInstances[0].currentTime = 8;

    act(() => {
      result.current.stopIntroMusic();
    });

    rerender();

    expect(audioInstances[0].pause).toHaveBeenCalledTimes(1);
    expect(audioInstances[0].currentTime).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });

  it("handles NotAllowedError when autoplay is blocked", async () => {
    const { result, rerender } = renderHook(() => useBackgroundMusicContext(), {
      wrapper: BackgroundMusicProvider,
    });

    const error = new Error("Autoplay blocked");
    error.name = "NotAllowedError";
    audioInstances[0].playResult = Promise.reject(error);

    await act(async () => {
      result.current.playIntroMusic();
      await flushPromises();
    });

    rerender();

    expect(audioInstances[0].play).toHaveBeenCalledTimes(1);
    expect(result.current.isPlaying).toBe(false);
  });

  it("cleans up the audio element on unmount", () => {
    const { unmount } = renderHook(() => useBackgroundMusicContext(), {
      wrapper: BackgroundMusicProvider,
    });

    unmount();

    expect(audioInstances[0].pause).toHaveBeenCalledTimes(1);
    expect(audioInstances[0].src).toBe("");
  });
});
