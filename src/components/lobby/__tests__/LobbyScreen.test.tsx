import { render, waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { toast } from "sonner";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { BackgroundMusicProvider } from "@/contexts/BackgroundMusicContext";
import { LocaleProvider, useLocale } from "@/contexts/LocaleContext";
import { useCategoryStorage } from "@/hooks/useCategoryStorage";
import { translations } from "@/locales";
import { DEFAULT_GAME_SETTINGS } from "@/types/gameSettings";

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
  useIsMobile: () => true,
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
      <LocaleProvider>
        <BackgroundMusicProvider>{component}</BackgroundMusicProvider>
      </LocaleProvider>
    </MemoryRouter>
  );
};

describe("LobbyScreen category selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryChipsPanelMockState.reset();
  });

  it("allows guests to submit category selections", async () => {
    const submitCategoryVote = vi.fn();
    const { persistCategories } = createCategoryStorageMock(mockedUseCategoryStorage);

    const socketState = createSocketState({
      submitCategoryVote,
    });

    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={socketState} />);

    const panelProps = await waitForCategoryChipsPanelProps();

    panelProps.onToggleCategory("geography");

    await waitFor(() => {
      expect(submitCategoryVote).toHaveBeenCalledWith(["geography"]);
    });
    expect(persistCategories).toHaveBeenCalledWith("ABC123", ["geography"]);
  });

  it("allows guests to change categories even when back from game", async () => {
    const submitCategoryVote = vi.fn();
    const { persistCategories } = createCategoryStorageMock(mockedUseCategoryStorage);

    const socketState = createSocketState({
      submitCategoryVote,
    });

    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={socketState} />);

    const panelProps = await waitForCategoryChipsPanelProps();

    expect(panelProps.isSelectionDisabled).toBe(false);

    panelProps.onToggleCategory("geography");

    await waitFor(() => {
      expect(submitCategoryVote).toHaveBeenCalledWith(["geography"]);
    });
    expect(persistCategories).toHaveBeenCalledWith("ABC123", ["geography"]);
  });
});

describe("LobbyScreen locale management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryChipsPanelMockState.reset();
    localStorage.clear();
  });

  it("should lock locale when creating a channel", async () => {
    const user = userEvent.setup();
    const createChannel = vi.fn();
    createCategoryStorageMock(mockedUseCategoryStorage);

    const socketState = createSocketState({
      isConnected: true,
      currentChannel: null,
      createChannel,
    });

    // Create a test component to access locale context
    let localeContext: ReturnType<typeof useLocale> | null = null;
    const TestComponent = () => {
      localeContext = useLocale();
      return <LobbyScreen onReady={vi.fn()} socket={socketState} />;
    };

    renderWithLocale(<TestComponent />);

    // Initially locale should not be locked
    expect(localeContext?.isLockedFromChange).toBe(false);

    // Click create room button
    const createButton = screen.getByRole("button", {
      name: new RegExp(lobbyStrings.createRoom, "i"),
    });
    await user.click(createButton);

    // Locale should now be locked
    await waitFor(() => {
      expect(localeContext?.isLockedFromChange).toBe(true);
    });
    expect(createChannel).toHaveBeenCalled();
  });
});

describe("LobbyScreen power-up settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryChipsPanelMockState.reset();
  });

  it("lets the admin set up the power-ups in a dialog of their own, sent with the game settings", async () => {
    const user = userEvent.setup();
    const updateGameSettings = vi.fn();
    createCategoryStorageMock(mockedUseCategoryStorage);
    const socketState = createSocketState({ selfRole: "admin", updateGameSettings });
    const powerUpStrings = translations["pt-BR"].quiz.gameScreen.powerUps;

    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={socketState} />);
    await user.click(screen.getByRole("button", { name: lobbyStrings.powerUpSettings.open }));

    const dialog = screen.getByRole("dialog", { name: lobbyStrings.powerUpSettings.title });
    expect(dialog).toBeVisible();
    await user.click(
      screen.getByRole("switch", {
        name: `Usar ${powerUpStrings.break.name} no jogo`,
      })
    );

    await waitFor(() => {
      expect(updateGameSettings).toHaveBeenLastCalledWith({
        ...DEFAULT_GAME_SETTINGS,
        powerUps: {
          ...DEFAULT_GAME_SETTINGS.powerUps,
          enabled: { ...DEFAULT_GAME_SETTINGS.powerUps.enabled, break: false },
        },
      });
    });
  });

  it("doesn't give the guests the power-up settings", () => {
    createCategoryStorageMock(mockedUseCategoryStorage);

    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={createSocketState()} />);

    expect(
      screen.queryByRole("button", { name: lobbyStrings.powerUpSettings.open })
    ).not.toBeInTheDocument();
  });
});

describe("LobbyScreen realtime server errors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryChipsPanelMockState.reset();
  });

  it.each([
    ["auth_required", "authRequired"],
    ["admin_required", "adminRequired"],
    ["invalid_channel_id", "invalidCode"],
    ["room_full", "roomFull"],
    ["too_many_rooms", "tooManyRooms"],
    ["rate_limited", "rateLimited"],
  ] as const)("tells the user about %s in their own words", async (error, key) => {
    createCategoryStorageMock(mockedUseCategoryStorage);
    const socketState = createSocketState({ channelError: { error } });

    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={socketState} />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(lobbyStrings.errors[key]);
    });
    expect(socketState.clearChannelError).toHaveBeenCalled();
  });

  it("keeps the admin in their room when an action is refused for their session", async () => {
    createCategoryStorageMock(mockedUseCategoryStorage);
    const socketState = createSocketState({
      selfRole: "admin",
      currentChannel: "ABC123",
      channelError: { error: "admin_required" },
    });

    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={socketState} />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(lobbyStrings.errors.adminRequired);
    });
    // Still in the room: its code shows, and the join form doesn't
    expect(screen.getAllByText("ABC123").length).toBeGreaterThan(0);
    expect(
      screen.queryByRole("button", { name: new RegExp(lobbyStrings.createRoom, "i") })
    ).toBeNull();
  });
});
