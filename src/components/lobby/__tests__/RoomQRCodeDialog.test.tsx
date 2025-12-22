import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";

import { RoomQRCodeDialog } from "../RoomQRCodeDialog";

const renderWithLocale = (ui: React.ReactElement) => {
  return render(<LocaleProvider>{ui}</LocaleProvider>);
};

describe("RoomQRCodeDialog", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it("renders when open", () => {
    renderWithLocale(<RoomQRCodeDialog isOpen={true} roomCode="ABC123" onClose={mockOnClose} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    renderWithLocale(<RoomQRCodeDialog isOpen={false} roomCode="ABC123" onClose={mockOnClose} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("displays room code", () => {
    renderWithLocale(<RoomQRCodeDialog isOpen={true} roomCode="TEST42" onClose={mockOnClose} />);

    expect(screen.getByText("TEST42")).toBeInTheDocument();
  });

  it("renders QR code title", () => {
    renderWithLocale(<RoomQRCodeDialog isOpen={true} roomCode="ABC123" onClose={mockOnClose} />);

    expect(screen.getByText(/qr code/i)).toBeInTheDocument();
  });
});
