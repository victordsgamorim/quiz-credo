import { useEffect, useRef } from "react";

import {
  NavigationType,
  useLocation,
  useNavigate,
  useNavigationType,
  type Location,
  type NavigateOptions,
} from "react-router-dom";

import {
  getEntryDepth,
  getLayerLevel,
  getPathLayer,
  getRoutePath,
  type RoomEntryState,
  type RoomLayer,
  type RoomRoute,
} from "@/lib/roomRoutes";

type UseRoomHistoryOptions = {
  // The screen the device is on: the URL follows it
  route: RoomRoute;
  // While the device is on its way to the URL's screen (rejoining its room after a reload, joining
  // a room's link, the room's game about to show), the URL stays where it is
  isWaiting: boolean;
  // The user's own back or forward, to another layer than the device's: true when the device goes
  // there, otherwise the URL comes back to the device's screen
  onUserNavigation: (layer: RoomLayer) => boolean;
};

// A move through the history (back as a negative number), or a new URL
type Move = number | { path: string; options: NavigateOptions };

// The last location the hook saw, and the one its own navigation left until the router moves (a
// move back through the history arrives a moment later)
type SeenLocations = { lastKey: string | null; leftKey: string | null };

// The route under a room's screen, where back from it leads
const getRouteBelow = (route: RoomRoute): RoomRoute =>
  route.layer === "game" ? { layer: "lobby", roomCode: route.roomCode } : { layer: "home" };

// The navigation that brings the URL to the route: in place within a layer, up a layer over the
// entry below, down back through the entries below (in place when there are none)
const getMove = (location: Location, route: RoomRoute): Move | null => {
  const urlLevel = getLayerLevel(getPathLayer(location.pathname));
  const routeLevel = getLayerLevel(route.layer);
  const routePath = getRoutePath(route);
  const depth = getEntryDepth(location.state);

  if (urlLevel === routeLevel) {
    if (location.pathname === routePath) return null;
    return { path: routePath, options: { replace: true, state: location.state as unknown } };
  }
  if (urlLevel < routeLevel) {
    const nextRoute = routeLevel - urlLevel > 1 ? getRouteBelow(route) : route;
    const state: RoomEntryState = { depth: depth + 1 };
    return { path: getRoutePath(nextRoute), options: { state } };
  }
  if (depth > 0) return -Math.min(urlLevel - routeLevel, depth);
  return { path: routePath, options: { replace: true } };
};

// A new location, by a move through the history that the hook didn't make: the user's own back or
// forward
const isUserMove = (seen: SeenLocations, key: string, navigationType: NavigationType) =>
  navigationType === NavigationType.Pop &&
  seen.leftKey === null &&
  seen.lastKey !== null &&
  seen.lastKey !== key;

/*
 * Keeps the URL on the device's screen, with a history like a stack: going into a room, or into its
 * game, adds an entry over the one below; moving between the game's screens replaces it; coming
 * out goes back to the entry below. So back from any game screen leads to the room's lobby, and
 * back from the lobby to the home screen. The user's own back and forward go to onUserNavigation.
 */
export const useRoomHistory = ({ route, isWaiting, onUserNavigation }: UseRoomHistoryOptions) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  const seenRef = useRef<SeenLocations>({ lastKey: null, leftKey: null });

  useEffect(() => {
    const seen = seenRef.current;
    if (seen.leftKey === location.key) return;
    const isByUser = isUserMove(seen, location.key, navigationType);
    seenRef.current = { lastKey: location.key, leftKey: null };

    const urlLayer = getPathLayer(location.pathname);
    if (isByUser && urlLayer !== route.layer && onUserNavigation(urlLayer)) return;
    const move = isWaiting ? null : getMove(location, route);
    if (move === null) return;

    seenRef.current.leftKey = location.key;
    if (typeof move === "number") navigate(move);
    else navigate(move.path, move.options);
  }, [location, navigationType, navigate, route, isWaiting, onUserNavigation]);
};
