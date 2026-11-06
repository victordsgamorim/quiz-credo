import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";

import { RoomCodePill } from "../RoomCodePill";

const renderPill = (props: Partial<React.ComponentProps<typeof RoomCodePill>> = {}) => {
  const onCopy = vi.fn();
  const onShowQRCode = vi.fn();
  render(
    <LocaleProvider>
      <RoomCodePill
        code="K7P4QX"
        hasCopied={false}
        onCopy={onCopy}
        onShowQRCode={onShowQRCode}
        {...props}
      />
    </LocaleProvider>
  );
  return { onCopy, onShowQRCode };
};

describe("RoomCodePill", () => {
  it("shows the room's code with its label", () => {
    renderPill();

    expect(screen.getByText("Código da Sala")).toBeInTheDocument();
    expect(screen.getByText("K7P4QX")).toBeInTheDocument();
  });

  it("copies the code", async () => {
    const user = userEvent.setup();
    const { onCopy } = renderPill();

    await user.click(screen.getByRole("button", { name: "Copiar código" }));

    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("opens the QR code", async () => {
    const user = userEvent.setup();
    const { onShowQRCode } = renderPill();

    await user.click(screen.getByRole("button", { name: "QR code" }));

    expect(onShowQRCode).toHaveBeenCalledTimes(1);
  });

  it("shows a check once the code was copied", () => {
    renderPill({ hasCopied: true });

    const copyButton = screen.getByRole("button", { name: "Copiar código" });
    expect(copyButton.querySelector(".lucide-check")).toBeInTheDocument();
    expect(copyButton.querySelector(".lucide-copy")).not.toBeInTheDocument();
  });

  it("takes extra classes", () => {
    const { container } = render(
      <LocaleProvider>
        <RoomCodePill
          code="K7P4QX"
          hasCopied={false}
          onCopy={vi.fn()}
          onShowQRCode={vi.fn()}
          className="py-0.5"
        />
      </LocaleProvider>
    );

    expect(container.firstElementChild).toHaveClass("py-0.5");
    expect(container.firstElementChild).not.toHaveClass("py-1.5");
  });
});
