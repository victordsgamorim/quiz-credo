import type { Locale } from "@/types/i18n";

import type { NarratorRequest, NarratorResponse } from "./narratorWorker";

// The narrator's Piper voice for each locale (https://huggingface.co/rhasspy/piper-voices): the
// admin's questions come in their own locale
export const NARRATOR_VOICES: Record<Locale, string> = {
  "pt-BR": "pt_BR-faber-medium",
  "en-UK": "en_GB-alan-medium",
  "es-BO": "es_MX-ald-medium",
};

export type NarratorStatus =
  // No voice: outside a room's game
  | { state: "off" }
  // Downloading the voice (the first time, about 60 MB) or opening it; how much downloaded, from 0
  // to 100, when known
  | { state: "loading"; percent: number | null }
  | { state: "ready" }
  // The voice didn't load (no connection, or a browser that can't run it)
  | { state: "failed" };

type Waiter = {
  resolve: (clip: Blob) => void;
  reject: (error: Error) => void;
};

// A line to synthesize, and everyone waiting for its speech
type Job = {
  id: number;
  text: string;
  waiters: Set<Waiter>;
};

// A line that takes longer than this hangs the voice, which then starts over
const SYNTHESIS_TIMEOUT_MS = 30_000;
// The speech of the last lines, enough for a question and the next one
const CLIP_CACHE_SIZE = 20;

const OFF: NarratorStatus = { state: "off" };

export const isNarratorSupported = () =>
  typeof Worker !== "undefined" && typeof WebAssembly === "object";

export const createAbortError = () => new DOMException("The narration stopped", "AbortError");

/*
 * The room's narrator: a voice that runs in the browser, in a worker (narratorWorker.ts), and turns
 * lines into speech one at a time, in the order they were asked for. A line nobody waits for any
 * more (its question changed, the admin left the game) leaves the queue before the worker gets to
 * it, and the speech of the last lines is kept, so a line asked for again is ready at once.
 */
export class Narrator {
  private status: NarratorStatus = OFF;
  private readonly listeners = new Set<() => void>();
  private worker: Worker | null = null;
  private voiceId: string | null = null;
  private readonly clips = new Map<string, Blob>();
  // The lines still to synthesize, by their text
  private readonly jobs = new Map<string, Job>();
  private queue: Job[] = [];
  // The line the worker is on, and the time it has left
  private current: Job | null = null;
  private timeout: ReturnType<typeof setTimeout> | undefined;
  private nextJobId = 1;

  constructor(private readonly createWorker: () => Worker) {}

  getStatus = () => this.status;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  // Loads a voice, once; a voice that failed is tried again, and another voice replaces it
  load(voiceId: string) {
    if (voiceId === this.voiceId && this.status.state !== "failed") return;
    this.dispose();
    if (!isNarratorSupported()) {
      this.setStatus({ state: "failed" });
      return;
    }
    this.voiceId = voiceId;
    this.startWorker(voiceId);
  }

  // A line's speech, as a WAV file. Lines asked for before the voice is ready wait for it; the
  // signal stops waiting
  synthesize(text: string, signal: AbortSignal) {
    return new Promise<Blob>((resolve, reject) => {
      if (signal.aborted) return reject(createAbortError());
      const clip = this.clips.get(text);
      if (clip) return resolve(clip);
      if (!this.worker) return reject(new Error("The narrator has no voice"));

      const job = this.jobs.get(text) ?? this.queueJob(text);
      const waiter: Waiter = { resolve, reject };
      job.waiters.add(waiter);
      signal.addEventListener("abort", () => this.cancel(job, waiter), { once: true });
      this.next();
    });
  }

  // Back to no voice: the worker stops, and the lines still waiting and the speech kept are dropped
  dispose() {
    this.stopWorker();
    this.voiceId = null;
    this.rejectAll(createAbortError());
    this.clips.clear();
    this.setStatus(OFF);
  }

  private setStatus(status: NarratorStatus) {
    if (status === this.status) return;
    this.status = status;
    this.listeners.forEach((listener) => listener());
  }

  private startWorker(voiceId: string) {
    const worker = this.createWorker();
    worker.onmessage = (event: MessageEvent<NarratorResponse>) => this.handleMessage(event.data);
    // The worker's own code didn't load
    worker.onerror = () => this.fail();
    this.worker = worker;
    this.setStatus({ state: "loading", percent: null });
    this.post({ type: "load", voiceId });
  }

  private stopWorker() {
    clearTimeout(this.timeout);
    this.worker?.terminate();
    this.worker = null;
  }

  private post(request: NarratorRequest) {
    this.worker?.postMessage(request);
  }

  private handleMessage(message: NarratorResponse) {
    switch (message.type) {
      case "progress":
        if (this.status.state === "loading") {
          this.setStatus({ state: "loading", percent: message.percent });
        }
        return;
      case "ready":
        this.setStatus({ state: "ready" });
        this.next();
        return;
      case "load-failed":
        console.warn("[Narrator] The voice didn't load:", message.message);
        this.fail();
        return;
      case "audio":
        this.settle(message.id, message.audio);
        return;
      case "synthesis-failed":
        this.settle(message.id, new Error(message.message));
    }
  }

  private queueJob(text: string) {
    const job: Job = { id: this.nextJobId++, text, waiters: new Set() };
    this.jobs.set(text, job);
    this.queue.push(job);
    return job;
  }

  // The worker takes the next line, once it's done with the one it's on
  private next() {
    if (this.current || this.status.state !== "ready") return;
    const job = this.queue.shift();
    if (!job) return;

    this.current = job;
    this.timeout = setTimeout(() => this.restart(), SYNTHESIS_TIMEOUT_MS);
    this.post({ type: "synthesize", id: job.id, text: job.text });
  }

  private settle(id: number, result: Blob | Error) {
    // A line from the worker before a restart
    if (this.current?.id !== id) return;
    clearTimeout(this.timeout);
    const job = this.current;
    this.current = null;
    this.jobs.delete(job.text);
    if (result instanceof Blob) {
      this.keepClip(job.text, result);
      job.waiters.forEach((waiter) => waiter.resolve(result));
    } else {
      job.waiters.forEach((waiter) => waiter.reject(result));
    }
    this.next();
  }

  private keepClip(text: string, clip: Blob) {
    this.clips.set(text, clip);
    // The oldest speech goes first (a Map keeps the order it was set in)
    if (this.clips.size <= CLIP_CACHE_SIZE) return;
    const [oldest] = this.clips.keys();
    this.clips.delete(oldest);
  }

  // A line nobody waits for leaves the queue. One the worker is already on finishes there (it
  // can't stop midway), and its speech is kept
  private cancel(job: Job, waiter: Waiter) {
    job.waiters.delete(waiter);
    waiter.reject(createAbortError());
    if (job.waiters.size > 0 || job === this.current) return;
    this.jobs.delete(job.text);
    this.queue = this.queue.filter((queued) => queued !== job);
  }

  // The voice hangs on a line: a new worker takes over, with the lines still waiting
  private restart() {
    console.warn("[Narrator] The voice hung on a line; starting it over");
    const job = this.current;
    this.current = null;
    if (job) {
      this.jobs.delete(job.text);
      job.waiters.forEach((waiter) => waiter.reject(new Error("The line took too long")));
    }
    this.stopWorker();
    if (this.voiceId) this.startWorker(this.voiceId);
  }

  private fail() {
    this.stopWorker();
    this.rejectAll(new Error("The narrator's voice didn't load"));
    this.setStatus({ state: "failed" });
  }

  private rejectAll(error: Error) {
    this.jobs.forEach((job) => job.waiters.forEach((waiter) => waiter.reject(error)));
    this.jobs.clear();
    this.current = null;
    this.queue = [];
  }
}

export const narrator = new Narrator(
  () => new Worker(new URL("./narratorWorker.ts", import.meta.url), { type: "module" })
);
