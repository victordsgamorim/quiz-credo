# QuizCredo

A real-time, multiplayer quiz game inspired by "Who Wants to Be a Millionaire?". An admin creates a
room, guests join from their own devices, everyone votes on the categories, and the whole room plays
the same questions at the same time while a live ranking is kept.

## Features

- **Real-time multiplayer**: rooms are synchronised over Socket.IO; the admin drives the game and
  guests follow.
- **Category voting**: guests vote on categories in the lobby and the top results become the game.
- **Question bank in Supabase**: questions are translated (pt-BR, en-UK, es-BO) and drawn by
  difficulty level (1 to 5) with no repeats.
- **Configurable games**: question count, timer, category limits and low/critical time thresholds.
- **Debug mode**: lets the admin start a game alone (no guests required) and answer questions like a
  guest, which is handy for testing.
- **Authentication**: room creation requires a signed-in user (Supabase Auth, including password
  reset).
- **Responsive UI** with dark mode and three interface languages.

## Requirements

| Requirement             | Version / notes                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| Node.js                 | 20 or newer (required by Vite 5 / Vitest 4)                                                            |
| npm                     | Ships with Node.js                                                                                     |
| Supabase project        | Hosts the question bank and authentication                                                             |
| Realtime server         | [`quiz-credo-server`](../quiz-credo-server) (Node.js + Express + Socket.IO), run as a separate process |
| `pre-commit` (optional) | Local lint/format hooks (`brew install pre-commit` or `pip install pre-commit`)                        |

## Getting Started

### 1. Install dependencies

```bash
git clone <repository-url>
cd quiz-credo
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

| Variable                 | Required | Description                                                    |
| ------------------------ | -------- | -------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Yes      | Supabase project URL (Settings → API → Project URL)            |
| `VITE_SUPABASE_ANON_KEY` | Yes      | Supabase public `anon` key (Settings → API → Project API keys) |
| `VITE_SOCKET_URL`        | No       | Realtime server URL. Defaults to `http://localhost:3001`       |

The app throws on startup if the two Supabase variables are missing.

### 3. Set up Supabase

The question bank lives in the `quiz` schema, which the Supabase client cannot query directly, so
questions are read through `SECURITY DEFINER` RPC functions. Run the root-level `supabase_*.sql`
files in the Supabase SQL Editor (there is no migrations folder). Start with
`supabase_game_question_selection.sql`.

See [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) for the step-by-step guide, including
password reset (`/reset-password`) configuration.

### 4. Start the realtime server

The Socket.IO server is a separate repository (`quiz-credo-server`, expected next to this one):

```bash
cd ../quiz-credo-server
npm install
npm start            # listens on port 3001 by default
```

| Server variable | Description                                  |
| --------------- | -------------------------------------------- |
| `PORT`          | Port to listen on (default `3001`)           |
| `FRONTEND_URL`  | Comma-separated list of allowed CORS origins |

> The `npm run server` and `npm run dev:all` scripts in this repo expect a `realtime-server/` folder
> that does not exist, so run the server manually as shown above.

### 5. Start the frontend

```bash
npm run dev
```

Open <http://localhost:8080>. To test with other devices on your network, see
[docs/REDE_LOCAL.md](./docs/REDE_LOCAL.md).

## Available Scripts

| Command                 | Description                           |
| ----------------------- | ------------------------------------- |
| `npm run dev`           | Start the Vite dev server (port 8080) |
| `npm run build`         | Production build into `dist/`         |
| `npm run build:dev`     | Development-mode build                |
| `npm run preview`       | Preview the production build          |
| `npm run lint`          | Run ESLint                            |
| `npm run lint:fix`      | Run ESLint and fix what it can        |
| `npm run format`        | Format the code with Prettier         |
| `npm run format:check`  | Check formatting                      |
| `npm run pre-commit`    | Run all pre-commit hooks              |
| `npm test`              | Run tests in watch mode               |
| `npm run test:run`      | Run tests once (CI mode)              |
| `npm run test:ui`       | Run tests with the Vitest UI          |
| `npm run test:coverage` | Run tests with coverage               |

## How a Game Works

```
Lobby ──► Game rules ──► Playing ──► Results
```

1. **Lobby** (`src/components/lobby`): a signed-in admin creates a room (or a guest joins through the
   room code, QR code, or `/join/:roomCode`). Guests vote on categories and mark themselves ready.
   The admin adjusts the game settings and starts the game once every guest is ready (or alone, in
   debug mode).
2. **Game rules** (`GameRulesScreen`): a short briefing before the first question. The host sits
   over a deck of the game's rules in the home screen's staggered cards (`StaggerCards`), one rule
   per card (`GameRuleCards`), with the room's settings: the questions, the time per question, the
   streak multiplier, the difficulty levels and their points, the categories and the power-ups. The
   admin's buttons, to start the game or return to the lobby (red, like the lobby's button that
   closes the room), rest on the center card, like the home's room buttons; the guests see that
   they're waiting for the admin there instead.
3. **Playing** (`GameScreen`): the admin loads the questions into the server, which plays them in
   order for the whole room. Guests pick an answer, the admin reveals the result and advances. The
   admin does not answer unless debug mode is on. The countdown (`Timer`) shows the time left inside
   a bar that drains blue, then gold when the time runs low and red when it's almost over. On phones
   the answers sit at the bottom of the screen, within thumb reach, and the admin's buttons in a bar
   along the bottom. The live ranking (`LiveRanking`) follows every change of points, showing each
   player's place and name but not their points: the top 10 in a column beside the question on wide
   screens (1024px and up), the top 3 side by side between the streak bar and the question below
   that. The 1st, 2nd and 3rd places get gold, silver and bronze, each a size smaller (once they have
   points), and a player who passes another glides to their new place with an arrow on their position
   for a few seconds.
4. **Results** (`ResultsScreen`): the final ranking of the room, in the live ranking's order, with a
   button back to the lobby for everyone at the bottom.

Routes: `/reset-password`, a 404 page, and the game's screens, one URL each:

| Screen            | URL                             |
| ----------------- | ------------------------------- |
| Home              | `/`                             |
| Lobby             | `/join/:roomCode`               |
| Game rules        | `/join/:roomCode/start`         |
| A question        | `/join/:roomCode/<question id>` |
| Results (ranking) | `/join/:roomCode/ranking`       |

### Back

The history works like a stack (`useRoomHistory`, `useRoomScreens`): joining a room adds the lobby
over the home screen, and the game adds one entry over the lobby, which each next screen (rules,
questions, ranking) replaces. So back never goes through the questions:

- **From the lobby**: home screen, out of the room (as the lobby's leave button; the admin's closes
  the room).
- **From the rules or the ranking**: the lobby. The admin's back ends the game for the whole room,
  as their own buttons back to the lobby do (the rules' "Return to Lobby", the ranking's arrow).
  A guest who goes back from the rules is taken back in when the questions start, and browser
  forward returns a guest to the game. The ranking also has a "Back to Lobby" button for everyone
  at its bottom, which does the same.
- **From a question**: the admin's back ends the game, as above. A guest is asked first
  (`QuitGameDialog`) whether they give up the game: giving up takes them out of the room, to the
  home screen; otherwise the question stays.

A room's link opened on its own (a QR code) gets the home screen under it in the history, so back
from that lobby leads home too (`stackRoomHistory`). Browsers may skip that entry with their own
back button until the user has interacted with the page (Firefox does), and back then leaves the
tab's history as before.

### When the admin is away

The admin is away when their connection drops or, during a game, when the game goes to the
background on their device (another app, a locked screen). The server then pauses the game: the
question's countdown stops, and every player sees a dialog (`AdminAwayDialog`) saying the admin
disconnected, with a one-minute countdown. Nothing else on the screen works, but the dialog has a
button to leave the room, which takes the player out of the game and its ranking. When the admin is
back, the dialog closes and the question's countdown goes on from where it stopped. If the minute
runs out, the room closes and everyone goes back to the home screen.

- In the lobby, only a dropped connection counts (the admin may be sharing the room's code from
  another app), and the room still closes after a minute.
- The results stay up whether the admin is there or not.
- A device whose connection drops and comes back is still in its room, and rejoins it to catch up.
  If the room closed meanwhile, the device goes back to the home screen.

### Game settings

Configured by the admin in the lobby (`src/types/gameSettings.ts`):

| Setting                 | Range / values           |
| ----------------------- | ------------------------ |
| Question count          | 10 – 50                  |
| Timer duration          | 60 – 300 s, or unlimited |
| Max category selections | 3 – 10                   |
| Top categories          | 5 – 15                   |
| Low / critical time     | 5 – 20 s / 3 – 10 s      |
| Streak for multiplier   | 1 – 10 (default 5)       |
| Question cache          | on / off                 |
| Debug mode              | on / off                 |

### Scoring

A correct answer earns the points of the question's level, times the player's streak multiplier:

| Level  | 1   | 2   | 3   | 4   | 5   |
| ------ | --- | --- | --- | --- | --- |
| Points | 10  | 20  | 30  | 40  | 50  |

- Every player has their own streak of correct answers in a row. Once it reaches the "streak for
  multiplier" setting (5 by default), the player's next correct answer is worth x1.5, and every
  further correct answer in a row adds 0.5, up to x3. A wrong (or missing) answer resets it.
- Each player sees only their own streak, in the "supercharged" bar of the game header (`StreakBar`),
  and the "worth" of a question already includes their multiplier. The bar changes color and gets
  more intense at every multiplier: gold (x1.5), orange (x2), magenta (x2.5) and violet (x3).
- The rules live in `src/lib/scoring.ts`. The realtime server applies the same multiplier to the final
  ranking (`quiz-credo-server/server.js`), so keep both in sync. The server only applies it when the
  game settings include `streakThreshold`, so older frontends keep their old scores.

## Architecture

```
src/
├── pages/            # Index (game state machine) and its screens' routes, ResetPassword, NotFound
├── components/
│   ├── auth/         # Login and password-reset dialogs
│   ├── lobby/        # Lobby screen and its cards (see lobby/README.md)
│   ├── quiz/         # Game rules, game, question card, timer, results
│   └── ui/           # shadcn/ui (Radix) primitives
├── hooks/            # useSocket, useQuiz, useAuth, useTimer, ...
├── services/         # Supabase auth and question fetching/selection
├── contexts/         # Locale and background music providers
├── locales/          # pt-BR, en-UK, es-BO translations
├── constants/        # Categories and shared constants
├── types/            # Shared TypeScript types (game settings, quiz, i18n)
└── lib/              # Supabase client and utilities
```

### Tech stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix UI), Framer Motion,
  React Router, TanStack Query, Socket.IO client
- **Backend**: Supabase (PostgreSQL, Auth) for questions and users; a Node.js + Express +
  Socket.IO server for room and game state
- **Tooling**: Vitest + React Testing Library, ESLint, Prettier, pre-commit

### Realtime events

The admin sends the whole game with `load-questions` (once per locale), and the server validates
answers and keeps the ranking.

| Direction       | Events                                                                                                                                                                                                                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Client → server | `create-channel`, `join-channel`, `leave-channel`, `remove-device`, `update-ready-state`, `update-category-vote`, `close-category-vote`, `update-game-settings`, `update-locale`, `start-game`, `load-questions`, `guest-selected-answer`, `submit-answer`, `next-question`, `reset-game`, `device-status`, `ping` |
| Server → client | Channel updates (devices, votes, game state, the admin away), `answer-result`, the live ranking (`ranking-update`), the final ranking (`game-finished`) and `force-leave-channel` (the room closed, or the admin removed the device)                                                                               |

`ranking-update` sends `{ ranking: [{ position, deviceId, displayName, totalPoints }] }`, the game's
players by points (the admin only plays in debug mode). The server sends it to the room when the
questions load, whenever the points or the players change (answers, power-ups, players joining or
leaving), and to a device that joins back mid-game; older servers never send it, and the game screen
then has no ranking. On equal points, the player who got there first stays ahead, and the final
ranking keeps the same order.

A player who answered and then left the room stays in both rankings (a reload leaves the room for a
moment). A player who quits the game with the leave button (`leave-channel` with
`{ isQuitting: true }`) is out of them, until they join the room again; what they did in the game
stays, so a steal they made still took its points.

While the admin is away, channel updates carry `adminAway: { closesInMs, timeoutMs }` (`null`
otherwise). Each device counts down from it, so its clock doesn't need to match the server's; older
servers never send it, and the game then never pauses. On every connection, the client tells the
server its room (`channelId`) and whether the game is on screen (`isActive`) in the handshake's
`auth`, and `device-status` tells it again when the page's visibility changes.

### Local storage

- `channel-category-preferences`: category choices per channel
- `socket-device-session`: device ID, display name and current room
- `quiz-player-history`: scores of the games played on this device

## Documentation

- [Lobby components](./src/components/lobby/README.md): architecture and sequence diagrams
- [Supabase setup](./docs/SUPABASE_SETUP.md): RPC functions, RLS and password reset
- [Question selection and difficulty levels](./docs/SUPABASE_DIFFICULTY_LEVELS.md)
- [Testing guide](./docs/TESTING.md)
- [Lint and formatting](./docs/LINT_SETUP.md)
- [Local network access](./docs/REDE_LOCAL.md)
- [Power-ups](./docs/POWER_UPS.md): the advantages, the disadvantages and the shield
- [Agent guidelines](./AGENT.md)

## Development

- **Lint and format**: ESLint (no `any`, no `console.log`, enforced import order and naming) and
  Prettier (100 columns, 2 spaces, double quotes). Run `npm run lint` and `npm run format:check`.
- **Pre-commit**: `pre-commit install` enables the hooks locally; CI runs the same checks.
- **Tests**: every new React component needs tests, colocated in `__tests__/`. Run `npm run test:run`.
  On Node 26, run tests with `NODE_OPTIONS=--no-experimental-webstorage` if `localStorage` errors
  appear.
- **Hooks** must be camelCase (`useMobile`, not `use-mobile`).
- **Imports** use the `@/` alias for `src/`.

## Deployment

The frontend is a static build and deploys to Vercel (`vercel.json` rewrites every route to
`index.html` so client-side routes work).

```bash
npm run build
```

Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `VITE_SOCKET_URL` (pointing at the deployed
realtime server) in the hosting provider. On the realtime server, set `FRONTEND_URL` to the deployed
frontend origin so CORS allows it.

## Contributing

1. Create a branch for your change.
2. Make sure `npm run lint`, `npm run format:check` and `npm run test:run` pass.
3. Update the relevant documentation in the same PR.
4. Open a pull request.

## License

MIT
