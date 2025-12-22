import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";

import { EditNameDialog } from "../EditNameDialog";

const renderWithLocale = (ui: React.ReactElement) => {
  return render(<LocaleProvider>{ui}</LocaleProvider>);
};

// eslint-disable-next-line max-lines-per-function
describe("EditNameDialog", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  it("renders when open", () => {
    renderWithLocale(
      <EditNameDialog
        isOpen={true}
        currentName="Test User"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    renderWithLocale(
      <EditNameDialog
        isOpen={false}
        currentName="Test User"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("displays current name in input", () => {
    renderWithLocale(
      <EditNameDialog
        isOpen={true}
        currentName="Test User"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("Test User");
  });

  it("calls onSave with new name when saved", async () => {
    const user = userEvent.setup();

    renderWithLocale(
      <EditNameDialog
        isOpen={true}
        currentName="Old Name"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "New Name");

    const saveButton = screen.getByRole("button", { name: /salvar/i });
    await user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith("New Name");
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose when cancel is clicked", async () => {
    const user = userEvent.setup();

    renderWithLocale(
      <EditNameDialog
        isOpen={true}
        currentName="Test User"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /cancelar/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("save button is disabled when name is empty", async () => {
    const user = userEvent.setup();

    renderWithLocale(
      <EditNameDialog
        isOpen={true}
        currentName="Test User"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByRole("textbox");
    await user.clear(input);

    const saveButton = screen.getByRole("button", { name: /salvar/i });
    expect(saveButton).toBeDisabled();
  });

  it("handles Enter key to save", async () => {
    const user = userEvent.setup();

    renderWithLocale(
      <EditNameDialog
        isOpen={true}
        currentName="Old Name"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "New Name{Enter}");

    expect(mockOnSave).toHaveBeenCalledWith("New Name");
    expect(mockOnClose).toHaveBeenCalled();
  });
});
