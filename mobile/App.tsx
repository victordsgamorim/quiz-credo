import { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import type {
  ShouldStartLoadRequest,
  WebViewMessageEvent,
  WebViewNavigation,
} from "react-native-webview/lib/WebViewTypes";
import { LaunchSplash, type LogoTarget } from "./src/LaunchSplash";

const APP_ORIGIN = "https://quiz-credo.vercel.app";
const APP_URL = `${APP_ORIGIN}/`;

// Same as --background in the web app (hsl 225 50% 4%), so no white flash shows between screens
const BACKGROUND = "#05080f";
const FOREGROUND = "#fffaeb";
const PRIMARY = "#ffbf00";

// The splash stays up until the site paints, but never longer than this if the load hangs
const SPLASH_TIMEOUT_MS = 10_000;

const ERROR_TEXTS = {
  pt: {
    title: "Sem conexão",
    message: "Não foi possível abrir o Quiz Credo.",
    retry: "Tentar de novo",
  },
  en: { title: "No connection", message: "Quiz Credo could not be opened.", retry: "Try again" },
  es: {
    title: "Sin conexión",
    message: "No se pudo abrir Quiz Credo.",
    retry: "Intentar de nuevo",
  },
};

// Runs in the page once it loads. The site draws under the system bars and pads itself with
// env(safe-area-inset-*), which current Android WebViews fill in; older ones report 0, so the page
// tells the app to pad it natively. It also tells the splash when React has painted, and where the
// site's logo is once its image has loaded, so the splash's logo can land on it.
const PAGE_PROBE = `(() => {
  const post = (message) => window.ReactNativeWebView.postMessage(JSON.stringify(message));
  const afterPaint = (callback) =>
    requestAnimationFrame(() => requestAnimationFrame(callback));

  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top, 0px)";
  document.documentElement.appendChild(probe);
  post({ type: "safe-area", top: parseFloat(getComputedStyle(probe).paddingTop) || 0 });
  probe.remove();

  // public/logo.png is a 3464px square with its letters at +55+491, 3347x2485
  const LOGO = { size: 3464, x: 55, y: 491, width: 3347, height: 2485 };
  const findLogo = () =>
    [...document.querySelectorAll('img[src="/logo.png"]')]
      .filter((img) => {
        const rect = img.getBoundingClientRect();
        return rect.width >= 80 && rect.bottom > 0 && rect.top < innerHeight;
      })
      .sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
  // object-contain centres the square image in its box
  const lettersOf = (img) => {
    const rect = img.getBoundingClientRect();
    const side = Math.min(rect.width, rect.height);
    const scale = side / LOGO.size;
    return {
      x: rect.left + (rect.width - side) / 2 + LOGO.x * scale,
      y: rect.top + (rect.height - side) / 2 + LOGO.y * scale,
      width: LOGO.width * scale,
      height: LOGO.height * scale,
    };
  };

  const postReady = () => {
    const img = findLogo();
    if (!img) return afterPaint(() => post({ type: "ready", logo: null }));
    let sent = false;
    // The first paint with the logo is heavy (a large image to decode), so the splash waits for
    // the page to go idle: an animation started earlier would freeze and then jump
    const send = () => {
      if (sent) return;
      sent = true;
      const whenIdle = window.requestIdleCallback || ((callback) => setTimeout(callback, 300));
      whenIdle(() => afterPaint(() => post({ type: "ready", logo: lettersOf(img) })), {
        timeout: 800,
      });
    };
    if (img.complete && img.naturalWidth > 0) return send();
    img.addEventListener("load", send, { once: true });
    img.addEventListener("error", send, { once: true });
    setTimeout(send, 4000);
  };

  const root = document.getElementById("root");
  if (!root || root.childElementCount > 0) return postReady();
  new MutationObserver((_, observer) => {
    observer.disconnect();
    postReady();
  }).observe(root, { childList: true });
})();
true;`;

void SplashScreen.preventAutoHideAsync();
// No fade: LaunchSplash draws the same frame underneath, so the native splash can just go
SplashScreen.setOptions({ duration: 0, fade: false });

function getErrorTexts() {
  try {
    const language = Intl.DateTimeFormat().resolvedOptions().locale.slice(0, 2);
    if (language === "en" || language === "es") return ERROR_TEXTS[language];
  } catch {
    // Falls back to Portuguese
  }
  return ERROR_TEXTS.pt;
}

function isAppUrl(url: string) {
  if (!url.startsWith(APP_ORIGIN)) return false;
  // Keeps look-alike hosts such as quiz-credo.vercel.app.example.com out
  const rest = url.slice(APP_ORIGIN.length);
  return rest === "" || /^[/?#]/.test(rest);
}

function QuizCredoWebView() {
  // WebView<object>: the default WebView<undefined> types its props as never under strict mode
  const webViewRef = useRef<WebView<object>>(null);
  const canGoBackRef = useRef(false);
  // A new key remounts the WebView, the only way back after Android kills its renderer
  const [webViewKey, setWebViewKey] = useState(0);
  const insets = useSafeAreaInsets();
  const [padSafeArea, setPadSafeArea] = useState(false);
  const [siteReady, setSiteReady] = useState(false);
  const [siteLogo, setSiteLogo] = useState<LogoTarget | null>(null);
  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setSiteReady(true), SPLASH_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, []);

  const handleSplashHidden = useCallback(() => setSplashHidden(true), []);

  // Android's back goes through the site's history, so its own back rules (room routes, quit dialog) still apply
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!canGoBackRef.current) return false;
      webViewRef.current?.goBack();
      return true;
    });
    return () => subscription.remove();
  }, []);

  const handleNavigationStateChange = useCallback((state: WebViewNavigation) => {
    canGoBackRef.current = state.canGoBack;
  }, []);

  // Links outside the site open in the phone's browser instead of replacing the game
  const handleShouldStartLoad = useCallback((request: ShouldStartLoadRequest) => {
    const { url } = request;
    if (isAppUrl(url) || /^(about|blob|data):/.test(url)) return true;
    void Linking.openURL(url).catch(() => undefined);
    return false;
  }, []);

  const renderError = useCallback(() => {
    const texts = getErrorTexts();
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>{texts.title}</Text>
        <Text style={styles.errorMessage}>{texts.message}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => webViewRef.current?.reload()}
          style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
        >
          <Text style={styles.retryText}>{texts.retry}</Text>
        </Pressable>
      </View>
    );
  }, []);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message = JSON.parse(event.nativeEvent.data) as {
          type?: string;
          top?: number;
          logo?: LogoTarget | null;
        };
        if (message.type === "ready") {
          // The page is laid out under the native padding when there is any
          const offset = padSafeArea ? insets.top : 0;
          setSiteLogo(message.logo ? { ...message.logo, y: message.logo.y + offset } : null);
          setSiteReady(true);
        }
        // Padding is only added when the WebView reports no insets of its own
        if (message.type === "safe-area") setPadSafeArea(message.top === 0 && insets.top > 0);
      } catch {
        // Not one of ours
      }
    },
    [insets.top, padSafeArea]
  );

  return (
    <>
      {/* Full screen like a game: the status bar only shows again with a swipe from the top */}
      <StatusBar hidden />
      <SafeAreaView style={styles.screen} edges={padSafeArea ? undefined : []}>
        <KeyboardAvoidingView
          style={styles.screen}
          behavior={Platform.OS === "android" ? "padding" : undefined}
        >
          <WebView<object>
            key={webViewKey}
            ref={webViewRef}
            source={{ uri: APP_URL }}
            style={styles.webView}
            containerStyle={styles.webView}
            renderError={renderError}
            onError={() => setSiteReady(true)}
            onNavigationStateChange={handleNavigationStateChange}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            onRenderProcessGone={() => setWebViewKey((key) => key + 1)}
            injectedJavaScript={PAGE_PROBE}
            onMessage={handleMessage}
            // The narrator and the game sounds start without a tap on the page
            mediaPlaybackRequiresUserAction={false}
            // target="_blank" links go through handleShouldStartLoad instead of opening a hidden window
            setSupportMultipleWindows={false}
            overScrollMode="never"
            webviewDebuggingEnabled={__DEV__}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
      {!splashHidden && (
        <LaunchSplash ready={siteReady} target={siteLogo} onHidden={handleSplashHidden} />
      )}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QuizCredoWebView />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  webView: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: BACKGROUND,
  },
  errorTitle: {
    color: FOREGROUND,
    fontSize: 22,
    fontWeight: "700",
  },
  errorMessage: {
    color: FOREGROUND,
    fontSize: 16,
    opacity: 0.8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 12,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: PRIMARY,
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryText: {
    color: BACKGROUND,
    fontSize: 16,
    fontWeight: "700",
  },
});
