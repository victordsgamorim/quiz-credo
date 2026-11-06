// A phone on its side: a screen wider than tall and too short for the stacked phone layouts. The
// minimum width leaves out a phone held upright whose keyboard (Android's shrinks the page) makes
// the page wider than tall, so typing never switches the layout. Tailwind's `phone-landscape:`
// variant (tailwind.config.ts) and useIsPhoneLandscape (useMediaQuery) both use it
export const PHONE_LANDSCAPE_QUERY =
  "(orientation: landscape) and (max-height: 500px) and (min-width: 560px)";
