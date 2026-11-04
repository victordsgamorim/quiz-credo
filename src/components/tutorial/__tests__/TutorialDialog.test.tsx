import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import { TutorialDialog } from "../TutorialDialog";

const strings = translations["pt-BR"].tutorial;

const renderDialog = (isOpen: boolean, onClose = vi.fn()) =>
  render(
    <LocaleProvider>
      <TutorialDialog isOpen={isOpen} onClose={onClose} />
    </LocaleProvider>
  );

describe("TutorialDialog", () => {
  it("shows the tutorial over the whole screen while open", () => {
    renderDialog(true);

    expect(screen.getByRole("dialog", { name: strings.title })).toBeInTheDocument();
    expect(screen.getByRole("tablist", { name: strings.tabsLabel })).toBeInTheDocument();
  });

  it("renders nothing while closed", () => {
    renderDialog(false);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes with its close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDialog(true, onClose);

    await user.click(screen.getByRole("button", { name: strings.close }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
