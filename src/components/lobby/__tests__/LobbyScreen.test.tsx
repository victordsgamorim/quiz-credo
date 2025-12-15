import { render, waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { LocaleProvider, useLocale } from "@/contexts/LocaleContext";
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

describe("LobbyScreen category selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryDrawerMockState.reset();
  });

  it("allows guests to submit category selections", async () => {
    const submitCategoryVote = vi.fn();
    const { persistCategories } = createCategoryStorageMock(mockedUseCategoryStorage);

    mockedUseSocket.mockReturnValue(
      createSocketState({
        submitCategoryVote,
      })
    );

    renderWithLocale(<LobbyScreen onReady={vi.fn()} />);

    const drawerProps = await waitForDrawerProps();

    drawerProps.onToggleCategory("Geografia");

    await waitFor(() => {
      expect(submitCategoryVote).toHaveBeenCalledWith(["Geografia"]);
    });
    expect(persistCategories).toHaveBeenCalledWith("ABC123", ["Geografia"]);
  });

  it("prevents voting when the session is closed", async () => {
    const submitCategoryVote = vi.fn();
    const { persistCategories } = createCategoryStorageMock(mockedUseCategoryStorage);

    mockedUseSocket.mockReturnValue(
      createSocketState({
        isVotingClosed: true,
        submitCategoryVote,
      })
    );

    renderWithLocale(<LobbyScreen onReady={vi.fn()} />);

    const drawerProps = await waitForDrawerProps();

    expect(drawerProps.isSelectionDisabled).toBe(true);

    drawerProps.onToggleCategory("Geografia");

    expect(submitCategoryVote).not.toHaveBeenCalled();
    expect(persistCategories).not.toHaveBeenCalled();
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

    mockedUseSocket.mockReturnValue(
      createSocketState({
        isConnected: true,
        currentChannel: null,
        createChannel,
      })
    );

    // Create a test component to access locale context
    let localeContext: ReturnType<typeof useLocale> | null = null;
    const TestComponent = () => {
      localeContext = useLocale();
      return <LobbyScreen onReady={vi.fn()} />;
    };

    renderWithLocale(<TestComponent />);

    // Initially locale should not be locked
    expect(localeContext?.isLockedFromChange).toBe(false);

    // Click create room button
    const createButton = screen.getByRole("button", { name: /criar sala/i });
    await user.click(createButton);

    // Locale should now be locked
    await waitFor(() => {
      expect(localeContext?.isLockedFromChange).toBe(true);
    });
    expect(createChannel).toHaveBeenCalled();
  });
});
