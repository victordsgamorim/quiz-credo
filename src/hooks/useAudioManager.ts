import { useCallback, useEffect, useRef, useState } from "react";

type AudioManagerState = "idle" | "question-start" | "suspense";

type UseAudioManagerOptions = {
  onQuestionStartEnd?: () => void;
  onAudioReady?: () => void;
};

type UseAudioManagerReturn = {
  startNewQuestion: () => void;
  stopAllAudio: () => void;
  state: AudioManagerState;
};

/**
 * Hook that manages audio playback for quiz questions.
 * Sequence:
 * 1. Play question-start.mp3
 * 2. When it ends, start playing questions-suspense-*.mp3 in loop at 50% volume
 * 3. Calls onQuestionStartEnd when question-start.mp3 finishes (signals Web Speech to start)
 *
 * @returns Audio control methods and state
 */
export const useAudioManager = ({
  onQuestionStartEnd,
  onAudioReady,
}: UseAudioManagerOptions = {}): UseAudioManagerReturn => {
  const [state, setState] = useState<AudioManagerState>("idle");

  const questionStartAudioRef = useRef<HTMLAudioElement | null>(null);
  const suspenseAudioRef = useRef<HTMLAudioElement | null>(null);
  const hookIdRef = useRef(`AUDIO_MANAGER_${Math.random().toString(36).slice(2, 9)}`);

  // Initialize audio elements
  useEffect(() => {
    console.warn(`[${hookIdRef.current}] Initializing audio elements`);

    // Create question-start audio element
    const questionStartAudio = new Audio("/assets/audios/question-start.mp3");
    questionStartAudio.preload = "auto";
    questionStartAudioRef.current = questionStartAudio;

    // Create suspense audio element (looping background)
    const suspenseAudio = new Audio();
    suspenseAudio.preload = "auto";
    suspenseAudio.loop = true;
    suspenseAudio.volume = 0.5; // 50% volume
    suspenseAudioRef.current = suspenseAudio;

    // Track voices loaded
    const voicesLoaded = () => {
      console.warn(`[${hookIdRef.current}] Audio elements ready`);
      onAudioReady?.();
    };

    // Use canplay event to know when audio is ready
    questionStartAudio.addEventListener("canplay", voicesLoaded, { once: true });

    return () => {
      questionStartAudio.removeEventListener("canplay", voicesLoaded);
      if (questionStartAudioRef.current) {
        questionStartAudioRef.current.pause();
        questionStartAudioRef.current.currentTime = 0;
      }
      if (suspenseAudioRef.current) {
        suspenseAudioRef.current.pause();
        suspenseAudioRef.current.currentTime = 0;
      }
    };
  }, [onAudioReady]);

  const startNewQuestion = useCallback(() => {
    console.warn(`[${hookIdRef.current}] startNewQuestion called`);

    if (!questionStartAudioRef.current || !suspenseAudioRef.current) {
      console.error(`[${hookIdRef.current}] Audio elements not initialized`);
      return;
    }

    // Stop any ongoing audio
    if (suspenseAudioRef.current) {
      suspenseAudioRef.current.pause();
      suspenseAudioRef.current.currentTime = 0;
    }

    setState("question-start");

    // Play question-start.mp3
    questionStartAudioRef.current.currentTime = 0;
    const playPromise = questionStartAudioRef.current.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error(`[${hookIdRef.current}] Error playing question-start audio:`, error);
      });
    }
  }, []);

  // Handle question-start.mp3 ending
  useEffect(() => {
    const questionStartAudio = questionStartAudioRef.current;
    if (!questionStartAudio) return;

    const handleQuestionStartEnd = () => {
      console.warn(`[${hookIdRef.current}] question-start.mp3 ended`);

      if (!suspenseAudioRef.current) return;

      setState("suspense");

      // Randomly select suspense audio (1 or 2)
      const suspenseIndex = Math.random() < 0.5 ? 1 : 2;
      const suspensePath = `/assets/audios/question-suspense-${suspenseIndex}.mp3`;

      console.warn(`[${hookIdRef.current}] Starting suspense audio: ${suspensePath}`);

      suspenseAudioRef.current.src = suspensePath;
      suspenseAudioRef.current.currentTime = 0;
      const playPromise = suspenseAudioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Signal that question-start ended (Web Speech should start now)
            onQuestionStartEnd?.();
          })
          .catch((error) => {
            console.error(`[${hookIdRef.current}] Error playing suspense audio:`, error);
          });
      } else {
        onQuestionStartEnd?.();
      }
    };

    questionStartAudio.addEventListener("ended", handleQuestionStartEnd);

    const cleanupId = hookIdRef.current;
    return () => {
      console.warn(`[${cleanupId}] Cleanup: removing ended listener`);
      questionStartAudio.removeEventListener("ended", handleQuestionStartEnd);
    };
  }, [onQuestionStartEnd]);

  const stopAllAudio = useCallback(() => {
    console.warn(`[${hookIdRef.current}] stopAllAudio called`);

    if (questionStartAudioRef.current) {
      questionStartAudioRef.current.pause();
      questionStartAudioRef.current.currentTime = 0;
    }

    if (suspenseAudioRef.current) {
      suspenseAudioRef.current.pause();
      suspenseAudioRef.current.currentTime = 0;
    }

    setState("idle");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.warn(`[${hookIdRef.current}] Cleaning up audio manager`);
      if (questionStartAudioRef.current) {
        questionStartAudioRef.current.pause();
        questionStartAudioRef.current.currentTime = 0;
      }
      if (suspenseAudioRef.current) {
        suspenseAudioRef.current.pause();
        suspenseAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  return {
    startNewQuestion,
    stopAllAudio,
    state,
  };
};
