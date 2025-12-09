import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Radio, CheckCircle2 } from "lucide-react";

interface ConnectionStatusCardProps {
  isConnected: boolean;
  isPageVisible: boolean;
  isReturningUser: boolean;
  currentChannel: string | null;
  deviceId: string | null;
  isAdmin: boolean;
  onResetSession: () => void;
}

export function ConnectionStatusCard({
  isConnected,
  isPageVisible,
  isReturningUser,
  currentChannel,
  deviceId,
  isAdmin,
  onResetSession,
}: ConnectionStatusCardProps) {
  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <div className="p-2 rounded-lg bg-success/10">
                <Wifi className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium">Conectado</p>
                <p className="text-xs text-muted-foreground">
                  {isPageVisible ? "Ativo" : "Em segundo plano"}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-2 rounded-lg bg-destructive/10">
                <WifiOff className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium">Desconectado</p>
                <p className="text-xs text-muted-foreground">Tentando reconectar...</p>
              </div>
            </>
          )}
        </div>
        {isConnected && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              ID: {deviceId?.substring(0, 12)}
            </Badge>
            <Badge
              variant={isAdmin ? "default" : "secondary"}
              className="text-xs uppercase tracking-wide"
            >
              {isAdmin ? "ADMIN" : "GUEST"}
            </Badge>
            <Button
              onClick={onResetSession}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              title="Resetar sessão e criar novo ID"
            >
              Resetar
            </Button>
          </div>
        )}
      </div>

      {isReturningUser && !currentChannel && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-3">
          <CheckCircle2 className="w-4 h-4 text-blue-500" />
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Bem-vindo de volta! Seu device ID foi recuperado.
          </p>
        </div>
      )}

      {!isPageVisible && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Radio className="w-4 h-4 text-amber-500" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Você está em segundo plano, mas a conexão permanece ativa
          </p>
        </div>
      )}
    </Card>
  );
}
