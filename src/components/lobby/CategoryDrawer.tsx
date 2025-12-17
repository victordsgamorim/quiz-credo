import { ListChecks, Check, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerHandle,
} from "@/components/ui/drawer";
import { CATEGORY_DEFINITIONS, type CategoryId } from "@/constants/categories";
import { useLocale, interpolate } from "@/contexts/LocaleContext";
import { getCategoryLabel } from "@/lib/categories";
import { cn } from "@/lib/utils";

type CategoryTotal = {
  name: string;
  votes: number;
};

type CategoryDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDesktopView: boolean;
  drawerSnapPoint: number | string;
  setDrawerSnapPoint: (snapPoint: number | string) => void;
  isAdmin: boolean;
  isVotingClosed: boolean;
  selectedCategories: CategoryId[];
  categorySelectionLimit: number;
  categoryTotals: CategoryTotal[];
  canViewResults: boolean;
  isSelectionDisabled: boolean;
  onToggleCategory: (category: CategoryId) => void;
  onClearSelections: () => void;
  onShowResults: () => void;
};

/*
 * Drawer component for category selection in the lobby.
 */
// eslint-disable-next-line max-lines-per-function
export const CategoryDrawer = ({
  open,
  onOpenChange,
  isDesktopView,
  drawerSnapPoint,
  setDrawerSnapPoint,
  isAdmin,
  isVotingClosed,
  selectedCategories,
  categorySelectionLimit,
  categoryTotals,
  canViewResults,
  isSelectionDisabled,
  onToggleCategory,
  onClearSelections,
  onShowResults,
  // eslint-disable-next-line complexity
}: CategoryDrawerProps) => {
  const { t } = useLocale();
  const totalVotes = categoryTotals.reduce((sum, cat) => sum + cat.votes, 0);
  const description = isAdmin
    ? t.lobby.categoryDrawer.description.admin
    : isVotingClosed
      ? t.lobby.categoryDrawer.description.votingClosed
      : t.lobby.categoryDrawer.description.open;
  const statusText = isVotingClosed
    ? t.lobby.categoryDrawer.status.votingClosed
    : isAdmin
      ? t.lobby.categoryDrawer.status.adminControl
      : t.lobby.categoryDrawer.status.waiting;

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground={!isDesktopView}
      snapPoints={isDesktopView ? undefined : [0.75, 1]}
      activeSnapPoint={isDesktopView ? undefined : drawerSnapPoint}
      setActiveSnapPoint={isDesktopView ? undefined : setDrawerSnapPoint}
    >
      <DrawerContent
        hideHandle
        className={cn(
          "px-0 pb-0",
          !isDesktopView && "h-[75vh]",
          isDesktopView &&
            "left-auto right-0 top-0 bottom-0 mt-0 h-screen w-full max-w-xl rounded-none border-l bg-background"
        )}
        style={
          !isDesktopView
            ? {
                height: `${(typeof drawerSnapPoint === "number" ? drawerSnapPoint : 0.75) * 100}vh`,
              }
            : undefined
        }
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-shrink-0 pt-2 pb-1 cursor-grab active:cursor-grabbing">
            <DrawerHandle />
          </div>

          <DrawerHeader className="text-left space-y-3 flex-shrink-0 pt-0">
            <div className="flex items-center justify-between gap-3">
              <DrawerTitle className="flex items-center gap-2 text-xl">
                <ListChecks className="w-5 h-5 text-primary" />
                {t.lobby.categoryDrawer.title}
              </DrawerTitle>
              <Badge
                variant={isVotingClosed ? "default" : "outline"}
                className={cn(
                  "text-xs uppercase tracking-wide",
                  isVotingClosed && "bg-emerald-500 text-white"
                )}
              >
                {selectedCategories.length}/{categorySelectionLimit}
              </Badge>
            </div>
            <DrawerDescription>{description}</DrawerDescription>
            <p className="text-xs text-muted-foreground">
              {t.lobby.categoryDrawer.statusLabel}: {statusText}
            </p>
          </DrawerHeader>

          <div
            className="flex-1 overflow-y-auto overscroll-contain px-5 space-y-5 pb-6"
            data-vaul-no-drag
          >
            {!isAdmin ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORY_DEFINITIONS.map((category) => {
                    const isSelected = selectedCategories.includes(category.id);
                    const isOptionDisabled =
                      isSelectionDisabled ||
                      (!isSelected && selectedCategories.length >= categorySelectionLimit);
                    const label = getCategoryLabel(t, category.id);

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => onToggleCategory(category.id)}
                        disabled={isOptionDisabled}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition shadow-sm ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary/40 border-border/50 hover:border-primary/50 hover:bg-secondary/60"
                        } ${isOptionDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span>{label}</span>
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>
                        <p className="text-xs mt-1 opacity-80">
                          {isSelected
                            ? t.lobby.categoryDrawer.badges.selected
                            : t.lobby.categoryDrawer.badges.voteHint}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between text-sm text-muted-foreground gap-3">
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
              <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-muted-foreground">
                {t.lobby.categoryDrawer.adminMessage}
              </div>
            )}

            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold">{t.lobby.categoryDrawer.rankingTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.lobby.categoryDrawer.rankingSubtitle}
                  </p>
                </div>
              </div>

              {!canViewResults ? (
                <p className="text-xs text-muted-foreground">
                  {t.lobby.categoryDrawer.resultsLocked}
                </p>
              ) : categoryTotals.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t.lobby.categoryDrawer.noVotes}</p>
              ) : (
                <div className="space-y-2">
                  {categoryTotals.map((category, index) => {
                    const percentage = totalVotes
                      ? Math.round((category.votes / totalVotes) * 100)
                      : 0;
                    const label = getCategoryLabel(t, category.name);

                    return (
                      <div key={category.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            {index + 1}. {label}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {category.votes} {category.votes === 1 ? t.lobby.vote : t.lobby.votes}
                            {totalVotes ? ` • ${percentage}%` : ""}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: totalVotes ? `${percentage}%` : "0%",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {interpolate(t.lobby.categoryDrawer.info, { limit: categorySelectionLimit })}
            </p>
            {isVotingClosed && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
                onClick={onShowResults}
              >
                {t.lobby.viewResults}
              </Button>
            )}
          </div>

          <DrawerFooter className="border-t bg-background flex-shrink-0">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                {t.lobby.categoryDrawer.closePanel}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
