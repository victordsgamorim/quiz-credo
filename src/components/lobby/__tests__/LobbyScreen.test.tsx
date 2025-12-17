import { render, waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { LocaleProvider, useLocale } from "@/contexts/LocaleContext";
import { useCategoryStorage } from "@/hooks/useCategoryStorage";
import { translations } from "@/locales";

import { LobbyScreen } from "../LobbyScreen";

import {
  CategoryDrawerMockProps,
  categoryDrawerMockState,
  createCategoryStorageMock,
  createSocketState,
  waitForDrawerProps,
} from "./LobbyScreenTestUtils";

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

const mockedUseCategoryStorage = vi.mocked(useCategoryStorage);

const lobbyStrings = translations["pt-BR"].lobby;

// Helper to render with LocaleProvider
const renderWithLocale = (component: React.ReactElement) => {
  return render(<LocaleProvider>{component}</LocaleProvider>);
};

describe("LobbyScreen category selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryDrawerMockState.reset();
  });

  it("allows guests to submit category selections", async () => {
    const submitCategoryVote = vi.fn();
    const { persistCategories } = createCategoryStorageMock(mockedUseCategoryStorage);

    const socketState = createSocketState({
      submitCategoryVote,
    });

    renderWithLocale(<LobbyScreen onReady={vi.fn()} socket={socketState} />);

    const drawerProps = await waitForDrawerProps();

    drawerProps.onToggleCategory("geography");

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

    const drawerProps = await waitForDrawerProps();

    expect(drawerProps.isSelectionDisabled).toBe(false);

    drawerProps.onToggleCategory("geography");

    await waitFor(() => {
      expect(submitCategoryVote).toHaveBeenCalledWith(["geography"]);
    });
    expect(persistCategories).toHaveBeenCalledWith("ABC123", ["geography"]);
  });
});

describe("LobbyScreen locale management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryDrawerMockState.reset();
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
