import { Check, ListChecks } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CATEGORY_DEFINITIONS, type CategoryId } from "@/constants/categories";
import { useLocale, interpolate } from "@/contexts/LocaleContext";
import { getCategoryLabel } from "@/lib/categories";
import { cn } from "@/lib/utils";

type CategoryChipsPanelProps = {
  isAdmin: boolean;
  isVotingClosed: boolean;
  selectedCategories: CategoryId[];
  categorySelectionLimit: number;
  isSelectionDisabled: boolean;
  onToggleCategory: (category: CategoryId) => void;
  onClearSelections: () => void;
};

const getDescription = (
  t: ReturnType<typeof useLocale>["t"],
  isAdmin: boolean,
  isVotingClosed: boolean
) => {
  if (isAdmin) {
    return t.lobby.categoryDrawer.description.admin;
  }
  if (isVotingClosed) {
    return t.lobby.categoryDrawer.description.votingClosed;
  }
  return t.lobby.categoryDrawer.description.open;
};

const getStatusText = (
  t: ReturnType<typeof useLocale>["t"],
  isAdmin: boolean,
  isVotingClosed: boolean
) => {
  if (isVotingClosed) {
    return t.lobby.categoryDrawer.status.votingClosed;
  }
  if (isAdmin) {
    return t.lobby.categoryDrawer.status.adminControl;
  }
  return t.lobby.categoryDrawer.status.waiting;
};

const isCategoryDisabled = ({
  isSelectionDisabled,
  isSelected,
  selectedCount,
  limit,
}: {
  isSelectionDisabled: boolean;
  isSelected: boolean;
  selectedCount: number;
  limit: number;
}) => {
  if (isSelectionDisabled) {
    return true;
  }
  if (!isSelected && selectedCount >= limit) {
    return true;
  }
  return false;
};

/*
 * Inline category selection panel for the lobby.
 */
// eslint-disable-next-line max-lines-per-function
export const CategoryChipsPanel = ({
  isAdmin,
  isVotingClosed,
  selectedCategories,
  categorySelectionLimit,
  isSelectionDisabled,
  onToggleCategory,
  onClearSelections,
}: CategoryChipsPanelProps) => {
  const { t } = useLocale();
  const description = getDescription(t, isAdmin, isVotingClosed);
  const statusText = getStatusText(t, isAdmin, isVotingClosed);

  return (
    <Card className="glass-card p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <ListChecks className="w-5 h-5" />
            {t.lobby.categoryDrawer.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {t.lobby.categoryDrawer.statusLabel}: {statusText}
          </p>
        </div>
        <Badge
          variant={isVotingClosed ? "default" : "outline"}
          className={cn(
            "shrink-0 text-xs tabular-nums",
            isVotingClosed && "bg-emerald-500 text-white"
          )}
        >
          {selectedCategories.length}/{categorySelectionLimit}
        </Badge>
      </div>

      {!isAdmin ? (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORY_DEFINITIONS.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              const isOptionDisabled = isCategoryDisabled({
                isSelectionDisabled,
                isSelected,
                selectedCount: selectedCategories.length,
                limit: categorySelectionLimit,
              });
              const label = getCategoryLabel(t, category.id);

              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onToggleCategory(category.id)}
                  disabled={isOptionDisabled}
                  className={cn(
                    "min-h-9 rounded-full border px-3 py-1.5 text-sm sm:text-xs font-medium transition",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/40 border-border/50 hover:border-primary/50 hover:bg-secondary/60",
                    isOptionDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    {label}
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between text-sm text-muted-foreground gap-3">
            <span>{t.lobby.categoryDrawer.selectionNote}</span>
            <Button
              onClick={onClearSelections}
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              disabled={!selectedCategories.length || isSelectionDisabled}
            >
              {t.lobby.categoryDrawer.clearSelections}
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-muted-foreground">
          {t.lobby.categoryDrawer.adminMessage}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        {interpolate(t.lobby.categoryDrawer.info, { limit: categorySelectionLimit })}
      </p>
    </Card>
  );
};
