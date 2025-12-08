import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerHandle,
} from '@/components/ui/drawer';
import { ListChecks, Check, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_OPTIONS } from '@/constants/categories';

interface CategoryTotal {
  name: string;
  votes: number;
}

interface CategoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDesktopView: boolean;
  drawerSnapPoint: number | string;
  setDrawerSnapPoint: (snapPoint: number | string) => void;
  isAdmin: boolean;
  isVotingClosed: boolean;
  selectedCategories: string[];
  categorySelectionLimit: number;
  categoryTotals: CategoryTotal[];
  canViewResults: boolean;
  selectionDisabled: boolean;
  onToggleCategory: (category: string) => void;
  onClearSelections: () => void;
  onShowResults: () => void;
}

export function CategoryDrawer({
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
  selectionDisabled,
  onToggleCategory,
  onClearSelections,
  onShowResults,
}: CategoryDrawerProps) {
  const totalVotes = categoryTotals.reduce((sum, cat) => sum + cat.votes, 0);

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
          'px-0 pb-0',
          !isDesktopView && 'h-[75vh]',
          isDesktopView &&
            'left-auto right-0 top-0 bottom-0 mt-0 h-screen w-full max-w-xl rounded-none border-l bg-background'
        )}
        style={!isDesktopView ? { height: `${(typeof drawerSnapPoint === 'number' ? drawerSnapPoint : 0.75) * 100}vh` } : undefined}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-shrink-0 pt-2 pb-1 cursor-grab active:cursor-grabbing">
            <DrawerHandle />
          </div>

          <DrawerHeader className="text-left space-y-3 flex-shrink-0 pt-0">
            <div className="flex items-center justify-between gap-3">
              <DrawerTitle className="flex items-center gap-2 text-xl">
                <ListChecks className="w-5 h-5 text-primary" />
                Categorias do Quiz
              </DrawerTitle>
              <Badge
                variant={isVotingClosed ? 'default' : 'outline'}
                className={cn('text-xs uppercase tracking-wide', isVotingClosed && 'bg-emerald-500 text-white')}
              >
                {selectedCategories.length}/{categorySelectionLimit}
              </Badge>
            </div>
            <DrawerDescription>
              {isAdmin
                ? 'Você acompanha os votos em tempo real. Apenas os convidados escolhem as categorias.'
                : isVotingClosed
                  ? 'A votação foi encerrada. Aguarde o início do jogo.'
                  : 'Selecione até cinco categorias. Arraste a barra para expandir ou fechar.'}
            </DrawerDescription>
            <p className="text-xs text-muted-foreground">
              Status:{' '}
              {isVotingClosed
                ? 'Votação encerrada'
                : isAdmin
                  ? 'Você controla quando a votação termina'
                  : 'Aguardando o administrador encerrar a votação'}
            </p>
          </DrawerHeader>

          <div
            className="flex-1 overflow-y-auto overscroll-contain px-5 space-y-5 pb-6"
            data-vaul-no-drag
          >
            {!isAdmin ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORY_OPTIONS.map((category) => {
                    const isSelected = selectedCategories.includes(category);
                    const disableOption =
                      selectionDisabled || (!isSelected && selectedCategories.length >= categorySelectionLimit);

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => onToggleCategory(category)}
                        disabled={disableOption}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition shadow-sm ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-secondary/40 border-border/50 hover:border-primary/50 hover:bg-secondary/60'
                        } ${disableOption ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span>{category}</span>
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>
                        <p className="text-xs mt-1 opacity-80">
                          {isSelected ? 'Selecionado' : 'Clique para votar'}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between text-sm text-muted-foreground gap-3">
                  <span>
                    Você pode alterar suas escolhas a qualquer momento enquanto estiver na sala.
                  </span>
                  <Button
                    onClick={onClearSelections}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    disabled={!selectedCategories.length || selectionDisabled}
                  >
                    Limpar seleções
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-muted-foreground">
                Apenas convidados exibem opções de voto. Este painel mostra o progresso em tempo real para
                ajudar na decisão de encerrar a votação.
              </div>
            )}

            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold">Categorias mais votadas</p>
                  <p className="text-xs text-muted-foreground">
                    As 10 mais votadas serão usadas nas próximas perguntas
                  </p>
                </div>
              </div>

              {!canViewResults ? (
                <p className="text-xs text-muted-foreground">
                  O administrador precisa encerrar a votação para revelar o ranking das categorias.
                </p>
              ) : categoryTotals.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Ainda não há votos registrados. Faça sua seleção para participar do ranking!
                </p>
              ) : (
                <div className="space-y-2">
                  {categoryTotals.map((category, index) => {
                    const percentage = totalVotes
                      ? Math.round((category.votes / totalVotes) * 100)
                      : 0;
                    return (
                      <div key={category.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            {index + 1}. {category.name}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {category.votes} {category.votes === 1 ? 'voto' : 'votos'}
                            {totalVotes ? ` • ${percentage}%` : ''}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: totalVotes ? `${percentage}%` : '0%',
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
              Cada jogador pode votar em até {categorySelectionLimit} categorias. As 10 mais populares
              definem os temas do jogo.
            </p>
            {isVotingClosed && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
                onClick={onShowResults}
              >
                Ver resultado completo
              </Button>
            )}
          </div>

          <DrawerFooter className="border-t bg-background flex-shrink-0">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Fechar painel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
