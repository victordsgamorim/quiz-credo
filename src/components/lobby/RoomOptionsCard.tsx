import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Radio, Users, Loader2 } from "lucide-react";

interface RoomOptionsCardProps {
  isConnected: boolean;
  showJoinInput: boolean;
  channelInput: string;
  guestName: string;
  onCreateRoom: () => void;
  onShowJoinInput: () => void;
  onHideJoinInput: () => void;
  onJoinChannel: () => void;
  onChannelInputChange: (value: string) => void;
  onGuestNameChange: (value: string) => void;
}

export function RoomOptionsCard({
  isConnected,
  showJoinInput,
  channelInput,
  guestName,
  onCreateRoom,
  onShowJoinInput,
  onHideJoinInput,
  onJoinChannel,
  onChannelInputChange,
  onGuestNameChange,
}: RoomOptionsCardProps) {
  const handleChannelInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/\s/g, "");
    value = value.replace(/[OI01]/g, "");
    onChannelInputChange(value);
  };

  if (!showJoinInput) {
    return (
      <Card className="glass-card p-6">
        <div className="space-y-4">
          <div className="text-center mb-2">
            <p className="text-sm text-muted-foreground">Escolha uma opção para começar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={onCreateRoom}
              disabled={!isConnected}
              className="h-24 text-lg font-display font-semibold bg-primary text-primary-foreground hover:bg-primary/90 flex flex-col gap-2"
            >
              <Radio className="w-8 h-8" />
              Criar Sala
              <span className="text-xs font-normal opacity-80">Gera um código automaticamente</span>
            </Button>

            <Button
              onClick={onShowJoinInput}
              disabled={!isConnected}
              variant="outline"
              className="h-24 text-lg font-display font-semibold flex flex-col gap-2"
            >
              <Users className="w-8 h-8" />
              Entrar em uma Sala
              <span className="text-xs font-normal opacity-80">Digite o código da sala</span>
            </Button>
          </div>

          {!isConnected && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Conectando ao servidor...
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-muted-foreground">
            Digite o código da sala
          </label>
          <Button onClick={onHideJoinInput} variant="ghost" size="sm" className="h-7 px-2 text-xs">
            Voltar
          </Button>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Seu nome</label>
          <Input
            type="text"
            placeholder="Como você quer aparecer na sala?"
            value={guestName}
            onChange={(e) => onGuestNameChange(e.target.value)}
            className="h-12 text-base font-medium bg-secondary border-border/50 focus:border-primary focus:ring-primary"
            maxLength={30}
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Digite o código..."
            value={channelInput}
            onChange={handleChannelInputChange}
            onKeyDown={(e) => e.key === "Enter" && onJoinChannel()}
            className="h-12 text-lg font-mono tracking-widest bg-secondary border-border/50 focus:border-primary focus:ring-primary"
            disabled={!isConnected}
            maxLength={6}
          />
        </div>

        <Button
          onClick={onJoinChannel}
          disabled={!isConnected || !channelInput.trim() || !guestName.trim()}
          className="w-full h-12 text-lg font-display font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {!isConnected ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <Radio className="w-5 h-5 mr-2" />
              Entrar na Sala
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
