import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSocket } from "../useSocket";

type SentAuth = Record<string, unknown>;

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
// The handshake's auth the hook sends: socket.io reads it on every connection
let readAuth: ((send: (auth: SentAuth) => void) => void) | undefined;

vi.mock("socket.io-client", () => ({
  io: (_url: string, options: { auth: typeof readAuth }) => {
    readAuth = options.auth;
    return fakeSocket;
  },
}));

const SESSION_KEY = "socket-device-session";
// The identity the server gives the device
const SERVER_SESSION = { deviceId: "device_server-1", deviceToken: "token-1" };

const connectSocket = (adminAuth?: Parameters<typeof useSocket>[1]) => {
  const view = renderHook(() => useSocket("pt-BR", adminAuth));
  act(() => view.result.current.connect());
  return view;
};

const receive = (event: string, payload: unknown) => {
  act(() => handlers.get(event)?.(payload));
};

// What the device sends the server with its next connection
const nextAuth = () => {
  let sent: SentAuth | undefined;
  readAuth?.((auth) => (sent = auth));
  return sent;
};

describe("useSocket device identity", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    handlers.clear();
    fakeSocket.emit.mockClear();
  });

  afterEach(() => {
    // Node 26 has a localStorage of its own, undefined unless set up, ahead of jsdom's
    globalThis.localStorage?.removeItem(SESSION_KEY);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("connects without a token until the server gives it one", () => {
    connectSocket();
    expect(nextAuth()).toMatchObject({ deviceToken: null });
  });

  it("takes the identity the server gives it, and sends it back on its next connections", () => {
    const { result } = connectSocket();

    receive("device-session", SERVER_SESSION);

    expect(result.current.deviceId).toBe(SERVER_SESSION.deviceId);
    expect(nextAuth()).toMatchObject(SERVER_SESSION);
  });

  it("keeps its token when it joins a room", () => {
    const { result } = connectSocket();
    receive("connect", undefined);
    receive("device-session", SERVER_SESSION);

    act(() => result.current.joinChannel("ROOM1", "Ana"));

    expect(nextAuth()).toMatchObject(SERVER_SESSION);
  });

  it("creates a room without the session: it goes with the connection", () => {
    const { result } = connectSocket();
    receive("connect", undefined);

    act(() => result.current.createChannel("ROOM1", "Host"));

    expect(fakeSocket.emit).toHaveBeenCalledWith("create-channel", "ROOM1", expect.any(String), {
      displayName: "Host",
    });
  });
});

// eslint-disable-next-line max-lines-per-function
describe("useSocket admin session", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    handlers.clear();
    fakeSocket.emit.mockClear();
  });

  afterEach(() => {
    fakeSocket.connected = true;
    globalThis.localStorage?.removeItem(SESSION_KEY);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // The page's session changing while the socket is open: the admin signs in, or Supabase renews it
  const renderWithSession = (initialToken: string | null) => {
    const view = renderHook(({ token }) => useSocket("pt-BR", { accessToken: token }), {
      initialProps: { token: initialToken },
    });
    act(() => view.result.current.connect());
    receive("connect", undefined);
    fakeSocket.emit.mockClear();
    return view;
  };

  it("connects without a session when the admin isn't signed in", () => {
    connectSocket({ accessToken: null });
    expect(nextAuth()).toMatchObject({ accessToken: null });
  });

  it("sends the session with its connection, and with the ones that come back", () => {
    connectSocket({ accessToken: "token-1" });
    expect(nextAuth()).toMatchObject({ accessToken: "token-1" });
  });

  it("tells the server when the admin signs in, when Supabase renews the session and when they sign out", () => {
    const view = renderWithSession(null);

    view.rerender({ token: "token-1" });
    expect(fakeSocket.emit).toHaveBeenLastCalledWith("update-access-token", {
      accessToken: "token-1",
    });

    view.rerender({ token: "token-2" });
    expect(fakeSocket.emit).toHaveBeenLastCalledWith("update-access-token", {
      accessToken: "token-2",
    });
    // The next connection sends the renewed one
    expect(nextAuth()).toMatchObject({ accessToken: "token-2" });

    view.rerender({ token: null });
    expect(fakeSocket.emit).toHaveBeenLastCalledWith("update-access-token", { accessToken: null });
    expect(nextAuth()).toMatchObject({ accessToken: null });
  });

  it("doesn't send the session again while it hasn't changed", () => {
    const view = renderWithSession("token-1");

    view.rerender({ token: "token-1" });

    expect(fakeSocket.emit).not.toHaveBeenCalled();
  });

  it("leaves the session to the next connection when it isn't connected", () => {
    const view = renderWithSession(null);
    fakeSocket.connected = false;

    view.rerender({ token: "token-1" });

    expect(fakeSocket.emit).not.toHaveBeenCalled();
    expect(nextAuth()).toMatchObject({ accessToken: "token-1" });
  });

  it("renews the session, without telling the user, when the server says it expired", () => {
    const onSessionExpired = vi.fn();
    const { result } = connectSocket({ accessToken: "token-1", onSessionExpired });

    receive("channel-error", { error: "auth_expired" });

    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(result.current.channelError).toBeNull();
  });

  it.each(["auth_required", "admin_required"] as const)(
    "gives the page the %s refusal to show",
    (error) => {
      const { result } = connectSocket({ accessToken: "token-1" });

      receive("channel-error", { error });

      expect(result.current.channelError).toEqual({ error });
    }
  );
});
