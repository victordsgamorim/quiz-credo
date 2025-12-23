import { useCallback, useEffect, useRef, useState } from "react";

type PresenterState = "idle" | "speaking" | "paused";

type UseQuizPresenterOptions = {
  question: string;
  options: string[];
  autoPlay?: boolean;
  onSpeechEnd?: () => void;
  onSpeechStart?: () => void;
};

type UseQuizPresenterReturn = {
  speak: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  replay: () => void;
  state: PresenterState;
  isSupported: boolean;
};

const PAUSE_SHORT = 300;
const PAUSE_MEDIUM = 600;
const PAUSE_SUSPENSE = 1200;

const optionLabels = ["A", "B", "C", "D"];

/**
 * Creates a presenter script with natural pauses for a TV quiz host style.
 * The script includes dramatic pauses for suspense effect.
 *
 * @param question - The quiz question text
 * @param options - Array of answer options
 * @returns Array of speech segments to be spoken sequentially
 */
const createPresenterScript = (question: string, options: string[]): string[] => {
  const segments: string[] = [];

  // Opening with the question
  segments.push(question);

  // Add each option with its label
  options.forEach((option, index) => {
    const label = optionLabels[index];
    segments.push(`${label}... ${option}`);
  });

  return segments;
};

/**
 * Gets the best available Portuguese voice for the speech synthesis.
 * Prefers Brazilian Portuguese (pt-BR) but falls back to other Portuguese variants.
 *
 * @returns The best available Portuguese voice, or null if none found
 */
const getPortugueseVoice = (): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();

  // Priority order for voice selection
  const preferredVoices = [
    // Brazilian Portuguese voices (prefer male voices for TV host feel)
    (v: SpeechSynthesisVoice) => v.lang === "pt-BR" && v.name.toLowerCase().includes("male"),
    (v: SpeechSynthesisVoice) => v.lang === "pt-BR" && v.name.toLowerCase().includes("luciana"),
    (v: SpeechSynthesisVoice) => v.lang === "pt-BR",
    // Generic Portuguese
    (v: SpeechSynthesisVoice) => v.lang.startsWith("pt"),
  ];

  for (const predicate of preferredVoices) {
    const voice = voices.find(predicate);
    if (voice) return voice;
  }

  return null;
};

/**
 * Hook that provides Web Speech API functionality for quiz presentation.
 * Simulates a TV quiz host with dramatic pauses and Brazilian Portuguese voice.
 *
 * @returns Speech control methods and state
 */
export const useQuizPresenter = ({
  question,
  options,
  autoPlay = true,
  onSpeechEnd,
  onSpeechStart,
}: UseQuizPresenterOptions): UseQuizPresenterReturn => {
  const [state, setState] = useState<PresenterState>("idle");
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const segmentIndexRef = useRef(0);
  const segmentsRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);
  const questionIdRef = useRef<string>("");
  const hookIdRef = useRef(`QUIZ_PRESENTER_${Math.random().toString(36).slice(2, 9)}`);

  // Check for Web Speech API support
  useEffect(() => {
    setIsSupported("speechSynthesis" in window);
  }, []);

  // Load voices (needed for some browsers)
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  const speakSegment = useCallback(
    (segmentIndex: number) => {
      console.warn(
        `[${hookIdRef.current}] speakSegment called with index=${segmentIndex}, total segments=${segmentsRef.current.length}, isSpeaking=${isSpeakingRef.current}`
      );

      if (!isSupported || segmentIndex >= segmentsRef.current.length) {
        console.warn(
          `[${hookIdRef.current}] speakSegment returning early: isSupported=${isSupported}, segmentIndex=${segmentIndex}, length=${segmentsRef.current.length}`
        );
        setState("idle");
        isSpeakingRef.current = false;
        onSpeechEnd?.();
        return;
      }

      const segment = segmentsRef.current[segmentIndex];
      console.warn(`[${hookIdRef.current}] Speaking segment ${segmentIndex}: "${segment}"`);
      const utterance = new SpeechSynthesisUtterance(segment);

      // Configure voice settings for TV host style
      const voice = getPortugueseVoice();
      if (voice) {
        utterance.voice = voice;
      }
      utterance.lang = "pt-BR";
      utterance.rate = 0.9; // Slightly slower for dramatic effect
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        console.warn(`[${hookIdRef.current}] Utterance onstart for segment ${segmentIndex}`);
        if (segmentIndex === 0) {
          onSpeechStart?.();
        }
      };

      utterance.onend = () => {
        console.warn(`[${hookIdRef.current}] Utterance onend for segment ${segmentIndex}`);
        segmentIndexRef.current = segmentIndex + 1;

        // Determine pause duration based on segment type
        let pauseDuration = PAUSE_MEDIUM;
        if (segmentIndex === 0) {
          // After question, longer pause for suspense
          pauseDuration = PAUSE_SUSPENSE;
        } else if (segmentIndex < segmentsRef.current.length - 1) {
          // Between options
          pauseDuration = PAUSE_SHORT;
        }

        console.warn(
          `[${hookIdRef.current}] After segment ${segmentIndex}, next index will be ${segmentIndexRef.current}, isSpeaking=${isSpeakingRef.current}, pause=${pauseDuration}ms`
        );

        // Continue with next segment after pause
        if (segmentIndexRef.current < segmentsRef.current.length && isSpeakingRef.current) {
          setTimeout(() => {
            console.warn(
              `[${hookIdRef.current}] Timeout callback: calling speakSegment(${segmentIndexRef.current}), isSpeaking=${isSpeakingRef.current}`
            );
            if (isSpeakingRef.current) {
              speakSegment(segmentIndexRef.current);
            }
          }, pauseDuration);
        } else {
          console.warn(`[${hookIdRef.current}] Speech finished (no more segments or not speaking)`);
          setState("idle");
          isSpeakingRef.current = false;
          onSpeechEnd?.();
        }
      };

      utterance.onerror = () => {
        console.error(`[${hookIdRef.current}] Utterance error`);
        setState("idle");
        isSpeakingRef.current = false;
      };

      utteranceRef.current = utterance;
      console.warn(`[${hookIdRef.current}] Calling window.speechSynthesis.speak()`);
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, onSpeechEnd, onSpeechStart]
  );

  const speak = useCallback(() => {
    if (!isSupported) return;

    console.warn(`[${hookIdRef.current}] speak() called, cancelling any ongoing speech`);

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create script segments
    segmentsRef.current = createPresenterScript(question, options);
    segmentIndexRef.current = 0;
    isSpeakingRef.current = true;
    setState("speaking");

    console.warn(
      `[${hookIdRef.current}] Created ${segmentsRef.current.length} segments, scheduling speakSegment(0)`
    );

    // Small delay to ensure cancel is processed
    setTimeout(() => {
      console.warn(
        `[${hookIdRef.current}] speak() timeout callback: calling speakSegment(0), isSpeaking=${isSpeakingRef.current}`
      );
      if (isSpeakingRef.current) {
        speakSegment(0);
      }
    }, 50);
  }, [isSupported, question, options, speakSegment]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setState("idle");
    isSpeakingRef.current = false;
    segmentIndexRef.current = 0;
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported || state !== "speaking") return;
    window.speechSynthesis.pause();
    setState("paused");
  }, [isSupported, state]);

  const resume = useCallback(() => {
    if (!isSupported || state !== "paused") return;
    window.speechSynthesis.resume();
    setState("speaking");
  }, [isSupported, state]);

  const replay = useCallback(() => {
    stop();
    // Small delay to ensure stop is complete
    setTimeout(() => {
      speak();
    }, 100);
  }, [stop, speak]);

  // Auto-play when question changes (only if Web Speech is supported)
  useEffect(() => {
    console.warn(
      `[${hookIdRef.current}] Auto-play useEffect triggered: isSupported=${isSupported}, autoPlay=${autoPlay}`
    );

    if (!autoPlay || !isSupported) {
      console.warn(
        `[${hookIdRef.current}] Auto-play skipped: autoPlay=${autoPlay}, isSupported=${isSupported}`
      );
      return;
    }

    // Create a unique ID for this question
    const newQuestionId = `${question}-${options.join(",")}`;

    // Only auto-play if this is a new question (different from the last one)
    if (questionIdRef.current === newQuestionId) {
      console.warn(
        `[${hookIdRef.current}] Same question detected, skipping auto-play. Previous: "${questionIdRef.current}"`
      );
      return;
    }

    console.warn(
      `[${hookIdRef.current}] NEW QUESTION DETECTED. Previous: "${questionIdRef.current}", New: "${newQuestionId}"`
    );

    // New question detected, update the ref and trigger auto-play
    questionIdRef.current = newQuestionId;

    // Cancel any ongoing speech before starting new one
    window.speechSynthesis.cancel();

    // Create script segments
    segmentsRef.current = createPresenterScript(question, options);
    segmentIndexRef.current = 0;
    isSpeakingRef.current = true;
    setState("speaking");

    console.warn(
      `[${hookIdRef.current}] Created ${segmentsRef.current.length} segments, scheduling speakSegment(0)`
    );

    // Larger delay to ensure voices are fully loaded by Web Speech API
    const timeoutId = setTimeout(() => {
      console.warn(
        `[${hookIdRef.current}] Auto-play timeout callback: calling speakSegment(0), isSpeaking=${isSpeakingRef.current}`
      );
      if (isSpeakingRef.current) {
        speakSegment(0);
      }
    }, 1200);

    return () => {
      console.warn(`[${hookIdRef.current}] Auto-play useEffect cleanup: clearing timeout`);
      clearTimeout(timeoutId);
    };
  }, [isSupported, autoPlay, question, options, speakSegment]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    stop,
    pause,
    resume,
    replay,
    state,
    isSupported,
  };
};
