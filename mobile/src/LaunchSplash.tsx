import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  type LayoutRectangle,
  StyleSheet,
  View,
} from "react-native";

const LOGO = require("../assets/logo.png");

// Android 12+ draws the native splash's icon inside a circle, so its logo is small (this is its
// width, measured on a Pixel 9). This splash starts at exactly that size, then grows to LOGO_WIDTH.
const NATIVE_LOGO_WIDTH = 160;
const LOGO_WIDTH = 200;
const LOGO_HEIGHT = LOGO_WIDTH * (535 / 720);
const NATIVE_SCALE = NATIVE_LOGO_WIDTH / LOGO_WIDTH;
const GLOW_SIZE = 540;
const GLINT_WIDTH = 72;
// Nested windows of the same faint light: where more of them overlap the light is stronger, so
// together they make a glint that is brightest in the middle and soft at the edges
const GLINT_LAYERS = [1, 0.75, 0.5, 0.3, 0.15].map((share) => ({
  width: GLINT_WIDTH * share,
  opacity: 0.08,
}));

const LIGHTS_MS = 750;
const GLINT_MS = 900;
const GLINT_START_MS = 300;
const GLINT_PAUSE_MS = 650;
const LANDING_MS = 560;
const FADE_MS = 280;

/** Where the site's logo sits, in the app's coordinates */
export type LogoTarget = Pick<LayoutRectangle, "x" | "y" | "width" | "height">;

type LaunchSplashProps = {
  /** The site has painted, or failed to load */
  ready: boolean;
  /** The site's logo, when the page has one on screen */
  target: LogoTarget | null;
  onHidden: () => void;
};

/**
 * Takes over from the native splash without moving a pixel: the stage lights come on behind the
 * logo, a glint runs over the gold letters while the site loads, then the logo lands on the site's
 * own logo while the stage fades away.
 */
export function LaunchSplash({ ready, target, onHidden }: LaunchSplashProps) {
  const lights = useRef(new Animated.Value(0)).current;
  const glint = useRef(new Animated.Value(0)).current;
  const landing = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [lightsOn, setLightsOn] = useState(false);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  // Whether the native splash is gone; the lights only come on once nothing else is on screen
  const [handedOff, setHandedOff] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotion)
      .catch(() => setReduceMotion(false));
  }, []);

  useEffect(() => {
    if (reduceMotion === null || !handedOff) return;
    if (reduceMotion) {
      setLightsOn(true);
      return;
    }
    Animated.timing(lights, {
      toValue: 1,
      duration: LIGHTS_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setLightsOn(true));

    // The first pass starts as the lights come up, so even a fast load shows one
    const glintLoop = Animated.sequence([
      Animated.delay(GLINT_START_MS),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glint, {
            toValue: 1,
            duration: GLINT_MS,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(GLINT_PAUSE_MS),
        ])
      ),
    ]);
    glintLoop.start();
    return () => glintLoop.stop();
  }, [reduceMotion, handedOff, lights, glint]);

  const canLand = Boolean(target && size && !reduceMotion);

  // Waits for the lights to finish coming on, so even a fast load shows the whole moment once
  useEffect(() => {
    if (!ready || !lightsOn) return;
    const fadeOut = Animated.timing(fade, {
      toValue: 0,
      duration: FADE_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    const exit = canLand
      ? Animated.sequence([
          Animated.timing(landing, {
            toValue: 1,
            duration: LANDING_MS,
            easing: Easing.bezier(0.65, 0, 0.35, 1),
            useNativeDriver: true,
          }),
          fadeOut,
        ])
      : fadeOut;
    exit.start(() => onHidden());
  }, [ready, lightsOn, canLand, landing, fade, onHidden]);

  // From the middle of the screen to the middle of the site's logo
  const dx = canLand ? target!.x + target!.width / 2 - size!.width / 2 : 0;
  const dy = canLand ? target!.y + target!.height / 2 - size!.height / 2 : 0;
  const landedScale = canLand ? target!.width / LOGO_WIDTH : 1;

  const introScale = reduceMotion
    ? NATIVE_SCALE
    : lights.interpolate({ inputRange: [0, 1], outputRange: [NATIVE_SCALE, 1] });
  const stageStyle = {
    opacity: fade,
    transform: [
      { translateX: landing.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
      { translateY: landing.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) },
      {
        scale: Animated.multiply(
          introScale,
          landing.interpolate({ inputRange: [0, 1], outputRange: [1, landedScale] })
        ),
      },
    ],
  };
  // The lights go down while the logo travels; the backdrop stays until it has landed, so the
  // site's own logo is never seen next to this one
  const lightsDown = landing.interpolate({
    inputRange: [0, 0.6],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const backdropStyle = { opacity: fade };
  const glowStyle = {
    opacity: Animated.multiply(lights, lightsDown),
    transform: [{ scale: lights.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
  };
  // Where the middle of the glint is, from just before the letters to just after them
  const glintCenter = glint.interpolate({
    inputRange: [0, 1],
    outputRange: [-GLINT_WIDTH, LOGO_WIDTH + GLINT_WIDTH],
  });
  const glintOpacity = reduceMotion ? 0 : lightsDown;
  return (
    <View
      // Lets taps reach the site while the logo lands
      pointerEvents={ready ? "none" : "auto"}
      style={styles.root}
      onLayout={(event) => {
        setSize(event.nativeEvent.layout);
        // A frame later, so this splash has painted before the native one goes
        requestAnimationFrame(() => {
          SplashScreen.hideAsync()
            .catch(() => undefined)
            .finally(() => setHandedOff(true));
        });
      }}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      <Animated.View style={[styles.stage, stageStyle]}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <View style={styles.logo}>
          <Image source={LOGO} style={styles.logo} />
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: glintOpacity }]}>
            {GLINT_LAYERS.map((layer) => (
              <GlintLayer key={layer.width} center={glintCenter} {...layer} />
            ))}
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#05080f",
  },
  stage: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },
  // The same warm spotlight the site puts behind its logo
  glow: {
    position: "absolute",
    left: (LOGO_WIDTH - GLOW_SIZE) / 2,
    top: (LOGO_HEIGHT - GLOW_SIZE) / 2,
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    backgroundImage:
      "radial-gradient(circle, rgba(255, 176, 0, 0.32) 0%, rgba(240, 130, 0, 0.12) 32%, rgba(5, 8, 15, 0) 68%)",
  },
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    overflow: "hidden",
  },
  glintWindow: {
    position: "absolute",
    top: 0,
    left: 0,
    height: LOGO_HEIGHT,
    overflow: "hidden",
  },
});

type GlintLayerProps = {
  center: Animated.AnimatedInterpolation<number>;
  width: number;
  opacity: number;
};

/**
 * A light-coloured copy of the logo seen through a narrow window that slides across it: the window
 * moves one way and the copy inside it the other, so the copy stays on top of the logo and the
 * light only ever falls on the letters.
 */
function GlintLayer({ center, width, opacity }: GlintLayerProps) {
  const left = Animated.subtract(center, width / 2);
  return (
    <Animated.View style={[styles.glintWindow, { width, transform: [{ translateX: left }] }]}>
      <Animated.Image
        source={LOGO}
        tintColor="#fffaeb"
        style={[styles.logo, { opacity, transform: [{ translateX: Animated.multiply(left, -1) }] }]}
      />
    </Animated.View>
  );
}
