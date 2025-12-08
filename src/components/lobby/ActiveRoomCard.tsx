import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Copy, Check, Users, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface ActiveRoomCardProps {
  currentChannel: string | null;
  channelInput: string;
  totalDevices: number;
  isAdmin: boolean;
  onLeaveChannel: () => void;
}

export function ActiveRoomCard({
  currentChannel,
  channelInput,
  totalDevices,
  isAdmin,
  onLeaveChannel,
}: ActiveRoomCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyChannelId = () => {
    if (currentChannel) {
      navigator.clipboard.writeText(currentChannel);
      setCopied(true);
      toast.success('ID do canal copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="glass-card p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium">Sala Criada</p>
              <p className="text-xs text-muted-foreground">Compartilhe o código abaixo</p>
            </div>
          </div>
          <Button
            onClick={onLeaveChannel}
            variant="ghost"
            size="sm"
          >
            Sair
          </Button>
        </div>

        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 rounded-xl p-6">
          <div className="text-center space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Código da Sala
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-5xl font-bold tracking-[0.3em] gold-text select-all">
                {currentChannel || channelInput}
              </span>
              <Button
                onClick={handleCopyChannelId}
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0"
                title="Copiar código"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-success" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Compartilhe este código com outros jogadores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center p-3 rounded-lg bg-secondary/50">
          <Users className="w-4 h-4" />
          <span>
            {totalDevices} {totalDevices === 1 ? 'dispositivo' : 'dispositivos'} conectado
            {totalDevices !== 1 && 's'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
          <Shield className="w-4 h-4" />
          <span>
            {isAdmin
              ? 'Você é o administrador desta sala e pode remover convidados.'
              : 'Você está como convidado nesta sala.'}
          </span>
        </div>
      </div>
    </Card>
  );
}
