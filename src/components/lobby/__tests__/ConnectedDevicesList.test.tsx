/* eslint-disable max-lines */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import { ConnectedDevicesList } from "../ConnectedDevicesList";

const localeStrings = translations["pt-BR"];
const lobbyStrings = localeStrings.lobby;

const renderWithLocale = (component: React.ReactElement) =>
  render(<LocaleProvider>{component}</LocaleProvider>);

const createMockDevice = (overrides = {}) => ({
  id: "device-123-456",
  displayName: "Player 1",
  role: "guest" as const,
  isActive: true,
  isReady: false,
  ...overrides,
});

// eslint-disable-next-line max-lines-per-function
describe("ConnectedDevicesList", () => {
  const defaultProps = {
    devices: [createMockDevice()],
    currentDeviceId: "device-123-456",
    isAdmin: false,
    onRemoveGuest: vi.fn(),
    onToggleReadyState: vi.fn(),
    onEditName: undefined,
    isGameStarted: false,
    canSelfToggleReady: true,
    selfRole: "guest" as const,
  };

  it("renders the connected devices heading", () => {
    renderWithLocale(<ConnectedDevicesList {...defaultProps} />);
    expect(screen.getByText(lobbyStrings.connectedDevices)).toBeInTheDocument();
  });

  it("renders nothing when devices array is empty", () => {
    const { container } = renderWithLocale(<ConnectedDevicesList {...defaultProps} devices={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays device name", () => {
    renderWithLocale(<ConnectedDevicesList {...defaultProps} />);
    expect(screen.getByText("Player 1")).toBeInTheDocument();
  });

  it("displays device ID substring when no displayName", () => {
    const deviceWithoutName = createMockDevice({ displayName: undefined, id: "abcd1234-5678" });
    renderWithLocale(<ConnectedDevicesList {...defaultProps} devices={[deviceWithoutName]} />);
    expect(screen.getByText("abcd1234")).toBeInTheDocument();
  });

  // eslint-disable-next-line max-lines-per-function
  describe("visibility based on role", () => {
    const adminDevice = createMockDevice({
      id: "admin-device",
      role: "admin",
      displayName: "Admin",
    });
    const guestDevice = createMockDevice({
      id: "guest-device",
      role: "guest",
      displayName: "Guest Player",
    });

    it("hides admin devices when viewer is a guest", () => {
      renderWithLocale(
        <ConnectedDevicesList
          {...defaultProps}
          devices={[adminDevice, guestDevice]}
          selfRole="guest"
          currentDeviceId="guest-device"
        />
      );
      expect(screen.queryByText("Admin")).not.toBeInTheDocument();
      expect(screen.getByText("Guest Player")).toBeInTheDocument();
    });

    it("shows all devices when viewer is admin", () => {
      renderWithLocale(
        <ConnectedDevicesList
          {...defaultProps}
          devices={[adminDevice, guestDevice]}
          selfRole="admin"
          isAdmin={true}
          currentDeviceId="admin-device"
        />
      );
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("Guest Player")).toBeInTheDocument();
    });

    it("hides device ID hash for guests", () => {
      renderWithLocale(
        <ConnectedDevicesList
          {...defaultProps}
          devices={[guestDevice]}
          selfRole="guest"
          currentDeviceId="guest-device"
        />
      );
      expect(screen.queryByText(/#guest-de/)).not.toBeInTheDocument();
    });

    it("shows device ID hash for admin", () => {
      renderWithLocale(
        <ConnectedDevicesList
          {...defaultProps}
          devices={[guestDevice]}
          selfRole="admin"
          isAdmin={true}
          currentDeviceId="admin-device"
        />
      );
      expect(screen.getByText("#guest-de")).toBeInTheDocument();
    });

    it("shows role badges only for admin", () => {
      renderWithLocale(
        <ConnectedDevicesList
          {...defaultProps}
          devices={[guestDevice]}
          selfRole="admin"
          isAdmin={true}
          currentDeviceId="admin-device"
        />
      );
      expect(screen.getByText(lobbyStrings.guest)).toBeInTheDocument();
    });

    it("hides role badges for guests", () => {
      renderWithLocale(
        <ConnectedDevicesList
          {...defaultProps}
          devices={[guestDevice]}
          selfRole="guest"
          currentDeviceId="guest-device"
        />
      );
      expect(screen.queryByText(lobbyStrings.guest)).not.toBeInTheDocument();
    });
  });

  describe("tile styling", () => {
    it("applies yellow styling for current user tile", () => {
      const { container } = renderWithLocale(<ConnectedDevicesList {...defaultProps} />);
      const tile = container.querySelector(".bg-amber-500\\/20");
      expect(tile).toBeInTheDocument();
    });

    it("applies blue styling for other users tile", () => {
      const otherDevice = createMockDevice({ id: "other-device", displayName: "Other Player" });
      const { container } = renderWithLocale(
        <ConnectedDevicesList
          {...defaultProps}
          devices={[otherDevice]}
          currentDeviceId="my-device"
        />
      );
      const tile = container.querySelector(".bg-slate-800\\/50");
      expect(tile).toBeInTheDocument();
    });
  });

  describe("ready toggle button", () => {
    it("shows ready toggle button only for current device", () => {
      const currentDevice = createMockDevice({ id: "current-device" });
      const otherDevice = createMockDevice({ id: "other-device", displayName: "Other" });

      renderWithLocale(
        <ConnectedDevicesList
          {...defaultProps}
          devices={[currentDevice, otherDevice]}
          currentDeviceId="current-device"
        />
      );

      const buttons = screen.getAllByRole("button");
      const readyButton = buttons.find((btn) => btn.getAttribute("title")?.includes("pronto"));
      expect(readyButton).toBeInTheDocument();
    });

    it("calls onToggleReadyState when ready button is clicked", async () => {
      const onToggleReadyState = vi.fn();
      const user = userEvent.setup();

      renderWithLocale(
        <ConnectedDevicesList {...defaultProps} onToggleReadyState={onToggleReadyState} />
      );

      const buttons = screen.getAllByRole("button");
      const readyButton = buttons.find((btn) => btn.getAttribute("title")?.includes("pronto"));
      if (readyButton) {
        await user.click(readyButton);
      }
      expect(onToggleReadyState).toHaveBeenCalledWith("device-123-456", true);
    });

    it("disables ready button when game is started", () => {
      renderWithLocale(<ConnectedDevicesList {...defaultProps} isGameStarted={true} />);

      const buttons = screen.getAllByRole("button");
      const readyButton = buttons.find((btn) => btn.getAttribute("title")?.includes("jogo"));
      expect(readyButton).toBeDisabled();
    });
  });

  describe("remove guest button", () => {
    it("shows remove button for admin viewing other guests", () => {
      const otherGuest = createMockDevice({ id: "other-guest", displayName: "Other Guest" });

      renderWithLocale(
        <ConnectedDevicesList
          {...defaultProps}
          devices={[otherGuest]}
          selfRole="admin"
          isAdmin={true}
          currentDeviceId="admin-device"
        />
      );

      const buttons = screen.getAllByRole("button");
      const removeButton = buttons.find(
        (btn) => btn.getAttribute("title") === lobbyStrings.removeGuest
      );
      expect(removeButton).toBeInTheDocument();
    });

    it("hides remove button for non-admin users", () => {
      const otherGuest = createMockDevice({ id: "other-guest", displayName: "Other Guest" });

      renderWithLocale(
        <ConnectedDevicesList
          {...defaultProps}
          devices={[otherGuest]}
          selfRole="guest"
          isAdmin={false}
          currentDeviceId="my-device"
        />
      );

      const removeButton = screen.queryByTitle(lobbyStrings.removeGuest);
      expect(removeButton).not.toBeInTheDocument();
    });

    it("calls onRemoveGuest when remove button is clicked", async () => {
      const onRemoveGuest = vi.fn();
      const user = userEvent.setup();
      const otherGuest = createMockDevice({ id: "other-guest", displayName: "Other Guest" });

      renderWithLocale(
        <ConnectedDevicesList
          {...defaultProps}
          devices={[otherGuest]}
          selfRole="admin"
          isAdmin={true}
          currentDeviceId="admin-device"
          onRemoveGuest={onRemoveGuest}
        />
      );

      await user.click(screen.getByTitle(lobbyStrings.removeGuest));
      expect(onRemoveGuest).toHaveBeenCalledWith("other-guest");
    });
  });

  describe("active status indicator", () => {
    it("shows active indicator only for admin", () => {
      const { container } = renderWithLocale(
        <ConnectedDevicesList
          {...defaultProps}
          selfRole="admin"
          isAdmin={true}
          currentDeviceId="admin-device"
        />
      );

      const indicator = container.querySelector(".bg-success");
      expect(indicator).toBeInTheDocument();
    });

    it("hides active indicator for guests", () => {
      const { container } = renderWithLocale(
        <ConnectedDevicesList {...defaultProps} selfRole="guest" />
      );

      const indicator = container.querySelector(".bg-success");
      expect(indicator).not.toBeInTheDocument();
    });

    it("shows amber indicator when device is in background", () => {
      const backgroundDevice = createMockDevice({ isActive: false });

      const { container } = renderWithLocale(
        <ConnectedDevicesList
          {...defaultProps}
          devices={[backgroundDevice]}
          selfRole="admin"
          isAdmin={true}
          currentDeviceId="admin-device"
        />
      );

      const indicator = container.querySelector(".bg-amber-500");
      expect(indicator).toBeInTheDocument();
    });
  });
});
