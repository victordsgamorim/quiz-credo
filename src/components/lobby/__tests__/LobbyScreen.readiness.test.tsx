import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { useCategoryStorage } from "@/hooks/useCategoryStorage";
import { useSocket } from "@/hooks/useSocket";

import { LobbyScreen } from "../LobbyScreen";

import {
  CategoryDrawerMockProps,
  categoryDrawerMockState,
  createCategoryStorageMock,
  createSocketState,
  waitForDrawerProps,
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

// Helper to render with LocaleProvider
const renderWithLocale = (component: React.ReactElement) => {
  return render(<LocaleProvider>{component}</LocaleProvider>);
};

// eslint-disable-next-line max-lines-per-function
describe("LobbyScreen readiness flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryDrawerMockState.reset();
  });

  it("allows the current guest to toggle ready only after selecting the full set of categories", async () => {
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

    renderWithLocale(<LobbyScreen onReady={vi.fn()} />);

    const readyButton = screen.getByRole("button", { name: /estou pronto/i });
    expect(readyButton).toBeDisabled();

    const drawerProps = await waitForDrawerProps();
    ["Cat A", "Cat B", "Cat C", "Cat D", "Cat E"].forEach((category) =>
      drawerProps.onToggleCategory(category)
    );

    await waitFor(() => {
      expect(readyButton).not.toBeDisabled();
    });

    fireEvent.click(readyButton);

    expect(updateReadyState).toHaveBeenCalledWith(true);
  });

  it("renders readiness status text for guests only", () => {
    createCategoryStorageMock(mockedUseCategoryStorage);

    mockedUseSocket.mockReturnValue(
      createSocketState({
        channelDevices: [
          {
            id: "admin-1",
            role: "admin",
            isActive: true,
            isReady: false,
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
            displayName: "Convidado A",
          },
          {
            id: "guest-2",
            role: "guest",
            isActive: true,
            isReady: false,
            connectedAt: Date.now(),
            channel: "ABC123",
            displayName: "Convidado B",
          },
        ],
        totalDevices: 3,
      })
    );

    renderWithLocale(<LobbyScreen onReady={vi.fn()} />);

    // Check for the readiness status ratio (1/2 format works in any language)
    expect(screen.getByText(/1\/2/i)).toBeInTheDocument();
  });

  it("keeps the admin start button disabled until at least one guest signals ready", () => {
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

    renderWithLocale(<LobbyScreen onReady={vi.fn()} />);

    const startButton = screen.getByRole("button", { name: /iniciar jogo/i });
    expect(startButton).toBeDisabled();
    fireEvent.click(startButton);
    expect(startGame).not.toHaveBeenCalled();
  });

  it("starts the game once there is at least one ready guest", () => {
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
            isReady: false,
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

    renderWithLocale(<LobbyScreen onReady={vi.fn()} />);

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

    renderWithLocale(<LobbyScreen onReady={onReady} />);
    expect(onReady).toHaveBeenCalledTimes(1);
  });
});
