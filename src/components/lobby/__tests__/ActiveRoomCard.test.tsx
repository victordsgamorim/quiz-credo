import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import { ActiveRoomCard } from "../ActiveRoomCard";

const localeStrings = translations["pt-BR"];
const lobbyStrings = localeStrings.lobby;

const renderWithLocale = (component: React.ReactElement) =>
  render(<LocaleProvider>{component}</LocaleProvider>);

const mockWriteText = vi.fn();

Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

// eslint-disable-next-line max-lines-per-function
describe("ActiveRoomCard", () => {
  const defaultProps = {
    currentChannel: "ABC123",
    channelInput: "",
    totalDevices: 1,
    isAdmin: true,
    onLeaveChannel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders room created message", () => {
    renderWithLocale(<ActiveRoomCard {...defaultProps} />);
    expect(screen.getByText(lobbyStrings.roomCreated)).toBeInTheDocument();
  });

  it("displays the channel code", () => {
    renderWithLocale(<ActiveRoomCard {...defaultProps} />);
    expect(screen.getByText("ABC123")).toBeInTheDocument();
  });

  it("displays fallback to channelInput when currentChannel is null", () => {
    renderWithLocale(
      <ActiveRoomCard {...defaultProps} currentChannel={null} channelInput="XYZ789" />
    );
    expect(screen.getByText("XYZ789")).toBeInTheDocument();
  });

  it("displays correct device count for single device", () => {
    renderWithLocale(<ActiveRoomCard {...defaultProps} totalDevices={1} />);
    expect(screen.getByText(new RegExp(`1 ${lobbyStrings.device}`))).toBeInTheDocument();
  });

  it("displays correct device count for multiple devices", () => {
    renderWithLocale(<ActiveRoomCard {...defaultProps} totalDevices={3} />);
    expect(screen.getByText(new RegExp(`3 ${lobbyStrings.devices}`))).toBeInTheDocument();
  });

  it("shows admin message when isAdmin is true", () => {
    renderWithLocale(<ActiveRoomCard {...defaultProps} isAdmin={true} />);
    expect(screen.getByText(lobbyStrings.adminInfo)).toBeInTheDocument();
  });

  it("shows guest message when isAdmin is false", () => {
    renderWithLocale(<ActiveRoomCard {...defaultProps} isAdmin={false} />);
    expect(screen.getByText(lobbyStrings.guestInfo)).toBeInTheDocument();
  });

  it("calls onLeaveChannel when leave button is clicked", async () => {
    const onLeaveChannel = vi.fn();
    const user = userEvent.setup();
    renderWithLocale(<ActiveRoomCard {...defaultProps} onLeaveChannel={onLeaveChannel} />);

    await user.click(screen.getByRole("button", { name: new RegExp(lobbyStrings.leaveRoom, "i") }));
    expect(onLeaveChannel).toHaveBeenCalledTimes(1);
  });

  it("renders copy button", () => {
    renderWithLocale(<ActiveRoomCard {...defaultProps} />);
    const copyButton = screen.getByTitle(lobbyStrings.copyCode);
    expect(copyButton).toBeInTheDocument();
  });

  it("confirms the copy with the check icon only, without a toast", async () => {
    const user = userEvent.setup();
    renderWithLocale(<ActiveRoomCard {...defaultProps} />);

    await user.click(screen.getByTitle(lobbyStrings.copyCode));

    await waitFor(() => {
      expect(
        screen.getByTitle(lobbyStrings.copyCode).querySelector(".text-success")
      ).toBeInTheDocument();
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("shows check icon temporarily after copying", async () => {
    const user = userEvent.setup();
    renderWithLocale(<ActiveRoomCard {...defaultProps} />);

    const copyButton = screen.getByTitle(lobbyStrings.copyCode);
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByTitle("Copiar código").querySelector(".text-success")).toBeInTheDocument();
    });
  });

  it("displays share message", () => {
    renderWithLocale(<ActiveRoomCard {...defaultProps} />);
    const shareMessages = screen.getAllByText(lobbyStrings.shareCodeDescription);
    expect(shareMessages.length).toBeGreaterThan(0);
  });

  it("displays code label", () => {
    renderWithLocale(<ActiveRoomCard {...defaultProps} />);
    expect(screen.getByText(lobbyStrings.roomCode)).toBeInTheDocument();
  });
});
