import { render, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

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
    const { persistCategories } = createCategoryStorageMock(mockedUseCategoryStorage);

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
