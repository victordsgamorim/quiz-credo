import { describe, expect, it } from "vitest";

import {
  getEntryDepth,
  getLayerLevel,
  getPathLayer,
  getRoutePath,
  RANKING_SCREEN,
  stackRoomHistory,
  START_SCREEN,
} from "../roomRoutes";

// The browser's move back through the history arrives a moment later
const goBack = () =>
  new Promise<void>((resolve) => {
    window.addEventListener("popstate", () => resolve(), { once: true });
    window.history.back();
  });

// A page opened on a URL: a new entry at the end of the history, with no state yet
const openPage = (url: string) => {
  window.history.pushState(null, "", url);
};

describe("getRoutePath", () => {
  it("gives the home screen, a room's lobby and its game screens their paths", () => {
    expect(getRoutePath({ layer: "home" })).toBe("/");
    expect(getRoutePath({ layer: "lobby", roomCode: "V6L5UG" })).toBe("/join/V6L5UG");
    expect(getRoutePath({ layer: "game", roomCode: "V6L5UG", screen: START_SCREEN })).toBe(
      "/join/V6L5UG/start"
    );
    expect(getRoutePath({ layer: "game", roomCode: "V6L5UG", screen: "a1b2-c3" })).toBe(
      "/join/V6L5UG/a1b2-c3"
    );
    expect(getRoutePath({ layer: "game", roomCode: "V6L5UG", screen: RANKING_SCREEN })).toBe(
      "/join/V6L5UG/ranking"
    );
  });
});

describe("getPathLayer", () => {
  it("tells the layer of a URL's path", () => {
    expect(getPathLayer("/")).toBe("home");
    expect(getPathLayer("/join/V6L5UG")).toBe("lobby");
    expect(getPathLayer("/join/V6L5UG/")).toBe("lobby");
    expect(getPathLayer("/join/V6L5UG/start")).toBe("game");
    expect(getPathLayer("/join/V6L5UG/ranking")).toBe("game");
  });

  it("takes any other path for the home screen", () => {
    expect(getPathLayer("/join")).toBe("home");
    expect(getPathLayer("/reset-password")).toBe("home");
  });

  it("puts the layers in order, from the bottom of the history up", () => {
    expect(getLayerLevel("home")).toBeLessThan(getLayerLevel("lobby"));
    expect(getLayerLevel("lobby")).toBeLessThan(getLayerLevel("game"));
  });
});

describe("getEntryDepth", () => {
  it("reads how many of the app's layers lie under an entry", () => {
    expect(getEntryDepth({ depth: 2 })).toBe(2);
  });

  it("finds none under an entry the app didn't make", () => {
    expect(getEntryDepth(null)).toBe(0);
    expect(getEntryDepth(undefined)).toBe(0);
    expect(getEntryDepth({})).toBe(0);
  });
});

describe("stackRoomHistory", () => {
  it("puts the home screen under a room's link opened on its own", async () => {
    openPage("/join/V6L5UG?from=qr");
    const length = window.history.length;

    stackRoomHistory();

    expect(window.history.length).toBe(length + 1);
    expect(`${window.location.pathname}${window.location.search}`).toBe("/join/V6L5UG?from=qr");
    expect(window.history.state).toMatchObject({ usr: { depth: 1 }, idx: 1 });

    await goBack();
    expect(window.location.pathname).toBe("/");
    expect(window.history.state).toMatchObject({ usr: { depth: 0 }, idx: 0 });
  });

  it("puts the room's lobby, then the home screen, under a game screen's link", async () => {
    openPage("/join/V6L5UG/ranking");
    const length = window.history.length;

    stackRoomHistory();

    expect(window.history.length).toBe(length + 2);
    expect(window.location.pathname).toBe("/join/V6L5UG/ranking");
    expect(window.history.state).toMatchObject({ usr: { depth: 2 }, idx: 2 });

    await goBack();
    expect(window.location.pathname).toBe("/join/V6L5UG");
    expect(window.history.state).toMatchObject({ usr: { depth: 1 }, idx: 1 });
    await goBack();
    expect(window.location.pathname).toBe("/");
  });

  it("leaves the history of a reload as it was", () => {
    window.history.replaceState({ usr: { depth: 2 }, key: "q1", idx: 2 }, "", "/join/V6L5UG/q1");
    const length = window.history.length;

    stackRoomHistory();

    expect(window.history.length).toBe(length);
    expect(window.history.state).toEqual({ usr: { depth: 2 }, key: "q1", idx: 2 });
  });

  it("leaves the home screen as it was", () => {
    openPage("/");
    const length = window.history.length;

    stackRoomHistory();

    expect(window.history.length).toBe(length);
    expect(window.history.state).toBeNull();
  });
});
