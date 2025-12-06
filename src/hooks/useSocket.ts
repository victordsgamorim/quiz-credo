import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';
const STORAGE_KEY = 'socket-device-session';

interface DeviceInfo {
  id: string;
  connectedAt: number;
  channel: string | null;
  isActive: boolean;
  socketId?: string;
}

interface ChannelUpdate {
  channelId: string;
  devices: DeviceInfo[];
  totalDevices: number;
}

interface DeviceSession {
  deviceId: string;
  channelId: string | null;
  lastConnected: number;
}

const generateDeviceId = (): string => {
  return `device_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
};

const loadSession = (): DeviceSession | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveSession = (session: DeviceSession): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('[Socket] Erro ao salvar sessão:', error);
  }
};

const clearSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[Socket] Erro ao limpar sessão:', error);
  }
};

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [channelDevices, setChannelDevices] = useState<DeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityHandlerRef = useRef<(() => void) | null>(null);
  const hasReconnectedRef = useRef(false);
  const currentChannelRef = useRef<string | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    const session = loadSession();
    let persistentDeviceId = session?.deviceId;

    if (!persistentDeviceId) {
      persistentDeviceId = generateDeviceId();
      console.log('[Socket] Novo device ID gerado:', persistentDeviceId);
    } else {
      console.log('[Socket] Device ID recuperado do cache:', persistentDeviceId);
    }

    console.log('[Socket] Iniciando conexão...');

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      auth: {
        deviceId: persistentDeviceId,
      },
    });

    socket.on('connect', () => {
      console.log('[Socket] Conectado! Socket ID:', socket.id, 'Device ID:', persistentDeviceId);
      setIsConnected(true);
      setDeviceId(persistentDeviceId);

      saveSession({
        deviceId: persistentDeviceId!,
        channelId: session?.channelId || null,
        lastConnected: Date.now(),
      });

      if (session?.channelId && !hasReconnectedRef.current) {
        console.log('[Socket] Retomando canal anterior:', session.channelId);
        hasReconnectedRef.current = true;
        setTimeout(() => {
          socket.emit('join-channel', session.channelId, persistentDeviceId);
        }, 500);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Desconectado:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Erro de conexão:', error);
    });

    socket.on('joined-channel', (data) => {
      console.log('[Socket] Entrou no channel:', data);
      console.log('[Socket] Devices recebidos:', data.devices);
      console.log('[Socket] Total de devices:', data.devices?.length || 0);
      setCurrentChannel(data.channelId);
      currentChannelRef.current = data.channelId;
      setChannelDevices(data.devices || []);
    });

    socket.on('channel-update', (data: ChannelUpdate) => {
      console.log('[Socket] Atualização do channel:', data);
      console.log('[Socket] Devices atualizados:', data.devices);
      console.log('[Socket] Total de devices:', data.devices?.length || 0);
      setChannelDevices(data.devices || []);
    });

    socket.on('pong', (data) => {
      console.log('[Socket] Pong recebido:', data);
    });

    socketRef.current = socket;

    startKeepAlive();
    setupVisibilityHandler();
  }, []);

  const startKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
    }

    keepAliveIntervalRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('ping');
      }
    }, 15000);
  }, []);

  const setupVisibilityHandler = useCallback(() => {
    const handleVisibilityChange = () => {
      const isActive = !document.hidden;
      console.log('[Socket] Visibilidade mudou:', isActive ? 'ativa' : 'background');

      if (socketRef.current?.connected) {
        socketRef.current.emit('device-status', { isActive });
      }

      if (isActive && !socketRef.current?.connected) {
        console.log('[Socket] Reconectando após voltar para foreground...');
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    visibilityHandlerRef.current = handleVisibilityChange;

    const handleBeforeUnload = () => {
      const activeChannel = currentChannelRef.current;
      if (socketRef.current && activeChannel) {
        socketRef.current.emit('leave-channel', activeChannel);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [connect]);

  const joinChannel = useCallback((channelId: string) => {
    if (!socketRef.current?.connected) {
      console.error('[Socket] Não conectado. Conectando...');
      connect();
      setTimeout(() => {
        if (socketRef.current?.connected && deviceId) {
          socketRef.current.emit('join-channel', channelId, deviceId);
        }
      }, 1000);
      return;
    }

    console.log('[Socket] Entrando no channel:', channelId);
    socketRef.current.emit('join-channel', channelId, deviceId);

    const session = loadSession();
    if (session && deviceId) {
      saveSession({
        ...session,
        channelId,
        lastConnected: Date.now(),
      });
    }
  }, [connect, deviceId]);

  const leaveChannel = useCallback(() => {
    if (!socketRef.current?.connected || !currentChannel) {
      return;
    }

    console.log('[Socket] Saindo do channel:', currentChannel);
    socketRef.current.emit('leave-channel', currentChannel);
    setCurrentChannel(null);
    currentChannelRef.current = null;
    setChannelDevices([]);
    hasReconnectedRef.current = false;

    const session = loadSession();
    if (session && deviceId) {
      saveSession({
        ...session,
        channelId: null,
        lastConnected: Date.now(),
      });
    }
  }, [currentChannel, deviceId]);

  const disconnect = useCallback(() => {
    console.log('[Socket] Desconectando...');

    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }

    if (visibilityHandlerRef.current) {
      document.removeEventListener('visibilitychange', visibilityHandlerRef.current);
      visibilityHandlerRef.current = null;
    }

    const activeChannel = currentChannelRef.current;

    if (socketRef.current) {
      if (activeChannel) {
        socketRef.current.emit('leave-channel', activeChannel);
      }
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setCurrentChannel(null);
    currentChannelRef.current = null;
    setChannelDevices([]);
    setDeviceId(null);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  useEffect(() => {
    console.log('[Socket] channelDevices state mudou:', channelDevices);
    console.log('[Socket] channelDevices.length:', channelDevices.length);
  }, [channelDevices]);

  const clearDeviceSession = useCallback(() => {
    console.log('[Socket] Limpando sessão do device...');
    clearSession();
    disconnect();
    hasReconnectedRef.current = false;
  }, [disconnect]);

  const getStoredSession = useCallback(() => {
    return loadSession();
  }, []);

  return {
    connect,
    disconnect,
    joinChannel,
    leaveChannel,
    clearDeviceSession,
    getStoredSession,
    isConnected,
    currentChannel,
    channelDevices,
    deviceId,
    totalDevices: channelDevices.length,
  };
};
