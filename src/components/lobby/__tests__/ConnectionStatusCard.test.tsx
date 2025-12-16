import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import { ConnectionStatusCard } from "../ConnectionStatusCard";

const localeStrings = translations["pt-BR"];
const lobbyStrings = localeStrings.lobby;
const commonStrings = localeStrings.common;

const renderWithLocale = (component: React.ReactElement) =>
  render(<LocaleProvider>{component}</LocaleProvider>);

// eslint-disable-next-line max-lines-per-function
describe("ConnectionStatusCard", () => {
  const defaultProps = {
    isConnected: true,
    isPageVisible: true,
    isReturningUser: false,
    currentChannel: null,
    deviceId: "device-123-456-789",
    isAdmin: true,
    onResetSession: vi.fn(),
  };

  it("displays connected status when connected", () => {
    renderWithLocale(<ConnectionStatusCard {...defaultProps} />);
    expect(screen.getByText(lobbyStrings.connected)).toBeInTheDocument();
  });

  it("displays disconnected status when not connected", () => {
    renderWithLocale(<ConnectionStatusCard {...defaultProps} isConnected={false} />);
    expect(screen.getByText(lobbyStrings.disconnected)).toBeInTheDocument();
    expect(screen.getByText(lobbyStrings.tryingToReconnect)).toBeInTheDocument();
  });

  it("displays active status when page is visible", () => {
    renderWithLocale(<ConnectionStatusCard {...defaultProps} isPageVisible={true} />);
    expect(screen.getByText(lobbyStrings.active)).toBeInTheDocument();
  });

  it("displays background status when page is not visible", () => {
    renderWithLocale(<ConnectionStatusCard {...defaultProps} isPageVisible={false} />);
    expect(screen.getByText(lobbyStrings.background)).toBeInTheDocument();
  });

  it("displays device ID when connected", () => {
    renderWithLocale(<ConnectionStatusCard {...defaultProps} />);
    const expectedLabel = `${lobbyStrings.deviceId}: ${defaultProps.deviceId?.substring(0, 12)}`;
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });

  it("displays admin badge when user is admin", () => {
    renderWithLocale(<ConnectionStatusCard {...defaultProps} isAdmin={true} />);
    expect(screen.getByText(lobbyStrings.admin.toUpperCase())).toBeInTheDocument();
  });

  it("displays guest badge when user is not admin", () => {
    renderWithLocale(<ConnectionStatusCard {...defaultProps} isAdmin={false} />);
    expect(screen.getByText(lobbyStrings.guest.toUpperCase())).toBeInTheDocument();
  });

  it("does not display device ID when disconnected", () => {
    renderWithLocale(<ConnectionStatusCard {...defaultProps} isConnected={false} />);
    expect(
      screen.queryByText(new RegExp(`${lobbyStrings.deviceId}:`, "i"))
    ).not.toBeInTheDocument();
  });

  it("calls onResetSession when reset button is clicked", async () => {
    const onResetSession = vi.fn();
    const user = userEvent.setup();
    renderWithLocale(<ConnectionStatusCard {...defaultProps} onResetSession={onResetSession} />);

    await user.click(screen.getByRole("button", { name: new RegExp(commonStrings.reset, "i") }));
    expect(onResetSession).toHaveBeenCalledTimes(1);
  });

  it("shows returning user message when isReturningUser is true", () => {
    renderWithLocale(<ConnectionStatusCard {...defaultProps} isReturningUser={true} />);
    expect(screen.getByText(lobbyStrings.sessionRestored)).toBeInTheDocument();
  });

  it("does not show returning user message when in a channel", () => {
    renderWithLocale(
      <ConnectionStatusCard {...defaultProps} isReturningUser={true} currentChannel="ABC123" />
    );
    expect(screen.queryByText(lobbyStrings.sessionRestored)).not.toBeInTheDocument();
  });

  it("shows background activity message when page is not visible", () => {
    renderWithLocale(<ConnectionStatusCard {...defaultProps} isPageVisible={false} />);
    expect(screen.getByText(lobbyStrings.backgroundConnectionMessage)).toBeInTheDocument();
  });

  it("does not show background message when page is visible", () => {
    renderWithLocale(<ConnectionStatusCard {...defaultProps} isPageVisible={true} />);
    expect(screen.queryByText(lobbyStrings.backgroundConnectionMessage)).not.toBeInTheDocument();
  });

  it("displays reset button only when connected", () => {
    const { rerender } = renderWithLocale(
      <ConnectionStatusCard {...defaultProps} isConnected={true} />
    );
    expect(
      screen.getByRole("button", { name: new RegExp(commonStrings.reset, "i") })
    ).toBeInTheDocument();

    rerender(
      <LocaleProvider>
        <ConnectionStatusCard {...defaultProps} isConnected={false} />
      </LocaleProvider>
    );
    expect(
      screen.queryByRole("button", { name: new RegExp(commonStrings.reset, "i") })
    ).not.toBeInTheDocument();
  });

  it("truncates long device IDs correctly", () => {
    const longDeviceId = "very-long-device-id-that-should-be-truncated";
    renderWithLocale(<ConnectionStatusCard {...defaultProps} deviceId={longDeviceId} />);
    const expectedLabel = `${lobbyStrings.deviceId}: ${longDeviceId.substring(0, 12)}`;
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });
});
