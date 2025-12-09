# 🌐 Acessar de Outros Dispositivos na Rede Local

Este guia mostra como acessar o aplicativo de outros dispositivos (celular, tablet, outro computador) na mesma rede WiFi.

## 📋 Passo a Passo

### 1. Inicie o Servidor

```bash
npm run dev:all
```

### 2. Encontre seu IP Local

Quando o servidor iniciar, ele mostrará automaticamente os IPs disponíveis:

```
📱 Acesse de outros dispositivos na rede:
   http://192.168.1.100:5173

🔌 Socket.IO Server:
   Local:   http://localhost:3001
   Network: http://192.168.1.100:3001
```

**Ou encontre manualmente:**

**macOS/Linux:**

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**

```bash
ipconfig
```

Procure por algo como `192.168.1.x` ou `10.0.0.x`

### 3. Configure o Socket.IO para Rede Local

Edite o arquivo [`src/hooks/useSocket.ts`](src/hooks/useSocket.ts):

```typescript
// Linha 4 - Altere de:
const SOCKET_URL = "http://localhost:3001";

// Para (use seu IP):
const SOCKET_URL = "http://192.168.1.100:3001";
```

### 4. Acesse de Outro Dispositivo

No celular/tablet/outro computador **na mesma rede WiFi**:

```
http://192.168.1.100:8080
```

(Use o IP que apareceu no seu terminal)

## 🔥 Firewall

Se não conseguir conectar, verifique o firewall:

**macOS:**

- Vá em Preferências do Sistema → Segurança e Privacidade → Firewall
- Permita conexões para Node.js

**Windows:**

- Procure por "Firewall do Windows Defender"
- Permitir um aplicativo → Adicionar Node.js

**Linux:**

```bash
sudo ufw allow 3001
sudo ufw allow 8080
```

## 🧪 Testar Conexão

### Do Outro Dispositivo:

1. Teste se consegue acessar: `http://SEU_IP:8080`
2. Abra o Console do navegador (F12)
3. Procure por logs do Socket.IO:
   ```
   [Socket] Conectado! Socket ID: abc123 Device ID: device_xyz
   ```

## ⚙️ Voltar para Localhost

Quando terminar os testes, volte a configuração:

```typescript
// src/hooks/useSocket.ts linha 4
const SOCKET_URL = "http://localhost:3001";
```

## 🎮 Exemplo de Uso

### Cenário: Testar com 2 Celulares

1. **Computador**: Roda `npm run dev:all`
2. **Computador**: Anota o IP (ex: `192.168.1.100`)
3. **Computador**: Altera `SOCKET_URL` para `http://192.168.1.100:3001`
4. **Celular 1**: Acessa `http://192.168.1.100:8080`
5. **Celular 1**: Entra no canal `TESTE123`
6. **Celular 2**: Acessa `http://192.168.1.100:8080`
7. **Celular 2**: Entra no canal `TESTE123`
8. **Resultado**: Ambos veem um ao outro na lista de dispositivos!

## 📝 Notas Importantes

- ✅ Todos os dispositivos devem estar na **mesma rede WiFi**
- ✅ O servidor aceita conexões de qualquer IP da rede local
- ✅ O CORS já está configurado para aceitar qualquer origem
- ✅ A porta 8080 é usada pelo Vite (frontend)
- ✅ A porta 3001 é usada pelo Socket.IO (backend)
- ❌ Não funcionará em redes móveis (4G/5G)
- ❌ Não funcionará se estiver usando VPN

## 🐛 Troubleshooting

### Erro: "Failed to connect to socket"

- Verifique se alterou o `SOCKET_URL` corretamente
- Verifique se o firewall não está bloqueando
- Teste fazer ping: `ping 192.168.1.100`

### Erro: "This site can't be reached"

- Verifique se está na mesma rede WiFi
- Verifique se digitou o IP corretamente
- Tente acessar `http://SEU_IP:8080` primeiro

### Dispositivos não aparecem no canal

- Abra o console (F12) e veja os logs
- Verifique se ambos estão usando o mesmo `SOCKET_URL`
- Tente sair e entrar no canal novamente
