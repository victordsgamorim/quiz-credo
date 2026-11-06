import { logoInApp, needsNativePadding, parsePageMessage } from "./pageMessages";

const logo = { x: 105, y: 180, width: 200, height: 148 };

describe("parsePageMessage", () => {
  it("reads the safe-area message", () => {
    expect(parsePageMessage(JSON.stringify({ type: "safe-area", top: 66 }))).toEqual({
      type: "safe-area",
      top: 66,
    });
  });

  it("reads the ready message with the logo", () => {
    expect(parsePageMessage(JSON.stringify({ type: "ready", logo }))).toEqual({
      type: "ready",
      logo,
    });
  });

  it("reads the ready message of a page without a logo", () => {
    expect(parsePageMessage(JSON.stringify({ type: "ready", logo: null }))).toEqual({
      type: "ready",
      logo: null,
    });
  });

  it.each([
    ["a missing field", { x: 1, y: 2, width: 3 }],
    ["a string", { ...logo, width: "200" }],
    ["NaN", { ...logo, x: Number.NaN }],
    ["no size", { ...logo, width: 0 }],
    ["a negative size", { ...logo, height: -10 }],
    ["not an object", "logo"],
  ])("still ends the splash when the logo has %s, without the landing", (_, badLogo) => {
    expect(parsePageMessage(JSON.stringify({ type: "ready", logo: badLogo }))).toEqual({
      type: "ready",
      logo: null,
    });
  });

  it("drops extra fields from the logo", () => {
    const message = parsePageMessage(JSON.stringify({ type: "ready", logo: { ...logo, z: 9 } }));
    expect(message).toEqual({ type: "ready", logo });
  });

  it.each([
    ["not JSON", "hello"],
    ["a number", "42"],
    ["null", "null"],
    ["an unknown type", JSON.stringify({ type: "navigate", url: "https://evil.com" })],
    ["a safe area without a number", JSON.stringify({ type: "safe-area", top: "66px" })],
    ["no type", JSON.stringify({ top: 0 })],
  ])("ignores %s", (_, data) => {
    expect(parsePageMessage(data)).toBeNull();
  });
});

describe("needsNativePadding", () => {
  it("pads when the WebView reports no insets but the phone has some", () => {
    expect(needsNativePadding(0, 24)).toBe(true);
  });

  it("leaves the padding to the page when the WebView reports its insets", () => {
    expect(needsNativePadding(66, 24)).toBe(false);
  });

  it("doesn't pad a phone without insets", () => {
    expect(needsNativePadding(0, 0)).toBe(false);
  });
});

describe("logoInApp", () => {
  it("moves the logo down by the native padding", () => {
    expect(logoInApp(logo, 24)).toEqual({ ...logo, y: 204 });
  });

  it("keeps the logo where it is without padding", () => {
    expect(logoInApp(logo, 0)).toEqual(logo);
  });

  it("has no logo to move when the page has none", () => {
    expect(logoInApp(null, 24)).toBeNull();
  });
});
