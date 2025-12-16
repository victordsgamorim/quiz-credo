import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import { DeviceReadyControls } from "../DeviceReadyControls";

const localeStrings = translations["pt-BR"];
const lobbyStrings = localeStrings.lobby;

const renderWithLocale = (component: React.ReactElement) =>
  render(<LocaleProvider>{component}</LocaleProvider>);

const createMockDevice = (overrides = {}) => ({
  id: "device-123",
  isReady: false,
  isActive: true,
  ...overrides,
});

// eslint-disable-next-line max-lines-per-function
describe("DeviceReadyControls", () => {
  const defaultProps = {
    device: createMockDevice(),
    canRemoveGuest: false,
    onRemoveGuest: vi.fn(),
    onToggleReadyState: vi.fn(),
    isGameStarted: false,
    showReadyToggle: true,
    canToggleReady: true,
    showReadyBadge: true,
    selfRole: "guest" as const,
    isCurrentDevice: true,
  };

  // eslint-disable-next-line max-lines-per-function
  describe("ready toggle button", () => {
    it("shows ready toggle button for current device", () => {
      renderWithLocale(<DeviceReadyControls {...defaultProps} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("hides ready toggle button when showReadyToggle is false", () => {
      renderWithLocale(
        <DeviceReadyControls {...defaultProps} showReadyToggle={false} isCurrentDevice={false} />
      );
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("hides ready toggle button for non-current device", () => {
      renderWithLocale(<DeviceReadyControls {...defaultProps} isCurrentDevice={false} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("calls onToggleReadyState with correct args when clicked", async () => {
      const onToggleReadyState = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(
        <DeviceReadyControls {...defaultProps} onToggleReadyState={onToggleReadyState} />
      );

      await user.click(screen.getByRole("button"));
      expect(onToggleReadyState).toHaveBeenCalledWith("device-123", true);
    });

    it("toggles to false when device is already ready", async () => {
      const onToggleReadyState = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(
        <DeviceReadyControls
          {...defaultProps}
          device={createMockDevice({ isReady: true })}
          onToggleReadyState={onToggleReadyState}
        />
      );

      await user.click(screen.getByRole("button"));
      expect(onToggleReadyState).toHaveBeenCalledWith("device-123", false);
    });

    it("disables button when canToggleReady is false", () => {
      renderWithLocale(<DeviceReadyControls {...defaultProps} canToggleReady={false} />);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("shows change status tooltip when can toggle", () => {
      renderWithLocale(<DeviceReadyControls {...defaultProps} />);
      expect(screen.getByTitle(lobbyStrings.readyToggle.tooltip.changeStatus)).toBeInTheDocument();
    });

    it("shows game started tooltip when game is started", () => {
      renderWithLocale(
        <DeviceReadyControls {...defaultProps} canToggleReady={false} isGameStarted={true} />
      );
      expect(screen.getByTitle(lobbyStrings.readyToggle.tooltip.gameStarted)).toBeInTheDocument();
    });
  });

  describe("ready status icon for other users", () => {
    it("shows clock icon when device is not ready", () => {
      const { container } = renderWithLocale(
        <DeviceReadyControls {...defaultProps} isCurrentDevice={false} showReadyToggle={false} />
      );
      const clockIcon = container.querySelector(".text-muted-foreground");
      expect(clockIcon).toBeInTheDocument();
    });

    it("shows check icon when device is ready", () => {
      const { container } = renderWithLocale(
        <DeviceReadyControls
          {...defaultProps}
          device={createMockDevice({ isReady: true })}
          isCurrentDevice={false}
          showReadyToggle={false}
        />
      );
      const checkIcon = container.querySelector(".text-success");
      expect(checkIcon).toBeInTheDocument();
    });

    it("hides status icon for current device (shows button instead)", () => {
      const { container } = renderWithLocale(
        <DeviceReadyControls {...defaultProps} isCurrentDevice={true} />
      );
      // For current device, it shows a button instead of status icon
      // The status icon (Clock/Check outside of button) should not be visible
      const statusIcons = container.querySelectorAll(".lucide-clock, .lucide-check");
      // Should only find the icon inside the button, not a separate status icon
      expect(statusIcons.length).toBeLessThanOrEqual(1);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("active status text", () => {
    it("shows active status for admin", () => {
      renderWithLocale(<DeviceReadyControls {...defaultProps} selfRole="admin" />);
      expect(screen.getByText(lobbyStrings.active)).toBeInTheDocument();
    });

    it("shows background status when device is inactive", () => {
      renderWithLocale(
        <DeviceReadyControls
          {...defaultProps}
          selfRole="admin"
          device={createMockDevice({ isActive: false })}
        />
      );
      expect(screen.getByText(lobbyStrings.background)).toBeInTheDocument();
    });

    it("hides active status for guest users", () => {
      renderWithLocale(<DeviceReadyControls {...defaultProps} selfRole="guest" />);
      expect(screen.queryByText(lobbyStrings.active)).not.toBeInTheDocument();
    });
  });

  describe("remove guest button", () => {
    it("shows remove button when canRemoveGuest is true", () => {
      renderWithLocale(<DeviceReadyControls {...defaultProps} canRemoveGuest={true} />);
      expect(screen.getByTitle(lobbyStrings.removeGuest)).toBeInTheDocument();
    });

    it("hides remove button when canRemoveGuest is false", () => {
      renderWithLocale(<DeviceReadyControls {...defaultProps} canRemoveGuest={false} />);
      expect(screen.queryByTitle(lobbyStrings.removeGuest)).not.toBeInTheDocument();
    });

    it("calls onRemoveGuest when clicked", async () => {
      const onRemoveGuest = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(
        <DeviceReadyControls
          {...defaultProps}
          canRemoveGuest={true}
          onRemoveGuest={onRemoveGuest}
        />
      );

      await user.click(screen.getByTitle(lobbyStrings.removeGuest));
      expect(onRemoveGuest).toHaveBeenCalledWith("device-123");
    });

    it("renders X icon in remove button", () => {
      renderWithLocale(<DeviceReadyControls {...defaultProps} canRemoveGuest={true} />);
      const removeButton = screen.getByTitle(lobbyStrings.removeGuest);
      expect(removeButton.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("button variants", () => {
    it("uses default variant when device is ready", () => {
      renderWithLocale(
        <DeviceReadyControls {...defaultProps} device={createMockDevice({ isReady: true })} />
      );
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-primary");
    });

    it("uses outline variant when device is not ready", () => {
      renderWithLocale(
        <DeviceReadyControls {...defaultProps} device={createMockDevice({ isReady: false })} />
      );
      const button = screen.getByRole("button");
      expect(button).toHaveClass("border");
    });
  });
});
