import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";

import { CategoryDrawer } from "../CategoryDrawer";

const renderDrawer = (isDesktopView: boolean) =>
  render(
    <LocaleProvider>
      <CategoryDrawer
        open={true}
        onOpenChange={vi.fn()}
        isDesktopView={isDesktopView}
        drawerSnapPoint={0.75}
        setDrawerSnapPoint={vi.fn()}
        isAdmin={true}
        isVotingClosed={false}
        selectedCategories={[]}
        categorySelectionLimit={3}
        categoryTotals={[]}
        isSelectionDisabled={false}
        onToggleCategory={vi.fn()}
        onClearSelections={vi.fn()}
      />
    </LocaleProvider>
  );

describe("CategoryDrawer", () => {
  it("opens as a bottom sheet on phones", () => {
    renderDrawer(false);
    expect(screen.getByRole("dialog")).toHaveAttribute("data-vaul-drawer-direction", "bottom");
  });

  it("slides in from the right as a drawer on wider screens, without the sheet's handle", () => {
    renderDrawer(true);
    const drawer = screen.getByRole("dialog");
    expect(drawer).toHaveAttribute("data-vaul-drawer-direction", "right");
    expect(drawer.querySelector(".handle-game")).not.toBeInTheDocument();
  });
});
