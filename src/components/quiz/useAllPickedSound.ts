import { useEffect, useRef } from "react";

import { isNarrationReading } from "@/services/narrationPlayer";
import type { Question } from "@/types/quiz";

type AllPickedSoundOptions = {
  // Only the admin's screen of a room's game plays it
  isEnabled: boolean;
  // The question the guests are picking an answer to
  questionId: Question["id"];
  // Once the answer shows, the guests have nothing left to pick
  isShowingFeedback: boolean;
  // How many guests picked an answer to the question, out of all the guests in the room
  selectedGuestsCount?: number;
  totalGuests?: number;
};

/**
 * Plays the audience's sound, the one of the "ask the audience" button, by itself the first time
 * every guest in the room has picked an answer to the question, unless the host is reading the
 * question or its options then (it doesn't play later either). It plays once per question: moving
 * on to the next one, or showing the answer, doesn't play it, and the counts are still the last
 * question's until the server answers the admin's next.
 *
 * @returns Ref of the audio element that plays the sound
 */
export const useAllPickedSound = ({
  isEnabled,
  questionId,
  isShowingFeedback,
  selectedGuestsCount,
  totalGuests,
}: AllPickedSoundOptions) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  // The last question every guest picked an answer to, with or without the sound
  const allPickedQuestionRef = useRef<Question["id"] | null>(null);
  const hasEveryGuestPicked =
    totalGuests !== undefined && totalGuests > 0 && selectedGuestsCount === totalGuests;

  useEffect(() => {
    if (!isEnabled || !hasEveryGuestPicked || allPickedQuestionRef.current === questionId) return;

    allPickedQuestionRef.current = questionId;
    // An answer already showing is past its sound, and so is a moment the host is reading over
    if (isShowingFeedback || isNarrationReading() || !audioRef.current) return;

    audioRef.current.currentTime = 0;
    void audioRef.current.play();
  }, [isEnabled, hasEveryGuestPicked, isShowingFeedback, questionId]);

  return audioRef;
};
