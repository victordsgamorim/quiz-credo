import { useState, useEffect, useRef, useCallback } from 'react';
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
  Check,
  Shield,
  UserMinus,
  ListChecks,
  Trophy,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerHandle
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const CATEGORY_STORAGE_KEY = 'channel-category-preferences';

const CATEGORY_OPTIONS = [
  'Geografia',
  'Matemática',
  'História',
  'Ciências',
  'Arte',
  'Esportes',
  'Tecnologia',
  'Literatura',
  'Música',
  'Cinema',
  'Atualidades',
  'Mitologia',
  'Astronomia',
  'Biologia',
  'Química',
  'Política',
  'Economia',
  'Cultura Pop',
  'Idiomas',
  'Invenções'
];

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
    removeGuest,
    submitCategoryVote,
    closeCategoryVoting,
    clearForceLeaveInfo,
    isConnected,
    currentChannel,
    channelDevices,
    deviceId,
    totalDevices,
    selfRole,
    forceLeaveInfo,
    categoryTotals,
    maxCategorySelections,
    isVotingClosed,
  } = useSocket();

  const [channelInput, setChannelInput] = useState('');
  const [hasJoinedChannel, setHasJoinedChannel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [guestName, setGuestName] = useState('');
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
  const [drawerSnapPoint, setDrawerSnapPoint] = useState<number | string>(0.75);
  const [isDesktopView, setIsDesktopView] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const hasInitializedRef = useRef(false);
  const isAdmin = selfRole === 'admin';
  const categorySelectionLimit = maxCategorySelections || 5;
  const displayedCategoryTotals = categoryTotals.slice(0, 10);
  const totalCategoryVotes = displayedCategoryTotals.reduce((sum, category) => sum + category.votes, 0);
  const canVote = !isAdmin && !isVotingClosed;
  const selectionDisabled = !canVote;
  const canViewResults = isAdmin || isVotingClosed;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateMatch = (matches: boolean) => setIsDesktopView(matches);

    updateMatch(mediaQuery.matches);
    const listener = (event: MediaQueryListEvent) => updateMatch(event.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(listener);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', listener);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(listener);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasJoinedChannel) {
      setIsCategoryPanelOpen(false);
    }
  }, [hasJoinedChannel]);

  useEffect(() => {
    // Reset snap point when drawer opens to initial position
    if (isCategoryPanelOpen && !isDesktopView) {
      setDrawerSnapPoint(0.75);
    }
  }, [isCategoryPanelOpen, isDesktopView]);

  const loadStoredCategories = useCallback((channelId: string | null) => {
    if (!channelId) {
      return [];
    }
    try {
      const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      const stored = parsed?.[channelId];
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }, []);

  const persistCategories = useCallback((channelId: string, categories: string[]) => {
    try {
      const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      if (!categories.length) {
        delete parsed[channelId];
      } else {
        parsed[channelId] = categories;
      }
      if (Object.keys(parsed).length === 0) {
        localStorage.removeItem(CATEGORY_STORAGE_KEY);
      } else {
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch {
      // ignore
    }
  }, []);

  const clearPersistedCategories = useCallback((channelId?: string | null) => {
    try {
      const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
      if (!raw) {
        return;
      }
      if (!channelId) {
        localStorage.removeItem(CATEGORY_STORAGE_KEY);
        return;
      }
      const parsed = JSON.parse(raw);
      delete parsed[channelId];
      if (Object.keys(parsed).length === 0) {
        localStorage.removeItem(CATEGORY_STORAGE_KEY);
      } else {
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;

      const session = getStoredSession();
      if (session?.channelId) {
        setIsReturningUser(true);
        setChannelInput(session.channelId);
        toast.info(`Retomando sessão anterior no canal: ${session.channelId}`);
      }
      if (session?.displayName) {
        setGuestName(session.displayName);
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

  useEffect(() => {
    if (!forceLeaveInfo) {
      return;
    }

    const reasonMessages: Record<string, string> = {
      removed_by_admin: 'Você foi removido da sala pelo administrador.',
      admin_left: 'O administrador encerrou a sala.',
      admin_disconnected: 'O administrador perdeu a conexão e a sala foi encerrada.',
      admin_inactive_timeout: 'A sala foi encerrada por inatividade do administrador.',
      default: 'Você foi removido da sala.',
    };

    const message = reasonMessages[forceLeaveInfo.reason || 'default'] || reasonMessages.default;
    toast.error(message);
    setHasJoinedChannel(false);
    setChannelInput('');
    setShowJoinInput(false);
    setIsReturningUser(false);
    setSelectedCategories([]);
    if (forceLeaveInfo.channelId) {
      clearPersistedCategories(forceLeaveInfo.channelId);
    }
    clearForceLeaveInfo();
  }, [forceLeaveInfo, clearForceLeaveInfo, clearPersistedCategories]);

  const handleJoinChannel = () => {
    if (!channelInput.trim()) {
      toast.error('Digite um ID de canal válido');
      return;
    }

    if (!guestName.trim()) {
      toast.error('Digite seu nome antes de entrar na sala');
      return;
    }

    if (!isConnected) {
      toast.error('Aguarde a conexão ser estabelecida');
      return;
    }

    const trimmedName = guestName.trim();
    joinChannel(channelInput.trim(), trimmedName);
    setGuestName(trimmedName);
    setHasJoinedChannel(true);
    toast.success(`Conectado ao canal: ${channelInput.trim()}`);
  };

  const handleLeaveChannel = () => {
    const previousChannel = currentChannel;
    leaveChannel();
    clearDeviceSession();
    setHasJoinedChannel(false);
    setChannelInput('');
    setIsReturningUser(false);
    setSelectedCategories([]);
    if (previousChannel) {
      clearPersistedCategories(previousChannel);
    }
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

    const displayName = guestName.trim() || undefined;

    setChannelInput(randomId);
    joinChannel(randomId, displayName);
    setHasJoinedChannel(true);
    toast.success(`Código da sala: ${randomId}`, { duration: 5000 });
  };

  const handleShowJoinInput = () => {
    setShowJoinInput(true);
  };

  const handleToggleCategory = (category: string) => {
    if (!currentChannel) {
      toast.error('Entre em um canal antes de selecionar categorias.');
      return;
    }

    if (selectionDisabled) {
      toast.info(isAdmin ? 'Apenas os convidados podem votar.' : 'A votação já foi encerrada.');
      return;
    }

    setSelectedCategories((prev) => {
      const isSelected = prev.includes(category);
      let updated: string[];

      if (isSelected) {
        updated = prev.filter((item) => item !== category);
      } else {
        if (prev.length >= categorySelectionLimit) {
          toast.error(`Você pode escolher no máximo ${categorySelectionLimit} categorias.`);
          return prev;
        }
        updated = [...prev, category];
      }

      persistCategories(currentChannel, updated);
      submitCategoryVote(updated);
      return updated;
    });
  };

  const handleClearCategorySelections = () => {
    if (!currentChannel) {
      return;
    }
    if (selectionDisabled) {
      toast.info(isAdmin ? 'Apenas os convidados podem votar.' : 'A votação já foi encerrada.');
      return;
    }
    setSelectedCategories([]);
    persistCategories(currentChannel, []);
    submitCategoryVote([]);
    toast.info('Seleções de categorias limpas.');
  };

  const handleRemoveGuest = (targetDeviceId: string) => {
    if (!isAdmin || targetDeviceId === deviceId) {
      return;
    }

    removeGuest(targetDeviceId);
    toast.success('Convidado removido da sala.');
  };

  const handleResetSession = () => {
    clearDeviceSession();
    setChannelInput('');
    setHasJoinedChannel(false);
    setIsReturningUser(false);
    setGuestName('');
    clearPersistedCategories();
    setSelectedCategories([]);
    toast.success('Sessão reiniciada! Novo ID de device criado.');
    setTimeout(() => {
      connect();
    }, 500);
  };

  useEffect(() => {
    setHasJoinedChannel(Boolean(currentChannel));
    if (!currentChannel) {
      setSelectedCategories([]);
    }
  }, [currentChannel]);

  useEffect(() => {
    if (!currentChannel || isAdmin) {
      setSelectedCategories([]);
      return;
    }
    const stored = loadStoredCategories(currentChannel);
    setSelectedCategories(stored);
    if (stored.length && canVote) {
      submitCategoryVote(stored);
    }
  }, [currentChannel, isAdmin, canVote, loadStoredCategories, submitCategoryVote]);

  useEffect(() => {
    if (isAdmin && currentChannel) {
      clearPersistedCategories(currentChannel);
      setSelectedCategories([]);
    }
  }, [isAdmin, currentChannel, clearPersistedCategories]);

  const previousVotingClosedRef = useRef<boolean>(false);

  useEffect(() => {
    if (isVotingClosed && !previousVotingClosedRef.current) {
      setShowResultsDialog(true);
    }
    previousVotingClosedRef.current = isVotingClosed;
  }, [isVotingClosed]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="relative w-full max-w-2xl animate-fade-in space-y-6">
        {hasJoinedChannel && (
          <button
            type="button"
            aria-label={isCategoryPanelOpen ? 'Fechar painel de categorias' : 'Abrir painel de categorias'}
            onClick={() => setIsCategoryPanelOpen((prev) => !prev)}
            className="absolute top-0 right-0 rounded-full border border-primary/30 bg-background/80 backdrop-blur shadow-lg w-12 h-12 flex items-center justify-center transition hover:scale-105 active:scale-95"
          >
            <div className="relative w-6 h-6">
              <ListChecks
                className={cn(
                  'absolute inset-0 transition-all duration-200',
                  isCategoryPanelOpen ? 'scale-0 rotate-45 opacity-0' : 'scale-100 opacity-100'
                )}
              />
              <X
                className={cn(
                  'absolute inset-0 transition-all duration-200',
                  isCategoryPanelOpen ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 -rotate-45'
                )}
              />
            </div>
          </button>
        )}
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
                  <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-xs uppercase tracking-wide">
                    {isAdmin ? 'ADMIN' : 'GUEST'}
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Seu nome
                  </label>
                  <Input
                    type="text"
                    placeholder="Como você quer aparecer na sala?"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
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
                    maxLength={6}
                  />
                </div>

                <Button
                  onClick={handleJoinChannel}
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

            {isAdmin && (
              <Card className="glass-card p-4 border-primary/20 bg-primary/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">Controle de votação</p>
                    <p className="text-sm text-muted-foreground">
                      {isVotingClosed
                        ? 'Votação encerrada. Todos já podem ver as categorias escolhidas.'
                        : 'Acompanhe os votos em tempo real e encerre quando estiver pronto.'}
                    </p>
                  </div>
                  <Button
                    onClick={closeCategoryVoting}
                    disabled={isVotingClosed}
                    className="w-full sm:w-auto"
                    variant={isVotingClosed ? 'outline' : 'default'}
                  >
                    {isVotingClosed ? 'Votação encerrada' : 'Encerrar votação'}
                  </Button>
                </div>
              </Card>
            )}

            {/* Category Selection Drawer */}
            <Drawer
              open={isCategoryPanelOpen}
              onOpenChange={setIsCategoryPanelOpen}
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
                  {/* Handle area - only this area triggers drag */}
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

                  {/* Scrollable content area - data-vaul-no-drag prevents drawer drag on scroll */}
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
                                onClick={() => handleToggleCategory(category)}
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
                            onClick={handleClearCategorySelections}
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
                      ) : displayedCategoryTotals.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Ainda não há votos registrados. Faça sua seleção para participar do ranking!
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {displayedCategoryTotals.map((category, index) => {
                            const percentage = totalCategoryVotes
                              ? Math.round((category.votes / totalCategoryVotes) * 100)
                              : 0;
                            return (
                              <div key={category.name} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">
                                    {index + 1}. {category.name}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    {category.votes} {category.votes === 1 ? 'voto' : 'votos'}
                                    {totalCategoryVotes ? ` • ${percentage}%` : ''}
                                  </span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className="h-full bg-primary transition-all"
                                    style={{
                                      width: totalCategoryVotes ? `${percentage}%` : '0%',
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
                        onClick={() => setShowResultsDialog(true)}
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

            <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Resultados das Categorias</DialogTitle>
                  <DialogDescription>
                    Estas são as 10 categorias mais votadas após o encerramento da votação.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  {displayedCategoryTotals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Ainda não tivemos votos suficientes para gerar uma lista.
                    </p>
                  ) : (
                    displayedCategoryTotals.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {index + 1}. {category.name}
                        </span>
                        <span className="text-muted-foreground">
                          {category.votes} {category.votes === 1 ? 'voto' : 'votos'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={() => setShowResultsDialog(false)}>Fechar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
                <div>selectedCategories: {selectedCategories.join(', ') || 'nenhuma'}</div>
                <div>categoryTotals: {JSON.stringify(categoryTotals)}</div>
                <div>isVotingClosed: {isVotingClosed ? 'true' : 'false'}</div>
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
                        <div>
                          <span className="font-semibold text-sm block">
                            {device.displayName || device.id.substring(0, 8)}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground block">
                            #{device.id.substring(0, 8)}
                          </span>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge
                              variant={device.role === 'admin' ? 'default' : 'outline'}
                              className="text-[10px] uppercase tracking-wide"
                            >
                              {device.role === 'admin' ? 'Admin' : 'Guest'}
                            </Badge>
                            {device.id === deviceId && (
                              <Badge variant="secondary" className="text-[10px] uppercase">
                                Você
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {device.isActive ? 'Ativo' : 'Background'}
                        </span>
                        {isAdmin && device.role === 'guest' && device.id !== deviceId && (
                          <Button
                            onClick={() => handleRemoveGuest(device.id)}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                          >
                            <UserMinus className="w-4 h-4 mr-1" />
                            Remover
                          </Button>
                        )}
                      </div>
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
