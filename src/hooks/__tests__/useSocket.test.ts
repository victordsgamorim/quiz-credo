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
