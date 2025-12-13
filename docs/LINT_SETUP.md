# Agent Guidelines

These instructions describe how Codex should work inside this repository. Always respond and maintain files in English.

## Documentation Awareness

- Always look for existing `.md` files (e.g., `LINT_SETUP.md`, `PR_SUMMARY.md`, `README.md`, etc.) before making changes.
- When a code change affects tooling, workflow, or behavior described in any markdown file, update the relevant documentation in the same PR.
- Before finishing a task, double-check whether a documentation update is needed and mention it in your summary when applicable.

## Lint & Formatting

- Follow `LINT_SETUP.md` for the canonical lint/format commands (`npm run lint`, `npm run format`, and pre-commit hooks).
- Do not disable lint rules unless explicitly requested—prefer refactoring to satisfy them.

## Workflow Expectations

- Run or describe verification steps (lint/tests) whenever changes could affect them.
- Keep commits conventional and concise.
- When touching shared UI utilities or hooks, confirm that all relevant files (including docs) stay in sync.
