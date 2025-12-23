import { useState, useEffect } from "react";

/**
 * Hook that tracks whether a CSS media query matches.
 *
 * @param query - CSS media query string to evaluate
 * @returns Whether the media query currently matches
 */
export function useMediaQuery(query: string): boolean {
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
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
