import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

// The site draws under the system bars and pads itself with env(safe-area-inset-*), which current
// Android WebViews fill in. Older ones report 0, so the page tells the app to pad it natively.
const SAFE_AREA_PROBE = `(() => {
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top, 0px)";
  document.documentElement.appendChild(probe);
  const top = parseFloat(getComputedStyle(probe).paddingTop) || 0;
  probe.remove();
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: "safe-area", top }));
})();
true;`;

void SplashScreen.preventAutoHideAsync();

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

  const hideSplash = useCallback(() => {
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(hideSplash, SPLASH_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [hideSplash]);

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

  // Only reports the WebView's own insets; padding is added when they are missing
  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message = JSON.parse(event.nativeEvent.data) as { type?: string; top?: number };
        if (message.type !== "safe-area") return;
        setPadSafeArea(message.top === 0 && insets.top > 0);
      } catch {
        // Not one of ours
      }
    },
    [insets.top]
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
            startInLoadingState
            renderLoading={() => (
              <View style={[StyleSheet.absoluteFill, styles.centered]}>
                <ActivityIndicator color={PRIMARY} size="large" />
              </View>
            )}
            renderError={renderError}
            onLoadEnd={hideSplash}
            onNavigationStateChange={handleNavigationStateChange}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            onRenderProcessGone={() => setWebViewKey((key) => key + 1)}
            injectedJavaScript={SAFE_AREA_PROBE}
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
