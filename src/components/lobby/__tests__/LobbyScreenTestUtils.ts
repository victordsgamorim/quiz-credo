import { waitFor } from "@testing-library/react";
import { vi } from "vitest";

import type { CategoryId } from "@/constants/categories";
import type { useCategoryStorage } from "@/hooks/useCategoryStorage";
import type { useSocket } from "@/hooks/useSocket";

export type CategoryChipsPanelMockProps = {
  isSelectionDisabled: boolean;
  onToggleCategory: (category: CategoryId) => void;
  onClearSelections: () => void;
  selectedCategories: CategoryId[];
};

export type UseSocketReturn = ReturnType<typeof useSocket>;
export type CategoryStorageHandlers = ReturnType<typeof useCategoryStorage>;

let chipsPanelProps: CategoryChipsPanelMockProps | null = null;

export const categoryChipsPanelMockState = {
  setProps(newProps: CategoryChipsPanelMockProps) {
    chipsPanelProps = newProps;
  },
  getProps() {
    return chipsPanelProps;
  },
  reset() {
    chipsPanelProps = null;
  },
};

export const createSocketState = (overrides: Partial<UseSocketReturn> = {}): UseSocketReturn => ({
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
  updateReadyState: vi.fn(),
  startGame: vi.fn(),
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
  isGameStarted: false,
  ...overrides,
});

type MockedCategoryStorage = ReturnType<typeof vi.mocked<typeof useCategoryStorage>>;

export const createCategoryStorageMock = (
  mockedUseCategoryStorage: MockedCategoryStorage,
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

export const waitForCategoryChipsPanelProps = async (): Promise<CategoryChipsPanelMockProps> => {
  await waitFor(() => {
    if (!chipsPanelProps) {
      throw new Error("CategoryChipsPanel props not ready");
    }
  });

  if (!chipsPanelProps) {
    throw new Error("CategoryChipsPanel props missing");
  }

  return chipsPanelProps;
};
