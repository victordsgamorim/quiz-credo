# Agent Guidelines

These instructions define how the coding agent should operate in this repository.
This file is the single source of truth for agent behavior (no need to read other docs for agent rules).

Always respond in English, and keep code + documentation changes in English.

## Documentation Awareness

- Before changing code, consider whether any documentation needs to be updated (README, testing docs, Supabase docs, etc.).
- If a code change affects tooling, workflow, or behavior described in docs, update the relevant docs in the same PR.
- Before finishing a task, double-check whether a documentation update is needed and mention it in your summary.

## Commands (Canonical)

Install dependencies:

- `npm install`

Run the frontend:

- `npm run dev` (Vite runs on port `8080`)

Lint:

- `npm run lint`
- `npm run lint:fix`

Formatting:

- `npm run format:check`
- `npm run format`

Pre-commit checks:

- `npm run pre-commit` (runs all hooks on all files)

Tests:

- `npm test` (watch mode)
- `npm run test:run` (CI mode)
- `npm run test:ui`
- `npm run test:coverage`

## Local Development Notes (Project-Specific)

- Frontend: Vite is configured to run on `http://localhost:8080`.
- Socket server: the frontend defaults to `http://localhost:3001` via `VITE_SOCKET_URL` (see `src/hooks/useSocket.ts`).
- `npm run server` / `npm run dev:all` currently expect a `realtime-server/` folder (referenced via `--prefix`);
  if it is not present, those scripts will fail and you must run the socket backend separately.

## Pre-commit

This repo uses `pre-commit` to run checks locally (Prettier, ESLint, hook-name validation, and basic file hygiene).

Install `pre-commit`:

- macOS (Homebrew): `brew install pre-commit`
- Linux/Windows (pip): `pip install pre-commit`

Enable git hooks:

- `pre-commit install`

## Lint & Formatting

This project uses ESLint (TypeScript + React) and Prettier. Do not disable lint rules unless explicitly requested;
prefer refactoring code to satisfy the existing rules.

Key ESLint expectations (high level):

- No `any` (explicit `any` is an error).
- No unused variables (allowed only when intentionally prefixed with `_`).
- No `console.log` (only `console.warn` and `console.error` are allowed).
- No `debugger`.
- Prefer `const`; `var` is not allowed.
- Strict equality (`===` / `!==`) required.
- Import ordering is enforced.
- Naming conventions are validated (e.g., boolean prefixes like `is/has/should/...`).

Prettier (repo config):

- Print width: 100
- Indent: 2 spaces
- Double quotes
- Trailing commas: ES5
- Line endings: LF
- Semicolons: enabled

## Custom Hook Naming (Mandatory)

All custom hooks must be camelCase (e.g., `useMobile`, `useToast`).
Hooks in kebab-case are not allowed (e.g., `use-mobile`, `use-toast`).

Enforcement: a pre-commit hook fails if any file under `src/hooks` matches `use-*`.

## Testing Requirements (Mandatory for New Components)

This project uses Vitest with React Testing Library.

Whenever you create a new React component, you must also create corresponding tests.

### Where tests live

Tests are colocated next to components. This repo currently has both conventions:

- `__tests__/` (most components)
- `tests/` (some quiz tests)

Rule: follow the existing convention in the component’s folder. If neither exists, create `__tests__/` and add a
test-specific `.eslintrc.json` inside it (copy the pattern from existing test folders).

### Test templates

Basic render test:

```ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComponentName } from "../ComponentName";

describe("ComponentName", () => {
  it("renders correctly", () => {
    render(<ComponentName />);
    expect(screen.getByText("expected text")).toBeInTheDocument();
  });
});
```

User interactions:

```ts
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";

describe("Button", () => {
  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

If a `describe` block becomes large and triggers `max-lines-per-function`, add:

```ts
// eslint-disable-next-line max-lines-per-function
describe("ComponentName", () => {
  // ...
});
```

### Testing checklist (minimum coverage)

- Default render + basic props
- Conditional states (loading/empty/error when relevant)
- User interactions (click/typing/keyboard)
- Accessibility queries (`getByRole`, `getByLabelText`, etc.)

After adding or changing tests, run `npm run test:run`.

## CI & Workflow Expectations

GitHub Actions runs (at least):

- Prettier check
- ESLint
- Tests
- Build

Before finishing a task, run or clearly state the verification you performed (lint/tests/build) when relevant.

## Supabase Notes (Project-Specific)

This project fetches quiz questions from a custom Supabase schema (`quiz`). The Supabase JS client cannot access custom
schemas directly via REST, so the app uses a Postgres RPC function:

- Function name: `get_questions_by_categories`
- SQL source: `supabase_rpc_function.sql`

Environment variables (frontend):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Supabase client entry point:

- `src/lib/supabase.ts`

Difficulty system:

- The RPC supports 5 difficulty levels (1–5) with a specific distribution and returns questions ordered by difficulty,
  randomized within each level.
