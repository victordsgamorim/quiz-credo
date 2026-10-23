import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useKeyboardAvoidance } from "../useKeyboardAvoidance";

// A phone screen; the visual viewport is the part of it the keyboard leaves visible
const SCREEN_HEIGHT = 844;
const KEYBOARD_HEIGHT = 340;

class FakeVisualViewport extends EventTarget {
  height = SCREEN_HEIGHT;
  offsetTop = 0;
  scale = 1;
}

const root = document.documentElement;
const originalViewport = Object.getOwnPropertyDescriptor(window, "visualViewport");
const originalInnerHeight = Object.getOwnPropertyDescriptor(window, "innerHeight");
let viewport: FakeVisualViewport;

const setKeyboardHeight = (height: number) => {
  act(() => {
    viewport.height = SCREEN_HEIGHT - height;
    viewport.dispatchEvent(new Event("resize"));
  });
};

const nextFrame = () => {
  act(() => {
    vi.advanceTimersByTime(16);
  });
};

// A field whose top sits at the given distance from the top of the screen
const addField = ({ top = 600, type = "text", parent = document.body } = {}) => {
  const field = document.createElement("input");
  const scrollIntoView = vi.fn();
  field.type = type;
  field.getBoundingClientRect = () => ({ top, bottom: top + 48 }) as DOMRect;
  field.scrollIntoView = scrollIntoView;
  parent.appendChild(field);
  return { field, scrollIntoView };
};

const restore = (property: string, descriptor: PropertyDescriptor | undefined) => {
  if (descriptor) {
    Object.defineProperty(window, property, descriptor);
  } else {
    Reflect.deleteProperty(window, property);
  }
};

// eslint-disable-next-line max-lines-per-function
describe("useKeyboardAvoidance", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    viewport = new FakeVisualViewport();
    Object.defineProperty(window, "visualViewport", { value: viewport, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: SCREEN_HEIGHT, configurable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
    restore("visualViewport", originalViewport);
    restore("innerHeight", originalInnerHeight);
  });

  it("marks the page with the visible area while the keyboard covers a focused field", () => {
    renderHook(() => useKeyboardAvoidance());
    addField().field.focus();
    setKeyboardHeight(KEYBOARD_HEIGHT);

    expect(root).toHaveAttribute("data-keyboard-open");
    expect(root.style.getPropertyValue("--keyboard-height")).toBe("340px");
    expect(root.style.getPropertyValue("--visible-top")).toBe("0px");
    expect(root.style.getPropertyValue("--visible-height")).toBe("504px");
  });

  it("leaves the page alone without a focused text field, for a toolbar or for a zoom", () => {
    renderHook(() => useKeyboardAvoidance());
    setKeyboardHeight(KEYBOARD_HEIGHT);
    expect(root).not.toHaveAttribute("data-keyboard-open");

    addField({ type: "checkbox" }).field.focus();
    setKeyboardHeight(KEYBOARD_HEIGHT);
    expect(root).not.toHaveAttribute("data-keyboard-open");

    addField().field.focus();
    setKeyboardHeight(60);
    expect(root).not.toHaveAttribute("data-keyboard-open");

    viewport.scale = 2;
    setKeyboardHeight(KEYBOARD_HEIGHT);
    expect(root).not.toHaveAttribute("data-keyboard-open");
  });

  it("clears the page once the keyboard closes or the field loses focus", () => {
    renderHook(() => useKeyboardAvoidance());
    const { field } = addField();
    field.focus();
    setKeyboardHeight(KEYBOARD_HEIGHT);
    setKeyboardHeight(0);

    expect(root).not.toHaveAttribute("data-keyboard-open");
    expect(root.style.getPropertyValue("--keyboard-height")).toBe("");

    setKeyboardHeight(KEYBOARD_HEIGHT);
    act(() => field.blur());
    expect(root).not.toHaveAttribute("data-keyboard-open");
  });

  it("scrolls a page field the keyboard covers to the middle of the visible area", () => {
    const scrollBy = vi.spyOn(window, "scrollBy").mockImplementation(() => {});
    renderHook(() => useKeyboardAvoidance());
    const { field, scrollIntoView } = addField({ top: 600 });
    field.focus();
    setKeyboardHeight(KEYBOARD_HEIGHT);
    nextFrame();

    // The field's middle (624) goes to the middle of the 504px left above the keyboard (252)
    expect(scrollBy).toHaveBeenCalledWith({ top: 372 });
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("scrolls a dialog field only within its dialog, and leaves visible fields alone", () => {
    renderHook(() => useKeyboardAvoidance());
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    document.body.appendChild(dialog);
    const dialogField = addField({ top: 600, parent: dialog });
    dialogField.field.focus();
    setKeyboardHeight(KEYBOARD_HEIGHT);
    nextFrame();

    expect(dialogField.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });

    // Moving to a field the keyboard doesn't cover keeps the page marked
    const visibleField = addField({ top: 200 });
    act(() => visibleField.field.focus());
    nextFrame();

    expect(root).toHaveAttribute("data-keyboard-open");
    expect(visibleField.scrollIntoView).not.toHaveBeenCalled();
  });

  it("follows a pan of the page without scrolling the field again", () => {
    const scrollBy = vi.spyOn(window, "scrollBy").mockImplementation(() => {});
    renderHook(() => useKeyboardAvoidance());
    addField({ top: 600 }).field.focus();
    setKeyboardHeight(KEYBOARD_HEIGHT);
    nextFrame();
    act(() => {
      viewport.offsetTop = 120;
      viewport.dispatchEvent(new Event("scroll"));
    });
    nextFrame();

    expect(root.style.getPropertyValue("--visible-top")).toBe("120px");
    expect(scrollBy).toHaveBeenCalledTimes(1);
  });

  it("cleans up when unmounted", () => {
    const { unmount } = renderHook(() => useKeyboardAvoidance());
    addField().field.focus();
    setKeyboardHeight(KEYBOARD_HEIGHT);
    unmount();

    expect(root).not.toHaveAttribute("data-keyboard-open");
    expect(root.style.getPropertyValue("--visible-height")).toBe("");
  });

  it("does nothing without the Visual Viewport API", () => {
    Reflect.deleteProperty(window, "visualViewport");
    renderHook(() => useKeyboardAvoidance());
    addField().field.focus();
    setKeyboardHeight(KEYBOARD_HEIGHT);

    expect(root).not.toHaveAttribute("data-keyboard-open");
  });
});
