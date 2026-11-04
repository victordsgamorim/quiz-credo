# Access from Other Devices on the Local Network

This guide shows how to open the app from other devices (phone, tablet, another computer) on the
same WiFi network.

## Step by Step

### 1. Start the Frontend and the Realtime Server

```bash
npm run dev
```

The frontend runs on port `8080` and listens on every network interface (`host: "::"` in
`vite.config.ts`). The Socket.IO server (`quiz-credo-server`, a separate repository) runs on port
`3001`; start it from its own folder with `npm run dev`.

### 2. Find Your Local IP

**macOS/Linux:**

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**

```bash
ipconfig
```

Look for something like `192.168.1.x` or `10.0.0.x`.

### 3. Point the Frontend to the Socket Server

The frontend reads the server's address from `VITE_SOCKET_URL` (see `.env.example`), and falls back
to `http://localhost:3001` when it is not set. Other devices can't reach your `localhost`, so set it
to your IP in `.env`:

```bash
VITE_SOCKET_URL=http://192.168.1.100:3001
```

Restart `npm run dev` after changing it. Start the socket server with `FRONTEND_URL` set to the
address the devices open (`http://192.168.1.100:8080`) if it restricts the allowed origins.

### 4. Open the App from Another Device

On the phone/tablet/other computer, **on the same WiFi network**:

```
http://192.168.1.100:8080
```

(Use the IP you found in step 2.)

## Firewall

If the devices can't connect, check the firewall:

**macOS:**

- System Settings → Network → Firewall
- Allow incoming connections for Node.js

**Windows:**

- Search for "Windows Defender Firewall"
- Allow an app → add Node.js

**Linux:**

```bash
sudo ufw allow 3001
sudo ufw allow 8080
```

## Testing the Connection

On the other device:

1. Check that `http://YOUR_IP:8080` opens.
2. Open the browser console (F12).
3. Look for the Socket.IO logs, such as:
   ```
   [Socket] Connected! Socket ID: abc123 Device ID: device_xyz
   ```

## Going Back to Localhost

When you're done, remove `VITE_SOCKET_URL` from `.env` (or set it back to `http://localhost:3001`)
and restart `npm run dev`.

## Example: Testing with 2 Phones

1. **Computer**: runs the frontend (`npm run dev`) and the socket server.
2. **Computer**: note the IP (for example `192.168.1.100`).
3. **Computer**: set `VITE_SOCKET_URL=http://192.168.1.100:3001` in `.env` and restart the frontend.
4. **Computer**: sign in as the admin and create a room (creating a room needs a login).
5. **Phone 1**: open `http://192.168.1.100:8080`, tap "Join Room", enter the room code and a name.
6. **Phone 2**: do the same with the same room code.
7. **Result**: both guests (and the admin) see each other in the list of connected devices.

## Notes

- All devices must be on the **same WiFi network**.
- Port `8080` is used by Vite (frontend) and port `3001` by Socket.IO (backend).
- It won't work over mobile networks (4G/5G), or if a VPN is on.
- Joining by link works on the network too: `http://192.168.1.100:8080/join/<ROOM CODE>` (the room's
  QR code uses the address the admin opened the app from, so open it with the IP, not `localhost`).

## Troubleshooting

### Error: "Failed to connect to socket"

- Check that `VITE_SOCKET_URL` has your IP, and that you restarted the frontend.
- Check that the firewall isn't blocking port `3001`.
- Try pinging the computer: `ping 192.168.1.100`

### Error: "This site can't be reached"

- Check that the device is on the same WiFi network.
- Check that the IP is typed correctly.
- Try opening `http://YOUR_IP:8080` first.

### Devices don't show up in the room

- Open the console (F12) and read the logs.
- Check that every device loaded the app from the same address and the same socket server.
- Try leaving and joining the room again.
