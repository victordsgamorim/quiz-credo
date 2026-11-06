// Runs in the page once it loads. The site draws under the system bars and pads itself with
// env(safe-area-inset-*), which current Android WebViews fill in; older ones report 0, so the page
// tells the app to pad it natively. It also tells the splash when React has painted, and where the
// site's logo is once its image has loaded, so the splash's logo can land on it.
export const PAGE_PROBE = `(() => {
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
