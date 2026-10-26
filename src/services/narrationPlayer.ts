import { createAbortError } from "./narrator";

// One sample of silence, as a WAV file
const SILENCE =
  "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQIAAAAAAA==";

// The narration plays on a single audio element, the same for every question: Safari on iPhone
// only lets a page play sound without a tap on an element that a tap already played
let player: HTMLAudioElement | null = null;
let isUnlocked = false;

const getPlayer = () => {
  player ??= new Audio();
  return player;
};

/*
 * Called during a tap or a key press: the narration then plays without one. Playing silence is
 * enough for that, once.
 */
export const unlockNarrationPlayer = () => {
  const audio = getPlayer();
  if (isUnlocked || !audio.paused) return;

  audio.src = SILENCE;
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.then(
      () => {
        isUnlocked = true;
      },
      () => {}
    );
  }
};

/*
 * Plays a clip of the narration. Resolves when it ends; the signal stops it and rejects, and so
 * does a clip that can't play.
 */
export const playNarration = (clip: Blob, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(createAbortError());

    const audio = getPlayer();
    const url = URL.createObjectURL(clip);
    const finish = (error?: Error) => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      signal.removeEventListener("abort", handleAbort);
      URL.revokeObjectURL(url);
      if (error) reject(error);
      else resolve();
    };
    const handleEnded = () => finish();
    const handleError = () => finish(new Error("The narration's clip didn't play"));
    const handleAbort = () => {
      audio.pause();
      finish(createAbortError());
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    signal.addEventListener("abort", handleAbort);
    audio.src = url;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(
        () => {
          isUnlocked = true;
        },
        (error: Error) => finish(error)
      );
    }
  });
