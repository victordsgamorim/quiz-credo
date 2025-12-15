import { vi } from "vitest";

import type { useCategoryStorage } from "@/hooks/useCategoryStorage";
import type { useSocket } from "@/hooks/useSocket";

export type CategoryDrawerMockProps = {
  isSelectionDisabled: boolean;
  onToggleCategory: (category: string) => void;
  onClearSelections: () => void;
  selectedCategories: string[];
};

export type UseSocketReturn = ReturnType<typeof useSocket>;
export type CategoryStorageHandlers = ReturnType<typeof useCategoryStorage>;

let drawerProps: CategoryDrawerMockProps | null = null;

export const categoryDrawerMockState = {
  setProps(newProps: CategoryDrawerMockProps) {
    drawerProps = newProps;
  },
  getProps() {
    return drawerProps;
  },
  reset() {
    drawerProps = null;
  },
};

export const createSocketState = (
  overrides: Partial<UseSocketReturn> = {}
): UseSocketReturn => ({
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
