# Millionaire Brain Quiz - Agent Coding Guidelines

This file guides coding agents and developers working on the Millionaire Brain Quiz project. It defines project structure, build/test commands, and coding conventions so automated tools can reason about the repository safely and correctly.

## Project Overview

Millionaire Brain Quiz (QuizCredo) is a full-stack multiplayer real-time quiz game combining React/TypeScript frontend with Node.js/Express backend. The application features a state-machine-driven UI, WebSocket-based multiplayer synchronization, and responsive design. Players join rooms, vote on quiz categories, compete in timed 60-second rounds, and track scores via localStorage.

## Project Structure & Module Organization

The codebase is organized as a **monolithic full-stack application** with clear frontend/backend separation:

```
millionaire-brain-quiz/
├── src/                              # Frontend source (React + TypeScript)
│   ├── pages/                        # Route-level components
│   │   ├── Index.tsx                 # Main state machine controller
│   │   └── NotFound.tsx              # 404 fallback
│   │
│   ├── components/
│   │   ├── quiz/                     # Quiz game flow (7 components)
│   │   │   ├── GameScreen.tsx        # Main playing screen
│   │   │   ├── StartScreen.tsx       # Category selection
│   │   │   ├── ResultScreen.tsx      # Final scoring
│   │   │   ├── QuestionCard.tsx      # Question renderer
│   │   │   ├── AnswerOption.tsx      # Single answer option
│   │   │   ├── ProgressBar.tsx       # Question progress
│   │   │   └── Timer.tsx             # 60-second countdown
│   │   │
│   │   ├── lobby/                    # Multiplayer lobby (10 components)
│   │   │   ├── LobbyScreen.tsx       # Main lobby controller
│   │   │   ├── RoomOptionsCard.tsx   # Create/join UI
│   │   │   ├── ActiveRoomCard.tsx    # Room code display
│   │   │   ├── VotingControlCard.tsx # Admin controls
│   │   │   ├── ConnectedDevicesList.tsx
│   │   │   ├── CategoryDrawer.tsx    # Voting interface
│   │   │   ├── CategoryResultsDialog.tsx
│   │   │   ├── ConnectionStatusCard.tsx
│   │   │   ├── index.ts              # Barrel exports
│   │   │   └── README.md             # Lobby documentation
│   │   │
│   │   └── ui/                       # Shadcn/UI components (26 files)
│   │       └── Radix UI primitives + custom wrappers
│   │
│   ├── hooks/                        # Custom React hooks (8 files)
│   │   ├── useSocket.ts              # WebSocket + room sync
│   │   ├── useQuiz.ts                # Game state machine
│   │   ├── useTimer.ts               # 60-second countdown
│   │   ├── useMediaQuery.ts          # Responsive breakpoints
│   │   ├── useMobile.tsx             # Mobile detection
│   │   ├── useCategoryStorage.ts     # localStorage management
│   │   └── useToast.ts               # Toast notifications
│   │
│   ├── types/
│   │   └── quiz.ts                   # Core interfaces
│   │       ├── Question
│   │       ├── GameState
│   │       ├── AnswerRecord
│   │       ├── PlayerHistory
│   │       └── GameResult
│   │
│   ├── constants/
│   │   └── categories.ts             # 20 quiz category options
│   │
│   ├── data/
│   │   └── questions.ts              # 10 hardcoded quiz questions
│   │
│   ├── lib/
│   │   └── utils.ts                  # Tailwind class merger (cn)
│   │
│   ├── App.tsx                       # Root component with routing
│   ├── main.tsx                      # React entry point
│   └── index.css                     # Global styles
│
├── server.js                          # Express + Socket.IO backend
├── index.html                         # HTML entry point
├── vite.config.ts                     # Vite build config
├── tsconfig.json                      # TypeScript base config
├── tsconfig.app.json                  # App-specific TypeScript
├── tsconfig.node.json                 # Build tools TypeScript
├── package.json                       # Dependencies + scripts
├── tailwind.config.ts                 # Tailwind configuration
├── postcss.config.js                  # PostCSS + Tailwind
├── eslint.config.js                   # ESLint rules (flat config)
├── .prettierrc.json                   # Prettier formatting rules
├── .prettierignore                    # Prettier exclusions
├── .pre-commit-config.yaml            # Pre-commit hooks
├── .pre-commit-hooks/                 # Custom hook scripts
│   └── validate-hook-names.sh         # Enforce camelCase hooks
├── .github/workflows/                 # GitHub Actions CI/CD
│   └── lint.yml                       # Lint + format checks
├── LINT_SETUP.md                      # Linting setup guide
├── REDE_LOCAL.md                      # Local network setup
├── README.md                          # Project overview
└── AGENT.md                           # This file
```

### Architecture Layers

**Frontend (React + Vite):**

- Page layer (state machine in Index.tsx)
- Component layer (quiz screens, lobby, UI primitives)
- Hook layer (game logic, WebSocket, storage)
- Type layer (interfaces in types/quiz.ts)

**Backend (Node.js + Express):**

- HTTP server on port 3001
- Socket.IO for real-time communication
- Room management (channels)
- Category voting aggregation
- Device tracking and synchronization

**Data Flow:**

```
User Input → Component → Hook (useQuiz/useSocket) → State Update → Re-render
                ↓
           localStorage / Socket.IO → Backend (server.js)
                ↓
           Other devices / Leaderboard
```

## Build, Test, and Development Commands

### Core Development Commands

```bash
# Start frontend dev server (Vite, port 8080)
npm run dev

# Start backend server (Express + Socket.IO, port 3001)
npm run server

# Start both in parallel (recommended)
npm run dev:all

# Production build
npm run build

# Development build
npm run build:dev

# Preview production build
npm run preview
```

### Code Quality Commands

```bash
# Check code with ESLint
npm run lint

# Fix lint errors automatically
npm run lint:fix

# Check formatting with Prettier
npm run format:check

# Format all files
npm run format

# Run all pre-commit hooks
npm run pre-commit
```

### Typical Development Workflow

1. **Local Development:**

   ```bash
   npm run dev:all
   # Frontend: http://localhost:8080
   # Backend: http://localhost:3001
   ```

2. **Before Committing:**

   ```bash
   npm run format
   npm run lint:fix
   git add .
   git commit -m "feat: add new feature"
   # Pre-commit hooks run automatically
   ```

3. **Pre-Push Quality Check:**
   ```bash
   npm run lint
   npm run format:check
   npm run pre-commit
   ```

## Coding Style & Naming Conventions

### TypeScript & React Standards

- **Language:** TypeScript 5.8+ with strict mode encouraged
- **Indentation:** 2 spaces (enforced by Prettier)
- **Quote Style:** Double quotes (enforced by Prettier)
- **Line Length:** 100 characters (Prettier default)
- **Semicolons:** Required (enforced by Prettier)

### File & Function Naming

| Category          | Convention               | Example                                    |
| ----------------- | ------------------------ | ------------------------------------------ |
| React Components  | PascalCase               | `GameScreen.tsx`, `AnswerOption.tsx`       |
| Custom Hooks      | **camelCase** (enforced) | `useSocket.ts`, `useQuiz.ts`               |
| Utility Functions | camelCase                | `cn()`, `getShuffledQuestions()`           |
| Constants         | UPPER_SNAKE_CASE         | `SOCKET_URL`, `GAME_STATES`                |
| Types/Interfaces  | PascalCase               | `Question`, `GameState`, `PlayerHistory`   |
| Directories       | kebab-case or PascalCase | `src/components`, `src/hooks`, `src/types` |
| Local Variables   | camelCase                | `selectedAnswer`, `currentQuestion`        |

### Hook Naming Rules

⚠️ **All custom hooks MUST be camelCase starting with "use"**

- ✅ Correct: `useSocket`, `useQuiz`, `useTimer`, `useMobile`
- ❌ Incorrect: `use-socket`, `use-quiz`, `socket-hook`

**Pre-commit validation:** A custom hook (`validate-hook-names.sh`) prevents kebab-case hook files from being committed.

### Component Structure

Follow this structure for React components:

```tsx
// 1. Imports
import { useState } from "react";

// 2. Type definitions (if needed)
interface ComponentProps {
  title: string;
  onSubmit: (value: string) => void;
}

// 3. Component declaration
export const MyComponent = ({ title, onSubmit }: ComponentProps) => {
  // 4. Hooks
  const [state, setState] = useState("");

  // 5. Handlers
  const handleClick = () => {
    onSubmit(state);
  };

  // 6. Render
  return <button onClick={handleClick}>{title}</button>;
};
```

### Hook Creation Guidelines

Custom hooks should:

- Return object with named exports (not array)
- Start with `use` prefix
- Separate concerns (one hook = one responsibility)
- Document return types with JSDoc
- Use TypeScript interfaces for complex return objects

```tsx
// ✅ Good
export const useQuiz = () => {
  return {
    gameState,
    currentQuestion,
    selectedAnswer,
    startGame: (playerName: string) => void,
    selectAnswer: (index: number) => void,
    submitAnswer: (timeSpent: number) => void,
  };
};

// ❌ Avoid: Array returns, unclear naming
export const useQuizHook = () => {
  return [gameState, startGame, selectAnswer];
};
```

### Code Organization Rules

1. **Imports grouped by type:**

   ```tsx
   // React + third-party
   import { useState } from "react";
   import { useNavigate } from "react-router-dom";

   // Internal utils
   import { useQuiz } from "@/hooks/useQuiz";
   import { cn } from "@/lib/utils";

   // Types
   import { GameState } from "@/types/quiz";
   ```

2. **Barrel exports** (index.ts) for component groups:

   ```tsx
   // src/components/lobby/index.ts
   export { LobbyScreen } from "./LobbyScreen";
   export { RoomOptionsCard } from "./RoomOptionsCard";
   export { ActiveRoomCard } from "./ActiveRoomCard";
   ```

3. **Props interfaces** co-located with components:

   ```tsx
   interface QuestionCardProps {
     question: Question;
     selectedAnswer: number | null;
     onSelectAnswer: (index: number) => void;
   }

   export const QuestionCard = ({
     question,
     selectedAnswer,
     onSelectAnswer,
   }: QuestionCardProps) => {
     // ...
   };
   ```

## Code Review Guidance for Agents

### Objective

When reviewing code changes, ensure they maintain project quality standards, architectural consistency, and developer experience. Reviews should facilitate progress while preserving long-term maintainability.

### Review Scope

Agents must evaluate the following aspects of every PR:

#### 1. Architecture & Design Patterns

- ✅ Changes respect component/hook separation of concerns
- ✅ State management logic lives in hooks (`useSocket`, `useQuiz`)
- ✅ Components remain focused on rendering
- ✅ No direct backend calls from components (use hooks)
- ✅ Socket.IO integration flows through `useSocket` hook
- ⚠️ Flag: Direct API calls, business logic in components, state prop drilling

#### 2. TypeScript Compliance

- ✅ All function parameters typed
- ✅ Return types specified or inferred correctly
- ✅ Interface definitions in `types/quiz.ts`
- ✅ No use of `any` type (use `unknown` if necessary)
- ⚠️ Flag: `any` types, untyped callbacks, missing interface exports

#### 3. Hook Naming & Conventions

- ✅ Custom hooks named `use*` in camelCase
- ✅ Hook files in `src/hooks/` directory
- ✅ Pre-commit validates naming
- ⚠️ Flag: `use-kebab-case`, hooks in wrong directory

#### 4. Code Quality & Readability

- ✅ Variable names descriptive (`currentQuestion` not `q`)
- ✅ Functions single-responsibility
- ✅ Repeated code extracted to helpers
- ✅ Clear component hierarchies (avoid deep nesting)
- ✅ Comments explain "why", not "what"
- ⚠️ Flag: 3+ similar code blocks, unclear variable names, complex conditionals

#### 5. State Management

- ✅ Game state through `useQuiz` hook
- ✅ Real-time sync through `useSocket` hook
- ✅ UI state in component useState (OK for local UI)
- ✅ Persistent data in localStorage via `useCategoryStorage`
- ⚠️ Flag: Redux/Context added without justification, state duplication

#### 6. Testing & Error Handling

- ✅ Error states handled gracefully
- ✅ WebSocket disconnects managed (useSocket)
- ✅ Null checks for optional data
- ✅ Edge cases: empty arrays, 0 values, falsy checks
- ⚠️ Flag: Missing error boundaries, unhandled socket errors, silent failures

#### 7. Performance Considerations

- ✅ useCallback/useMemo used for expensive operations
- ✅ No unnecessary re-renders (dependency arrays correct)
- ✅ Images optimized / lazy-loaded
- ✅ Socket event handlers cleaned up (unsubscribe)
- ⚠️ Flag: Missing cleanup functions, infinite loops, frequent re-renders

#### 8. Accessibility & Responsive Design

- ✅ Semantic HTML used
- ✅ ARIA labels where necessary (Shadcn handles most)
- ✅ Mobile-responsive (tested via `useMediaQuery`)
- ✅ Keyboard navigation support
- ⚠️ Flag: Color-only differentiation, missing alt text, untested on mobile

#### 9. Code Formatting & Linting

- ✅ Prettier formatting applied (`npm run format`)
- ✅ ESLint passes (`npm run lint`)
- ✅ No console.log in production code (warn/error OK)
- ✅ No debugger statements
- ⚠️ Flag: Lint errors, formatting inconsistencies, stray logs

### PR Metadata Review

Validate metadata compliance:

#### Title Format

```
<Ticket/Issue Number>: <One-line Summary>

Examples:
- "feat: add multiplayer room voting"
- "fix: resolve socket reconnection lag"
- "docs: update API documentation"
- "chore: upgrade dependencies"
```

#### Branch Naming

```
<github-username>/<ticket-number>-<short-summary>

Example: victor/QUIZ-42-add-voting-feature
```

#### Commit Message Format

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting/linting
- `refactor:` - Code restructuring
- `chore:` - Dependencies, build config
- `test:` - Test additions/changes

### AI-Specific Code Review Conduct

- ✅ Evaluate own output critically; verify against actual code
- ✅ Never auto-resolve AI-generated comments—require human confirmation
- ✅ Post summary as separate comment, never edit author's PR description
- ✅ Limit analysis to visible code, PR description, and linked issues
- ✅ State uncertainty explicitly ("This may depend on…")
- ✅ Avoid commenting on auto-generated files or excluded directories

### Review Philosophy

- 🎯 Prioritize continuous improvement over exhaustive perfection
- 👥 Use reviews as mentorship opportunities; explain reasoning
- 🚀 Support delivery without sacrificing long-term quality
- 🤝 Treat reviews as collaborative, not gatekeeping

## Environment & Toolchain

### Node.js & Package Manager

- **Node.js:** 18.x LTS or higher recommended
- **npm:** 9.x or higher (bundled with Node.js)
- **Package Installation:** `npm install` from project root

### Build & Development Tools

| Tool            | Version | Purpose                 |
| --------------- | ------- | ----------------------- |
| **Vite**        | 5.4.19  | Build tool & dev server |
| **React**       | 18.3.1  | UI framework            |
| **TypeScript**  | 5.8.3   | Type checking           |
| **ESLint**      | 9.32.0  | Code linting            |
| **Prettier**    | 3.7.4   | Code formatting         |
| **TailwindCSS** | 3.4.17  | Styling                 |
| **Shadcn/UI**   | Latest  | Component library       |

### Frontend Stack

```json
{
  "@vitejs/plugin-react-swc": "^3.11.0", // Fast React compilation
  "react": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "react-query": "^5.83.0",
  "@radix-ui/*": "Latest", // Accessibility primitives
  "tailwindcss": "^3.4.17",
  "typescript": "^5.8.3",
  "socket.io-client": "^4.8.1",
  "zod": "^3.25.76" // Schema validation
}
```

### Backend Stack

```json
{
  "express": "^5.2.1",
  "socket.io": "^4.8.1",
  "cors": "^2.8.5"
}
```

### Key Configuration Files

| File                 | Purpose                                               |
| -------------------- | ----------------------------------------------------- |
| `vite.config.ts`     | Build config, dev server on port 8080, path aliases   |
| `tsconfig.app.json`  | Frontend TypeScript settings (ES2020, ESNext modules) |
| `tsconfig.node.json` | Build tools TypeScript (strict mode)                  |
| `tailwind.config.ts` | Tailwind theme, plugins, dark mode                    |
| `eslint.config.js`   | Linting rules (flat config)                           |
| `.prettierrc.json`   | Formatting: 100 chars, 2 spaces, double quotes        |
| `components.json`    | Shadcn/UI configuration                               |

### Recommended IDE Setup

- **VS Code** with extensions:
  - ESLint (dbaeumer.vscode-eslint)
  - Prettier (esbenp.prettier-vscode)
  - TypeScript Vue Plugin
  - TailwindCSS IntelliSense

## Testing Guidelines

### Unit Testing

Currently, the project lacks formal unit tests. When adding tests:

1. **Location:** `src/__tests__/` or co-located `*.test.ts` files
2. **Framework:** Jest or Vitest (recommended: Vitest for Vite projects)
3. **Test Files Naming:** `<Subject>.test.ts` or `<Subject>.spec.ts`
4. **Test Structure:**

   ```tsx
   import { describe, it, expect, beforeEach } from "vitest";

   describe("useQuiz", () => {
     it("should initialize with idle status", () => {
       const { gameState } = useQuiz();
       expect(gameState.status).toBe("idle");
     });
   });
   ```

### Manual Testing Checklist

Before submitting a PR, manually verify:

- ✅ Frontend loads without errors (`npm run dev`)
- ✅ Backend server starts (`npm run server`)
- ✅ Quiz flow works: Start → Select category → Play → Finish
- ✅ Multiplayer: Two browsers, same room, voting works
- ✅ Responsive design: Mobile (375px), tablet (768px), desktop (1920px)
- ✅ Timer counts down correctly (60 seconds)
- ✅ Score calculation is accurate
- ✅ localStorage persists player history
- ✅ Socket.IO reconnects on disconnect
- ✅ No console errors or warnings

### Integration Testing

Test Socket.IO integration:

```bash
# Terminal 1
npm run server

# Terminal 2
npm run dev

# Test in multiple browsers:
# 1. Open http://localhost:8080 (Device A)
# 2. Open http://localhost:8080 (Device B)
# 3. Create/join room on Device A
# 4. Verify Device B sees room code
# 5. Vote categories from both devices
# 6. Start quiz and verify sync
```

## Commit & Pull Request Guidelines

### Commit Message Format

Write clear, imperative commit messages:

```
feat: add category voting modal

Implement category selection UI with voting aggregation.
Devices can now vote for 5 categories before quiz starts.

Relates to: #42
```

**Format:**

```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

**Types:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting changes
- `refactor:` - Code restructuring
- `chore:` - Build/dependency changes
- `test:` - Test additions

### Pull Request Template

When opening a PR, include:

1. **Title:** Clear, descriptive (e.g., "feat: add multiplayer voting")
2. **Description:** What changed and why
3. **Testing:** How to verify the change works
4. **Checklist:**

   ```markdown
   - [ ] Code formatted with Prettier
   - [ ] ESLint passes
   - [ ] Pre-commit hooks pass
   - [ ] Tested locally (dev + server running)
   - [ ] Mobile responsive verified
   - [ ] No console errors
   ```

5. **Screenshots:** For UI changes, include before/after

### Before Opening a PR

```bash
# 1. Format code
npm run format

# 2. Fix lint issues
npm run lint:fix

# 3. Run pre-commit hooks
npm run pre-commit

# 4. Manual testing
npm run dev:all
# Test in browser, multiple devices, etc.

# 5. Push
git push origin <branch-name>
```

## Security & Configuration Tips

### Credentials & Secrets

- ❌ Never commit API keys, tokens, or secrets
- ❌ Never commit database credentials
- ✅ Use environment variables (`.env` in .gitignore)
- ✅ Store local overrides in `.env.local`

### Socket.IO Configuration

Backend runs on `http://localhost:3001` by default. Modify in:

- `src/hooks/useSocket.ts` - `SOCKET_URL` constant
- `server.js` - Express server port

### CORS & Cross-Origin

Express CORS enabled by default on all routes. Restrict in production:

```javascript
// server.js
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  })
);
```

### localStorage Security

Player history stored in browser localStorage:

- ✅ No sensitive data (scores, times)
- ⚠️ Can be cleared by user
- ⚠️ Not synced across devices
- ✅ Current session data held in state

## Safety & Escalation

### Escalation Triggers

Pause work and escalate to human maintainers if:

- Build failures with unclear causes
- Socket.IO connection instability
- Unexplained state inconsistencies between devices
- Performance regressions (framerate < 30fps)
- Conflicting changes in main quiz logic
- Module dependency issues

### Key Contacts

- **Project Owner:** Victor Amorim
- **Repository:** Local development only (no public CI/CD)
- **Issues/Features:** Use GitHub issues or Jira (if configured)

### Module Responsibilities

- **`src/pages/`** - Page state machines (Index.tsx authority)
- **`src/components/quiz/`** - Game flow screens (no business logic)
- **`src/components/lobby/`** - Multiplayer setup (Socket.IO via useSocket)
- **`src/hooks/`** - Business logic (game rules, socket sync)
- **`server.js`** - Backend room management and voting

Never introduce cross-module implementation dependencies or bypass hooks.

## Debugging & Troubleshooting

### Common Issues

| Issue                         | Solution                                             |
| ----------------------------- | ---------------------------------------------------- |
| Port 8080/3001 already in use | Kill process: `lsof -ti:8080 \| xargs kill -9`       |
| Socket.IO not connecting      | Check server running on port 3001, verify SOCKET_URL |
| Hot reload not working        | Clear `.vite` cache, restart dev server              |
| TypeScript errors             | Run `tsc --noEmit` to find issues                    |
| Formatting conflicts          | Run `npm run format` before committing               |
| Lint errors                   | Run `npm run lint:fix`, then manual review           |

### Debug Logging

- ✅ Use `console.warn()` and `console.error()` for important messages
- ❌ Remove `console.log()` before committing
- ✅ Debug flag in development: `if (process.env.NODE_ENV === 'development')`

### Socket.IO Debugging

```tsx
// In useSocket.ts
socket.onAny((event, ...args) => {
  console.warn("Socket event:", event, args);
});
```

## Reference Index

### Documentation Files

- [README.md](README.md) — Project overview, quick start, architecture
- [LINT_SETUP.md](LINT_SETUP.md) — Linting & formatting configuration guide
- [REDE_LOCAL.md](REDE_LOCAL.md) — Local network & deployment setup
- [src/components/lobby/README.md](src/components/lobby/README.md) — Multiplayer lobby flow
- [AGENT.md](AGENT.md) — This file (agent coding guidelines)

### Key Configuration Files

- [vite.config.ts](vite.config.ts) — Vite build configuration
- [tsconfig.app.json](tsconfig.app.json) — Frontend TypeScript settings
- [eslint.config.js](eslint.config.js) — ESLint rules
- [.prettierrc.json](.prettierrc.json) — Prettier formatting
- [tailwind.config.ts](tailwind.config.ts) — Tailwind theming
- [.pre-commit-config.yaml](.pre-commit-config.yaml) — Pre-commit hooks
- [.github/workflows/lint.yml](.github/workflows/lint.yml) — CI/CD linting

### Core Source Files

- [src/pages/Index.tsx](src/pages/Index.tsx) — Main state machine (150+ lines)
- [src/hooks/useQuiz.ts](src/hooks/useQuiz.ts) — Game logic (180+ lines)
- [src/hooks/useSocket.ts](src/hooks/useSocket.ts) — Real-time sync (100+ lines)
- [src/types/quiz.ts](src/types/quiz.ts) — Type definitions
- [server.js](server.js) — Backend (350+ lines)

### External Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Shadcn/UI Components](https://ui.shadcn.com/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [Pre-commit Framework](https://pre-commit.com/)

## Quick Reference Commands

```bash
# Development
npm run dev:all           # Start frontend + backend
npm run dev              # Frontend only
npm run server           # Backend only

# Quality
npm run lint             # Check lint
npm run lint:fix         # Fix lint
npm run format           # Format code
npm run format:check     # Check formatting
npm run pre-commit       # Run all hooks

# Build
npm run build            # Production build
npm run build:dev        # Dev build
npm run preview          # Preview build
```

---

**Last Updated:** December 2024
**Maintainers:** Victor Amorim
**Contributing:** Follow guidelines above, run quality checks before PR, include tests for new features.
