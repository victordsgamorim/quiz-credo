import { createContext, useContext, useEffect, useRef, ReactNode } from "react";

type BackgroundMusicContextType = {
  playIntroMusic: () => void;
  stopIntroMusic: () => void;
  isPlaying: boolean;
};

const BackgroundMusicContext = createContext<BackgroundMusicContextType | undefined>(undefined);

export const BackgroundMusicProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  // Initialize audio on mount
  useEffect(() => {
    if (!audioRef.current) {
      const audioPath = `${import.meta.env.BASE_URL}assets/audios/intro.mp3`;
      audioRef.current = new Audio(audioPath);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      audioRef.current.preload = "auto";
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const playIntroMusic = () => {
    if (audioRef.current && !isPlayingRef.current) {
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isPlayingRef.current = true;
          })
          .catch((error: Error) => {
            if (error.name === "NotAllowedError") {
              // Autoplay was prevented - this is expected behavior
              // The audio will play once the user interacts with the page
            }
          });
      }
    }
  };

  const stopIntroMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      isPlayingRef.current = false;
    }
  };

  return (
    <BackgroundMusicContext.Provider
      value={{
        playIntroMusic,
        stopIntroMusic,
        isPlaying: isPlayingRef.current,
      }}
    >
      {children}
    </BackgroundMusicContext.Provider>
  );
};

export const useBackgroundMusicContext = () => {
  const context = useContext(BackgroundMusicContext);
  if (!context) {
    throw new Error("useBackgroundMusicContext must be used within BackgroundMusicProvider");
  }
  return context;
};
