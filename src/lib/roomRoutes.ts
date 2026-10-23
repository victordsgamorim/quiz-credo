// The app's screens, a layer each from the bottom of the history up: the home screen, a room's
// lobby, and the room's game
export type RoomLayer = "home" | "lobby" | "game";

// The screen a device is on, and so its URL: the home screen (/), a room's lobby (/join/V6L5UG),
// or one of the room's game screens: its rules (/join/V6L5UG/start), a question, by its id
// (/join/V6L5UG/<question id>), and the ranking (/join/V6L5UG/ranking)
export type RoomRoute =
  | { layer: "home" }
  | { layer: "lobby"; roomCode: string }
  | { layer: "game"; roomCode: string; screen: string };

export const START_SCREEN = "start";
export const RANKING_SCREEN = "ranking";

// How many of the app's layers lie under a history entry, an entry each (a lobby's over the home's,
// a game screen's over the lobby's), kept in the entry's state. Coming out of a layer goes back
// through them instead of piling up new entries. An entry without it has none under it
export type RoomEntryState = { depth: number };

const LAYER_LEVELS: Record<RoomLayer, number> = { home: 0, lobby: 1, game: 2 };

export const getLayerLevel = (layer: RoomLayer) => LAYER_LEVELS[layer];

export const getRoutePath = (route: RoomRoute) => {
  if (route.layer === "home") return "/";
  const lobbyPath = `/join/${encodeURIComponent(route.roomCode)}`;
  return route.layer === "lobby" ? lobbyPath : `${lobbyPath}/${encodeURIComponent(route.screen)}`;
};

// The layer of a URL's path: anything outside a room's paths is the home screen's
export const getPathLayer = (pathname: string): RoomLayer => {
  const [, base, roomCode, screen] = pathname.split("/");
  if (base !== "join" || !roomCode) return "home";
  return screen ? "game" : "lobby";
};

export const getEntryDepth = (state: unknown) => {
  const depth = (state as Partial<RoomEntryState> | null)?.depth;
  return typeof depth === "number" ? depth : 0;
};

/**
 * A room's link opened on its own (a room's QR code, a link sent to a guest) gets the entries a
 * device has after joining from the home screen: the home screen under it, and the room's lobby
 * under a game screen. So back leads there, and not out of the app. A reload, or a return to the
 * page, finds the entries it had. Runs before React Router reads the history
 *
 * @param win - The window whose history to stack
 */
export const stackRoomHistory = (win: Window = window) => {
  const { history } = win;
  const { pathname, search, hash } = win.location;
  const layer = getPathLayer(pathname);
  if (history.state !== null || layer === "home") return;

  const lobbyPath = pathname.split("/").slice(0, 3).join("/");
  const paths = layer === "game" ? ["/", lobbyPath, pathname] : ["/", pathname];
  paths.forEach((path, depth) => {
    // As React Router keeps its entries: the location's state, its key and its place in the history
    const state = {
      usr: { depth } satisfies RoomEntryState,
      key: Math.random().toString(36).slice(2, 10),
      idx: depth,
    };
    if (depth === 0) {
      history.replaceState(state, "", path);
    } else {
      const isOpenedEntry = depth === paths.length - 1;
      history.pushState(state, "", isOpenedEntry ? `${path}${search}${hash}` : path);
    }
  });
};
