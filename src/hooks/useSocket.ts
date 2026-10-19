/* eslint-disable no-console */
/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

import { io, Socket } from "socket.io-client";

import type { CategoryId } from "@/constants/categories";
import type { GameSettings } from "@/types/gameSettings";
import type { PowerUpId, PowerUpOutcome } from "@/types/quiz";

const SOCKET_URL = String(import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3001");
const STORAGE_KEY = "socket-device-session";
const DEFAULT_MAX_CATEGORY_SELECTIONS = 5;

type DeviceRole = "admin" | "guest";

type DeviceInfo = {
  id: string;
  connectedAt: number;
  channel: string | null;
  isActive: boolean;
  socketId?: string;
  role: DeviceRole;
  displayName?: string;
  isReady?: boolean;
};

type Question = {
  id: string;
  question: string;
  options: string[];
  difficulty: string;
  points: number;
  category?: string;
};

type GameState = {
  questions: Question[];
  currentQuestionIndex: number;
  timerRemaining: number;
  isShowingResults: boolean;
  answeredGuestsCount?: number;
  totalGuests?: number;
  selectedGuestsCount?: number;
};

export type RankingEntry = {
  position: number;
  deviceId: string;
  displayName: string;
  role: string;
  totalPoints: number;
  correctAnswers: number;
  totalAnswers: number;
  accuracy: number;
};

type ChannelUpdate = {
  channelId: string;
  devices: DeviceInfo[];
  totalDevices: number;
  adminId?: string | null;
  categoryTotals?: CategoryVoteSummary[];
  maxCategorySelections?: number;
  gameSettings?: GameSettings | null;
  isVotingClosed?: boolean;
  isGameStarted?: boolean;
  gameState?: GameState | null;
};

type DeviceSession = {
  deviceId: string;
  channelId: string | null;
  lastConnected: number;
  displayName?: string | null;
  locale?: string | null;
};

type ForceLeaveInfo = {
  channelId: string | null;
  reason?: string;
};

type ChannelError = {
  error: "device_not_found" | "channel_not_found" | "channel_already_exists";
};

type CategoryVoteSummary = {
  name: string;
  votes: number;
};

type JoinedChannelData = {
  channelId: string;
  devices: DeviceInfo[];
  categoryTotals?: CategoryVoteSummary[];
  maxCategorySelections?: number;
  isVotingClosed?: boolean;
  isGameStarted?: boolean;
};

type PongData = {
  timestamp: number;
};

const generateDeviceId = (): string => {
  return `device_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
};

const loadSession = (): DeviceSession | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as DeviceSession) : null;
  } catch {
    return null;
  }
};

const saveSession = (session: DeviceSession): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("[Socket] Erro ao salvar sessão:", error);
  }
};

const clearSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("[Socket] Erro ao limpar sessão:", error);
  }
};

/*
 * Hook for managing WebSocket connections and real-time channel communication.
 */
export const useSocket = (locale?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [channelDevices, setChannelDevices] = useState<DeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [categoryTotals, setCategoryTotals] = useState<CategoryVoteSummary[]>([]);
  const [maxCategorySelections, setMaxCategorySelections] = useState(
    DEFAULT_MAX_CATEGORY_SELECTIONS
  );
  const [isVotingClosed, setIsVotingClosed] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [channelRanking, setChannelRanking] = useState<RankingEntry[]>([]);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityHandlerRef = useRef<(() => void) | null>(null);
  const hasReconnectedRef = useRef(false);
  const currentChannelRef = useRef<string | null>(null);
  const [forceLeaveInfo, setForceLeaveInfo] = useState<ForceLeaveInfo | null>(null);
  const [channelError, setChannelError] = useState<ChannelError | null>(null);
  const [isShowingFeedback, setIsShowingFeedback] = useState(false);
  // The disadvantages this device used, or was hit by, in the current game
  const [powerUpOutcomes, setPowerUpOutcomes] = useState<PowerUpOutcome[]>([]);
  // The power-ups the server dealt this device for the current game
  const [powerUpHand, setPowerUpHand] = useState<PowerUpId[] | null>(null);

  // Update locale when it changes
  useEffect(() => {
    if (locale && socketRef.current?.connected) {
      const session = loadSession();
      if (session && session.locale !== locale) {
        saveSession({
          ...session,
          locale,
        });
        // Emit locale update to server
        socketRef.current.emit("update-locale", { locale });
      }
    }
  }, [locale]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    const session = loadSession();
    let persistentDeviceId = session?.deviceId;

    if (!persistentDeviceId) {
      persistentDeviceId = generateDeviceId();
      console.log("[Socket] Novo device ID gerado:", persistentDeviceId);
    } else {
      console.log("[Socket] Device ID recuperado do cache:", persistentDeviceId);
    }

    console.log("[Socket] Iniciando conexão...");

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      auth: {
        deviceId: persistentDeviceId,
        locale: locale || session?.locale || "pt-BR",
      },
    });

    socket.on("connect", () => {
      console.log("[Socket] Conectado! Socket ID:", socket.id, "Device ID:", persistentDeviceId);
      setIsConnected(true);
      setDeviceId(persistentDeviceId);

      saveSession({
        deviceId: persistentDeviceId,
        channelId: session?.channelId || null,
        displayName: session?.displayName || null,
        locale: locale || session?.locale || "pt-BR",
        lastConnected: Date.now(),
      });

      if (session?.channelId && !hasReconnectedRef.current) {
        console.log("[Socket] Retomando canal anterior:", session.channelId);
        hasReconnectedRef.current = true;
        setTimeout(() => {
          const payload = session.displayName ? { displayName: session.displayName } : undefined;
          socket.emit("join-channel", session.channelId, persistentDeviceId, payload);
        }, 500);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Desconectado:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("[Socket] Erro de conexão:", error);
    });

    socket.on("joined-channel", (data: JoinedChannelData) => {
      console.log("[Socket] Entrou no channel:", data.channelId);
      setCurrentChannel(data.channelId);
      currentChannelRef.current = data.channelId;
      setChannelDevices(data.devices || []);
      setCategoryTotals(data.categoryTotals || []);
      if (data.maxCategorySelections) {
        setMaxCategorySelections(data.maxCategorySelections);
      }
      setIsVotingClosed(Boolean(data.isVotingClosed));
      setIsGameStarted(Boolean(data.isGameStarted));
      setChannelRanking([]);
      setTotalQuestions(null);
    });

    socket.on("channel-update", (data: ChannelUpdate) => {
      console.log("[Socket] Atualização do channel:", data);
      console.log("[Socket] Devices atualizados:", data.devices);
      console.log("[Socket] Total de devices:", data.devices?.length || 0);
      setChannelDevices(data.devices || []);
      setCategoryTotals(data.categoryTotals || []);
      if (data.maxCategorySelections) {
        setMaxCategorySelections(data.maxCategorySelections);
      }
      if (data.gameSettings) {
        setGameSettings(data.gameSettings);
      }
      setIsVotingClosed(Boolean(data.isVotingClosed));
      setIsGameStarted(Boolean(data.isGameStarted));
      setGameState(data.gameState || null);
    });

    socket.on("game-started", (payload: { channelId: string }) => {
      console.log("[Socket] Game started for channel:", payload.channelId);
      setIsGameStarted(true);
      setPowerUpOutcomes([]);
      setPowerUpHand(null);
      setChannelRanking([]);
      setTotalQuestions(null);
    });

    socket.on("game-reset", (payload: { channelId: string }) => {
      console.log("[Socket] Game reset for channel:", payload.channelId);
      setIsGameStarted(false);
      setPowerUpOutcomes([]);
      setPowerUpHand(null);
      setChannelRanking([]);
      setTotalQuestions(null);
      setCategoryTotals([]);
      setIsVotingClosed(false);
      setGameState(null);
    });

    socket.on("question-timeout", () => {
      console.log("[Socket] Question timeout");
      // Event will be handled by GameScreen component
    });

    socket.on(
      "answer-result",
      (data: { questionIndex: number; isCorrect: boolean; points: number }) => {
        console.log("[Socket] Answer result:", data);
        // Show feedback when admin submits answer
        setIsShowingFeedback(true);
      }
    );

    // Dealt when the game's questions load, and sent again when the device joins mid-game
    socket.on("power-up-hand", (hand: { powerUpIds: PowerUpId[] }) => {
      setPowerUpHand(hand.powerUpIds);
    });

    // Sent again, blocked, when the target's shield comes after the disadvantage
    socket.on("power-up-outcome", (outcome: PowerUpOutcome) => {
      setPowerUpOutcomes((previous) => [
        ...previous.filter(
          (known) =>
            known.powerUpId !== outcome.powerUpId || known.attacker.id !== outcome.attacker.id
        ),
        outcome,
      ]);
    });

    socket.on("game-finished", (data: { ranking: RankingEntry[]; totalQuestions: number }) => {
      console.log("[Socket] Game finished:", data);
      setChannelRanking(data.ranking);
      setTotalQuestions(data.totalQuestions);
    });

    socket.on("force-leave-channel", (payload: ForceLeaveInfo) => {
      console.warn("[Socket] Removido do canal pelo servidor:", payload);
      currentChannelRef.current = null;
      setCurrentChannel(null);
      setChannelDevices([]);
      setCategoryTotals([]);
      setMaxCategorySelections(DEFAULT_MAX_CATEGORY_SELECTIONS);
      setIsVotingClosed(false);
      setIsGameStarted(false);
      setChannelRanking([]);
      setTotalQuestions(null);
      hasReconnectedRef.current = false;
      setForceLeaveInfo({
        channelId: payload.channelId || null,
        reason: payload.reason,
      });

      const session = loadSession();
      if (session) {
        saveSession({
          ...session,
          channelId: null,
          lastConnected: Date.now(),
        });
      }
    });

    socket.on("pong", (data: PongData) => {
      console.log("[Socket] Pong recebido:", data);
    });

    socket.on("channel-error", (error: ChannelError) => {
      console.error("[Socket] Erro de canal:", error);
      setChannelError(error);
    });

    socketRef.current = socket;

    startKeepAlive();
    setupVisibilityHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
    }

    keepAliveIntervalRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("ping");
      }
    }, 15000);
  }, []);

  const setupVisibilityHandler = useCallback(() => {
    const handleVisibilityChange = () => {
      const isActive = !document.hidden;
      console.log("[Socket] Visibilidade mudou:", isActive ? "ativa" : "background");

      if (socketRef.current?.connected) {
        socketRef.current.emit("device-status", { isActive });
      }

      if (isActive && !socketRef.current?.connected) {
        console.log("[Socket] Reconectando após voltar para foreground...");
        connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    visibilityHandlerRef.current = handleVisibilityChange;

    const handleBeforeUnload = () => {
      const activeChannel = currentChannelRef.current;
      if (socketRef.current && activeChannel) {
        socketRef.current.emit("leave-channel", activeChannel);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [connect]);

  const createChannel = useCallback(
    (channelId: string, displayName?: string) => {
      if (!socketRef.current?.connected) {
        console.error("[Socket] Não conectado. Conectando...");
        connect();
        setTimeout(() => {
          if (socketRef.current?.connected && deviceId) {
            const payload = displayName ? { displayName } : undefined;
            socketRef.current.emit("create-channel", channelId, deviceId, payload);
          }
        }, 1000);
        return;
      }

      console.log("[Socket] Criando channel:", channelId);
      const payload = displayName ? { displayName } : undefined;
      socketRef.current.emit("create-channel", channelId, deviceId, payload);

      if (deviceId) {
        const session = loadSession();
        saveSession({
          deviceId,
          channelId,
          displayName: displayName || session?.displayName || null,
          lastConnected: Date.now(),
        });
      }
    },
    [connect, deviceId]
  );

  const joinChannel = useCallback(
    (channelId: string, displayName?: string) => {
      if (!socketRef.current?.connected) {
        console.error("[Socket] Não conectado. Conectando...");
        connect();
        setTimeout(() => {
          if (socketRef.current?.connected && deviceId) {
            const payload = displayName ? { displayName } : undefined;
            socketRef.current.emit("join-channel", channelId, deviceId, payload);
          }
        }, 1000);
        return;
      }

      console.log("[Socket] Entrando no channel:", channelId);
      const payload = displayName ? { displayName } : undefined;
      socketRef.current.emit("join-channel", channelId, deviceId, payload);

      if (deviceId) {
        const session = loadSession();
        saveSession({
          deviceId,
          channelId,
          displayName: displayName || session?.displayName || null,
          lastConnected: Date.now(),
        });
      }
    },
    [connect, deviceId]
  );

  const leaveChannel = useCallback(() => {
    if (!socketRef.current?.connected || !currentChannel) {
      return;
    }

    console.log("[Socket] Saindo do channel:", currentChannel);
    socketRef.current.emit("leave-channel", currentChannel);
    setCurrentChannel(null);
    currentChannelRef.current = null;
    setChannelDevices([]);
    setCategoryTotals([]);
    setMaxCategorySelections(DEFAULT_MAX_CATEGORY_SELECTIONS);
    setIsVotingClosed(false);
    setIsGameStarted(false);
    hasReconnectedRef.current = false;
    setForceLeaveInfo(null);
    setChannelRanking([]);
    setTotalQuestions(null);

    const session = loadSession();
    if (deviceId) {
      saveSession({
        deviceId,
        channelId: null,
        displayName: session?.displayName || null,
        lastConnected: Date.now(),
      });
    }
  }, [currentChannel, deviceId]);

  const disconnect = useCallback(() => {
    console.log("[Socket] Desconectando...");

    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }

    if (visibilityHandlerRef.current) {
      document.removeEventListener("visibilitychange", visibilityHandlerRef.current);
      visibilityHandlerRef.current = null;
    }

    const activeChannel = currentChannelRef.current;

    if (socketRef.current) {
      if (activeChannel) {
        socketRef.current.emit("leave-channel", activeChannel);
      }
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setCurrentChannel(null);
    currentChannelRef.current = null;
    setChannelDevices([]);
    setCategoryTotals([]);
    setMaxCategorySelections(DEFAULT_MAX_CATEGORY_SELECTIONS);
    setDeviceId(null);
    setForceLeaveInfo(null);
    setChannelRanking([]);
    setTotalQuestions(null);
    setIsGameStarted(false);
  }, []);

  useEffect(() => {
    console.log("[Socket] channelDevices state mudou:", channelDevices);
    console.log("[Socket] channelDevices.length:", channelDevices.length);
  }, [channelDevices]);

  const clearDeviceSession = useCallback(() => {
    console.log("[Socket] Limpando sessão do device...");
    clearSession();
    disconnect();
    hasReconnectedRef.current = false;
    setForceLeaveInfo(null);
  }, [disconnect]);

  const getStoredSession = useCallback(() => {
    return loadSession();
  }, []);

  const removeGuest = useCallback(
    (targetDeviceId: string) => {
      if (!socketRef.current?.connected || !currentChannel) {
        console.warn("[Socket] Não é possível remover convidado sem canal ativo.");
        return;
      }

      console.log("[Socket] Removendo convidado:", targetDeviceId);
      socketRef.current.emit("remove-device", {
        channelId: currentChannel,
        targetDeviceId,
      });
    },
    [currentChannel]
  );

  const updateReadyState = useCallback(
    (isReady: boolean) => {
      if (!socketRef.current?.connected || !currentChannel) {
        return;
      }

      socketRef.current.emit("update-ready-state", {
        channelId: currentChannel,
        isReady,
      });
    },
    [currentChannel]
  );

  const startGame = useCallback(
    (settings?: GameSettings) => {
      if (!socketRef.current?.connected || !currentChannel) {
        return;
      }

      socketRef.current.emit("start-game", {
        channelId: currentChannel,
        settings,
      });
    },
    [currentChannel]
  );

  const updateGameSettings = useCallback(
    (settings: GameSettings) => {
      if (!socketRef.current?.connected || !currentChannel) {
        return;
      }

      socketRef.current.emit("update-game-settings", {
        channelId: currentChannel,
        settings,
      });
    },
    [currentChannel]
  );

  const resetGameState = useCallback(() => {
    if (!socketRef.current?.connected || !currentChannel) {
      return;
    }

    console.log("[Socket] Resetando estado do jogo no servidor");
    socketRef.current.emit("reset-game", { channelId: currentChannel });
    // Don't set isGameStarted locally - wait for server broadcast via "game-reset" event
  }, [currentChannel]);

  const submitCategoryVote = useCallback(
    (categories: CategoryId[]) => {
      if (!socketRef.current?.connected || !currentChannel || isVotingClosed) {
        return;
      }

      socketRef.current.emit("update-category-vote", {
        channelId: currentChannel,
        categories,
      });
    },
    [currentChannel, isVotingClosed]
  );

  const closeCategoryVoting = useCallback(() => {
    if (!socketRef.current?.connected || !currentChannel) {
      return;
    }
    socketRef.current.emit("close-category-vote", { channelId: currentChannel });
  }, [currentChannel]);

  const loadQuestions = useCallback(
    (questions: Question[]) => {
      if (!socketRef.current || !currentChannel) {
        console.warn("[Socket] Cannot load questions: not connected or no channel");
        return;
      }
      socketRef.current.emit("load-questions", {
        channelId: currentChannel,
        questions,
      });
    },
    [currentChannel]
  );

  const notifyAnswerSelection = useCallback(
    (questionIndex: number) => {
      if (!socketRef.current || !currentChannel) {
        return;
      }
      socketRef.current.emit("guest-selected-answer", {
        channelId: currentChannel,
        questionIndex,
      });
    },
    [currentChannel]
  );

  const submitAnswer = useCallback(
    (questionIndex: number, answerIndex: number, timeSpent: number) => {
      if (!socketRef.current || !currentChannel) {
        console.warn("[Socket] Cannot submit answer: not connected or no channel");
        return;
      }
      socketRef.current.emit("submit-answer", {
        channelId: currentChannel,
        questionIndex,
        answerIndex,
        timeSpent,
      });
    },
    [currentChannel]
  );

  // Uses a power-up in the room's game: a disadvantage goes with the player it's used on
  const sendPowerUp = useCallback(
    (powerUpId: PowerUpId, targetDeviceId?: string) => {
      if (!socketRef.current || !currentChannel) {
        return;
      }
      socketRef.current.emit("use-power-up", {
        channelId: currentChannel,
        powerUpId,
        targetDeviceId,
      });
    },
    [currentChannel]
  );

  const nextQuestion = useCallback(() => {
    if (!socketRef.current || !currentChannel) {
      console.warn("[Socket] Cannot advance question: not connected or no channel");
      return;
    }
    socketRef.current.emit("next-question", { channelId: currentChannel });
  }, [currentChannel]);

  const clearForceLeaveInfo = useCallback(() => {
    setForceLeaveInfo(null);
  }, []);

  const clearChannelError = useCallback(() => {
    setChannelError(null);
  }, []);

  const selfRole = useMemo<DeviceRole>(() => {
    const selfInfo = channelDevices.find((device) => device.id === deviceId);
    return selfInfo?.role || "guest";
  }, [channelDevices, deviceId]);

  return {
    connect,
    disconnect,
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
    resetGameState,
    loadQuestions,
    notifyAnswerSelection,
    submitAnswer,
    sendPowerUp,
    nextQuestion,
    clearForceLeaveInfo,
    clearChannelError,
    isConnected,
    currentChannel,
    channelDevices,
    deviceId,
    totalDevices: channelDevices.length,
    selfRole,
    forceLeaveInfo,
    channelError,
    categoryTotals,
    maxCategorySelections,
    isVotingClosed,
    isGameStarted,
    gameState,
    gameSettings,
    channelRanking,
    totalQuestions,
    isShowingFeedback,
    setIsShowingFeedback,
    powerUpOutcomes,
    powerUpHand,
  };
};
