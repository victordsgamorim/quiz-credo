import { act, fireEvent, render, waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { toast } from "sonner";
import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";

import { BackgroundMusicProvider } from "@/contexts/BackgroundMusicContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { useCategoryStorage } from "@/hooks/useCategoryStorage";
import { translations } from "@/locales";
import { DEFAULT_GAME_SETTINGS } from "@/types/gameSettings";
import { LOCALES } from "@/types/i18n";

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

const savedSettings = vi.hoisted(() => ({ userId: null as string | null, fetch: vi.fn() }));

vi.mock("@/services/userSettings", () => ({ fetchUserSettings: savedSettings.fetch }));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: savedSettings.userId ? { id: savedSettings.userId } : null,
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

// A phone held upright, unless a test turns it on its side
const screenShape = vi.hoisted(() => ({ isPhoneLandscape: false }));

vi.mock("@/hooks/useMediaQuery", () => ({
  useIsDesktop: () => false,
  useIsMobile: () => true,
  useIsPhoneLandscape: () => screenShape.isPhoneLandscape,
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
const tutorialStrings = translations["pt-BR"].tutorial;

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

// eslint-disable-next-line max-lines-per-function
describe("LobbyScreen languages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryChipsPanelMockState.reset();
    localStorage.clear();
    createCategoryStorageMock(mockedUseCategoryStorage);
  });

  const flagButton = () =>
    screen.getByRole("button", {
      name: `${translations["pt-BR"].language.change}: ${LOCALES["pt-BR"].name}`,
    });

  const roomMenuButton = () => screen.getByRole("button", { name: lobbyStrings.roomMenu.open });

  it("puts the language's flag in the guest's header", () => {
    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={createSocketState()} />);

    expect(flagButton()).toHaveTextContent(LOCALES["pt-BR"].flag);
  });

  it("gathers the admin's tools and the language behind one button", async () => {
    const user = userEvent.setup();
    renderWithLocale(
      <LobbyScreen onReady={vi.fn()} socket={createSocketState({ selfRole: "admin" })} />
    );

    expect(screen.queryByRole("button", { name: lobbyStrings.powerUpSettings.open })).toBeNull();
    expect(screen.queryByRole("button", { name: lobbyStrings.gameSettings.title })).toBeNull();
    await user.click(roomMenuButton());

    for (const name of [
      lobbyStrings.gameSettings.title,
      lobbyStrings.powerUpSettings.open,
      lobbyStrings.categoryPanel.open,
      translations["pt-BR"].language.change,
    ]) {
      expect(screen.getByRole("menuitem", { name })).toBeInTheDocument();
    }
  });

  it("opens the tutorial over the guest's lobby, without leaving the room", async () => {
    const user = userEvent.setup();
    const leaveChannel = vi.fn();
    renderWithLocale(
      <LobbyScreen onReady={vi.fn()} socket={createSocketState({ leaveChannel })} />
    );

    await user.click(screen.getByRole("button", { name: tutorialStrings.open }));

    expect(screen.getByRole("dialog", { name: tutorialStrings.title })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: tutorialStrings.close }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(leaveChannel).not.toHaveBeenCalled();
  });

  it("opens the tutorial from the admin's room menu", async () => {
    const user = userEvent.setup();
    renderWithLocale(
      <LobbyScreen onReady={vi.fn()} socket={createSocketState({ selfRole: "admin" })} />
    );

    await user.click(roomMenuButton());
    await user.click(screen.getByRole("menuitem", { name: tutorialStrings.open }));

    expect(screen.getByRole("dialog", { name: tutorialStrings.title })).toBeInTheDocument();
  });

  it("links the home screen to the tutorial's page", () => {
    renderWithLocale(
      <LobbyScreen onReady={vi.fn()} socket={createSocketState({ currentChannel: null })} />
    );

    expect(screen.getByRole("link", { name: tutorialStrings.open })).toHaveAttribute(
      "href",
      "/tutorial"
    );
  });

  it("switches the whole lobby to the language chosen in the room", async () => {
    const user = userEvent.setup();
    renderWithLocale(
      <LobbyScreen onReady={vi.fn()} socket={createSocketState({ selfRole: "admin" })} />
    );

    await user.click(roomMenuButton());
    await user.click(screen.getByRole("menuitem", { name: translations["pt-BR"].language.change }));
    // Not a pointer click: the pointer's trip to the submenu closes it under jsdom
    fireEvent.click(await screen.findByRole("menuitem", { name: /English/ }));

    expect(await screen.findByText(translations["en-UK"].lobby.roomCode)).toBeInTheDocument();
    expect(screen.queryByText(lobbyStrings.roomCode)).toBeNull();
    expect(localStorage.getItem("app-locale")).toBe("en-UK");
  });

  it("still switches languages after creating a room", async () => {
    const user = userEvent.setup();
    const createChannel = vi.fn();
    renderWithLocale(
      <LobbyScreen
        onReady={vi.fn()}
        socket={createSocketState({ currentChannel: null, createChannel })}
      />
    );

    await user.click(
      screen.getByRole("button", { name: new RegExp(lobbyStrings.createRoom, "i") })
    );
    expect(createChannel).toHaveBeenCalled();
    // Until the server puts the device in its room, the home's menu is still there
    await user.click(screen.getByRole("button", { name: LOCALES["pt-BR"].name }));
    await user.click(screen.getByRole("menuitem", { name: /Español/ }));

    expect(localStorage.getItem("app-locale")).toBe("es-BO");
  });

  it("leaves the admin's connection badge only its dot on phones, beside their room tools", () => {
    const { unmount } = renderWithLocale(
      <LobbyScreen onReady={vi.fn()} socket={createSocketState({ selfRole: "admin" })} />
    );
    expect(screen.getByText(lobbyStrings.connected)).toHaveClass("sr-only", "sm:not-sr-only");
    unmount();

    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={createSocketState()} />);
    expect(screen.getByText(lobbyStrings.connected)).not.toHaveClass("sr-only");
  });
});

describe("LobbyScreen on a phone on its side", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryChipsPanelMockState.reset();
    createCategoryStorageMock(mockedUseCategoryStorage);
  });

  afterEach(() => {
    screenShape.isPhoneLandscape = false;
  });

  it("puts the room's code in the header, in the logo's place", async () => {
    screenShape.isPhoneLandscape = true;
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={createSocketState()} />);

    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getAllByText(lobbyStrings.roomCode)).toHaveLength(1);
    expect(screen.queryByAltText("Millionaire Brain Quiz")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: lobbyStrings.copyCode }));
    expect(writeText).toHaveBeenCalledWith("ABC123");
  });

  it("keeps the logo in the header of a phone held upright, the code under it", () => {
    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={createSocketState()} />);

    expect(screen.getByAltText("Millionaire Brain Quiz")).toBeInTheDocument();
    expect(screen.getByText("ABC123")).toBeInTheDocument();
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
    await user.click(screen.getByRole("button", { name: lobbyStrings.roomMenu.open }));
    await user.click(screen.getByRole("menuitem", { name: lobbyStrings.powerUpSettings.open }));

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

describe("LobbyScreen saved settings", () => {
  const saved = { ...DEFAULT_GAME_SETTINGS, questionCount: 30, streakThreshold: 3 };

  beforeEach(() => {
    vi.clearAllMocks();
    createCategoryStorageMock(mockedUseCategoryStorage);
    savedSettings.userId = "user-1";
    savedSettings.fetch.mockResolvedValue(saved);
  });

  afterEach(() => {
    savedSettings.userId = null;
  });

  const adminSocket = (overrides: Parameters<typeof createSocketState>[0] = {}) =>
    createSocketState({ selfRole: "admin", updateGameSettings: vi.fn(), ...overrides });

  it("loads the admin's saved settings and gives them to the room they create", async () => {
    const socket = adminSocket({ currentChannel: null });
    const view = renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={socket} />);
    await waitFor(() => expect(savedSettings.fetch).toHaveBeenCalledWith("user-1"));
    await act(() => Promise.resolve());

    const inRoom = { ...socket, currentChannel: "ABC123" };
    view.rerender(
      <MemoryRouter>
        <LocaleProvider>
          <BackgroundMusicProvider>
            <LobbyScreen onReady={vi.fn()} socket={inRoom} />
          </BackgroundMusicProvider>
        </LocaleProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(socket.updateGameSettings).toHaveBeenCalledWith(saved));
  });

  it("keeps the settings of a room already open", async () => {
    const roomSettings = { ...DEFAULT_GAME_SETTINGS, questionCount: 20 };
    const socket = adminSocket({ gameSettings: roomSettings });
    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={socket} />);
    await waitFor(() => expect(savedSettings.fetch).toHaveBeenCalled());
    await act(() => Promise.resolve());

    expect(socket.updateGameSettings).toHaveBeenCalledWith(roomSettings);
    expect(socket.updateGameSettings).not.toHaveBeenCalledWith(saved);
  });

  it("starts from the defaults when nothing was saved or nobody is signed in", async () => {
    savedSettings.fetch.mockResolvedValue(null);
    const socket = adminSocket();
    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={socket} />);
    await waitFor(() => expect(savedSettings.fetch).toHaveBeenCalled());
    await act(() => Promise.resolve());
    expect(socket.updateGameSettings).toHaveBeenCalledWith(DEFAULT_GAME_SETTINGS);

    savedSettings.userId = null;
    savedSettings.fetch.mockClear();
    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={adminSocket()} />);
    expect(savedSettings.fetch).not.toHaveBeenCalled();
  });
});
