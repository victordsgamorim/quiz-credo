import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate, type InitialEntry } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import type { RoomLayer, RoomRoute } from "@/lib/roomRoutes";

import { useRoomHistory } from "../useRoomHistory";

const HOME: RoomRoute = { layer: "home" };
const LOBBY: RoomRoute = { layer: "lobby", roomCode: "ABC123" };
const game = (screen: string): RoomRoute => ({ layer: "game", roomCode: "ABC123", screen });

// The history a device has in a room's game after joining it from the home screen
const IN_GAME_ENTRIES: InitialEntry[] = [
  "/",
  { pathname: "/join/ABC123", state: { depth: 1 } },
  { pathname: "/join/ABC123/q1", state: { depth: 2 } },
];

type HarnessProps = {
  route: RoomRoute;
  isWaiting?: boolean;
  onUserNavigation: (layer: RoomLayer) => boolean;
};

// The browser around the page: its address, and its back and forward buttons
const Harness = ({ route, isWaiting = false, onUserNavigation }: HarnessProps) => {
  useRoomHistory({ route, isWaiting, onUserNavigation });
  const navigate = useNavigate();

  return (
    <>
      <output aria-label="location">{useLocation().pathname}</output>
      <button type="button" onClick={() => navigate(-1)}>
        back
      </button>
      <button type="button" onClick={() => navigate(-2)}>
        back twice
      </button>
      <button type="button" onClick={() => navigate(1)}>
        forward
      </button>
    </>
  );
};

const renderHistory = (props: HarnessProps, entries: InitialEntry[] = ["/"]) => {
  const tree = (next: HarnessProps) => (
    <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
      <Harness {...next} />
    </MemoryRouter>
  );
  const view = render(tree(props));
  return { rerender: (next: HarnessProps) => view.rerender(tree(next)) };
};

const location = () => screen.getByRole("status", { name: "location" });
const back = () => fireEvent.click(screen.getByRole("button", { name: "back" }));
const forward = () => fireEvent.click(screen.getByRole("button", { name: "forward" }));

// eslint-disable-next-line max-lines-per-function
describe("useRoomHistory", () => {
  it("puts a room's lobby over the home screen, and the game over the lobby", () => {
    const onUserNavigation = vi.fn(() => true);
    const { rerender } = renderHistory({ route: HOME, onUserNavigation });
    expect(location()).toHaveTextContent(/^\/$/);

    rerender({ route: LOBBY, onUserNavigation });
    expect(location()).toHaveTextContent(/^\/join\/ABC123$/);
    rerender({ route: game("start"), onUserNavigation });
    expect(location()).toHaveTextContent("/join/ABC123/start");

    back();
    expect(location()).toHaveTextContent(/^\/join\/ABC123$/);
    back();
    expect(location()).toHaveTextContent(/^\/$/);
    expect(onUserNavigation.mock.calls).toEqual([["lobby"], ["home"]]);
  });

  it("moves between the game's screens in place, so back leads to the lobby", () => {
    const onUserNavigation = vi.fn(() => true);
    const { rerender } = renderHistory({ route: game("q1"), onUserNavigation }, IN_GAME_ENTRIES);

    rerender({ route: game("q2"), onUserNavigation });
    expect(location()).toHaveTextContent("/join/ABC123/q2");
    rerender({ route: game("ranking"), onUserNavigation });
    expect(location()).toHaveTextContent("/join/ABC123/ranking");

    back();
    expect(location()).toHaveTextContent(/^\/join\/ABC123$/);
    expect(onUserNavigation).toHaveBeenCalledWith("lobby");
  });

  it("goes back through the entries below when the device comes out of the game", () => {
    const onUserNavigation = vi.fn(() => true);
    const { rerender } = renderHistory({ route: game("q1"), onUserNavigation }, IN_GAME_ENTRIES);

    rerender({ route: LOBBY, onUserNavigation });
    expect(location()).toHaveTextContent(/^\/join\/ABC123$/);
    // Its own move back isn't the user's
    expect(onUserNavigation).not.toHaveBeenCalled();

    // Nothing piled up: the home screen is right under the lobby
    back();
    expect(location()).toHaveTextContent(/^\/$/);
  });

  it("goes back down to the home screen when the device leaves the room from the game", () => {
    const onUserNavigation = vi.fn(() => true);
    const { rerender } = renderHistory({ route: game("q1"), onUserNavigation }, IN_GAME_ENTRIES);

    rerender({ route: HOME, onUserNavigation });

    expect(location()).toHaveTextContent(/^\/$/);
    expect(onUserNavigation).not.toHaveBeenCalled();
  });

  it("brings the URL back to the device's screen when the device doesn't follow the user", () => {
    const onUserNavigation = vi.fn(() => false);
    renderHistory({ route: game("q1"), onUserNavigation }, IN_GAME_ENTRIES);

    back();

    expect(onUserNavigation).toHaveBeenCalledWith("lobby");
    expect(location()).toHaveTextContent("/join/ABC123/q1");
  });

  it("puts the lobby back under the game when the user jumps back past it", () => {
    const onUserNavigation = vi.fn(() => false);
    const { rerender } = renderHistory({ route: game("q1"), onUserNavigation }, IN_GAME_ENTRIES);

    fireEvent.click(screen.getByRole("button", { name: "back twice" }));

    expect(onUserNavigation).toHaveBeenCalledWith("home");
    expect(location()).toHaveTextContent("/join/ABC123/q1");
    rerender({ route: game("q1"), onUserNavigation: () => true });
    back();
    expect(location()).toHaveTextContent(/^\/join\/ABC123$/);
  });

  it("takes a stale entry forward back to where the device is", () => {
    const onUserNavigation = vi.fn(() => false);
    const { rerender } = renderHistory({ route: game("q1"), onUserNavigation }, IN_GAME_ENTRIES);
    rerender({ route: LOBBY, onUserNavigation });

    forward();

    expect(onUserNavigation).toHaveBeenCalledWith("game");
    expect(location()).toHaveTextContent(/^\/join\/ABC123$/);
  });

  it("leaves the URL where it is while the device is on its way there", () => {
    const onUserNavigation = vi.fn(() => true);
    const { rerender } = renderHistory({ route: HOME, isWaiting: true, onUserNavigation }, [
      "/join/ABC123/q1",
    ]);
    expect(location()).toHaveTextContent("/join/ABC123/q1");

    // The room turned out to be gone: nothing of the app's under the link, so the URL changes in
    // place
    rerender({ route: HOME, onUserNavigation });
    expect(location()).toHaveTextContent(/^\/$/);
  });
});
