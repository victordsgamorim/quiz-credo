# Agent Guidelines

These instructions describe how Codex should work inside this repository. Always respond and maintain files in English.

## Documentation Awareness

- Always look for existing `.md` files (e.g., `LINT_SETUP.md`, `PR_SUMMARY.md`, `README.md`, etc.) before making changes.
- When a code change affects tooling, workflow, or behavior described in any markdown file, update the relevant documentation in the same PR.
- Before finishing a task, double-check whether a documentation update is needed and mention it in your summary when applicable.

## Lint & Formatting

- Follow `LINT_SETUP.md` for the canonical lint/format commands (`npm run lint`, `npm run format`, and pre-commit hooks).
- Do not disable lint rules unless explicitly requested—prefer refactoring to satisfy them.

## Testing Requirements

### When Creating New Components

Whenever you create a new React component, you **must** also create corresponding test files:

1. Place tests in `__tests__/` directory next to the component
2. Use the template from `TESTING.md`
3. Add `.eslintrc.json` in the `__tests__/` directory with test-specific ESLint rules
4. Add `// eslint-disable-next-line max-lines-per-function` above large describe blocks
5. Run `npm run test:run` after creating tests

See `TESTING.md` for complete testing guidelines and examples.

## Workflow Expectations

- Run or describe verification steps (lint/tests) whenever changes could affect them.
- Keep commits conventional and concise.
- When touching shared UI utilities or hooks, confirm that all relevant files (including docs) stay in sync.
- **Always create tests when creating new components** - this is not optional.
