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

  describe("ready status of other users", () => {
    it("shows a waiting pill when the device is not ready", () => {
      renderWithLocale(
        <DeviceReadyControls {...defaultProps} isCurrentDevice={false} showReadyToggle={false} />
      );
      expect(screen.getByText(lobbyStrings.notReady)).toHaveClass("badge-game-navy");
    });

    it("shows a green ready pill when the device is ready", () => {
      renderWithLocale(
        <DeviceReadyControls
          {...defaultProps}
          device={createMockDevice({ isReady: true })}
          isCurrentDevice={false}
          showReadyToggle={false}
        />
      );
      expect(screen.getByText(lobbyStrings.ready)).toHaveClass("badge-game-success");
    });

    it("hides the pill when the ready badge is off (the admin's row)", () => {
      renderWithLocale(
        <DeviceReadyControls
          {...defaultProps}
          isCurrentDevice={false}
          showReadyToggle={false}
          showReadyBadge={false}
        />
      );
      expect(screen.queryByText(lobbyStrings.notReady)).not.toBeInTheDocument();
    });

    it("shows the button instead of the pill for the current device", () => {
      renderWithLocale(<DeviceReadyControls {...defaultProps} isCurrentDevice={true} />);

      expect(screen.queryByText(lobbyStrings.notReady)).not.toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
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

  describe("ready button", () => {
    it("turns green and says so when the device is ready", () => {
      renderWithLocale(
        <DeviceReadyControls {...defaultProps} device={createMockDevice({ isReady: true })} />
      );
      const button = screen.getByRole("button", { pressed: true });
      expect(button).toHaveClass("bg-success");
      expect(button).toHaveTextContent(lobbyStrings.ready);
    });

    it("asks the player to say they're ready when they aren't", () => {
      renderWithLocale(
        <DeviceReadyControls {...defaultProps} device={createMockDevice({ isReady: false })} />
      );
      const button = screen.getByRole("button", { pressed: false });
      expect(button).toHaveClass("border");
      expect(button).toHaveTextContent(lobbyStrings.readyToggle.markReady);
    });
  });
});
