import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { useCategoryStorage } from "@/hooks/useCategoryStorage";
import { translations } from "@/locales";

import { LobbyScreen } from "../LobbyScreen";

import {
  CategoryChipsPanelMockProps,
  categoryChipsPanelMockState,
  createCategoryStorageMock,
  createSocketState,
  waitForCategoryChipsPanelProps,
} from "./LobbyScreenTestUtils";

vi.mock("@/hooks/useCategoryStorage", () => ({
  useCategoryStorage: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: null,
    session: null,
    signOut: vi.fn(),
  }),
}));

vi.mock("../CategoryChipsPanel", () => ({
  CategoryChipsPanel: (props: CategoryChipsPanelMockProps) => {
    categoryChipsPanelMockState.setProps(props);
    return <div data-testid="category-chips-panel-mock" />;
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

const mockedUseCategoryStorage = vi.mocked(useCategoryStorage);

const lobbyStrings = translations["pt-BR"].lobby;

// Helper to render with LocaleProvider
const renderWithLocale = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <LocaleProvider>{component}</LocaleProvider>
    </MemoryRouter>
  );
};

// eslint-disable-next-line max-lines-per-function
describe("LobbyScreen readiness flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryChipsPanelMockState.reset();
  });

  it("allows the current guest to toggle ready only after selecting the full set of categories", async () => {
    const updateReadyState = vi.fn();
    createCategoryStorageMock(mockedUseCategoryStorage);

    const socketState = createSocketState({
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
    });

    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={socketState} />);

    // Ready button is now an icon button with title tooltip
    const readyButton = screen.getByTitle(lobbyStrings.readyToggle.tooltip.onlySelf);
    expect(readyButton).toBeDisabled();

    const panelProps = await waitForCategoryChipsPanelProps();
    ["geography", "mathematics", "history", "science", "art"].forEach((category) =>
      panelProps.onToggleCategory(category)
    );

    await waitFor(() => {
      expect(readyButton).not.toBeDisabled();
    });

    fireEvent.click(readyButton);

    expect(updateReadyState).toHaveBeenCalledWith(true);
  });

  it("renders readiness status text for guests only", () => {
    createCategoryStorageMock(mockedUseCategoryStorage);

    const socketState = createSocketState({
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
    });

    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={socketState} />);

    // Check for the readiness status ratio (1/2 format works in any language)
    expect(screen.getByText(/1\/2/i)).toBeInTheDocument();
  });

  it("keeps the admin start button disabled until at least one guest signals ready", () => {
    const startGame = vi.fn();
    createCategoryStorageMock(mockedUseCategoryStorage);

    const socketState = createSocketState({
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
    });

    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={socketState} />);

    const startButton = screen.getByRole("button", {
      name: new RegExp(lobbyStrings.startGame, "i"),
    });
    expect(startButton).toBeDisabled();
    fireEvent.click(startButton);
    expect(startGame).not.toHaveBeenCalled();
  });

  it("starts the game once there is at least one ready guest", () => {
    const startGame = vi.fn();
    createCategoryStorageMock(mockedUseCategoryStorage);

    const socketState = createSocketState({
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
    });

    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={socketState} />);

    const startButton = screen.getByRole("button", {
      name: new RegExp(lobbyStrings.startGame, "i"),
    });
    expect(startButton).not.toBeDisabled();
    fireEvent.click(startButton);
    expect(startGame).toHaveBeenCalled();
  });

  it("invokes onReady when the game has already started", () => {
    const onReady = vi.fn();
    createCategoryStorageMock(mockedUseCategoryStorage);

    const socketState = createSocketState({
      isGameStarted: true,
    });

    renderWithLocale(<LobbyScreen onReady={onReady} socket={socketState} />);
    expect(onReady).toHaveBeenCalledTimes(1);
  });
});
