import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Clock, Target, Zap } from "lucide-react";

interface StartScreenProps {
  onStart: (playerName: string) => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  const [playerName, setPlayerName] = useState("");

  const handleStart = () => {
    if (playerName.trim()) {
      onStart(playerName.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && playerName.trim()) {
      handleStart();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Logo/Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-4">
            <span className="gold-text">QuizCredo</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Teste seus conhecimentos e alcance o topo!
          </p>
        </div>

        {/* Instructions */}
        <div className="glass-card p-6 mb-8">
          <h2 className="font-display text-xl font-semibold mb-4 text-center">Como Jogar</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">10 Perguntas</p>
                <p className="text-xs text-muted-foreground">Por partida</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-sm">1 Minuto</p>
                <p className="text-xs text-muted-foreground">Por pergunta</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Trophy className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-sm">Pontos</p>
                <p className="text-xs text-muted-foreground">Acumule pontos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Zap className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-sm">Dificuldade</p>
                <p className="text-xs text-muted-foreground">Progressiva</p>
              </div>
            </div>
          </div>
        </div>

        {/* Player Name Input */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="playerName" className="text-sm font-medium text-muted-foreground">
              Seu nome
            </label>
            <Input
              id="playerName"
              type="text"
              placeholder="Digite seu nome..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-14 text-lg bg-secondary border-border/50 focus:border-primary focus:ring-primary"
              autoFocus
            />
          </div>
          <Button
            onClick={handleStart}
            disabled={!playerName.trim()}
            className="w-full h-14 text-lg font-display font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gold-glow animate-pulse-glow disabled:opacity-50 disabled:animate-none disabled:shadow-none"
          >
            Começar
          </Button>
        </div>
      </div>
    </div>
  );
};
