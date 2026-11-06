import { APP_URL, isAppUrl, opensInApp } from "./links";

describe("isAppUrl", () => {
  it.each([
    APP_URL,
    "https://quiz-credo.vercel.app",
    "https://quiz-credo.vercel.app/room/ABC123",
    "https://quiz-credo.vercel.app/?lang=en",
    "https://quiz-credo.vercel.app#tutorial",
  ])("accepts the site's own page %s", (url) => {
    expect(isAppUrl(url)).toBe(true);
  });

  it.each([
    "https://quiz-credo.vercel.app.evil.com/",
    "https://quiz-credo.vercel.appx/",
    "https://quiz-credo.vercel.app:8080/",
    "https://quiz-credo.vercel.app@evil.com/",
    "http://quiz-credo.vercel.app/",
    "https://other.vercel.app/",
    "https://evil.com/?next=https://quiz-credo.vercel.app/",
  ])("rejects %s", (url) => {
    expect(isAppUrl(url)).toBe(false);
  });
});

describe("opensInApp", () => {
  it.each(["about:blank", "blob:https://quiz-credo.vercel.app/1234", "data:text/plain,hi"])(
    "keeps %s in the WebView",
    (url) => {
      expect(opensInApp(url)).toBe(true);
    }
  );

  it.each([
    "https://supabase.co/auth",
    "mailto:someone@example.com",
    "tel:+5511999999999",
    "intent://scan/#Intent;scheme=zxing;end",
    "javascript:alert(1)",
  ])("sends %s out of the app", (url) => {
    expect(opensInApp(url)).toBe(false);
  });
});
