import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { CATEGORY_DEFINITIONS } from "@/constants/categories";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import { CategoryChipsPanel } from "../CategoryChipsPanel";

const lobbyStrings = translations["pt-BR"].lobby;
const firstCategory = CATEGORY_DEFINITIONS[0];
const firstCategoryLabel =
  lobbyStrings.categoryNames[firstCategory.id as keyof typeof lobbyStrings.categoryNames] ||
  firstCategory.id;

const renderWithLocale = (component: React.ReactElement) => {
  return render(<LocaleProvider>{component}</LocaleProvider>);
};

// eslint-disable-next-line max-lines-per-function
describe("CategoryChipsPanel", () => {
  it("renders the selection header and chips for guests", () => {
    renderWithLocale(
      <CategoryChipsPanel
        isAdmin={false}
        isVotingClosed={false}
        selectedCategories={[]}
        categorySelectionLimit={5}
        isSelectionDisabled={false}
        onToggleCategory={vi.fn()}
        onClearSelections={vi.fn()}
      />
    );

    expect(screen.getByText(lobbyStrings.categoryDrawer.title)).toBeInTheDocument();
    expect(screen.getByText("0/5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: firstCategoryLabel })).toBeInTheDocument();
  });

  it("calls onToggleCategory when a chip is clicked", async () => {
    const onToggleCategory = vi.fn();
    const user = userEvent.setup();

    renderWithLocale(
      <CategoryChipsPanel
        isAdmin={false}
        isVotingClosed={false}
        selectedCategories={[]}
        categorySelectionLimit={5}
        isSelectionDisabled={false}
        onToggleCategory={onToggleCategory}
        onClearSelections={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: firstCategoryLabel }));

    expect(onToggleCategory).toHaveBeenCalledWith(firstCategory.id);
  });

  it("disables unselected chips when the selection limit is reached", () => {
    renderWithLocale(
      <CategoryChipsPanel
        isAdmin={false}
        isVotingClosed={false}
        selectedCategories={CATEGORY_DEFINITIONS.slice(0, 5).map((category) => category.id)}
        categorySelectionLimit={5}
        isSelectionDisabled={false}
        onToggleCategory={vi.fn()}
        onClearSelections={vi.fn()}
      />
    );

    const firstChip = screen.getByRole("button", { name: firstCategoryLabel });
    expect(firstChip).not.toBeDisabled();

    const unselectedCategory = CATEGORY_DEFINITIONS[6];
    const unselectedLabel =
      lobbyStrings.categoryNames[
        unselectedCategory.id as keyof typeof lobbyStrings.categoryNames
      ] || unselectedCategory.id;

    expect(screen.getByRole("button", { name: unselectedLabel })).toBeDisabled();
  });

  it("renders admin message instead of chips when user is admin", () => {
    renderWithLocale(
      <CategoryChipsPanel
        isAdmin={true}
        isVotingClosed={false}
        selectedCategories={[]}
        categorySelectionLimit={5}
        isSelectionDisabled={true}
        onToggleCategory={vi.fn()}
        onClearSelections={vi.fn()}
      />
    );

    expect(screen.getByText(lobbyStrings.categoryDrawer.adminMessage)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: firstCategoryLabel })).not.toBeInTheDocument();
  });
});
