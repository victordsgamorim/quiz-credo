/* eslint-disable max-lines */
import { useState, useEffect, useRef } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Globe,
  ListChecks,
  LogOut,
  QrCode,
  Settings,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { LoginDialog } from "@/components/auth/LoginDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CategoryId } from "@/constants/categories";
import { useBackgroundMusicContext } from "@/contexts/BackgroundMusicContext";
import { useLocale, interpolate } from "@/contexts/LocaleContext";
import { useAuth } from "@/hooks/useAuth";
import { useCategoryStorage } from "@/hooks/useCategoryStorage";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import type { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import { DEFAULT_GAME_SETTINGS, type GameSettings } from "@/types/gameSettings";
import { LOCALES } from "@/types/i18n";
import { generateRandomGuestName } from "@/utils/randomNameGenerator";

import { CategoryChipsPanel } from "./CategoryChipsPanel";
import { CategoryDrawer } from "./CategoryDrawer";
import { ConnectedDevicesList } from "./ConnectedDevicesList";
import { EditNameDialog } from "./EditNameDialog";
import { GameSettingsCard } from "./GameSettingsCard";
import { RoomOptionsCard } from "./RoomOptionsCard";
import { RoomQRCodeDialog } from "./RoomQRCodeDialog";

type LobbyScreenProps = {
  onReady: (playerName: string) => void;
  socket: ReturnType<typeof useSocket>;
  initialRoomCode?: string;
};

/*
 * Main lobby screen component for room management and category voting.
 */
// eslint-disable-next-line max-lines-per-function, complexity
export const LobbyScreen = ({ onReady, socket, initialRoomCode }: LobbyScreenProps) => {
  const { t, locale, setLocale, lockLocaleChange, unlockLocaleChange } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
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
    updateGameSettings,
    clearForceLeaveInfo,
    clearChannelError,
    isConnected,
    currentChannel,
    channelDevices,
    deviceId,
    selfRole,
    forceLeaveInfo,
    channelError,
    categoryTotals,
    maxCategorySelections,
    isVotingClosed,
    isGameStarted,
  } = socket;

  const isDesktopView = useIsDesktop();
  const isMobile = !isDesktopView;
  const { loadStoredCategories, persistCategories, clearPersistedCategories } =
    useCategoryStorage();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [channelInput, setChannelInput] = useState("");
  const [hasJoinedChannel, setHasJoinedChannel] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isShowingJoinInput, setIsShowingJoinInput] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>([]);
  const [guestName, setGuestName] = useState("");
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
  const [drawerSnapPoint, setDrawerSnapPoint] = useState<number | string>(0.75);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isEditNameDialogOpen, setIsEditNameDialogOpen] = useState(false);
  const [isQRCodeDialogOpen, setIsQRCodeDialogOpen] = useState(false);
  const [pendingJoinCode, setPendingJoinCode] = useState<string | null>(null);

  const hasInitializedRef = useRef(false);
  const hasTransitionedToGameRef = useRef(false);

  const isAdmin = selfRole === "admin";
  const { playIntroMusic, stopIntroMusic } = useBackgroundMusicContext();

  // Play music when admin joins/returns to lobby channel
  useEffect(() => {
    if (currentChannel && isAdmin && !isGameStarted) {
      playIntroMusic();
    }
  }, [currentChannel, isAdmin, isGameStarted, playIntroMusic]);

  // Sync gameSettings from socket (for guests)
  useEffect(() => {
    if (socket.gameSettings && !isAdmin) {
      setGameSettings(socket.gameSettings);
    }
  }, [socket.gameSettings, isAdmin]);

  // Send gameSettings to server when ADMIN modifies them
  useEffect(() => {
    if (isAdmin && currentChannel && !isGameStarted) {
      updateGameSettings(gameSettings);
    }
  }, [gameSettings, isAdmin, currentChannel, isGameStarted, updateGameSettings]);

  const categorySelectionLimit = maxCategorySelections || gameSettings.maxCategorySelections;

  // Trim selected categories when limit decreases (remove last added categories)
  useEffect(() => {
    if (selectedCategories.length > categorySelectionLimit) {
      // Keep only the first N categories (remove the last ones)
      const trimmedCategories = selectedCategories.slice(0, categorySelectionLimit);
      setSelectedCategories(trimmedCategories);

      // Update server with trimmed selection
      if (currentChannel) {
        submitCategoryVote(trimmedCategories);
      }

      // Persist trimmed categories
      if (currentChannel) {
        persistCategories(currentChannel, trimmedCategories);
      }
    }
  }, [
    categorySelectionLimit,
    selectedCategories,
    currentChannel,
    submitCategoryVote,
    persistCategories,
  ]);
  const displayedCategoryTotals = categoryTotals.slice(0, gameSettings.topCategoriesCount);
  const canVote = !isAdmin;
  const isSelectionDisabled = !canVote;
  const guestDevices = channelDevices.filter((device) => device.role === "guest");
  const readyGuestCount = guestDevices.filter((device) => Boolean(device.isReady)).length;
  const totalGuests = guestDevices.length;
  const isAllGuestsReady = totalGuests > 0 && readyGuestCount === totalGuests;
  const isDebugMode = isAdmin && gameSettings.enableDebugMode;
  const canSelfToggleReady =
    !isAdmin && categorySelectionLimit > 0 && selectedCategories.length === categorySelectionLimit;
  const canStartGame = isAdmin && (isAllGuestsReady || isDebugMode) && !isGameStarted;
  const displayChannelCode = currentChannel || channelInput;
  const canCreateRoom = isAuthenticated && !isAuthLoading;

  // Reset category panel when leaving channel or game starts
  useEffect(() => {
    if (!hasJoinedChannel || isGameStarted) {
      setIsCategoryPanelOpen(false);
    }
  }, [hasJoinedChannel, isGameStarted]);

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

      // Check for QR code redirect (route param or URL parameter)
      const urlParams = new URLSearchParams(window.location.search);
      const roomCodeFromUrl = urlParams.get("room");
      const normalizedRoomCode = (initialRoomCode || roomCodeFromUrl)?.trim();

      if (normalizedRoomCode) {
        // User came from QR code - set room code and generate random name
        const uppercaseRoomCode = normalizedRoomCode.toUpperCase();
        setChannelInput(uppercaseRoomCode);
        const randomName = generateRandomGuestName();
        setGuestName(randomName);
        setPendingJoinCode(uppercaseRoomCode);

        if (roomCodeFromUrl) {
          // Clean up URL without page reload
          window.history.replaceState({}, "", window.location.pathname);
        }
      } else {
        // Normal flow - restore session if available
        const session = getStoredSession();
        if (session?.channelId) {
          setChannelInput(session.channelId);
        }
        if (session?.displayName) {
          setGuestName(session.displayName);
        }
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
  }, [connect, getStoredSession, initialRoomCode, interpolate, t]);

  // Auto-join when a QR code provides a room code
  useEffect(() => {
    if (!pendingJoinCode || currentChannel) return;
    if (!isConnected || !guestName.trim()) return;

    const trimmedName = guestName.trim();
    joinChannel(pendingJoinCode, trimmedName);
    setGuestName(trimmedName);
    setPendingJoinCode(null);
    lockLocaleChange();
  }, [pendingJoinCode, currentChannel, isConnected, guestName, joinChannel, lockLocaleChange]);

  // Handle force leave
  useEffect(() => {
    if (!forceLeaveInfo) return;

    stopIntroMusic();
    const reasonMap: Record<string, keyof typeof t.lobby.forceLeave> = {
      removed_by_admin: "removedByAdmin",
      admin_left: "adminLeft",
      admin_disconnected: "adminDisconnected",
      admin_inactive_timeout: "adminInactiveTimeout",
    };
    const reasonKey =
      reasonMap[forceLeaveInfo.reason || ""] ?? ("default" as keyof typeof t.lobby.forceLeave);
    const message = t.lobby.forceLeave[reasonKey];
    toast.error(message);
    setHasJoinedChannel(false);
    setChannelInput("");
    setIsShowingJoinInput(false);
    setSelectedCategories([]);
    if (forceLeaveInfo.channelId) {
      clearPersistedCategories(forceLeaveInfo.channelId);
    }
    clearForceLeaveInfo();
  }, [forceLeaveInfo, clearForceLeaveInfo, clearPersistedCategories, t, stopIntroMusic]);

  // Sync hasJoinedChannel with currentChannel
  useEffect(() => {
    setHasJoinedChannel(Boolean(currentChannel));
    if (!currentChannel) {
      setSelectedCategories([]);
    }
  }, [currentChannel]);

  // Keep the URL in sync with the current channel (for sharing/reload)
  useEffect(() => {
    if (currentChannel) {
      const targetPath = `/join/${currentChannel}`;
      if (location.pathname !== targetPath) {
        navigate(targetPath, { replace: true });
      }
      return;
    }

    if (location.pathname.startsWith("/join/")) {
      navigate("/", { replace: true });
    }
  }, [currentChannel, location.pathname, navigate]);

  useEffect(() => {
    if (!currentChannel) {
      unlockLocaleChange();
    }
  }, [currentChannel, unlockLocaleChange]);

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

  // Handle channel errors
  useEffect(() => {
    if (!channelError) return;

    const errorKeyMap: Record<string, keyof typeof t.lobby.errors> = {
      device_not_found: "deviceNotFound",
      channel_not_found: "channelNotFound",
      channel_already_exists: "channelAlreadyExists",
    };
    const lookupKey = errorKeyMap[channelError.error] || "channelNotFound";
    const message = t.lobby.errors[lookupKey] || t.lobby.errors.channelNotFound;
    toast.error(message);
    setHasJoinedChannel(false);
    clearChannelError();
  }, [channelError, clearChannelError, t]);

  useEffect(() => {
    if (isGameStarted && !hasTransitionedToGameRef.current) {
      hasTransitionedToGameRef.current = true;
      console.log("[LobbyScreen] Game starting, calling onReady with guestName:", guestName);
      onReady(guestName);
    }

    if (!isGameStarted) {
      hasTransitionedToGameRef.current = false;
    }
  }, [isGameStarted, onReady, guestName, t]);

  const handleJoinChannel = () => {
    if (!channelInput.trim()) {
      toast.error(t.lobby.errors.invalidCode);
      return;
    }
    if (!guestName.trim()) {
      toast.error(t.lobby.errors.enterName);
      return;
    }
    if (!isConnected) {
      toast.error(t.lobby.errors.waitConnection);
      return;
    }

    // Only admin plays intro music
    const trimmedName = guestName.trim();
    joinChannel(channelInput.trim(), trimmedName);
    setGuestName(trimmedName);
    lockLocaleChange();
  };

  const handleLeaveChannel = () => {
    stopIntroMusic();
    const previousChannel = currentChannel;
    leaveChannel();
    clearDeviceSession();
    setHasJoinedChannel(false);
    setChannelInput("");
    setSelectedCategories([]);
    if (previousChannel) {
      clearPersistedCategories(previousChannel);
    }
    hasInitializedRef.current = false;
    unlockLocaleChange();
    setTimeout(() => connect(), 500);
  };

  const handleCreateRoom = () => {
    if (!isConnected) {
      toast.error(t.lobby.errors.waitConnection);
      return;
    }
    if (!canCreateRoom) {
      toast.error(t.lobby.errors.authRequired);
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
  };

  const handleToggleCategory = (category: CategoryId) => {
    if (!currentChannel) {
      toast.error(t.lobby.errors.enterChannel);
      return;
    }
    if (isSelectionDisabled) {
      toast.info(isAdmin ? t.lobby.errors.onlyGuestsVote : t.lobby.errors.votingClosed);
      return;
    }

    setSelectedCategories((prev) => {
      const isSelected = prev.includes(category);
      let updated: CategoryId[];

      if (isSelected) {
        updated = prev.filter((item) => item !== category);
      } else {
        if (prev.length >= categorySelectionLimit) {
          toast.error(
            interpolate(t.lobby.errors.maxCategories, {
              max: categorySelectionLimit,
            })
          );
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
      toast.info(isAdmin ? t.lobby.errors.onlyGuestsVote : t.lobby.errors.votingClosed);
      return;
    }
    setSelectedCategories([]);
    persistCategories(currentChannel, []);
    submitCategoryVote([]);
  };

  const handleRemoveGuest = (targetDeviceId: string) => {
    if (!isAdmin || targetDeviceId === deviceId) return;
    removeGuest(targetDeviceId);
  };

  const handleToggleReadyStatus = (targetDeviceId: string, nextIsReady: boolean) => {
    if (!currentChannel || targetDeviceId !== deviceId) {
      return;
    }
    if (!canSelfToggleReady) {
      toast.info(t.lobby.selectAllCategories);
      return;
    }
    updateReadyState(nextIsReady);
  };

  const handleStartGame = () => {
    if (!isAdmin) {
      toast.error(t.lobby.errors.onlyAdmin);
      return;
    }
    if (!isDebugMode && totalGuests === 0) {
      toast.error(t.lobby.errors.needGuests);
      return;
    }
    if (!isDebugMode && !isAllGuestsReady) {
      toast.error(t.lobby.errors.allGuestsMustBeReady);
      return;
    }

    // Close voting before starting the game
    if (!isVotingClosed) {
      closeCategoryVoting();
    }

    // Pass game settings to start game
    startGame(gameSettings);
  };

  const handleCopyChannelId = () => {
    if (!displayChannelCode) return;
    void navigator.clipboard.writeText(displayChannelCode);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2000);
  };

  const handleEditName = () => {
    setIsEditNameDialogOpen(true);
  };

  const handleSaveName = (newName: string) => {
    if (currentChannel && newName.trim() && newName !== guestName) {
      setGuestName(newName);
      // Rejoin channel with new name to update on server
      joinChannel(currentChannel, newName);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-background via-background to-primary/5 pb-[env(safe-area-inset-bottom)]">
      <div className="sticky top-0 z-20 border-b border-primary/10 bg-background/80 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 justify-self-start">
            <span
              className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium sm:px-3",
                isConnected
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  isConnected ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
              {isConnected ? t.lobby.connected : t.lobby.disconnected}
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {isPageVisible ? t.lobby.active : t.lobby.background}
            </span>
          </div>
          <div className="flex items-center justify-center justify-self-center">
            {hasJoinedChannel && (
              <img
                src="/logo.png"
                alt="Millionaire Brain Quiz"
                className="h-6 w-auto object-contain sm:h-7"
              />
            )}
          </div>
          <div className="flex items-center gap-2 justify-self-end">
            {!hasJoinedChannel ? (
              <>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      variant="outline"
                      size={isMobile ? "icon" : "sm"}
                      className={isMobile ? "h-9 w-9" : "h-9 gap-2 px-3"}
                      title={isMobile ? LOCALES[locale].name : undefined}
                      aria-label={LOCALES[locale].name}
                    >
                      <Globe className="h-4 w-4" aria-hidden="true" />
                      {!isMobile && (
                        <>
                          <span className="text-xs font-medium">{LOCALES[locale].name}</span>
                          <ChevronDown className="h-4 w-4 opacity-70" />
                        </>
                      )}
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      sideOffset={8}
                      align="end"
                      className="glass-card z-50 min-w-[200px] p-1.5 text-sm"
                    >
                      {Object.values(LOCALES).map((localeConfig) => (
                        <DropdownMenu.Item
                          key={localeConfig.code}
                          onSelect={() => setLocale(localeConfig.code)}
                          className="menu-item-game flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 outline-none transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-base">{localeConfig.flag}</span>
                            <span className="text-xs font-medium">{localeConfig.name}</span>
                          </span>
                          {locale === localeConfig.code && (
                            <Check className="h-4 w-4 text-success" />
                          )}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
                <LoginDialog />
              </>
            ) : (
              <>
                {!isGameStarted && isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsSettingsDialogOpen(true)}
                      title={t.lobby.gameSettings.title}
                      aria-label={t.lobby.gameSettings.title}
                      className="h-9 w-9"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsCategoryPanelOpen((prev) => !prev)}
                      title={
                        isCategoryPanelOpen
                          ? t.lobby.categoryPanel.close
                          : t.lobby.categoryPanel.open
                      }
                      aria-label={
                        isCategoryPanelOpen
                          ? t.lobby.categoryPanel.close
                          : t.lobby.categoryPanel.open
                      }
                      aria-expanded={isCategoryPanelOpen}
                      className="h-9 w-9"
                    >
                      <ListChecks className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLeaveChannel}
                  title={t.lobby.leaveRoom}
                  aria-label={t.lobby.leaveRoom}
                  className="h-9 w-9"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {hasJoinedChannel && (
        <div className="mx-auto w-full max-w-3xl px-4 pt-3">
          <div className="flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-background/80 py-1.5 pl-4 pr-1.5 text-xs text-muted-foreground shadow-sm sm:gap-3">
            <span className="whitespace-nowrap">{t.lobby.roomCode}</span>
            <span className="font-mono text-lg font-bold tracking-[0.2em] text-primary">
              {displayChannelCode}
            </span>
            <Button
              onClick={handleCopyChannelId}
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              title={t.lobby.copyCode}
              aria-label={t.lobby.copyCode}
            >
              {hasCopiedCode ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setIsQRCodeDialogOpen(true)}
              title={t.lobby.qrCode}
              aria-label={t.lobby.qrCode}
            >
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex flex-1 justify-center px-4 pb-8",
          hasJoinedChannel ? "items-start" : "items-center"
        )}
      >
        <div className="relative w-full max-w-2xl animate-fade-in space-y-4 pt-4 sm:space-y-6 sm:pt-6">
          {/* Pre-join content */}
          {!hasJoinedChannel && (
            <>
              <div className="flex justify-center">
                <img
                  src="/logo.png"
                  alt="Millionaire Brain Quiz"
                  className="w-[min(60%,340px)] max-h-[30dvh] h-auto object-contain image-glow"
                />
              </div>
              <RoomOptionsCard
                isConnected={isConnected}
                canCreateRoom={canCreateRoom}
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
              {!isGameStarted &&
                (isAdmin ? (
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
                    isSelectionDisabled={isSelectionDisabled}
                    onToggleCategory={handleToggleCategory}
                    onClearSelections={handleClearCategorySelections}
                  />
                ) : (
                  <CategoryChipsPanel
                    isAdmin={isAdmin}
                    isVotingClosed={isVotingClosed}
                    selectedCategories={selectedCategories}
                    categorySelectionLimit={categorySelectionLimit}
                    isSelectionDisabled={isSelectionDisabled}
                    onToggleCategory={handleToggleCategory}
                    onClearSelections={handleClearCategorySelections}
                  />
                ))}

              <ConnectedDevicesList
                devices={channelDevices}
                currentDeviceId={deviceId}
                isAdmin={isAdmin}
                onRemoveGuest={handleRemoveGuest}
                onToggleReadyState={handleToggleReadyStatus}
                onEditName={handleEditName}
                isGameStarted={isGameStarted}
                canSelfToggleReady={canSelfToggleReady}
                selfRole={selfRole}
              />

              <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 flex items-center justify-between gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_20px_hsl(45_100%_50%/0.2),0_0_40px_hsl(45_100%_50%/0.1)]">
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
                <Badge
                  variant="secondary"
                  className="shrink-0 whitespace-nowrap text-xs font-semibold"
                >
                  {readyGuestCount}/{totalGuests || 0} {t.lobby.ready.toLowerCase()}
                </Badge>
              </div>

              {isAdmin ? (
                <>
                  <Button
                    onClick={handleStartGame}
                    disabled={!canStartGame}
                    variant="success"
                    className="w-full h-14 text-lg font-display font-semibold disabled:opacity-60"
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

      {/* Game Settings Dialog */}
      <Dialog.Root open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl translate-x-[-50%] translate-y-[-50%] overflow-y-auto overscroll-contain rounded-lg border bg-background p-4 sm:p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
            <Dialog.Title className="text-xl font-bold mb-2">
              {t.lobby.gameSettings.title}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground mb-6">
              {t.lobby.gameSettings.description}
            </Dialog.Description>
            <GameSettingsCard
              settings={gameSettings}
              onChange={setGameSettings}
              disabled={isGameStarted}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit Name Dialog */}
      <EditNameDialog
        isOpen={isEditNameDialogOpen}
        currentName={guestName}
        onClose={() => setIsEditNameDialogOpen(false)}
        onSave={handleSaveName}
      />

      {/* QR Code Dialog */}
      {displayChannelCode && (
        <RoomQRCodeDialog
          isOpen={isQRCodeDialogOpen}
          roomCode={displayChannelCode}
          onClose={() => setIsQRCodeDialogOpen(false)}
        />
      )}
    </div>
  );
};
