import type { LogoTarget } from "./LaunchSplash";

/** What PAGE_PROBE posts from the page */
export type PageMessage =
  | { type: "safe-area"; top: number }
  | { type: "ready"; logo: LogoTarget | null };

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

function readLogo(value: unknown): LogoTarget | null {
  if (typeof value !== "object" || value === null) return null;
  const { x, y, width, height } = value as Record<string, unknown>;
  if (!isNumber(x) || !isNumber(y) || !isNumber(width) || !isNumber(height)) return null;
  if (width <= 0 || height <= 0) return null;
  return { x, y, width, height };
}

/**
 * Reads a message from the page. Any page script can post to the app, so anything that isn't
 * one of PAGE_PROBE's messages, in its exact shape, is ignored.
 */
export function parsePageMessage(data: string): PageMessage | null {
  let message: unknown;
  try {
    message = JSON.parse(data);
  } catch {
    return null;
  }
  if (typeof message !== "object" || message === null) return null;
  const { type, top, logo } = message as Record<string, unknown>;
  if (type === "safe-area" && isNumber(top)) return { type, top };
  // A logo that can't be read only costs the landing; the splash still fades out
  if (type === "ready") return { type, logo: readLogo(logo) };
  return null;
}

/** The app pads the page itself only when the WebView reports no insets but the phone has some */
export function needsNativePadding(pageTop: number, nativeTop: number) {
  return pageTop === 0 && nativeTop > 0;
}

/** The page's logo in the app's coordinates: the page starts below the native padding, if any */
export function logoInApp(logo: LogoTarget | null, paddingTop: number): LogoTarget | null {
  return logo && { ...logo, y: logo.y + paddingTop };
}
