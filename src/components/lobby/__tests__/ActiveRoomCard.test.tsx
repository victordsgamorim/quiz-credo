import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ActiveRoomCard } from "../ActiveRoomCard";

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
    render(<ActiveRoomCard {...defaultProps} />);
    expect(screen.getByText("Sala Criada")).toBeInTheDocument();
  });

  it("displays the channel code", () => {
    render(<ActiveRoomCard {...defaultProps} />);
    expect(screen.getByText("ABC123")).toBeInTheDocument();
  });

  it("displays fallback to channelInput when currentChannel is null", () => {
    render(<ActiveRoomCard {...defaultProps} currentChannel={null} channelInput="XYZ789" />);
    expect(screen.getByText("XYZ789")).toBeInTheDocument();
  });

  it("displays correct device count for single device", () => {
    render(<ActiveRoomCard {...defaultProps} totalDevices={1} />);
    expect(screen.getByText(/1 dispositivo conectado/)).toBeInTheDocument();
  });

  it("displays correct device count for multiple devices", () => {
    render(<ActiveRoomCard {...defaultProps} totalDevices={3} />);
    expect(screen.getByText(/3 dispositivos conectados/)).toBeInTheDocument();
  });

  it("shows admin message when isAdmin is true", () => {
    render(<ActiveRoomCard {...defaultProps} isAdmin={true} />);
    expect(
      screen.getByText(/Você é o administrador desta sala e pode remover convidados/)
    ).toBeInTheDocument();
  });

  it("shows guest message when isAdmin is false", () => {
    render(<ActiveRoomCard {...defaultProps} isAdmin={false} />);
    expect(screen.getByText(/Você está como convidado nesta sala/)).toBeInTheDocument();
  });

  it("calls onLeaveChannel when leave button is clicked", async () => {
    const onLeaveChannel = vi.fn();
    const user = userEvent.setup();
    render(<ActiveRoomCard {...defaultProps} onLeaveChannel={onLeaveChannel} />);

    await user.click(screen.getByRole("button", { name: /sair/i }));
    expect(onLeaveChannel).toHaveBeenCalledTimes(1);
  });

  it("renders copy button", () => {
    render(<ActiveRoomCard {...defaultProps} />);
    const copyButton = screen.getByTitle("Copiar código");
    expect(copyButton).toBeInTheDocument();
  });

  it("shows check icon temporarily after copying", async () => {
    const user = userEvent.setup();
    render(<ActiveRoomCard {...defaultProps} />);

    const copyButton = screen.getByTitle("Copiar código");
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByTitle("Copiar código").querySelector(".text-success")).toBeInTheDocument();
    });
  });

  it("displays share message", () => {
    render(<ActiveRoomCard {...defaultProps} />);
    expect(screen.getByText("Compartilhe este código com outros jogadores")).toBeInTheDocument();
  });

  it("displays code label", () => {
    render(<ActiveRoomCard {...defaultProps} />);
    expect(screen.getByText("Código da Sala")).toBeInTheDocument();
  });
});
