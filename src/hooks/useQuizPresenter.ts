import { useCallback, useEffect, useRef, useState } from "react";

import { playNarration, setNarrationReading } from "@/services/narrationPlayer";
import { createAbortError, narrator, type NarratorStatus } from "@/services/narrator";

import { useNarratorStatus } from "./useNarrator";

type PresenterQuestion = {
  question: string;
  options: string[];
};

type UseQuizPresenterOptions = PresenterQuestion & {
  // The next question of the game: its speech is synthesized after this one's, so it's ready when
  // the question shows
  upcoming?: PresenterQuestion;
};

type UseQuizPresenterReturn = {
  // Reads the question and its options from the start, as soon as their speech is ready
  speak: () => void;
  stop: () => void;
  // From `speak` until the last option was read, or `stop`
  isSpeaking: boolean;
  // The narrator's voice: none outside a room's game, or when it didn't load
  voice: NarratorStatus;
};

const PAUSE_SHORT = 300;
const PAUSE_SUSPENSE = 1200;

const optionLabels = ["A", "B", "C", "D"];

/**
 * Creates a presenter script for a TV quiz host style: the question, then each option with its
 * label. A period parts the label from the option: the voice drops an ellipsis, and runs the label
 * into the option ("A... São Paulo" sounds like "Assão Paulo").
 *
 * @param question - The quiz question text
 * @param options - Array of answer options
 * @returns The lines to read, in order
 */
const createPresenterScript = (question: string, options: string[]): string[] => [
  question,
  ...options.map((option, index) => `${optionLabels[index]}. ${option}`),
];

// A dramatic pause after the question, a short one between the options
const getPauseBefore = (lineIndex: number) => (lineIndex === 1 ? PAUSE_SUSPENSE : PAUSE_SHORT);

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(createAbortError());

    const timeout = setTimeout(() => {
      signal.removeEventListener("abort", handleAbort);
      resolve();
    }, ms);
    const handleAbort = () => {
      clearTimeout(timeout);
      reject(createAbortError());
    };
    signal.addEventListener("abort", handleAbort, { once: true });
  });

// Reads the lines one after another, each as soon as its speech is ready
const readScript = async (clips: Promise<Blob>[], signal: AbortSignal) => {
  for (const [index, clip] of clips.entries()) {
    if (index > 0) await wait(getPauseBefore(index), signal);
    await playNarration(await clip, signal);
  }
};

const hasVoice = (voice: NarratorStatus) => voice.state === "loading" || voice.state === "ready";

// The question's state comes again with every update of the room, so its lines are told apart by
// their text
const getScriptKey = (presented?: PresenterQuestion) =>
  presented ? JSON.stringify(createPresenterScript(presented.question, presented.options)) : null;

// The speech of the script's lines, asked for as soon as the voice is ready
const useScriptClips = (isVoiceReady: boolean, scriptKey: string) => {
  const [clips, setClips] = useState<Promise<Blob>[] | null>(null);

  useEffect(() => {
    if (!isVoiceReady) return;

    const synthesis = new AbortController();
    const lines = JSON.parse(scriptKey) as string[];
    const nextClips = lines.map((line) => narrator.synthesize(line, synthesis.signal));
    // The speech of a reading that stopped is never played: its failure goes unreported
    nextClips.forEach((clip) => {
      clip.catch(() => {});
    });
    setClips(nextClips);
    return () => {
      synthesis.abort();
      setClips(null);
    };
  }, [isVoiceReady, scriptKey]);

  return clips;
};

// The next question's lines, after this one's: the narrator keeps their speech, for the next
// question to find it ready
const useUpcomingScript = (isVoiceReady: boolean, upcomingScriptKey: string | null) => {
  useEffect(() => {
    if (!isVoiceReady || !upcomingScriptKey) return;

    const synthesis = new AbortController();
    (JSON.parse(upcomingScriptKey) as string[]).forEach((line) => {
      narrator.synthesize(line, synthesis.signal).catch(() => {});
    });
    return () => synthesis.abort();
  }, [isVoiceReady, upcomingScriptKey]);
};

/**
 * Hook that reads the quiz question and its options aloud, like a TV quiz host, with the room's
 * narrator (see useNarratorVoice). The speech is synthesized as soon as the question shows, so
 * the reading can start right away; changing the question, or unmounting, stops the reading and
 * drops the speech still to come.
 *
 * @returns Speech control methods and state
 */
export const useQuizPresenter = ({
  question,
  options,
  upcoming,
}: UseQuizPresenterOptions): UseQuizPresenterReturn => {
  const voice = useNarratorStatus();
  const isVoiceReady = voice.state === "ready";
  const clips = useScriptClips(isVoiceReady, getScriptKey({ question, options }));
  useUpcomingScript(isVoiceReady, getScriptKey(upcoming));
  // Set from `speak` to the end of the reading: each reading has its own number
  const [reading, setReading] = useState<number | null>(null);
  const readingCountRef = useRef(0);
  const hasVoiceRef = useRef(hasVoice(voice));
  hasVoiceRef.current = hasVoice(voice);

  useEffect(() => {
    if (reading === null || !clips) return;

    const playback = new AbortController();
    readScript(clips, playback.signal)
      .catch((error: unknown) => {
        if (!playback.signal.aborted) console.warn("[QuizPresenter] The reading stopped:", error);
      })
      .finally(() => {
        if (!playback.signal.aborted) setReading(null);
      });
    return () => playback.abort();
  }, [reading, clips]);

  const speak = useCallback(() => {
    if (!hasVoiceRef.current) return;
    readingCountRef.current += 1;
    setReading(readingCountRef.current);
  }, []);

  const stop = useCallback(() => setReading(null), []);

  // The room's other sounds can tell the host is reading
  const isSpeaking = reading !== null;
  useEffect(() => {
    setNarrationReading(isSpeaking);
    return () => setNarrationReading(false);
  }, [isSpeaking]);

  return { speak, stop, isSpeaking, voice };
};
