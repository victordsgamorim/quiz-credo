/* eslint-disable max-lines */
import { useState, useEffect, useRef } from "react";

import { ListChecks, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import {
  DEFAULT_MAX_CATEGORY_SELECTIONS,
  DEFAULT_DISPLAYED_CATEGORIES,
} from "@/constants/categories";
import { useLocale, interpolate } from "@/contexts/LocaleContext";
import { useCategoryStorage } from "@/hooks/useCategoryStorage";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

import { ActiveRoomCard } from "./ActiveRoomCard";
import { CategoryDrawer } from "./CategoryDrawer";
import { CategoryResultsDialog } from "./CategoryResultsDialog";
import { ConnectedDevicesList } from "./ConnectedDevicesList";
import { ConnectionStatusCard } from "./ConnectionStatusCard";
import { RoomOptionsCard } from "./RoomOptionsCard";

type LobbyScreenProps = {
  onReady: () => void;
};

/*
 * Main lobby screen component for room management and category voting.
 */
// eslint-disable-next-line max-lines-per-function, complexity
export const LobbyScreen = ({ onReady }: LobbyScreenProps) => {
  const { t, lockLocaleChange, unlockLocaleChange } = useLocale();
  const {
    connect,
    createChannel,
    joinChannel,
    leaveChannel,
    clearDeviceSession,
    getStoredSession,
    removeGuest,
    submitCategoryVote,
    closeCategoryVoting,
    updateReadyState,
    startGame,
    clearForceLeaveInfo,
    clearChannelError,
    isConnected,
    currentChannel,
    channelDevices,
    deviceId,
    totalDevices,
    selfRole,
    forceLeaveInfo,
    channelError,
    categoryTotals,
    maxCategorySelections,
    isVotingClosed,
    isGameStarted,
  } = useSocket();

  const isDesktopView = useIsDesktop();
  const { loadStoredCategories, persistCategories, clearPersistedCategories } =
    useCategoryStorage();

  const [channelInput, setChannelInput] = useState("");
  const [hasJoinedChannel, setHasJoinedChannel] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [isShowingJoinInput, setIsShowingJoinInput] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [guestName, setGuestName] = useState("");
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
  const [drawerSnapPoint, setDrawerSnapPoint] = useState<number | string>(0.75);
  const [isShowingResultsDialog, setIsShowingResultsDialog] = useState(false);

  const hasInitializedRef = useRef(false);
  const previousVotingClosedRef = useRef<boolean>(false);
  const hasTransitionedToGameRef = useRef(false);

  const isAdmin = selfRole === "admin";
  const categorySelectionLimit = maxCategorySelections || DEFAULT_MAX_CATEGORY_SELECTIONS;
  const displayedCategoryTotals = categoryTotals.slice(0, DEFAULT_DISPLAYED_CATEGORIES);
  const canVote = !isAdmin && !isVotingClosed;
  const isSelectionDisabled = !canVote;
  const canViewResults = isAdmin || isVotingClosed;
  const guestDevices = channelDevices.filter((device) => device.role === "guest");
  const readyGuestCount = guestDevices.filter((device) => Boolean(device.isReady)).length;
  const totalGuests = guestDevices.length;
  const isAllGuestsReady = totalGuests > 0 && readyGuestCount === totalGuests;
  const canSelfToggleReady =
    !isAdmin && categorySelectionLimit > 0 && selectedCategories.length === categorySelectionLimit;
  const canStartGame = isAdmin && isAllGuestsReady && !isGameStarted;

  // Reset category panel when leaving channel
  useEffect(() => {
    if (!hasJoinedChannel) {
      setIsCategoryPanelOpen(false);
    }
  }, [hasJoinedChannel]);

  // Reset snap point when drawer opens
  useEffect(() => {
    if (isCategoryPanelOpen && !isDesktopView) {
      setDrawerSnapPoint(0.75);
    }
  }, [isCategoryPanelOpen, isDesktopView]);

  // Initialize connection and restore session
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;

      const session = getStoredSession();
      if (session?.channelId) {
        setIsReturningUser(true);
        setChannelInput(session.channelId);
        toast.info(interpolate(t.lobby.returningSession, { channel: session.channelId }));
      }
      if (session?.displayName) {
        setGuestName(session.displayName);
      }
    }

    connect();

    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [connect, getStoredSession, t]);

  // Handle force leave
  useEffect(() => {
    if (!forceLeaveInfo) return;

    const reasonMessages: Record<string, string> = {
      removed_by_admin: "Você foi removido da sala pelo administrador.",
      admin_left: "O administrador encerrou a sala.",
      admin_disconnected: "O administrador perdeu a conexão e a sala foi encerrada.",
      admin_inactive_timeout: "A sala foi encerrada por inatividade do administrador.",
      default: "Você foi removido da sala.",
    };

    const message = reasonMessages[forceLeaveInfo.reason || "default"] || reasonMessages.default;
    toast.error(message);
    setHasJoinedChannel(false);
    setChannelInput("");
    setIsShowingJoinInput(false);
    setIsReturningUser(false);
    setSelectedCategories([]);
    if (forceLeaveInfo.channelId) {
      clearPersistedCategories(forceLeaveInfo.channelId);
    }
    clearForceLeaveInfo();
  }, [forceLeaveInfo, clearForceLeaveInfo, clearPersistedCategories]);

  // Sync hasJoinedChannel with currentChannel
  useEffect(() => {
    setHasJoinedChannel(Boolean(currentChannel));
    if (!currentChannel) {
      setSelectedCategories([]);
    }
  }, [currentChannel]);

  // Load stored categories when joining channel
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

  // Clear categories for admin
  useEffect(() => {
    if (isAdmin && currentChannel) {
      clearPersistedCategories(currentChannel);
      setSelectedCategories([]);
    }
  }, [isAdmin, currentChannel, clearPersistedCategories]);

  // Show results dialog when voting closes
  useEffect(() => {
    if (isVotingClosed && !previousVotingClosedRef.current) {
      setIsShowingResultsDialog(true);
    }
    previousVotingClosedRef.current = isVotingClosed;
  }, [isVotingClosed]);

  // Handle channel errors
  useEffect(() => {
    if (!channelError) return;

    const errorMessages: Record<string, string> = {
      device_not_found: "Dispositivo não encontrado. Tente reconectar.",
      channel_not_found: "Canal não encontrado. Verifique o código e tente novamente.",
      channel_already_exists: "Este canal já existe. Tente criar outro.",
    };

    const message = errorMessages[channelError.error] || "Erro ao processar canal.";
    toast.error(message);
    setHasJoinedChannel(false);
    clearChannelError();
  }, [channelError, clearChannelError]);

  useEffect(() => {
    if (isGameStarted && !hasTransitionedToGameRef.current) {
      hasTransitionedToGameRef.current = true;
      toast.success(t.lobby.gameStarting);
      onReady();
    }

    if (!isGameStarted) {
      hasTransitionedToGameRef.current = false;
    }
  }, [isGameStarted, onReady, t]);

  const handleJoinChannel = () => {
    if (!channelInput.trim()) {
      toast.error("Digite um ID de canal válido");
      return;
    }
    if (!guestName.trim()) {
      toast.error("Digite seu nome antes de entrar na sala");
      return;
    }
    if (!isConnected) {
      toast.error("Aguarde a conexão ser estabelecida");
      return;
    }

    const trimmedName = guestName.trim();
    joinChannel(channelInput.trim(), trimmedName);
    setGuestName(trimmedName);
    lockLocaleChange();
  };

  const handleLeaveChannel = () => {
    const previousChannel = currentChannel;
    leaveChannel();
    clearDeviceSession();
    setHasJoinedChannel(false);
    setChannelInput("");
    setIsReturningUser(false);
    setSelectedCategories([]);
    if (previousChannel) {
      clearPersistedCategories(previousChannel);
    }
    hasInitializedRef.current = false;
    unlockLocaleChange();
    toast.info("Você saiu do canal. Sessão reiniciada.");
    setTimeout(() => connect(), 500);
  };

  const handleCreateRoom = () => {
    if (!isConnected) {
      toast.error("Aguarde a conexão ser estabelecida");
      return;
    }

    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let randomId = "";
    for (let i = 0; i < 6; i++) {
      randomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const displayName = guestName.trim() || undefined;
    setChannelInput(randomId);
    createChannel(randomId, displayName);
    lockLocaleChange();
    toast.success(`Código da sala: ${randomId}`, { duration: 5000 });
  };

  const handleToggleCategory = (category: string) => {
    if (!currentChannel) {
      toast.error("Entre em um canal antes de selecionar categorias.");
      return;
    }
    if (isSelectionDisabled) {
      toast.info(isAdmin ? "Apenas os convidados podem votar." : "A votação já foi encerrada.");
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
    if (!currentChannel) return;
    if (isSelectionDisabled) {
      toast.info(isAdmin ? "Apenas os convidados podem votar." : "A votação já foi encerrada.");
      return;
    }
    setSelectedCategories([]);
    persistCategories(currentChannel, []);
    submitCategoryVote([]);
    toast.info("Seleções de categorias limpas.");
  };

  const handleRemoveGuest = (targetDeviceId: string) => {
    if (!isAdmin || targetDeviceId === deviceId) return;
    removeGuest(targetDeviceId);
    toast.success("Convidado removido da sala.");
  };

  const handleToggleReadyStatus = (targetDeviceId: string, nextIsReady: boolean) => {
    if (!currentChannel || targetDeviceId !== deviceId) {
      return;
    }
    if (!canSelfToggleReady) {
      toast.info("Selecione todas as categorias antes de marcar como pronto.");
      return;
    }
    updateReadyState(nextIsReady);
    if (nextIsReady) {
      toast.success("Você está pronto para jogar!");
    } else {
      toast.info("Você saiu do estado de pronto.");
    }
  };

  const handleResetSession = () => {
    clearDeviceSession();
    setChannelInput("");
    setHasJoinedChannel(false);
    setIsReturningUser(false);
    setGuestName("");
    clearPersistedCategories();
    setSelectedCategories([]);
    toast.success("Sessão reiniciada! Novo ID de device criado.");
    setTimeout(() => connect(), 500);
  };

  const handleStartGame = () => {
    if (!isAdmin) {
      toast.error("Apenas o administrador pode iniciar o jogo.");
      return;
    }
    if (totalGuests === 0) {
      toast.error("É necessário ter pelo menos um convidado conectado.");
      return;
    }
    if (!isAllGuestsReady) {
      toast.error("Todos os convidados precisam confirmar que estão prontos.");
      return;
    }

    // Close voting before starting the game
    if (!isVotingClosed) {
      closeCategoryVoting();
    }

    startGame();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="relative w-full max-w-2xl animate-fade-in space-y-6">
        {/* Category Panel Toggle Button */}
        {hasJoinedChannel && (
          <button
            type="button"
            aria-label={
              isCategoryPanelOpen ? "Fechar painel de categorias" : "Abrir painel de categorias"
            }
            onClick={() => setIsCategoryPanelOpen((prev) => !prev)}
            className="absolute top-0 right-0 rounded-full border border-primary/30 bg-background/80 backdrop-blur shadow-lg w-12 h-12 flex items-center justify-center transition hover:scale-105 active:scale-95"
          >
            <div className="relative w-6 h-6">
              <ListChecks
                className={cn(
                  "absolute inset-0 transition-all duration-200",
                  isCategoryPanelOpen ? "scale-0 rotate-45 opacity-0" : "scale-100 opacity-100"
                )}
              />
              <X
                className={cn(
                  "absolute inset-0 transition-all duration-200",
                  isCategoryPanelOpen
                    ? "scale-100 opacity-100 rotate-0"
                    : "scale-0 opacity-0 -rotate-45"
                )}
              />
            </div>
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-3">
            <span className="gold-text">{t.lobby.title}</span>
          </h1>
          <p className="text-muted-foreground text-lg">{t.lobby.subtitle}</p>
        </div>

        {/* Pre-join content */}
        {!hasJoinedChannel && (
          <>
            <LanguageSelector />

            <ConnectionStatusCard
              isConnected={isConnected}
              isPageVisible={isPageVisible}
              isReturningUser={isReturningUser}
              currentChannel={currentChannel}
              deviceId={deviceId}
              isAdmin={isAdmin}
              onResetSession={handleResetSession}
            />

            <RoomOptionsCard
              isConnected={isConnected}
              isShowingJoinInput={isShowingJoinInput}
              channelInput={channelInput}
              guestName={guestName}
              onCreateRoom={handleCreateRoom}
              onShowJoinInput={() => setIsShowingJoinInput(true)}
              onHideJoinInput={() => setIsShowingJoinInput(false)}
              onJoinChannel={handleJoinChannel}
              onChannelInputChange={setChannelInput}
              onGuestNameChange={setGuestName}
            />
          </>
        )}

        {/* Post-join content */}
        {hasJoinedChannel && (
          <>
            <ActiveRoomCard
              currentChannel={currentChannel}
              channelInput={channelInput}
              totalDevices={totalDevices}
              isAdmin={isAdmin}
              onLeaveChannel={handleLeaveChannel}
            />

            <CategoryDrawer
              open={isCategoryPanelOpen}
              onOpenChange={setIsCategoryPanelOpen}
              isDesktopView={isDesktopView}
              drawerSnapPoint={drawerSnapPoint}
              setDrawerSnapPoint={setDrawerSnapPoint}
              isAdmin={isAdmin}
              isVotingClosed={isVotingClosed}
              selectedCategories={selectedCategories}
              categorySelectionLimit={categorySelectionLimit}
              categoryTotals={displayedCategoryTotals}
              canViewResults={canViewResults}
              isSelectionDisabled={isSelectionDisabled}
              onToggleCategory={handleToggleCategory}
              onClearSelections={handleClearCategorySelections}
              onShowResults={() => setIsShowingResultsDialog(true)}
            />

            <CategoryResultsDialog
              open={isShowingResultsDialog}
              onOpenChange={setIsShowingResultsDialog}
              categoryTotals={displayedCategoryTotals}
            />

            <ConnectedDevicesList
              devices={channelDevices}
              currentDeviceId={deviceId}
              isAdmin={isAdmin}
              onRemoveGuest={handleRemoveGuest}
              onToggleReadyState={handleToggleReadyStatus}
              isGameStarted={isGameStarted}
              canSelfToggleReady={canSelfToggleReady}
            />

            <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold">{t.lobby.readyStatus}</p>
                <p className="text-xs text-muted-foreground">
                  {isAllGuestsReady
                    ? t.lobby.allGuestsReady
                    : interpolate(t.lobby.guestsReady, {
                        ready: readyGuestCount,
                        total: totalGuests || 0,
                      })}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs font-semibold">
                {readyGuestCount}/{totalGuests || 0} {t.lobby.ready.toLowerCase()}
              </Badge>
            </div>

            {isAdmin ? (
              <>
                <Button
                  onClick={handleStartGame}
                  disabled={!canStartGame}
                  className="w-full h-14 text-lg font-display font-semibold bg-success text-white hover:bg-success/90 disabled:opacity-60"
                >
                  {t.lobby.startGame}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                {!isAllGuestsReady && (
                  <p className="text-xs text-muted-foreground text-center">
                    {t.lobby.cannotStartYet}
                  </p>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-primary/30 bg-background/90 p-4 text-sm text-muted-foreground text-center">
                {t.lobby.waitingForGuests}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
