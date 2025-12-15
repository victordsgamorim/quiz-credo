import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

vi.mock("@/components/lobby/CategoryDrawer", () => ({
  CategoryDrawer: ({
    isSelectionDisabled,
    onToggleCategory,
    selectedCategories,
  }: {
    isSelectionDisabled: boolean;
    onToggleCategory: (category: string) => void;
    selectedCategories: string[];
  }) => (
    <div>
      <button
        type="button"
        onClick={() => onToggleCategory("Geografia")}
        disabled={isSelectionDisabled}
      >
        Geografia
        {selectedCategories.includes("Geografia") ? " selecionada" : ""}
      </button>
    </div>
  ),
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

describe("LobbyScreen category selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    const user = userEvent.setup();
    const categoryButton = await screen.findByRole("button", { name: /geografia/i });

    await user.click(categoryButton);

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

    const user = userEvent.setup();
    const categoryButton = await screen.findByRole("button", { name: /geografia/i });

    expect(categoryButton).toBeDisabled();

    await user.click(categoryButton);

    expect(submitCategoryVote).not.toHaveBeenCalled();
    expect(persistCategories).not.toHaveBeenCalled();
  });
});
