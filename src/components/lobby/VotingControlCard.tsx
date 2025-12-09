import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VotingControlCardProps {
  isVotingClosed: boolean;
  onCloseVoting: () => void;
}

export function VotingControlCard({ isVotingClosed, onCloseVoting }: VotingControlCardProps) {
  return (
    <Card className="glass-card p-4 border-primary/20 bg-primary/5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Controle de votação</p>
          <p className="text-sm text-muted-foreground">
            {isVotingClosed
              ? "Votação encerrada. Todos já podem ver as categorias escolhidas."
              : "Acompanhe os votos em tempo real e encerre quando estiver pronto."}
          </p>
        </div>
        <Button
          onClick={onCloseVoting}
          disabled={isVotingClosed}
          className="w-full sm:w-auto"
          variant={isVotingClosed ? "outline" : "default"}
        >
          {isVotingClosed ? "Votação encerrada" : "Encerrar votação"}
        </Button>
      </div>
    </Card>
  );
}
