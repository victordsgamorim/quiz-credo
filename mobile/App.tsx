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
import { getErrorTexts } from "./src/errorTexts";
import { LaunchSplash, type LogoTarget } from "./src/LaunchSplash";
import { APP_URL, opensInApp } from "./src/links";
import { logoInApp, needsNativePadding, parsePageMessage } from "./src/pageMessages";
import { PAGE_PROBE } from "./src/pageProbe";

// Same as --background in the web app (hsl 225 50% 4%), so no white flash shows between screens
const BACKGROUND = "#05080f";
const FOREGROUND = "#fffaeb";
const PRIMARY = "#ffbf00";

// The splash stays up until the site paints, but never longer than this if the load hangs
export const SPLASH_TIMEOUT_MS = 10_000;

void SplashScreen.preventAutoHideAsync();
// No fade: LaunchSplash draws the same frame underneath, so the native splash can just go
SplashScreen.setOptions({ duration: 0, fade: false });

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

  const handleShouldStartLoad = useCallback((request: ShouldStartLoadRequest) => {
    if (opensInApp(request.url)) return true;
    void Linking.openURL(request.url).catch(() => undefined);
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
      const message = parsePageMessage(event.nativeEvent.data);
      if (message?.type === "safe-area")
        setPadSafeArea(needsNativePadding(message.top, insets.top));
      if (message?.type === "ready") {
        setSiteLogo(logoInApp(message.logo, padSafeArea ? insets.top : 0));
        setSiteReady(true);
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
