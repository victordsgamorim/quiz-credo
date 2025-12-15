import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLocale } from "@/contexts/LocaleContext";
import { getCategoryLabel } from "@/lib/categories";

type CategoryTotal = {
  name: string;
  votes: number;
};

type CategoryResultsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryTotals: CategoryTotal[];
};

/*
 * Dialog component displaying category voting results.
 */
export const CategoryResultsDialog = ({
  open,
  onOpenChange,
  categoryTotals,
}: CategoryResultsDialogProps) => {
  const { t } = useLocale();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.lobby.categoryResults.title}</DialogTitle>
          <DialogDescription>{t.lobby.categoryResults.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {categoryTotals.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.lobby.categoryResults.empty}</p>
          ) : (
            categoryTotals.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {index + 1}. {getCategoryLabel(t, category.name)}
                </span>
                <span className="text-muted-foreground">
                  {category.votes} {category.votes === 1 ? t.lobby.vote : t.lobby.votes}
                </span>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{t.common.close}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
