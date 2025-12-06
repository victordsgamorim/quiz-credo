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

const channels = new Map();
const connectedDevices = new Map();
const socketToDevice = new Map();

io.on('connection', (socket) => {
  const persistentDeviceId = socket.handshake.auth.deviceId || socket.id;

  console.log(`[${new Date().toISOString()}] Device connected: ${persistentDeviceId} (socket: ${socket.id})`);

  socketToDevice.set(socket.id, persistentDeviceId);

  connectedDevices.set(persistentDeviceId, {
    id: persistentDeviceId,
    socketId: socket.id,
    connectedAt: Date.now(),
    channel: null,
    isActive: true
  });

  socket.on('join-channel', (channelId, deviceId) => {
    const actualDeviceId = deviceId || persistentDeviceId;
    console.log(`[${new Date().toISOString()}] Device ${actualDeviceId} joining channel: ${channelId}`);

    const device = connectedDevices.get(actualDeviceId);
    if (device) {
      device.channel = channelId;
      device.socketId = socket.id;
    }

    socket.join(channelId);

    if (!channels.has(channelId)) {
      channels.set(channelId, new Set());
    }
    channels.get(channelId).add(actualDeviceId);

    const channelDevices = Array.from(channels.get(channelId) || [])
      .map(id => connectedDevices.get(id))
      .filter(device => device != null)
      .map(device => ({
        id: device.id,
        connectedAt: device.connectedAt,
        channel: device.channel,
        isActive: device.isActive,
        socketId: device.socketId
      }));

    console.log(`[${new Date().toISOString()}] Channel ${channelId} now has ${channelDevices.length} devices:`, channelDevices.map(d => d.id));

    io.to(channelId).emit('channel-update', {
      channelId,
      devices: channelDevices,
      totalDevices: channelDevices.length
    });

    socket.emit('joined-channel', {
      channelId,
      deviceId: actualDeviceId,
      devices: channelDevices
    });
  });

  socket.on('leave-channel', (channelId) => {
    console.log(`[${new Date().toISOString()}] Device ${persistentDeviceId} leaving channel: ${channelId}`);

    const device = connectedDevices.get(persistentDeviceId);
    if (device) {
      device.channel = null;
    }

    socket.leave(channelId);

    if (channels.has(channelId)) {
      channels.get(channelId).delete(persistentDeviceId);

      const channelDevices = Array.from(channels.get(channelId) || [])
        .map(id => connectedDevices.get(id))
        .filter(device => device != null)
        .map(device => ({
          id: device.id,
          connectedAt: device.connectedAt,
          channel: device.channel,
          isActive: device.isActive,
          socketId: device.socketId
        }));

      io.to(channelId).emit('channel-update', {
        channelId,
        devices: channelDevices,
        totalDevices: channelDevices.length
      });
    }
  });

  socket.on('device-status', (status) => {
    const device = connectedDevices.get(persistentDeviceId);
    if (device) {
      device.isActive = status.isActive;

      if (device.channel) {
        const channelDevices = Array.from(channels.get(device.channel) || [])
          .map(id => connectedDevices.get(id))
          .filter(device => device != null)
          .map(device => ({
            id: device.id,
            connectedAt: device.connectedAt,
            channel: device.channel,
            isActive: device.isActive,
            socketId: device.socketId
          }));

        io.to(device.channel).emit('channel-update', {
          channelId: device.channel,
          devices: channelDevices,
          totalDevices: channelDevices.length
        });
      }
    }
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
        const channelDevices = Array.from(channels.get(device.channel) || [])
          .map(id => connectedDevices.get(id))
          .filter(device => device != null)
          .map(device => ({
            id: device.id,
            connectedAt: device.connectedAt,
            channel: device.channel,
            isActive: device.isActive,
            socketId: device.socketId
          }));

        io.to(device.channel).emit('channel-update', {
          channelId: device.channel,
          devices: channelDevices,
          totalDevices: channelDevices.length
        });
      }

      setTimeout(() => {
        const stillConnected = connectedDevices.get(persistentDeviceId);
        if (stillConnected && !stillConnected.isActive && stillConnected.socketId === socket.id) {
          console.log(`[${new Date().toISOString()}] Removing inactive device: ${persistentDeviceId}`);

          if (stillConnected.channel && channels.has(stillConnected.channel)) {
            channels.get(stillConnected.channel).delete(persistentDeviceId);

            const channelDevices = Array.from(channels.get(stillConnected.channel) || [])
              .map(id => connectedDevices.get(id))
              .filter(device => device != null)
              .map(device => ({
                id: device.id,
                connectedAt: device.connectedAt,
                channel: device.channel,
                isActive: device.isActive,
                socketId: device.socketId
              }));

            io.to(stillConnected.channel).emit('channel-update', {
              channelId: stillConnected.channel,
              devices: channelDevices,
              totalDevices: channelDevices.length
            });

            if (channels.get(stillConnected.channel).size === 0) {
              channels.delete(stillConnected.channel);
              console.log(`[${new Date().toISOString()}] Channel ${stillConnected.channel} deleted (no devices)`);
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
