import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Wifi,
  WifiOff,
  Users,
  Radio,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface LobbyScreenProps {
  onReady: () => void;
}

export const LobbyScreen = ({ onReady }: LobbyScreenProps) => {
  const {
    connect,
    joinChannel,
    leaveChannel,
    clearDeviceSession,
    getStoredSession,
    isConnected,
    currentChannel,
    channelDevices,
    deviceId,
    totalDevices,
  } = useSocket();

  const [channelInput, setChannelInput] = useState('');
  const [hasJoinedChannel, setHasJoinedChannel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;

      const session = getStoredSession();
      if (session?.channelId) {
        setIsReturningUser(true);
        setChannelInput(session.channelId);
        toast.info(`Retomando sessão anterior no canal: ${session.channelId}`);
      }
    }

    connect();

    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Não desconecta aqui - deixa o socket vivo durante a sessão
      // O disconnect() só será chamado quando o componente for completamente desmontado
    };
    // Remove 'disconnect' das dependências para evitar reconexões
  }, [connect, getStoredSession]);

  const handleJoinChannel = () => {
    if (!channelInput.trim()) {
      toast.error('Digite um ID de canal válido');
      return;
    }

    if (!isConnected) {
      toast.error('Aguarde a conexão ser estabelecida');
      return;
    }

    joinChannel(channelInput.trim());
    setHasJoinedChannel(true);
    toast.success(`Conectado ao canal: ${channelInput.trim()}`);
  };

  const handleLeaveChannel = () => {
    leaveChannel();
    clearDeviceSession();
    setHasJoinedChannel(false);
    setChannelInput('');
    setIsReturningUser(false);
    hasInitializedRef.current = false;
    toast.info('Você saiu do canal. Sessão reiniciada.');
    setTimeout(() => {
      connect();
    }, 500);
  };

  const handleCopyChannelId = () => {
    if (currentChannel) {
      navigator.clipboard.writeText(currentChannel);
      setCopied(true);
      toast.success('ID do canal copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProceedToGame = () => {
    toast.success('Iniciando o jogo...');
    onReady();
  };

  const handleCreateRoom = () => {
    if (!isConnected) {
      toast.error('Aguarde a conexão ser estabelecida');
      return;
    }

    // Gera código sem caracteres confusos (0, O, I, 1, etc)
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let randomId = '';
    for (let i = 0; i < 6; i++) {
      randomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setChannelInput(randomId);
    joinChannel(randomId);
    setHasJoinedChannel(true);
    toast.success(`Código da sala: ${randomId}`, { duration: 5000 });
  };

  const handleShowJoinInput = () => {
    setShowJoinInput(true);
  };

  const handleResetSession = () => {
    clearDeviceSession();
    setChannelInput('');
    setHasJoinedChannel(false);
    setIsReturningUser(false);
    toast.success('Sessão reiniciada! Novo ID de device criado.');
    setTimeout(() => {
      connect();
    }, 500);
  };

  useEffect(() => {
    if (currentChannel) {
      setHasJoinedChannel(true);
    }
  }, [currentChannel]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-2xl animate-fade-in space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-3">
            <span className="gold-text">Lobby do Jogo</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Conecte-se a um canal para começar
          </p>
        </div>

        {/* Connection Status Card */}
        {!hasJoinedChannel && (
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
                        {isPageVisible ? 'Ativo' : 'Em segundo plano'}
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
                  <Button
                    onClick={handleResetSession}
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
        )}

        {/* Channel Input Card */}
        {!hasJoinedChannel ? (
          <Card className="glass-card p-6">
            {!showJoinInput ? (
              <div className="space-y-4">
                <div className="text-center mb-2">
                  <p className="text-sm text-muted-foreground">
                    Escolha uma opção para começar
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleCreateRoom}
                    disabled={!isConnected}
                    className="h-24 text-lg font-display font-semibold bg-primary text-primary-foreground hover:bg-primary/90 flex flex-col gap-2"
                  >
                    <Radio className="w-8 h-8" />
                    Criar Sala
                    <span className="text-xs font-normal opacity-80">
                      Gera um código automaticamente
                    </span>
                  </Button>

                  <Button
                    onClick={handleShowJoinInput}
                    disabled={!isConnected}
                    variant="outline"
                    className="h-24 text-lg font-display font-semibold flex flex-col gap-2"
                  >
                    <Users className="w-8 h-8" />
                    Entrar em uma Sala
                    <span className="text-xs font-normal opacity-80">
                      Digite o código da sala
                    </span>
                  </Button>
                </div>

                {!isConnected && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Conectando ao servidor...
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Digite o código da sala
                  </label>
                  <Button
                    onClick={() => setShowJoinInput(false)}
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    Voltar
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Digite o código..."
                    value={channelInput}
                    onChange={(e) => {
                      // Remove espaços e converte para maiúsculas
                      let value = e.target.value.toUpperCase().replace(/\s/g, '');
                      // Substitui caracteres confusos automaticamente
                      value = value.replace(/[O]/g, '').replace(/[I]/g, '').replace(/[0]/g, '').replace(/[1]/g, '');
                      setChannelInput(value);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinChannel()}
                    className="h-12 text-lg font-mono tracking-widest bg-secondary border-border/50 focus:border-primary focus:ring-primary"
                    disabled={!isConnected}
                    autoFocus
                    maxLength={6}
                  />
                </div>

                <Button
                  onClick={handleJoinChannel}
                  disabled={!isConnected || !channelInput.trim()}
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
            )}
          </Card>
        ) : (
          <>
            {/* Active Channel Card */}
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
                    onClick={handleLeaveChannel}
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
              </div>
            </Card>

            {/* DEBUG: Show raw data */}
            <Card className="glass-card p-4 bg-amber-500/10 border-amber-500/20">
              <h3 className="font-semibold mb-2 text-xs text-amber-600 dark:text-amber-400">
                DEBUG INFO:
              </h3>
              <div className="space-y-1 text-xs font-mono">
                <div>channelDevices.length: {channelDevices.length}</div>
                <div>totalDevices: {totalDevices}</div>
                <div>currentChannel: {currentChannel || 'null'}</div>
                <div>isConnected: {isConnected ? 'true' : 'false'}</div>
                <div className="mt-2">Raw channelDevices:</div>
                <pre className="text-xs bg-black/20 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(channelDevices, null, 2)}
                </pre>
              </div>
            </Card>

            {/* Connected Devices */}
            {channelDevices.length > 0 && (
              <Card className="glass-card p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Dispositivos Conectados
                </h3>
                <div className="space-y-2">
                  {channelDevices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${device.isActive ? 'bg-success' : 'bg-amber-500'}`} />
                        <span className="font-mono text-sm">
                          {device.id.substring(0, 8)}
                          {device.id === deviceId && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Você
                            </Badge>
                          )}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {device.isActive ? 'Ativo' : 'Background'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Proceed Button */}
            <Button
              onClick={handleProceedToGame}
              className="w-full h-14 text-lg font-display font-semibold bg-success text-white hover:bg-success/90"
            >
              Prosseguir para o Jogo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
