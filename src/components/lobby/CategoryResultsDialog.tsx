import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Resultados das Categorias</DialogTitle>
          <DialogDescription>
            Estas são as 10 categorias mais votadas após o encerramento da votação.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {categoryTotals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ainda não tivemos votos suficientes para gerar uma lista.
            </p>
          ) : (
            categoryTotals.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {index + 1}. {category.name}
                </span>
                <span className="text-muted-foreground">
                  {category.votes} {category.votes === 1 ? "voto" : "votos"}
                </span>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
