import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import { QuitGameDialog } from "../QuitGameDialog";

const strings = translations["pt-BR"].quiz.quitGame;

const renderDialog = (isOpen = true) => {
  const onQuit = vi.fn();
  const onStay = vi.fn();
  render(
    <LocaleProvider>
      <QuitGameDialog isOpen={isOpen} onQuit={onQuit} onStay={onStay} />
    </LocaleProvider>
  );
  return { onQuit, onStay };
};

describe("QuitGameDialog", () => {
  it("shows nothing until the player goes back from a question", () => {
    renderDialog(false);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("asks whether the player gives up the game", () => {
    renderDialog();

    const dialog = screen.getByRole("alertdialog", { name: strings.title });
    expect(dialog).toHaveAccessibleDescription(strings.description);
  });

  it("starts on staying in the game, so a key pressed out of habit doesn't give up", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: strings.stay })).toHaveFocus();
  });

  it("keeps the player in the game", () => {
    const { onQuit, onStay } = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: strings.stay }));

    expect(onStay).toHaveBeenCalledTimes(1);
    expect(onQuit).not.toHaveBeenCalled();
  });

  it("keeps the player in the game on Escape", () => {
    const { onQuit, onStay } = renderDialog();

    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });

    expect(onStay).toHaveBeenCalledTimes(1);
    expect(onQuit).not.toHaveBeenCalled();
  });

  it("gives up the game", () => {
    const { onQuit, onStay } = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: strings.quit }));

    expect(onQuit).toHaveBeenCalledTimes(1);
    expect(onStay).not.toHaveBeenCalled();
  });
});
