import { useEffect } from "react";

// An on-screen keyboard takes at least this much of the screen; smaller changes are the browser's
// toolbars or a hardware keyboard's shortcut bar, and leave the page alone
const MIN_KEYBOARD_HEIGHT = 100;

// How close a field may come to the edges of the visible area before it counts as covered
const REVEAL_MARGIN = 8;

// Input types that don't open the keyboard
const NON_TEXT_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

const KEYBOARD_PROPERTIES = ["--keyboard-height", "--visible-top", "--visible-height"];

const isTextField = (element: Element | null): element is HTMLInputElement | HTMLTextAreaElement =>
  element instanceof HTMLTextAreaElement ||
  (element instanceof HTMLInputElement && !NON_TEXT_INPUT_TYPES.has(element.type));

// How much of the screen the keyboard covers. Safari keeps window.innerHeight at the full height
// and shrinks only the visual viewport; where the keyboard shrinks the whole page (Android, see
// index.html) both shrink and this stays 0. Zooming in shrinks the visual viewport too, so a pinch
// never counts as a keyboard
const getKeyboardHeight = (viewport: VisualViewport) =>
  viewport.scale > 1.01 ? 0 : window.innerHeight - viewport.height;

const markKeyboardOpen = (root: HTMLElement, viewport: VisualViewport, keyboardHeight: number) => {
  root.dataset.keyboardOpen = "";
  root.style.setProperty("--keyboard-height", `${keyboardHeight}px`);
  root.style.setProperty("--visible-top", `${viewport.offsetTop}px`);
  root.style.setProperty("--visible-height", `${viewport.height}px`);
};

const markKeyboardClosed = (root: HTMLElement) => {
  delete root.dataset.keyboardOpen;
  KEYBOARD_PROPERTIES.forEach((property) => root.style.removeProperty(property));
};

// Brings a field the keyboard covers back into view: a page field to the middle of the visible
// area, a dialog field into the visible part of its dialog, since the dialog itself moves above
// the keyboard (index.css)
const revealField = (field: HTMLElement, viewport: VisualViewport) => {
  const { top, bottom } = field.getBoundingClientRect();
  const visibleTop = viewport.offsetTop;
  const visibleBottom = visibleTop + viewport.height;
  const isCovered = top < visibleTop + REVEAL_MARGIN || bottom > visibleBottom - REVEAL_MARGIN;
  if (!isCovered) {
    return;
  }

  if (field.closest('[role="dialog"], [role="alertdialog"]')) {
    field.scrollIntoView({ block: "nearest" });
    return;
  }
  // By hand: scrollIntoView can center on the whole screen, keyboard included
  window.scrollBy({ top: (top + bottom - visibleTop - visibleBottom) / 2 });
};

/**
 * Keeps the focused text field above the on-screen keyboard where the keyboard covers the page
 * instead of shrinking it (Safari on iOS; on Android the page shrinks, see interactive-widget in
 * index.html). While the keyboard is up, the root element gets data-keyboard-open and the visible
 * area as CSS variables, which center the dialogs above the keyboard and give the page room to
 * scroll (index.css), and a field the keyboard covers is scrolled into view.
 */
export function useKeyboardAvoidance(): void {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }

    const root = document.documentElement;
    let frame = 0;

    const update = (shouldReveal: boolean) => {
      const field = document.activeElement;
      const keyboardHeight = getKeyboardHeight(viewport);
      if (!isTextField(field) || keyboardHeight < MIN_KEYBOARD_HEIGHT) {
        markKeyboardClosed(root);
        return;
      }

      markKeyboardOpen(root, viewport, keyboardHeight);
      if (shouldReveal) {
        cancelAnimationFrame(frame);
        // Once the dialog has moved and the page has room
        frame = requestAnimationFrame(() => revealField(field, viewport));
      }
    };
    // The keyboard opened, closed or changed height, or the focus moved. Moving between fields
    // fires focusout then focusin in the same task, so nothing flickers in between
    const updateAndReveal = () => update(true);
    // Safari panned the page under the keyboard: the dialogs follow it, but the page stays where
    // the user scrolled it
    const followPan = () => update(false);

    viewport.addEventListener("resize", updateAndReveal);
    viewport.addEventListener("scroll", followPan);
    document.addEventListener("focusin", updateAndReveal);
    document.addEventListener("focusout", updateAndReveal);

    return () => {
      viewport.removeEventListener("resize", updateAndReveal);
      viewport.removeEventListener("scroll", followPan);
      document.removeEventListener("focusin", updateAndReveal);
      document.removeEventListener("focusout", updateAndReveal);
      cancelAnimationFrame(frame);
      markKeyboardClosed(root);
    };
  }, []);
}
