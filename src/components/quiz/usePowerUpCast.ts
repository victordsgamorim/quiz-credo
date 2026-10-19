import { useCallback, useState } from "react";

import type { PowerUpId } from "@/types/quiz";

// How long a power-up's animation covers the screen (the .power-up-cast styles in index.css)
export const CAST_DURATION_MS = 1900;

export type Cast = {
  id: PowerUpId;
  // Every use plays the animation again, even of the same power-up
  key: number;
};

/*
 * Uses a power-up and plays its animation over the whole screen.
 */
export const usePowerUpCast = (onUse?: (id: PowerUpId) => void) => {
  const [cast, setCast] = useState<Cast | null>(null);

  const use = useCallback(
    (id: PowerUpId) => {
      setCast({ id, key: Date.now() });
      onUse?.(id);
    },
    [onUse]
  );
  const clear = useCallback(() => setCast(null), []);

  return { cast, use, clear };
};
