import { render, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useCategoryStorage } from "@/hooks/useCategoryStorage";
import { useSocket } from "@/hooks/useSocket";

import { LobbyScreen } from "../LobbyScreen";

vi.mock("@/hooks/useSocket", () => ({
  useSocket: vi.fn(),
}));

vi.mock("@/hooks/useCategoryStorage", () => ({
  useCategoryStorage: vi.fn(),
}));

type CategoryDrawerMockProps = {
  isSelectionDisabled: boolean;
  onToggleCategory: (category: string) => void;
  onClearSelections: () => void;
  selectedCategories: string[];
};

const categoryDrawerMockState = vi.hoisted(() => {
  let props: CategoryDrawerMockProps | null = null;
  return {
    setProps(newProps: CategoryDrawerMockProps) {
      props = newProps;
    },
    getProps() {
      return props;
    },
    reset() {
      props = null;
    },
  };
});

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

type UseSocketReturn = ReturnType<typeof useSocket>;

type CategoryStorageHandlers = ReturnType<typeof useCategoryStorage>;

const mockedUseSocket = vi.mocked(useSocket);
const mockedUseCategoryStorage = vi.mocked(useCategoryStorage);

const createSocketState = (overrides: Partial<UseSocketReturn> = {}): UseSocketReturn => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  createChannel: vi.fn(),
  joinChannel: vi.fn(),
  leaveChannel: vi.fn(),
  clearDeviceSession: vi.fn(),
  getStoredSession: vi.fn(() => null),
  removeGuest: vi.fn(),
  submitCategoryVote: vi.fn(),
  closeCategoryVoting: vi.fn(),
  clearForceLeaveInfo: vi.fn(),
  clearChannelError: vi.fn(),
  isConnected: true,
  currentChannel: "ABC123",
  channelDevices: [],
  deviceId: "device-123",
  totalDevices: 1,
  selfRole: "guest",
  forceLeaveInfo: null,
  channelError: null,
  categoryTotals: [],
  maxCategorySelections: 5,
  isVotingClosed: false,
  ...overrides,
});

const mockCategoryStorage = (
  overrides: Partial<CategoryStorageHandlers> = {}
): CategoryStorageHandlers => {
  const loadStoredCategories = vi.fn().mockReturnValue([]);
  const persistCategories = vi.fn();
  const clearPersistedCategories = vi.fn();

  const handlers: CategoryStorageHandlers = {
    loadStoredCategories,
    persistCategories,
    clearPersistedCategories,
    ...overrides,
  };

  mockedUseCategoryStorage.mockReturnValue(handlers);
  return handlers;
};

const waitForDrawerProps = async (): Promise<CategoryDrawerMockProps> => {
  await waitFor(() => {
    if (!categoryDrawerMockState.getProps()) {
      throw new Error("CategoryDrawer props not ready");
    }
  });
  return categoryDrawerMockState.getProps() as CategoryDrawerMockProps;
};

describe("LobbyScreen category selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryDrawerMockState.reset();
  });

  it("allows guests to submit category selections", async () => {
    const submitCategoryVote = vi.fn();
    const { persistCategories } = mockCategoryStorage();

    mockedUseSocket.mockReturnValue(
      createSocketState({
        submitCategoryVote,
      })
    );

    render(<LobbyScreen onReady={vi.fn()} />);

    const drawerProps = await waitForDrawerProps();

    drawerProps.onToggleCategory("Geografia");

    await waitFor(() => {
      expect(submitCategoryVote).toHaveBeenCalledWith(["Geografia"]);
    });
    expect(persistCategories).toHaveBeenCalledWith("ABC123", ["Geografia"]);
  });

  it("prevents voting when the session is closed", async () => {
    const submitCategoryVote = vi.fn();
    const { persistCategories } = mockCategoryStorage();

    mockedUseSocket.mockReturnValue(
      createSocketState({
        isVotingClosed: true,
        submitCategoryVote,
      })
    );

    render(<LobbyScreen onReady={vi.fn()} />);

    const drawerProps = await waitForDrawerProps();

    expect(drawerProps.isSelectionDisabled).toBe(true);

    drawerProps.onToggleCategory("Geografia");

    expect(submitCategoryVote).not.toHaveBeenCalled();
    expect(persistCategories).not.toHaveBeenCalled();
  });
});
