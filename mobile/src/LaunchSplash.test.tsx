import { act, fireEvent, render, screen } from "@testing-library/react-native";
import * as SplashScreen from "expo-splash-screen";
import { AccessibilityInfo, NativeModules } from "react-native";

import { LaunchSplash, type LogoTarget, SPLASH_TIMINGS } from "./LaunchSplash";

jest.mock("expo-splash-screen", () => ({
  hideAsync: jest.fn(() => Promise.resolve()),
  preventAutoHideAsync: jest.fn(() => Promise.resolve(true)),
  setOptions: jest.fn(),
}));

const { lights, landing, fade } = SPLASH_TIMINGS;
const FRAME_MS = 1000 / 60;
// Animations end on a frame, a little after their duration
const SLACK = 100;
const siteLogo: LogoTarget = { x: 115, y: 180, width: 180, height: 134 };

// A frame at a time, so React runs the effects each step starts before the next one is due
async function advance(ms: number) {
  for (let elapsed = 0; elapsed < ms; elapsed += FRAME_MS) {
    await act(async () => {
      jest.advanceTimersByTime(Math.min(FRAME_MS, ms - elapsed));
    });
  }
}

// Lets promise chains (hideAsync().catch().finally()) settle, as they would at once on a phone
async function settlePromises() {
  for (let tick = 0; tick < 5; tick++) await act(async () => {});
}

async function renderSplash({
  ready = false,
  target = null,
}: { ready?: boolean; target?: LogoTarget | null } = {}) {
  const onHidden = jest.fn();
  const view = await render(<LaunchSplash ready={ready} target={target} onHidden={onHidden} />);
  await fireEvent.layout(screen.root!, { x: 0, y: 0, width: 411, height: 923 });
  // The native splash goes a frame after this one has laid out
  await advance(20);
  await settlePromises();
  const rerender = (props: { ready: boolean; target?: LogoTarget | null }) =>
    view.rerender(
      <LaunchSplash ready={props.ready} target={props.target ?? null} onHidden={onHidden} />
    );
  return { onHidden, rerender };
}

beforeEach(() => {
  jest.useFakeTimers();
  // React Native's mock ends every native-driven animation after 16ms, whatever its duration; this
  // one takes as long as the animation's frames, so the tests can tell a landing from a plain fade
  jest
    .mocked(NativeModules.NativeAnimatedModule.startAnimatingNode)
    .mockImplementation(
      (
        _id: number,
        _tag: number,
        config: { type: string; frames?: number[] },
        endCallback: (result: { finished: boolean }) => void
      ) => {
        const duration = config.type === "frames" ? config.frames!.length * FRAME_MS : 16;
        setTimeout(() => endCallback({ finished: true }), duration);
      }
    );
  jest.mocked(SplashScreen.hideAsync).mockClear();
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(false);
});

afterEach(() => {
  jest.useRealTimers();
});

it("hides the native splash once it has laid out", async () => {
  const onHidden = jest.fn();
  await render(<LaunchSplash ready={false} target={null} onHidden={onHidden} />);
  expect(SplashScreen.hideAsync).not.toHaveBeenCalled();

  await fireEvent.layout(screen.root!, { x: 0, y: 0, width: 411, height: 923 });
  await advance(20);
  expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
});

it("stays up until the site is ready", async () => {
  const { onHidden } = await renderSplash();
  await advance(20_000);
  expect(onHidden).not.toHaveBeenCalled();
});

it("blocks taps until the site is ready, then lets them through", async () => {
  const { rerender } = await renderSplash();
  expect(screen.root).toHaveProp("pointerEvents", "auto");

  await rerender({ ready: true });
  expect(screen.root).toHaveProp("pointerEvents", "none");
});

it("fades out after the lights have come on when the page has no logo", async () => {
  const { onHidden } = await renderSplash({ ready: true });
  await advance(lights + fade - SLACK);
  expect(onHidden).not.toHaveBeenCalled();

  await advance(2 * SLACK);
  expect(onHidden).toHaveBeenCalledTimes(1);
});

it("lands on the site's logo before fading out", async () => {
  const { onHidden } = await renderSplash({ ready: true, target: siteLogo });
  // Without the landing it would already be gone here
  await advance(lights + fade + SLACK);
  expect(onHidden).not.toHaveBeenCalled();

  await advance(landing);
  expect(onHidden).toHaveBeenCalledTimes(1);
});

it("leaves as soon as a site that took its time is ready", async () => {
  const { onHidden, rerender } = await renderSplash();
  await advance(3000);

  await rerender({ ready: true, target: siteLogo });
  await advance(landing + fade + SLACK);
  expect(onHidden).toHaveBeenCalledTimes(1);
});

it("only fades, without lights or landing, for people who asked for less motion", async () => {
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(true);
  const { onHidden } = await renderSplash({ ready: true, target: siteLogo });
  await advance(fade + SLACK);
  expect(onHidden).toHaveBeenCalledTimes(1);
});

it("still goes when the native splash fails to hide", async () => {
  jest.mocked(SplashScreen.hideAsync).mockRejectedValueOnce(new Error("no splash"));
  const { onHidden } = await renderSplash({ ready: true });
  await advance(lights + fade + SLACK);
  expect(onHidden).toHaveBeenCalledTimes(1);
});
