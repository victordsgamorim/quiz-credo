import { useEffect, useRef } from "react";

type UseBackgroundMusicOptions = {
  src: string;
  volume?: number;
  loop?: boolean;
  enabled?: boolean;
};

/**
 * Hook to manage background music playback
 * Automatically plays/pauses music based on enabled state
 * Maintains single audio instance across component re-renders
 */
export const useBackgroundMusic = ({
  src,
  volume = 0.3,
  loop = true,
  enabled = true,
}: UseBackgroundMusicOptions) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.loop = loop;
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    // Play or pause based on enabled state
    if (enabled) {
      const playPromise = audio.play();

      // Handle autoplay restrictions
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("[BackgroundMusic] Autoplay prevented:", error);
        });
      }
    } else {
      audio.pause();
    }

    // Cleanup: pause audio when component unmounts
    return () => {
      if (audio && !enabled) {
        audio.pause();
      }
    };
  }, [enabled, src, loop, volume]);

  // Cleanup audio element when hook is destroyed
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  return audioRef;
};
