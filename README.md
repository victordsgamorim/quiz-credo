# 🧠 Millionaire Brain Quiz

Um jogo de quiz multiplayer em tempo real inspirado no formato "Quem Quer Ser Milionário", onde múltiplos jogadores podem se conectar a uma sala de jogo, votar em categorias de perguntas e competir juntos.

## ✨ Características

- **🎮 Jogo Multiplayer em Tempo Real** - Múltiplos dispositivos se conectam à mesma sala
- **🗳️ Votação de Categorias** - Convidados votam em categorias enquanto o admin controla
- **📊 Pontuação em Tempo Real** - Acompanhamento dinâmico de scores
- **📱 Interface Responsiva** - Desktop e mobile otimizados
- **🎯 Chips de Categoria Inline** - Seleção direta de categorias no lobby (guest)
- **🔄 Sincronização em Tempo Real** - WebSocket para múltiplos jogadores

## 📁 Arquitetura do Projeto

```
src/
├── pages/
│   └── Index.tsx                    # Página principal (State Machine)
├── components/
│   ├── ui/                          # Componentes Shadcn/Radix UI
│   ├── lobby/                       # Tela de Lobby (refatorado)
│   │   ├── LobbyScreen.tsx          # Componente principal (~420 linhas)
│   │   ├── ConnectionStatusCard.tsx
│   │   ├── RoomOptionsCard.tsx
│   │   ├── ActiveRoomCard.tsx
│   │   ├── VotingControlCard.tsx
│   │   ├── ConnectedDevicesList.tsx
│   │   ├── CategoryChipsPanel.tsx   # Chips de categoria inline (guest)
│   │   ├── CategoryDrawer.tsx       # Painel com votação (admin)
│   │   ├── CategoryResultsDialog.tsx
│   │   ├── index.ts
│   │   └── README.md                # Documentação detalhada
│   └── quiz/                        # Componentes do Quiz
│       ├── StartScreen.tsx
│       ├── GameScreen.tsx
│       ├── ResultScreen.tsx
│       ├── QuestionCard.tsx
│       ├── AnswerOption.tsx
│       ├── ProgressBar.tsx
│       └── Timer.tsx
├── hooks/
│   ├── useSocket.ts                 # WebSocket e estado do jogo
│   ├── useQuiz.ts                   # State machine do quiz
│   ├── useMediaQuery.ts             # Hooks de responsive design
│   └── useCategoryStorage.ts        # Persistência localStorage
├── constants/
│   └── categories.ts                # Constantes centralizadas
├── lib/
│   └── utils.ts                     # Utilitários globais
└── App.tsx                          # Root component
```

## 🚀 Quick Start

### Pré-requisitos

- Node.js & npm (ou yarn/pnpm)

### Instalação

```bash
git clone <seu-repositorio>
cd millionaire-brain-quiz
npm install
```

### Configuração do Supabase

1. **Criar um projeto no Supabase**:
   - Acesse [https://app.supabase.com](https://app.supabase.com)
   - Crie um novo projeto
   - Aguarde a inicialização do projeto

2. **Configurar variáveis de ambiente**:
   - Copie o arquivo `.env.example` para `.env`:
     ```bash
     cp .env.example .env
     ```
   - Obtenha suas credenciais no dashboard do Supabase:
     - Project URL: Settings → API → Project URL
     - Anon Key: Settings → API → Project API keys → anon/public
   - Preencha as variáveis no arquivo `.env`:
     ```env
     VITE_SUPABASE_URL=https://seu-projeto.supabase.co
     VITE_SUPABASE_ANON_KEY=sua-chave-anon
     ```

3. **Verificar configuração**:
   - O cliente Supabase está disponível em `src/lib/supabase.ts`
   - Importe e use em qualquer componente:
     ```typescript
     import { supabase } from "@/lib/supabase";
     ```

### Desenvolvimento

```bash
# Terminal 1: Frontend (porta 5173)
npm run dev

# Terminal 2: Backend (porta 3000)
npm run server

# Ou ambos ao mesmo tempo
npm run dev:all
```

Acesse `http://localhost:5173`

### Build & Preview

```bash
npm run build      # Build para produção
npm run preview    # Preview do build
```

## 🎯 Fluxo da Aplicação

### State Machine Principal

```
Index.tsx (Controller)
    ↓
    ├─→ isInLobby = true
    │   └─→ LobbyScreen (Votação de Categorias)
    │
    ├─→ gameState.idle
    │   └─→ StartScreen (Aguardando início)
    │
    ├─→ gameState.playing
    │   └─→ GameScreen (Respondendo perguntas)
    │
    └─→ gameState.finished
        └─→ ResultScreen (Ranking final)
```

### 1. Lobby Screen 🎯

**Arquivos**: `src/components/lobby/*`

- Criar ou entrar em sala
- Sincronização de múltiplos dispositivos
- Admin vs Guest roles
- Votação de categorias
- Visualização em tempo real dos votos

**Componentes**:

- `ConnectionStatusCard` - Status de conexão
- `RoomOptionsCard` - Criar/entrar sala
- `ActiveRoomCard` - Código e compartilhamento
- `VotingControlCard` - Controle de votação (admin)
- `CategoryChipsPanel` - Chips de categorias inline (guest)
- `CategoryDrawer` - Painel de votação do admin
- `ConnectedDevicesList` - Lista de jogadores
- `CategoryResultsDialog` - Resultados finais

### 2. Start Screen ⏳

**Arquivo**: `src/components/quiz/StartScreen.tsx`

- Informações da sala
- Lista de categorias votadas
- Aguardar admin iniciar

### 3. Game Screen 🎮

**Arquivo**: `src/components/quiz/GameScreen.tsx`

- Exibição de perguntas
- Múltiplas escolhas
- Feedback em tempo real
- Progresso e pontuação

### 4. Result Screen 🏆

**Arquivo**: `src/components/quiz/ResultScreen.tsx`

- Ranking final
- Estatísticas individuais
- Opção para jogar novamente

## 🔧 Tecnologias

### Frontend

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Shadcn/UI** - Component library (Radix UI)
- **React Router** - Navegação
- **React Query** - State management
- **Socket.IO** - WebSocket
- **Supabase** - Backend as a Service (Database, Auth, Storage)

### Backend

- **Node.js + Express** (server.js)
- **Socket.IO** - Real-time communication
- **Supabase** - PostgreSQL database, authentication, real-time subscriptions

## 📚 Documentação Detalhada

- **[Componentes Lobby - README](./src/components/lobby/README.md)** - Arquitetura, flow, diagrama de sequência
- **Componentes Quiz** - Documentação em `src/components/quiz/README.md`
- **[Supabase Setup](./docs/SUPABASE_SETUP.md)** - RPC, RLS e redefinição de senha (`/reset-password`)

## 🎨 Design & Styling

- **Tailwind CSS** - Utility-first styling
- **Dark Mode** - Suporte nativo
- **Responsivo** - Mobile-first approach
- **Acessibilidade** - WCAG compliant (Radix UI)

## 🔌 Comunicação em Tempo Real

### Socket Events

**Client → Server**:

- `joinChannel` - Entrar em sala
- `submitCategoryVote` - Votar categoria
- `selectAnswer` - Selecionar resposta
- `submitAnswer` - Confirmar resposta
- `leaveChannel` - Sair da sala

**Server → Client**:

- `categoryVotesUpdated` - Votos atualizados
- `gameStarted` - Jogo iniciado
- `questionUpdated` - Nova pergunta
- `playerAnswered` - Jogador respondeu

## 💾 Persistência de Dados

### LocalStorage

- `channel-category-preferences` - Categorias por canal
- `device-session` - Device ID e nome

### Socket State

- Sincronização em tempo real via WebSocket

## 🎯 Refatoração Recente

**Lobby Screen** foi refatorado de **~1080 linhas** para **~420 linhas** através de:

1. ✅ Extração de componentes pequenos
2. ✅ Criação de hooks customizados
3. ✅ Centralização de constantes
4. ✅ Separação de responsabilidades

**Novos arquivos criados**:

- `useMediaQuery.ts` - Media queries customizadas
- `useCategoryStorage.ts` - Gerenciamento de localStorage
- 7 novos componentes modularizados

## 🧪 Hooks Customizados

### useSocket()

```tsx
const {
  isConnected,
  currentChannel,
  channelDevices,
  categoryTotals,
  joinChannel,
  leaveChannel,
  submitCategoryVote,
  // ... mais
} = useSocket();
```

### useQuiz()

```tsx
const {
  gameState,
  currentQuestion,
  startGame,
  selectAnswer,
  submitAnswer,
  // ... mais
} = useQuiz();
```

### useIsDesktop()

```tsx
const isDesktopView = useIsDesktop(); // (min-width: 768px)
```

### useCategoryStorage()

```tsx
const { loadStoredCategories, persistCategories, clearPersistedCategories } = useCategoryStorage();
```

## 🚀 Deploy

### Variáveis de Ambiente

Certifique-se de configurar as seguintes variáveis de ambiente em produção:

```env
# API Configuration
VITE_API_URL=https://seu-backend-producao.com

# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### Build & Deploy

```bash
npm run build
```

A pasta `dist/` contém os arquivos prontos para produção.

## 📝 Convenções de Código

| Padrão     | Exemplo                       |
| ---------- | ----------------------------- |
| Components | `ConnectionStatusCard`        |
| Hooks      | `useSocket`, `useQuiz`        |
| Types      | `src/types/game.ts`           |
| Constants  | `src/constants/categories.ts` |
| Paths      | `@/components/lobby`          |

## 🌟 Recursos Destacados

- ✅ **Chips de Categoria Inline** - Seleção direta no lobby (guest)
- ✅ **State Machine Robusta** - Controle completo do flow
- ✅ **Real-time Sync** - Múltiplos jogadores sincronizados
- ✅ **Type Safe** - TypeScript em todo o projeto
- ✅ **Responsive** - Mobile-first design
- ✅ **Acessível** - WCAG guidelines

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ e ☕
