import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Narrator } from "../narrator";

import type { NarratorRequest, NarratorResponse } from "../narratorWorker";

const VOICE = "pt_BR-faber-medium";

// The worker as the narrator sees it: what it was asked, and a way to answer
class FakeWorker {
  onmessage: ((event: { data: NarratorResponse }) => void) | null = null;
  onerror: (() => void) | null = null;
  requests: NarratorRequest[] = [];
  terminate = vi.fn();

  postMessage(request: NarratorRequest) {
    this.requests.push(request);
  }

  answer(response: NarratorResponse) {
    this.onmessage?.({ data: response });
  }

  // The lines it was asked to synthesize, by their text
  get lines() {
    return this.requests.flatMap((request) =>
      request.type === "synthesize" ? [request.text] : []
    );
  }

  // Answers the last line it was asked for with its speech
  speak(audio = new Blob([this.lastLine().text])) {
    this.answer({ type: "audio", id: this.lastLine().id, audio });
    return audio;
  }

  lastLine() {
    const lines = this.requests.filter((request) => request.type === "synthesize");
    return lines[lines.length - 1];
  }
}

const setUp = () => {
  const workers: FakeWorker[] = [];
  const narrator = new Narrator(() => {
    const worker = new FakeWorker();
    workers.push(worker);
    return worker as unknown as Worker;
  });
  return { narrator, workers, worker: () => workers[workers.length - 1] };
};

const setUpReady = () => {
  const setup = setUp();
  setup.narrator.load(VOICE);
  setup.worker().answer({ type: "ready" });
  return setup;
};

// eslint-disable-next-line max-lines-per-function
describe("Narrator", () => {
  beforeEach(() => {
    // jsdom has no workers
    vi.stubGlobal("Worker", class {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("loads the voice in a worker, following its download", () => {
    const { narrator, worker } = setUp();
    const listener = vi.fn();
    narrator.subscribe(listener);

    narrator.load(VOICE);
    expect(worker().requests).toEqual([{ type: "load", voiceId: VOICE }]);
    expect(narrator.getStatus()).toEqual({ state: "loading", percent: null });

    worker().answer({ type: "progress", percent: 40 });
    expect(narrator.getStatus()).toEqual({ state: "loading", percent: 40 });

    worker().answer({ type: "ready" });
    expect(narrator.getStatus()).toEqual({ state: "ready" });
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("loads a voice once", () => {
    const { narrator, workers } = setUp();

    narrator.load(VOICE);
    narrator.load(VOICE);

    expect(workers).toHaveLength(1);
  });

  it("replaces the voice with another one", () => {
    const { narrator, workers } = setUpReady();

    narrator.load("en_GB-alan-medium");

    expect(workers).toHaveLength(2);
    expect(workers[0].terminate).toHaveBeenCalled();
    expect(workers[1].requests).toEqual([{ type: "load", voiceId: "en_GB-alan-medium" }]);
  });

  it("synthesizes the lines one at a time, in the order they were asked for", async () => {
    const { narrator, worker } = setUpReady();
    const signal = new AbortController().signal;

    const question = narrator.synthesize("Qual é a capital do Brasil?", signal);
    const option = narrator.synthesize("A. São Paulo", signal);
    expect(worker().lines).toEqual(["Qual é a capital do Brasil?"]);

    const questionAudio = worker().speak();
    await expect(question).resolves.toBe(questionAudio);
    expect(worker().lines).toEqual(["Qual é a capital do Brasil?", "A. São Paulo"]);

    const optionAudio = worker().speak();
    await expect(option).resolves.toBe(optionAudio);
  });

  it("waits for the voice before synthesizing", () => {
    const { narrator, worker } = setUp();
    narrator.load(VOICE);

    void narrator.synthesize("Qual é a capital do Brasil?", new AbortController().signal);
    expect(worker().lines).toEqual([]);

    worker().answer({ type: "ready" });
    expect(worker().lines).toEqual(["Qual é a capital do Brasil?"]);
  });

  it("drops a line nobody waits for before the worker gets to it", async () => {
    const { narrator, worker } = setUpReady();
    const stopped = new AbortController();

    void narrator.synthesize("Qual é a capital do Brasil?", new AbortController().signal);
    const option = narrator.synthesize("A. São Paulo", stopped.signal);
    stopped.abort();

    await expect(option).rejects.toMatchObject({ name: "AbortError" });
    worker().speak();
    expect(worker().lines).toEqual(["Qual é a capital do Brasil?"]);
  });

  it("keeps the speech of a line the worker was on when it stopped", async () => {
    const { narrator, worker } = setUpReady();
    const stopped = new AbortController();

    const question = narrator.synthesize("Qual é a capital do Brasil?", stopped.signal);
    stopped.abort();
    await expect(question).rejects.toMatchObject({ name: "AbortError" });
    const audio = worker().speak();

    await expect(
      narrator.synthesize("Qual é a capital do Brasil?", new AbortController().signal)
    ).resolves.toBe(audio);
    expect(worker().lines).toEqual(["Qual é a capital do Brasil?"]);
  });

  it("synthesizes a line asked for twice once", async () => {
    const { narrator, worker } = setUpReady();
    const stopped = new AbortController();

    const first = narrator.synthesize("A. São Paulo", stopped.signal);
    const second = narrator.synthesize("A. São Paulo", new AbortController().signal);
    stopped.abort();
    const audio = worker().speak();

    await expect(first).rejects.toMatchObject({ name: "AbortError" });
    await expect(second).resolves.toBe(audio);
    expect(worker().lines).toEqual(["A. São Paulo"]);
  });

  it("keeps the speech of the last 20 lines", async () => {
    const { narrator, worker } = setUpReady();
    const signal = new AbortController().signal;

    for (let index = 0; index <= 20; index++) {
      const line = narrator.synthesize(`Line ${index}`, signal);
      worker().speak();
      await line;
    }

    await narrator.synthesize("Line 20", signal);
    expect(worker().lines).toHaveLength(21);
    void narrator.synthesize("Line 0", signal);
    expect(worker().lines).toHaveLength(22);
  });

  it("rejects the line the worker couldn't synthesize, and goes on", async () => {
    const { narrator, worker } = setUpReady();
    const signal = new AbortController().signal;

    const question = narrator.synthesize("Qual é a capital do Brasil?", signal);
    void narrator.synthesize("A. São Paulo", signal);
    worker().answer({ type: "synthesis-failed", id: worker().lastLine().id, message: "broken" });

    await expect(question).rejects.toThrow("broken");
    expect(worker().lines).toEqual(["Qual é a capital do Brasil?", "A. São Paulo"]);
  });

  it("fails when the voice doesn't load, and tries again on the next load", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { narrator, workers, worker } = setUp();
    narrator.load(VOICE);
    const question = narrator.synthesize(
      "Qual é a capital do Brasil?",
      new AbortController().signal
    );

    worker().answer({ type: "load-failed", message: "offline" });

    expect(narrator.getStatus()).toEqual({ state: "failed" });
    expect(workers[0].terminate).toHaveBeenCalled();
    await expect(question).rejects.toThrow();

    narrator.load(VOICE);
    expect(workers).toHaveLength(2);
  });

  it("fails when the worker's code doesn't load", () => {
    const { narrator, worker } = setUp();
    narrator.load(VOICE);

    worker().onerror?.();

    expect(narrator.getStatus()).toEqual({ state: "failed" });
  });

  it("fails in a browser that can't run the voice", () => {
    vi.stubGlobal("Worker", undefined);
    const { narrator, workers } = setUp();

    narrator.load(VOICE);

    expect(narrator.getStatus()).toEqual({ state: "failed" });
    expect(workers).toHaveLength(0);
  });

  it("starts the voice over when it hangs on a line, with the lines still waiting", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { narrator, workers, worker } = setUpReady();
    const signal = new AbortController().signal;
    const question = narrator.synthesize("Qual é a capital do Brasil?", signal);
    const option = narrator.synthesize("A. São Paulo", signal);

    vi.advanceTimersByTime(30_000);

    await expect(question).rejects.toThrow();
    expect(workers[0].terminate).toHaveBeenCalled();
    expect(narrator.getStatus()).toEqual({ state: "loading", percent: null });
    worker().answer({ type: "ready" });
    expect(worker().lines).toEqual(["A. São Paulo"]);
    const audio = worker().speak();
    await expect(option).resolves.toBe(audio);
  });

  it("ignores a line the worker answers after the voice started over", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { narrator, workers } = setUpReady();
    const signal = new AbortController().signal;
    const question = narrator.synthesize("Qual é a capital do Brasil?", signal);
    const staleId = workers[0].lastLine().id;
    vi.advanceTimersByTime(30_000);
    await expect(question).rejects.toThrow();
    workers[1].answer({ type: "ready" });

    const option = narrator.synthesize("A. São Paulo", signal);
    workers[0].answer({ type: "audio", id: staleId, audio: new Blob(["stale"]) });
    const audio = workers[1].speak();

    await expect(option).resolves.toBe(audio);
  });

  it("rejects lines without a voice", async () => {
    const { narrator } = setUp();

    await expect(
      narrator.synthesize("Qual é a capital do Brasil?", new AbortController().signal)
    ).rejects.toThrow();
  });

  it("drops the voice, the lines waiting and the speech kept when disposed", async () => {
    const { narrator, workers, worker } = setUpReady();
    const signal = new AbortController().signal;
    const kept = narrator.synthesize("Qual é a capital do Brasil?", signal);
    worker().speak();
    await kept;
    const waiting = narrator.synthesize("A. São Paulo", signal);

    narrator.dispose();

    await expect(waiting).rejects.toMatchObject({ name: "AbortError" });
    expect(workers[0].terminate).toHaveBeenCalled();
    expect(narrator.getStatus()).toEqual({ state: "off" });
    narrator.load(VOICE);
    worker().answer({ type: "ready" });
    void narrator.synthesize("Qual é a capital do Brasil?", signal);
    expect(worker().lines).toEqual(["Qual é a capital do Brasil?"]);
  });

  it("stops notifying a listener that unsubscribed", () => {
    const { narrator } = setUp();
    const listener = vi.fn();
    const unsubscribe = narrator.subscribe(listener);

    unsubscribe();
    narrator.load(VOICE);

    expect(listener).not.toHaveBeenCalled();
  });
});
