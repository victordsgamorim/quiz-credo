import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSocket, type LiveRankingEntry } from "../useSocket";

// The server's events, by name, as the hook listens to them
const handlers = new Map<string, (payload: unknown) => void>();
const fakeSocket = {
  id: "socket-1",
  connected: true,
  on: (event: string, handler: (payload: unknown) => void) => handlers.set(event, handler),
  emit: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock("socket.io-client", () => ({ io: () => fakeSocket }));

const RANKING: LiveRankingEntry[] = [
  { position: 1, deviceId: "bia", displayName: "Bia", totalPoints: 90 },
  { position: 2, deviceId: "caio", displayName: "Caio", totalPoints: 60 },
];

const connectSocket = () => {
  const view = renderHook(() => useSocket("pt-BR"));
  act(() => view.result.current.connect());
  return view;
};

const receive = (event: string, payload: unknown) => {
  act(() => handlers.get(event)?.(payload));
};

describe("useSocket live ranking", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
    handlers.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("has no ranking until the server sends one", () => {
    const { result } = connectSocket();
    expect(result.current.liveRanking).toBeNull();
  });

  it("keeps the latest ranking the server sends", () => {
    const { result } = connectSocket();

    receive("ranking-update", { ranking: RANKING });
    expect(result.current.liveRanking).toEqual(RANKING);

    const passed = [
      { ...RANKING[1], position: 1, totalPoints: 120 },
      { ...RANKING[0], position: 2 },
    ];
    receive("ranking-update", { ranking: passed });
    expect(result.current.liveRanking).toEqual(passed);
  });

  it.each([
    ["a new game starts", "game-started"],
    ["the game is reset", "game-reset"],
    ["the device joins a room", "joined-channel"],
  ])("drops the ranking when %s", (_, event) => {
    const { result } = connectSocket();
    receive("ranking-update", { ranking: RANKING });

    receive(event, { channelId: "ROOM1", devices: [] });

    expect(result.current.liveRanking).toBeNull();
  });
});

describe("useSocket answer shown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
    handlers.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows the answer once someone's answer comes back", () => {
    const { result } = connectSocket();
    expect(result.current.isShowingFeedback).toBe(false);

    receive("answer-result", { questionIndex: 0, isCorrect: true, points: 10 });

    expect(result.current.isShowingFeedback).toBe(true);
  });

  // The admin going back to the lobby while the answer shows: the next game starts on a question
  // nobody answered yet
  it.each([
    ["the game is reset", "game-reset"],
    ["a new game starts", "game-started"],
  ])("stops showing the answer when %s", (_, event) => {
    const { result } = connectSocket();
    receive("answer-result", { questionIndex: 0, isCorrect: true, points: 10 });

    receive(event, { channelId: "ROOM1" });

    expect(result.current.isShowingFeedback).toBe(false);
  });
});

const SESSION_KEY = "socket-device-session";
const NOW = new Date("2026-10-23T12:00:00Z").getTime();
const awayFor = (closesInMs: number) => ({ closesInMs, timeoutMs: 60000 });

// eslint-disable-next-line max-lines-per-function
describe("useSocket admin away", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    handlers.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("has no pause until the server says the admin is away", () => {
    const { result } = connectSocket();
    receive("channel-update", { channelId: "ROOM1", devices: [] });
    expect(result.current.adminAway).toBeNull();
  });

  it("counts down from the time the server says the room has left", () => {
    const { result } = connectSocket();

    receive("channel-update", { channelId: "ROOM1", devices: [], adminAway: awayFor(45000) });

    expect(result.current.adminAway).toEqual({ closesAt: NOW + 45000, timeoutMs: 60000 });
  });

  it("keeps its countdown when an update comes with the network's delay", () => {
    const { result } = connectSocket();
    receive("channel-update", { channelId: "ROOM1", devices: [], adminAway: awayFor(45000) });

    vi.advanceTimersByTime(1000);
    receive("channel-update", { channelId: "ROOM1", devices: [], adminAway: awayFor(44200) });

    expect(result.current.adminAway?.closesAt).toBe(NOW + 45000);
  });

  it("takes the server's countdown when the admin went away again", () => {
    const { result } = connectSocket();
    receive("channel-update", { channelId: "ROOM1", devices: [], adminAway: awayFor(45000) });

    vi.advanceTimersByTime(10000);
    receive("channel-update", { channelId: "ROOM1", devices: [], adminAway: awayFor(60000) });

    expect(result.current.adminAway?.closesAt).toBe(NOW + 70000);
  });

  it("ends the pause once the admin is back", () => {
    const { result } = connectSocket();
    receive("channel-update", { channelId: "ROOM1", devices: [], adminAway: awayFor(45000) });

    receive("channel-update", { channelId: "ROOM1", devices: [], adminAway: null });

    expect(result.current.adminAway).toBeNull();
  });

  it("knows about the pause when it joins the room during it", () => {
    const { result } = connectSocket();

    receive("joined-channel", { channelId: "ROOM1", devices: [], adminAway: awayFor(30000) });

    expect(result.current.adminAway).toEqual({ closesAt: NOW + 30000, timeoutMs: 60000 });
  });

  it("forgets the pause once the room closes", () => {
    const { result } = connectSocket();
    receive("joined-channel", { channelId: "ROOM1", devices: [], adminAway: awayFor(1000) });

    receive("force-leave-channel", { channelId: "ROOM1", reason: "admin_inactive_timeout" });

    expect(result.current.adminAway).toBeNull();
    expect(result.current.currentChannel).toBeNull();
    expect(result.current.forceLeaveInfo).toEqual({
      channelId: "ROOM1",
      reason: "admin_inactive_timeout",
    });
  });
});

// eslint-disable-next-line max-lines-per-function
describe("useSocket dropped connection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    handlers.clear();
    fakeSocket.emit.mockClear();
    fakeSocket.connect.mockClear();
  });

  afterEach(() => {
    fakeSocket.connected = true;
    // Node 26 has a localStorage of its own, undefined unless set up, ahead of jsdom's
    globalThis.localStorage?.removeItem(SESSION_KEY);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // In ROOM1, as the server confirmed it
  const connectInRoom = () => {
    const view = connectSocket();
    receive("connect", undefined);
    receive("joined-channel", { channelId: "ROOM1", devices: [] });
    fakeSocket.emit.mockClear();
    return view;
  };

  it("rejoins its room when the connection comes back", () => {
    connectInRoom();

    receive("connect", undefined);
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(fakeSocket.emit).toHaveBeenCalledWith(
      "join-channel",
      "ROOM1",
      expect.any(String),
      undefined
    );
  });

  it("keeps the rankings when it's back in the same room", () => {
    const { result } = connectInRoom();
    receive("ranking-update", { ranking: RANKING });

    receive("joined-channel", { channelId: "ROOM1", devices: [] });

    expect(result.current.liveRanking).toEqual(RANKING);
  });

  it("leaves a room that closed while it was offline", () => {
    const { result } = connectInRoom();

    receive("channel-error", { error: "channel_not_found" });

    expect(result.current.currentChannel).toBeNull();
    expect(result.current.channelError).toBeNull();
    expect(result.current.forceLeaveInfo).toEqual({
      channelId: "ROOM1",
      reason: "closed_while_offline",
    });
  });

  it("drops a saved room that's gone by the time the page loads, without telling", () => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ deviceId: "device-1", channelId: "ROOM9", lastConnected: NOW })
    );
    const { result } = connectSocket();
    receive("connect", undefined);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(fakeSocket.emit).toHaveBeenCalledWith("join-channel", "ROOM9", "device-1", undefined);

    receive("channel-error", { error: "channel_not_found" });

    expect(result.current.channelError).toBeNull();
    expect(result.current.forceLeaveInfo).toBeNull();
    expect(result.current.isResumingChannel).toBe(false);
  });

  it("quits the game when the player leaves: out of its ranking, unlike a reload", () => {
    const { result } = connectInRoom();

    act(() => result.current.leaveChannel());

    expect(fakeSocket.emit).toHaveBeenCalledWith("leave-channel", "ROOM1", { isQuitting: true });
    expect(result.current.currentChannel).toBeNull();
  });

  it("leaves its room without a connection, for the socket to tell the server once it's back", () => {
    const { result } = connectInRoom();
    fakeSocket.connected = false;

    act(() => result.current.leaveChannel());

    expect(fakeSocket.emit).toHaveBeenCalledWith("leave-channel", "ROOM1", { isQuitting: true });
    expect(result.current.currentChannel).toBeNull();
  });

  it("waits for its own socket to reconnect instead of opening another one", () => {
    const { result } = connectInRoom();
    fakeSocket.connected = false;

    act(() => result.current.connect());

    expect(fakeSocket.connect).toHaveBeenCalledTimes(1);
  });
});
