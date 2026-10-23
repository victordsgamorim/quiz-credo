import { useEffect, useSyncExternalStore } from "react";

import { unlockNarrationPlayer } from "@/services/narrationPlayer";
import { NARRATOR_VOICES, narrator } from "@/services/narrator";
import type { Locale } from "@/types/i18n";

// Taps and key presses let the narration play sound (see unlockNarrationPlayer)
const UNLOCK_EVENTS = ["click", "keydown", "touchend"] as const;

/**
 * The narrator's voice, as it loads.
 *
 * @returns The voice's status
 */
export const useNarratorStatus = () => useSyncExternalStore(narrator.subscribe, narrator.getStatus);

/**
 * Loads the narrator's voice, in the locale's language, while it's enabled (the admin, in a room),
 * so it's ready before the questions: the first time, it downloads (about 60 MB). Disabled, the
 * voice goes away.
 *
 * @param isEnabled - Whether the device narrates the room's game
 * @param locale - The language of the questions it reads
 */
export const useNarratorVoice = (isEnabled: boolean, locale: Locale) => {
  useEffect(() => {
    if (!isEnabled) return;

    narrator.load(NARRATOR_VOICES[locale]);
    UNLOCK_EVENTS.forEach((type) => document.addEventListener(type, unlockNarrationPlayer, true));
    return () => {
      UNLOCK_EVENTS.forEach((type) =>
        document.removeEventListener(type, unlockNarrationPlayer, true)
      );
      narrator.dispose();
    };
  }, [isEnabled, locale]);
};
