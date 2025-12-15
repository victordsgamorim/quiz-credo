import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConnectionStatusCard } from "../ConnectionStatusCard";

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
    render(<ConnectionStatusCard {...defaultProps} />);
    expect(screen.getByText("Conectado")).toBeInTheDocument();
  });

  it("displays disconnected status when not connected", () => {
    render(<ConnectionStatusCard {...defaultProps} isConnected={false} />);
    expect(screen.getByText("Desconectado")).toBeInTheDocument();
    expect(screen.getByText("Tentando reconectar...")).toBeInTheDocument();
  });

  it("displays active status when page is visible", () => {
    render(<ConnectionStatusCard {...defaultProps} isPageVisible={true} />);
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("displays background status when page is not visible", () => {
    render(<ConnectionStatusCard {...defaultProps} isPageVisible={false} />);
    expect(screen.getByText("Em segundo plano")).toBeInTheDocument();
  });

  it("displays device ID when connected", () => {
    render(<ConnectionStatusCard {...defaultProps} />);
    expect(screen.getByText(/ID: device-123-4/)).toBeInTheDocument();
  });

  it("displays admin badge when user is admin", () => {
    render(<ConnectionStatusCard {...defaultProps} isAdmin={true} />);
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
  });

  it("displays guest badge when user is not admin", () => {
    render(<ConnectionStatusCard {...defaultProps} isAdmin={false} />);
    expect(screen.getByText("GUEST")).toBeInTheDocument();
  });

  it("does not display device ID when disconnected", () => {
    render(<ConnectionStatusCard {...defaultProps} isConnected={false} />);
    expect(screen.queryByText(/ID:/)).not.toBeInTheDocument();
  });

  it("calls onResetSession when reset button is clicked", async () => {
    const onResetSession = vi.fn();
    const user = userEvent.setup();
    render(<ConnectionStatusCard {...defaultProps} onResetSession={onResetSession} />);

    await user.click(screen.getByRole("button", { name: /resetar/i }));
    expect(onResetSession).toHaveBeenCalledTimes(1);
  });

  it("shows returning user message when isReturningUser is true", () => {
    render(<ConnectionStatusCard {...defaultProps} isReturningUser={true} />);
    expect(
      screen.getByText("Bem-vindo de volta! Seu device ID foi recuperado.")
    ).toBeInTheDocument();
  });

  it("does not show returning user message when in a channel", () => {
    render(
      <ConnectionStatusCard {...defaultProps} isReturningUser={true} currentChannel="ABC123" />
    );
    expect(
      screen.queryByText("Bem-vindo de volta! Seu device ID foi recuperado.")
    ).not.toBeInTheDocument();
  });

  it("shows background activity message when page is not visible", () => {
    render(<ConnectionStatusCard {...defaultProps} isPageVisible={false} />);
    expect(
      screen.getByText("Você está em segundo plano, mas a conexão permanece ativa")
    ).toBeInTheDocument();
  });

  it("does not show background message when page is visible", () => {
    render(<ConnectionStatusCard {...defaultProps} isPageVisible={true} />);
    expect(
      screen.queryByText("Você está em segundo plano, mas a conexão permanece ativa")
    ).not.toBeInTheDocument();
  });

  it("displays reset button only when connected", () => {
    const { rerender } = render(<ConnectionStatusCard {...defaultProps} isConnected={true} />);
    expect(screen.getByRole("button", { name: /resetar/i })).toBeInTheDocument();

    rerender(<ConnectionStatusCard {...defaultProps} isConnected={false} />);
    expect(screen.queryByRole("button", { name: /resetar/i })).not.toBeInTheDocument();
  });

  it("truncates long device IDs correctly", () => {
    const longDeviceId = "very-long-device-id-that-should-be-truncated";
    render(<ConnectionStatusCard {...defaultProps} deviceId={longDeviceId} />);
    expect(screen.getByText(/ID: very-long-de/)).toBeInTheDocument();
  });
});
