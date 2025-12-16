/* eslint-disable no-console */
/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

import { io, Socket } from "socket.io-client";

import type { CategoryId } from "@/constants/categories";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3001";
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

type ChannelUpdate = {
  channelId: string;
  devices: DeviceInfo[];
  totalDevices: number;
  adminId?: string | null;
  categoryTotals?: CategoryVoteSummary[];
  maxCategorySelections?: number;
  isVotingClosed?: boolean;
  isGameStarted?: boolean;
};

type DeviceSession = {
  deviceId: string;
  channelId: string | null;
  lastConnected: number;
  displayName?: string | null;
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
export const useSocket = () => {
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
  const [isGameStarted, setIsGameStarted] = useState(false);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityHandlerRef = useRef<(() => void) | null>(null);
  const hasReconnectedRef = useRef(false);
  const currentChannelRef = useRef<string | null>(null);
  const [forceLeaveInfo, setForceLeaveInfo] = useState<ForceLeaveInfo | null>(null);
  const [channelError, setChannelError] = useState<ChannelError | null>(null);

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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      auth: {
        deviceId: persistentDeviceId,
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
      setIsVotingClosed(Boolean(data.isVotingClosed));
      setIsGameStarted(Boolean(data.isGameStarted));
    });

    socket.on("game-started", (payload: { channelId: string }) => {
      console.log("[Socket] Game started for channel:", payload.channelId);
      setIsGameStarted(true);
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
    setIsGameStarted(false);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

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

  const startGame = useCallback(() => {
    if (!socketRef.current?.connected || !currentChannel) {
      return;
    }

    socketRef.current.emit("start-game", { channelId: currentChannel });
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
  };
};
