import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";

type Player = typeof import("../narrationPlayer");

// The audio elements that played, in order
let played: HTMLMediaElement[] = [];
let play: MockInstance<HTMLMediaElement["play"]>;
let pause: MockInstance<HTMLMediaElement["pause"]>;
// jsdom has no object URLs
const createObjectURL = vi.fn((_clip: Blob) => "blob:clip");
const revokeObjectURL = vi.fn((_url: string) => {});

// The player keeps its audio element: a fresh copy of the module for every test
const loadPlayer = async (): Promise<Player> => {
  vi.resetModules();
  return import("../narrationPlayer");
};

const setPaused = (element: HTMLMediaElement, isPaused: boolean) =>
  Object.defineProperty(element, "paused", { value: isPaused, configurable: true });

// eslint-disable-next-line max-lines-per-function
describe("narrationPlayer", () => {
  beforeEach(() => {
    played = [];
    play = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
      this: HTMLMediaElement
    ) {
      played.push(this);
      return Promise.resolve();
    });
    pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("plays a clip, and resolves when it ends", async () => {
    const { playNarration } = await loadPlayer();
    const clip = new Blob(["speech"]);

    const playing = playNarration(clip, new AbortController().signal);
    expect(createObjectURL).toHaveBeenCalledWith(clip);
    expect(played[0].src).toBe("blob:clip");
    played[0].dispatchEvent(new Event("ended"));

    await expect(playing).resolves.toBeUndefined();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:clip");
  });

  it("stops the clip when the signal aborts", async () => {
    const { playNarration } = await loadPlayer();
    const reading = new AbortController();

    const playing = playNarration(new Blob(["speech"]), reading.signal);
    reading.abort();

    await expect(playing).rejects.toMatchObject({ name: "AbortError" });
    expect(pause).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:clip");
  });

  it("doesn't play a clip whose reading already stopped", async () => {
    const { playNarration } = await loadPlayer();
    const reading = new AbortController();
    reading.abort();

    await expect(playNarration(new Blob(["speech"]), reading.signal)).rejects.toMatchObject({
      name: "AbortError",
    });
    expect(play).not.toHaveBeenCalled();
  });

  it("rejects a clip the browser doesn't let play", async () => {
    const { playNarration } = await loadPlayer();
    play.mockRejectedValueOnce(new DOMException("No tap yet", "NotAllowedError"));

    await expect(
      playNarration(new Blob(["speech"]), new AbortController().signal)
    ).rejects.toMatchObject({ name: "NotAllowedError" });
  });

  it("rejects a clip that can't be decoded", async () => {
    const { playNarration } = await loadPlayer();

    const playing = playNarration(new Blob(["speech"]), new AbortController().signal);
    played[0].dispatchEvent(new Event("error"));

    await expect(playing).rejects.toThrow();
  });

  it("plays every clip on the same element", async () => {
    const { playNarration } = await loadPlayer();
    const signal = new AbortController().signal;

    const first = playNarration(new Blob(["question"]), signal);
    played[0].dispatchEvent(new Event("ended"));
    await first;
    void playNarration(new Blob(["option"]), signal);

    expect(played).toHaveLength(2);
    expect(played[1]).toBe(played[0]);
  });

  it("unlocks its element with silence during a tap, once", async () => {
    const { unlockNarrationPlayer } = await loadPlayer();

    unlockNarrationPlayer();
    await Promise.resolve();
    unlockNarrationPlayer();

    expect(played).toHaveLength(1);
    expect(played[0].src).toMatch(/^data:audio\/wav;base64,/);
  });

  it("doesn't interrupt a clip to unlock its element", async () => {
    const { playNarration, unlockNarrationPlayer } = await loadPlayer();
    play.mockImplementationOnce(function (this: HTMLMediaElement) {
      played.push(this);
      return new Promise(() => {});
    });
    void playNarration(new Blob(["speech"]), new AbortController().signal);
    setPaused(played[0], false);

    unlockNarrationPlayer();

    expect(played).toHaveLength(1);
    expect(played[0].src).toBe("blob:clip");
  });

  it("needs no unlocking once a clip played", async () => {
    const { playNarration, unlockNarrationPlayer } = await loadPlayer();

    void playNarration(new Blob(["speech"]), new AbortController().signal);
    await Promise.resolve();
    played[0].dispatchEvent(new Event("ended"));
    unlockNarrationPlayer();

    expect(played).toHaveLength(1);
  });
});
