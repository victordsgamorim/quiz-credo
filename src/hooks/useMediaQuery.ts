import { useState, useEffect } from "react";

import { PHONE_LANDSCAPE_QUERY } from "@/constants/screens";

// Whether the query matches now; false where there's no matchMedia (tests' jsdom)
const getMatches = (query: string) =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(query).matches
    : false;

/**
 * Hook that tracks whether a CSS media query matches. The first render already has the answer, so
 * a layout picked with it doesn't flash the other one first.
 *
 * @param query - CSS media query string to evaluate
 * @returns Whether the media query currently matches
 */
export function useMediaQuery(query: string): boolean {
  const [isMatching, setIsMatching] = useState(() => getMatches(query));

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    setIsMatching(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setIsMatching(event.matches);
    };

    mediaQuery.addEventListener("change", listener);

    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, [query]);

  return isMatching;
}

/**
 * Hook that returns whether the viewport is desktop size (768px or larger).
 *
 * @returns Whether the current viewport is desktop size
 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 768px)");
}

/**
 * Hook that returns whether the viewport is mobile size (less than 768px).
 *
 * @returns Whether the current viewport is mobile size
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

/**
 * Hook that returns whether the device is a phone on its side, like Tailwind's `phone-landscape:`
 * variant: for the layouts that move a piece somewhere else instead of only restyling it.
 *
 * @returns Whether the viewport is a phone in landscape
 */
export function useIsPhoneLandscape(): boolean {
  return useMediaQuery(PHONE_LANDSCAPE_QUERY);
}
