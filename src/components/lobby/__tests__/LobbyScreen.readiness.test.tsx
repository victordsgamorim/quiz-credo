import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useCategoryStorage } from "@/hooks/useCategoryStorage";
import { useSocket } from "@/hooks/useSocket";

import { LobbyScreen } from "../LobbyScreen";

import {
  CategoryDrawerMockProps,
  categoryDrawerMockState,
  createCategoryStorageMock,
  createSocketState,
} from "./LobbyScreenTestUtils";

vi.mock("@/hooks/useSocket", () => ({
  useSocket: vi.fn(),
}));

vi.mock("@/hooks/useCategoryStorage", () => ({
  useCategoryStorage: vi.fn(),
}));

vi.mock("../CategoryDrawer", () => ({
  CategoryDrawer: (props: CategoryDrawerMockProps) => {
    categoryDrawerMockState.setProps(props);
    return <div data-testid="category-drawer-mock" />;
  },
}));

vi.mock("@/hooks/useMediaQuery", () => ({
  useIsDesktop: () => false,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockedUseSocket = vi.mocked(useSocket);
const mockedUseCategoryStorage = vi.mocked(useCategoryStorage);

// eslint-disable-next-line max-lines-per-function
describe("LobbyScreen readiness flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryDrawerMockState.reset();
  });

  it("allows the current user to toggle their ready state", () => {
    const updateReadyState = vi.fn();
    createCategoryStorageMock(mockedUseCategoryStorage);

    mockedUseSocket.mockReturnValue(
      createSocketState({
        updateReadyState,
        channelDevices: [
          {
            id: "admin-1",
            role: "admin",
            isActive: true,
            isReady: true,
            connectedAt: Date.now(),
            channel: "ABC123",
            displayName: "Host",
          },
          {
            id: "device-123",
            role: "guest",
            isActive: true,
            isReady: false,
            connectedAt: Date.now(),
            channel: "ABC123",
            displayName: "Jogador",
          },
        ],
        totalDevices: 2,
      })
    );

    render(<LobbyScreen onReady={vi.fn()} />);

    const readyButton = screen.getByRole("button", { name: /estou pronto/i });
    fireEvent.click(readyButton);

    expect(updateReadyState).toHaveBeenCalledWith(true);
  });

  it("disables the start button for admin until everyone is ready", () => {
    const startGame = vi.fn();
    createCategoryStorageMock(mockedUseCategoryStorage);

    mockedUseSocket.mockReturnValue(
      createSocketState({
        startGame,
        selfRole: "admin",
        channelDevices: [
          {
            id: "device-123",
            role: "admin",
            isActive: true,
            isReady: true,
            connectedAt: Date.now(),
            channel: "ABC123",
            displayName: "Host",
          },
          {
            id: "guest-1",
            role: "guest",
            isActive: true,
            isReady: false,
            connectedAt: Date.now(),
            channel: "ABC123",
            displayName: "Convidado",
          },
        ],
        totalDevices: 2,
      })
    );

    render(<LobbyScreen onReady={vi.fn()} />);

    const startButton = screen.getByRole("button", { name: /iniciar jogo/i });
    expect(startButton).toBeDisabled();
    fireEvent.click(startButton);
    expect(startGame).not.toHaveBeenCalled();
  });

  it("starts the game when admin clicks start and everyone is ready", () => {
    const startGame = vi.fn();
    createCategoryStorageMock(mockedUseCategoryStorage);

    mockedUseSocket.mockReturnValue(
      createSocketState({
        startGame,
        selfRole: "admin",
        channelDevices: [
          {
            id: "device-123",
            role: "admin",
            isActive: true,
            isReady: true,
            connectedAt: Date.now(),
            channel: "ABC123",
            displayName: "Host",
          },
          {
            id: "guest-1",
            role: "guest",
            isActive: true,
            isReady: true,
            connectedAt: Date.now(),
            channel: "ABC123",
            displayName: "Convidado",
          },
        ],
        totalDevices: 2,
      })
    );

    render(<LobbyScreen onReady={vi.fn()} />);

    const startButton = screen.getByRole("button", { name: /iniciar jogo/i });
    expect(startButton).not.toBeDisabled();
    fireEvent.click(startButton);
    expect(startGame).toHaveBeenCalled();
  });

  it("invokes onReady when the game has already started", () => {
    const onReady = vi.fn();
    createCategoryStorageMock(mockedUseCategoryStorage);

    mockedUseSocket.mockReturnValue(
      createSocketState({
        isGameStarted: true,
      })
    );

    render(<LobbyScreen onReady={onReady} />);
    expect(onReady).toHaveBeenCalledTimes(1);
  });
});
