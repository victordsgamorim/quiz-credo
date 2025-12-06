import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';

const app = express();
const httpServer = createServer(app);

app.use(cors());

const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingInterval: 10000,
  pingTimeout: 5000,
  transports: ['websocket', 'polling']
});

const channels = new Map(); // channelId -> { adminId: string, devices: Set<string> }
const connectedDevices = new Map(); // deviceId -> device info
const socketToDevice = new Map();

const buildDevicePayload = (device) => ({
  id: device.id,
  connectedAt: device.connectedAt,
  channel: device.channel,
  isActive: device.isActive,
  socketId: device.socketId,
  role: device.role || 'guest',
  displayName: device.displayName || device.id
});

const getChannelDevices = (channelId) => {
  const channel = channels.get(channelId);
  if (!channel) {
    return [];
  }

  return Array.from(channel.devices)
    .map(id => connectedDevices.get(id))
    .filter(device => device != null)
    .map(buildDevicePayload);
};

const broadcastChannelUpdate = (channelId) => {
  const devices = getChannelDevices(channelId);
  const channel = channels.get(channelId);

  io.to(channelId).emit('channel-update', {
    channelId,
    devices,
    totalDevices: devices.length,
    adminId: channel?.adminId || null
  });
};

const removeDeviceFromChannel = (deviceId, reason, options = {}) => {
  const device = connectedDevices.get(deviceId);
  if (!device || !device.channel) {
    return;
  }

  const channelId = device.channel;
  const channel = channels.get(channelId);
  if (!channel) {
    device.channel = null;
    device.role = 'guest';
    return;
  }

  channel.devices.delete(deviceId);
  device.channel = null;
  device.role = 'guest';

  const socketInstance = io.sockets.sockets.get(device.socketId);
  if (socketInstance) {
    socketInstance.leave(channelId);
  }

  if (reason && device.socketId) {
    io.to(device.socketId).emit('force-leave-channel', {
      channelId,
      reason
    });
  }

  if (channel.devices.size === 0) {
    channels.delete(channelId);
  } else if (!options.suppressUpdate) {
    broadcastChannelUpdate(channelId);
  }
};

const forceCloseChannel = (channelId, reason, { notifyAdmin = false } = {}) => {
  const channel = channels.get(channelId);
  if (!channel) {
    return;
  }

  console.log(`[${new Date().toISOString()}] Force closing channel ${channelId} (reason: ${reason})`);
  const members = Array.from(channel.devices);

  members.forEach((deviceId) => {
    const shouldNotify = deviceId === channel.adminId ? notifyAdmin : true;
    removeDeviceFromChannel(deviceId, shouldNotify ? reason : undefined, { suppressUpdate: true });
  });

  channels.delete(channelId);
};

io.on('connection', (socket) => {
  const persistentDeviceId = socket.handshake.auth.deviceId || socket.id;

  console.log(`[${new Date().toISOString()}] Device connected: ${persistentDeviceId} (socket: ${socket.id})`);

  socketToDevice.set(socket.id, persistentDeviceId);

  connectedDevices.set(persistentDeviceId, {
    id: persistentDeviceId,
    socketId: socket.id,
    connectedAt: Date.now(),
    channel: null,
    isActive: true,
    role: 'guest',
    displayName: null
  });

  socket.on('join-channel', (channelId, deviceId, options = {}) => {
    const actualDeviceId = deviceId || persistentDeviceId;
    console.log(`[${new Date().toISOString()}] Device ${actualDeviceId} joining channel: ${channelId}`);

    const device = connectedDevices.get(actualDeviceId);
    if (!device) {
      console.warn(`[${new Date().toISOString()}] Unknown device tried to join: ${actualDeviceId}`);
      return;
    }

    const { displayName } = options || {};
    if (displayName && typeof displayName === 'string') {
      device.displayName = displayName.trim().substring(0, 50);
    }

    let channel = channels.get(channelId);
    if (!channel) {
      channel = {
        adminId: actualDeviceId,
        devices: new Set()
      };
      channels.set(channelId, channel);
      console.log(`[${new Date().toISOString()}] Channel ${channelId} created with admin ${actualDeviceId}`);
    }

    channel.devices.add(actualDeviceId);
    device.channel = channelId;
    device.socketId = socket.id;
    device.role = channel.adminId === actualDeviceId ? 'admin' : 'guest';

    socket.join(channelId);

    const channelDevices = getChannelDevices(channelId);

    console.log(
      `[${new Date().toISOString()}] Channel ${channelId} now has ${channelDevices.length} devices:`,
      channelDevices.map(d => `${d.id} (${d.role})`)
    );

    broadcastChannelUpdate(channelId);

    socket.emit('joined-channel', {
      channelId,
      deviceId: actualDeviceId,
      devices: channelDevices,
      adminId: channel.adminId
    });
  });

  socket.on('leave-channel', (channelId) => {
    const device = connectedDevices.get(persistentDeviceId);
    const activeChannel = device?.channel || channelId;

    if (!device || !activeChannel) {
      console.warn(`[${new Date().toISOString()}] Device ${persistentDeviceId} tried to leave but no active channel`);
      return;
    }

    console.log(`[${new Date().toISOString()}] Device ${persistentDeviceId} leaving channel: ${activeChannel}`);

    const channel = channels.get(activeChannel);
    if (channel && channel.adminId === persistentDeviceId) {
      forceCloseChannel(activeChannel, 'admin_left');
    } else {
      removeDeviceFromChannel(persistentDeviceId);
    }
  });

  socket.on('device-status', (status) => {
    const device = connectedDevices.get(persistentDeviceId);
    if (device) {
      device.isActive = status.isActive;

      if (device.channel) {
        broadcastChannelUpdate(device.channel);
      }
    }
  });

  socket.on('remove-device', ({ channelId, targetDeviceId }) => {
    if (!channelId || !targetDeviceId) {
      return;
    }

    const requester = connectedDevices.get(persistentDeviceId);
    const channel = channels.get(channelId);

    if (!requester || !channel || requester.channel !== channelId) {
      console.warn(`[${new Date().toISOString()}] Invalid remove-device attempt by ${persistentDeviceId}`);
      return;
    }

    if (channel.adminId !== persistentDeviceId) {
      console.warn(`[${new Date().toISOString()}] Device ${persistentDeviceId} tried to remove without admin role`);
      return;
    }

    if (targetDeviceId === channel.adminId || !channel.devices.has(targetDeviceId)) {
      return;
    }

    console.log(`[${new Date().toISOString()}] Admin ${persistentDeviceId} removing device ${targetDeviceId} from channel ${channelId}`);
    removeDeviceFromChannel(targetDeviceId, 'removed_by_admin');
  });

  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  socket.on('disconnect', () => {
    console.log(`[${new Date().toISOString()}] Socket disconnected: ${socket.id} (Device: ${persistentDeviceId})`);

    socketToDevice.delete(socket.id);

    const device = connectedDevices.get(persistentDeviceId);
    if (device) {
      device.isActive = false;

      if (device.channel) {
        const channel = channels.get(device.channel);
        if (channel && channel.adminId === persistentDeviceId) {
          forceCloseChannel(device.channel, 'admin_disconnected');
        } else {
          broadcastChannelUpdate(device.channel);
        }
      }

      setTimeout(() => {
        const stillConnected = connectedDevices.get(persistentDeviceId);
        if (stillConnected && !stillConnected.isActive && stillConnected.socketId === socket.id) {
          console.log(`[${new Date().toISOString()}] Removing inactive device: ${persistentDeviceId}`);

          if (stillConnected.channel) {
            const channel = channels.get(stillConnected.channel);
            if (channel && channel.adminId === persistentDeviceId) {
              forceCloseChannel(stillConnected.channel, 'admin_inactive_timeout');
            } else {
              removeDeviceFromChannel(persistentDeviceId);
            }
          }

          connectedDevices.delete(persistentDeviceId);
        }
      }, 600000); // 10 minutos (600000ms)
    }
  });
});

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
  const networkInterfaces = os.networkInterfaces();
  const addresses = [];

  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }

  console.log(`
╔══════════════════════════════════════════╗
║   Socket.IO Server Running               ║
║   Port: ${PORT}                            ║
║   Environment: Development               ║
╚══════════════════════════════════════════╝

📱 Acesse de outros dispositivos na rede:
${addresses.map(ip => `   http://${ip}:8080`).join('\n')}

🔌 Socket.IO Server:
   Local:   http://localhost:${PORT}
${addresses.map(ip => `   Network: http://${ip}:${PORT}`).join('\n')}

⚙️  Para usar em outros dispositivos, altere SOCKET_URL em:
   src/hooks/useSocket.ts
   De: http://localhost:3001
   Para: http://${addresses[0] || 'SEU_IP'}:3001
  `);
});

setInterval(() => {
  console.log(`[${new Date().toISOString()}] Active channels: ${channels.size}, Connected devices: ${connectedDevices.size}`);
}, 30000);
