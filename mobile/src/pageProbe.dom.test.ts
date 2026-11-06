// Runs in jsdom, like the page PAGE_PROBE is injected into (see the "page" Jest project)
import { PAGE_PROBE } from "./pageProbe";

// public/logo.png: a 3464px square with its letters at +55+491, 3347x2485
const LOGO_SIZE = 3464;

type Box = { left: number; top: number; width: number; height: number };

let posted: unknown[];

function addLogo(box: Box, { loaded = true } = {}) {
  const img = document.createElement("img");
  img.setAttribute("src", "/logo.png");
  img.getBoundingClientRect = () =>
    ({ ...box, right: box.left + box.width, bottom: box.top + box.height }) as DOMRect;
  Object.defineProperty(img, "complete", { value: loaded, configurable: true });
  Object.defineProperty(img, "naturalWidth", { value: loaded ? LOGO_SIZE : 0, configurable: true });
  document.getElementById("root")!.appendChild(img);
  return img;
}

function lettersIn(left: number, top: number, side: number) {
  const scale = side / LOGO_SIZE;
  return {
    x: left + 55 * scale,
    y: top + 491 * scale,
    width: 3347 * scale,
    height: 2485 * scale,
  };
}

const runProbe = () => window.eval(PAGE_PROBE);
const readyMessages = () =>
  posted.filter((message) => (message as { type: string }).type === "ready");
// The idle wait (300ms without requestIdleCallback) and the two frames after it
const settle = () => jest.advanceTimersByTime(400);

beforeEach(() => {
  jest.useFakeTimers();
  posted = [];
  document.body.innerHTML = '<div id="root"></div>';
  Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
  (window as unknown as { ReactNativeWebView: unknown }).ReactNativeWebView = {
    postMessage: (data: string) => posted.push(JSON.parse(data)),
  };
  delete (window as Partial<Window>).requestIdleCallback;
});

afterEach(() => {
  jest.useRealTimers();
});

it("reports the WebView's top inset first, as 0 when it has none", () => {
  addLogo({ left: 0, top: 0, width: 300, height: 300 });
  runProbe();
  expect(posted[0]).toEqual({ type: "safe-area", top: 0 });
});

it("reports where the letters of a loaded logo are", () => {
  addLogo({ left: 40, top: 120, width: 340, height: 340 });
  runProbe();
  expect(readyMessages()).toHaveLength(0);
  settle();
  expect(readyMessages()).toEqual([{ type: "ready", logo: lettersIn(40, 120, 340) }]);
});

it("finds the letters of a logo shown with object-contain in a wider box", () => {
  addLogo({ left: 0, top: 100, width: 400, height: 300 });
  runProbe();
  settle();
  // The 300px square image sits 50px in from the left of the 400px box
  expect(readyMessages()).toEqual([{ type: "ready", logo: lettersIn(50, 100, 300) }]);
});

it("lands on the biggest logo on screen, not the small one in the header", () => {
  addLogo({ left: 180, top: 10, width: 60, height: 24 });
  addLogo({ left: 40, top: 900, width: 400, height: 400 });
  addLogo({ left: 60, top: 200, width: 300, height: 300 });
  runProbe();
  settle();
  expect(readyMessages()).toEqual([{ type: "ready", logo: lettersIn(60, 200, 300) }]);
});

it("is ready without a logo on a page that has none", () => {
  document.getElementById("root")!.appendChild(document.createElement("main"));
  runProbe();
  jest.advanceTimersByTime(100);
  expect(readyMessages()).toEqual([{ type: "ready", logo: null }]);
});

it("waits for React to render into an empty root", () => {
  runProbe();
  jest.advanceTimersByTime(5000);
  expect(readyMessages()).toHaveLength(0);

  addLogo({ left: 40, top: 120, width: 340, height: 340 });
  // MutationObserver callbacks run as microtasks
  return Promise.resolve().then(() => {
    settle();
    expect(readyMessages()).toEqual([{ type: "ready", logo: lettersIn(40, 120, 340) }]);
  });
});

it("waits for the logo's image to load", () => {
  const img = addLogo({ left: 40, top: 120, width: 340, height: 340 }, { loaded: false });
  runProbe();
  jest.advanceTimersByTime(2000);
  expect(readyMessages()).toHaveLength(0);

  img.dispatchEvent(new Event("load"));
  settle();
  expect(readyMessages()).toEqual([{ type: "ready", logo: lettersIn(40, 120, 340) }]);
});

it("doesn't wait more than 4s for an image that never loads, and reports once", () => {
  const img = addLogo({ left: 40, top: 120, width: 340, height: 340 }, { loaded: false });
  runProbe();
  jest.advanceTimersByTime(4000);
  settle();
  img.dispatchEvent(new Event("load"));
  settle();
  expect(readyMessages()).toHaveLength(1);
});

it("is ready after a logo that fails to load too", () => {
  const img = addLogo({ left: 40, top: 120, width: 340, height: 340 }, { loaded: false });
  runProbe();
  img.dispatchEvent(new Event("error"));
  settle();
  expect(readyMessages()).toHaveLength(1);
});

it("waits for the page to go idle when the WebView can tell", () => {
  const idleCallbacks: { callback: () => void; options: unknown }[] = [];
  window.requestIdleCallback = ((callback: () => void, options: unknown) => {
    idleCallbacks.push({ callback, options });
    return 1;
  }) as typeof window.requestIdleCallback;
  addLogo({ left: 40, top: 120, width: 340, height: 340 });
  runProbe();
  jest.advanceTimersByTime(1000);
  expect(readyMessages()).toHaveLength(0);
  expect(idleCallbacks).toEqual([{ callback: expect.any(Function), options: { timeout: 800 } }]);

  idleCallbacks[0].callback();
  jest.advanceTimersByTime(100);
  expect(readyMessages()).toHaveLength(1);
});
