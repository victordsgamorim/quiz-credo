import { act, render, screen, userEvent } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { BackHandler, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import App, { SPLASH_TIMEOUT_MS } from "./App";
import { getErrorTexts } from "./src/errorTexts";
import type { LogoTarget } from "./src/LaunchSplash";
import { APP_URL } from "./src/links";
import { PAGE_PROBE } from "./src/pageProbe";

jest.mock("expo-splash-screen", () => ({
  hideAsync: jest.fn(() => Promise.resolve()),
  preventAutoHideAsync: jest.fn(() => Promise.resolve(true)),
  setOptions: jest.fn(),
}));

jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default
);

// Keeps the props the app gives the WebView, and stands in for its goBack and reload
jest.mock("react-native-webview", () => {
  const { forwardRef, useEffect, useImperativeHandle } = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  const webView = {
    props: {} as Record<string, unknown>,
    goBack: jest.fn(),
    reload: jest.fn(),
    mounts: 0,
  };
  const WebView = forwardRef((props: Record<string, unknown>, ref: unknown) => {
    webView.props = props;
    useImperativeHandle(ref, () => ({ goBack: webView.goBack, reload: webView.reload }));
    useEffect(() => {
      webView.mounts += 1;
    }, []);
    return <View />;
  });
  return { WebView, mockWebView: webView };
});

// Keeps what the app tells the splash; the splash itself has its own tests
jest.mock("./src/LaunchSplash", () => {
  const { useEffect } = jest.requireActual("react");
  const splash = { props: null as null | Record<string, unknown>, shown: false };
  const LaunchSplash = (props: Record<string, unknown>) => {
    splash.props = props;
    useEffect(() => {
      splash.shown = true;
      return () => {
        splash.shown = false;
      };
    }, []);
    return null;
  };
  return { LaunchSplash, mockSplash: splash };
});

type WebViewProps = {
  source: { uri: string };
  injectedJavaScript: string;
  mediaPlaybackRequiresUserAction: boolean;
  setSupportMultipleWindows: boolean;
  onShouldStartLoadWithRequest: (request: { url: string }) => boolean;
  onNavigationStateChange: (state: { canGoBack: boolean }) => void;
  onMessage: (event: { nativeEvent: { data: string } }) => void;
  onError: () => void;
  onRenderProcessGone: () => void;
  renderError: () => ReactElement;
};

const { mockWebView } = jest.requireMock("react-native-webview");
const { mockSplash } = jest.requireMock("./src/LaunchSplash");
const webView = () => mockWebView.props as WebViewProps;
const splash = () =>
  mockSplash.props as { ready: boolean; target: LogoTarget | null; onHidden: () => void };

const siteLogo = { x: 115, y: 180, width: 180, height: 134 };

let backHandler: () => boolean | null | undefined;
const removeBackHandler = jest.fn();

async function postFromPage(message: unknown) {
  await act(async () => {
    webView().onMessage({
      nativeEvent: { data: typeof message === "string" ? message : JSON.stringify(message) },
    });
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  mockWebView.goBack.mockClear();
  mockWebView.reload.mockClear();
  mockWebView.mounts = 0;
  jest.mocked(Linking.openURL).mockReset().mockResolvedValue(undefined);
  jest.mocked(useSafeAreaInsets).mockReturnValue({ top: 0, right: 0, bottom: 0, left: 0 });
  removeBackHandler.mockClear();
  jest.spyOn(BackHandler, "addEventListener").mockImplementation((_, handler) => {
    backHandler = handler as typeof backHandler;
    return { remove: removeBackHandler };
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("the WebView", () => {
  it("opens the site with the page probe", async () => {
    await render(<App />);
    expect(webView().source).toEqual({ uri: APP_URL });
    expect(webView().injectedJavaScript).toBe(PAGE_PROBE);
  });

  it("lets the narrator and the game sounds play without a tap", async () => {
    await render(<App />);
    expect(webView().mediaPlaybackRequiresUserAction).toBe(false);
  });

  it("opens target=_blank links in place, where the link check sees them", async () => {
    await render(<App />);
    expect(webView().setSupportMultipleWindows).toBe(false);
  });

  it("comes back with a new WebView when Android kills its renderer", async () => {
    await render(<App />);
    expect(mockWebView.mounts).toBe(1);

    await act(async () => webView().onRenderProcessGone());
    expect(mockWebView.mounts).toBe(2);
  });
});

describe("links", () => {
  it("loads the site's own pages in the app", async () => {
    await render(<App />);
    expect(webView().onShouldStartLoadWithRequest({ url: `${APP_URL}room/ABC123` })).toBe(true);
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it("opens other sites in the phone's browser", async () => {
    await render(<App />);
    const url = "https://quiz-credo.vercel.app.evil.com/";
    expect(webView().onShouldStartLoadWithRequest({ url })).toBe(false);
    expect(Linking.openURL).toHaveBeenCalledWith(url);
  });

  it("doesn't crash when no app can open the link", async () => {
    jest.mocked(Linking.openURL).mockRejectedValue(new Error("No app"));
    await render(<App />);
    expect(webView().onShouldStartLoadWithRequest({ url: "tel:+5511999999999" })).toBe(false);
    await act(async () => {});
  });
});

describe("Android's back button", () => {
  it("lets Android close the app when the site has no page to go back to", async () => {
    await render(<App />);
    expect(backHandler()).toBe(false);
    expect(mockWebView.goBack).not.toHaveBeenCalled();
  });

  it("goes back in the site's history when there is one", async () => {
    await render(<App />);
    await act(async () => webView().onNavigationStateChange({ canGoBack: true }));
    expect(backHandler()).toBe(true);
    expect(mockWebView.goBack).toHaveBeenCalledTimes(1);

    await act(async () => webView().onNavigationStateChange({ canGoBack: false }));
    expect(backHandler()).toBe(false);
  });

  it("stops listening when the app goes away", async () => {
    const view = await render(<App />);
    await view.unmount();
    expect(removeBackHandler).toHaveBeenCalled();
  });
});

describe("the splash", () => {
  it("waits for the site", async () => {
    await render(<App />);
    expect(splash()).toMatchObject({ ready: false, target: null });
  });

  it("lands on the logo the page reports", async () => {
    await render(<App />);
    await postFromPage({ type: "ready", logo: siteLogo });
    expect(splash()).toMatchObject({ ready: true, target: siteLogo });
  });

  it("just fades on a page without a logo", async () => {
    await render(<App />);
    await postFromPage({ type: "ready", logo: null });
    expect(splash()).toMatchObject({ ready: true, target: null });
  });

  it("moves the landing down when the app pads the page itself", async () => {
    jest.mocked(useSafeAreaInsets).mockReturnValue({ top: 24, right: 0, bottom: 0, left: 0 });
    await render(<App />);
    // An old WebView: no insets of its own
    await postFromPage({ type: "safe-area", top: 0 });
    await postFromPage({ type: "ready", logo: siteLogo });
    expect(splash().target).toEqual({ ...siteLogo, y: siteLogo.y + 24 });
  });

  it("keeps the landing where the page says when the page pads itself", async () => {
    jest.mocked(useSafeAreaInsets).mockReturnValue({ top: 24, right: 0, bottom: 0, left: 0 });
    await render(<App />);
    await postFromPage({ type: "safe-area", top: 66 });
    await postFromPage({ type: "ready", logo: siteLogo });
    expect(splash().target).toEqual(siteLogo);
  });

  it("ignores messages that aren't the probe's", async () => {
    await render(<App />);
    await postFromPage("hello");
    await postFromPage({ type: "navigate", url: "https://evil.com" });
    expect(splash().ready).toBe(false);
  });

  it("goes when the site fails to load, so the error screen shows", async () => {
    await render(<App />);
    await act(async () => webView().onError());
    expect(splash().ready).toBe(true);
  });

  it("doesn't wait for a site that never answers for more than the timeout", async () => {
    await render(<App />);
    await act(async () => {
      jest.advanceTimersByTime(SPLASH_TIMEOUT_MS - 1);
    });
    expect(splash().ready).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(splash().ready).toBe(true);
  });

  it("is removed once it has faded out", async () => {
    await render(<App />);
    expect(mockSplash.shown).toBe(true);

    await act(async () => splash().onHidden());
    expect(mockSplash.shown).toBe(false);
  });
});

describe("the error screen", () => {
  it("says what happened and reloads the site on retry", async () => {
    const texts = getErrorTexts();
    await render(<App />);
    await render(webView().renderError());

    expect(screen.getByText(texts.title)).toBeOnTheScreen();
    expect(screen.getByText(texts.message)).toBeOnTheScreen();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole("button", { name: texts.retry }));
    expect(mockWebView.reload).toHaveBeenCalledTimes(1);
  });
});
