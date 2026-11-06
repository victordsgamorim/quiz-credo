export const APP_ORIGIN = "https://quiz-credo.vercel.app";
export const APP_URL = `${APP_ORIGIN}/`;

/** Whether the URL is a page of the site, not of a look-alike host such as quiz-credo.vercel.app.evil.com */
export function isAppUrl(url: string) {
  if (!url.startsWith(APP_ORIGIN)) return false;
  const rest = url.slice(APP_ORIGIN.length);
  return rest === "" || /^[/?#]/.test(rest);
}

/**
 * Whether the WebView loads the URL itself: the site's pages, and the about:, blob: and data: URLs
 * a page can open. Everything else opens in the phone's browser instead of replacing the game.
 */
export function opensInApp(url: string) {
  return isAppUrl(url) || /^(about|blob|data):/.test(url);
}
