# DayCraft: Progress and handoff

> **Read this first** when starting a session (see [AGENTS.md](../AGENTS.md) §3).
> The **current phase's task list is the "agreed scope"**. Agents may work on these tasks without asking; anything else needs the owner's approval.
> Keep this file short and current. History belongs in git and the session log at the bottom.

---

## Current status

|                      |                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| **Current phase**    | **Phase 1: Local foundation**, approved 2026-10-16. All code done; commit, push, and PR remain   |
| **Repository**       | https://github.com/sivaganesz/daycraft (public). `master` has the Phase 0 docs (bootstrap, D-24) |
| **Working branch**   | `chore/phase-1-foundation` (not yet committed or pushed)                                         |
| **Live environment** | None yet (Phases 4–5)                                                                            |

---

## Phase overview

Every phase ends with: test locally → `pnpm verify` → commit → push → CI → PR merge → deploy → verify live. Git, CI/CD, and infrastructure steps need the owner's approval (AGENTS.md §4).

| #   | Phase                                                           | Status            |
| --- | --------------------------------------------------------------- | ----------------- |
| 0   | Decisions & documentation                                       | ✅ Done           |
| 1   | Local foundation (monorepo skeleton)                            | 🟡 Commit pending |
| 2   | Containerization (API image, production Compose)                | ⬜                |
| 3   | CI for branches + branch protection                             | ⬜                |
| 4   | Infrastructure: Oracle VM, Cloudflare Pages, DNS, HTTPS         | ⬜                |
| 5   | CD on `master`: walking skeleton live                           | ⬜                |
| 6   | Authentication + workspace foundation → **"Hey, {name}!" live** | ⬜                |
| 7   | App shell & design system                                       | ⬜                |
| 8   | Settings core                                                   | ⬜                |
| 9   | Task model + Smart Daily Planner                                | ⬜                |
| 10  | Deadline & Follow-up Tracker                                    | ⬜                |
| 11  | Focus-Based Task Manager                                        | ⬜                |
| 12  | Kanban                                                          | ⬜                |
| 13  | Email (Resend)                                                  | ⬜                |
| 14  | Teams & invitations                                             | ⬜                |
| 15  | Production hardening                                            | ⬜                |

Phase details: [ARCHITECTURE.md](ARCHITECTURE.md) and the [original roadmap](archive/PROJECT_UNDERSTANDING.md) §8 and §12.11.

---

## Current phase: Phase 1, Local foundation (**approved 2026-10-16**)

**Goal:** a clean monorepo that runs locally. The web page calls the API, the API reaches PostgreSQL in Docker, and every quality check runs with one command. No features yet.

**Approved new tools:** `nestjs-zod`, `nestjs-pino`, `lefthook`, `commitlint`, `gitleaks`. Official companion packages added with them: `@nestjs/cli`, `@nestjs/testing`, `supertest`, `unplugin-swc` + `@swc/core` (needed for Vitest with NestJS decorators), `pino`, `pino-http`, `@prisma/adapter-pg`, and the ESLint React plugins.

| #   | Task                                                                                   | Status                                                                    |
| --- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | Check prerequisites                                                                    | ✅ Node 22.22.3 (D-23), pnpm 12.9.1, Docker 29.7, Git 2.55                |
| 2   | Initialize the repo + `.gitignore` / `.gitattributes` / `.editorconfig`                | ✅ Bootstrap commit `db675a6` on `master` (D-24)                          |
| 3   | Workspace root (`package.json`, `pnpm-workspace.yaml`, `.nvmrc`, `tsconfig.base.json`) | ✅                                                                        |
| 4   | `packages/shared` with the health schemas                                              | ✅                                                                        |
| 5   | `apps/api`: health + readiness, env validation, JSON logs + request IDs, strict CORS   | ✅                                                                        |
| 6   | PostgreSQL 18 in Docker Compose; Prisma 7.10.0 set up (no models yet)                  | ✅                                                                        |
| 7   | `apps/web`: "Hello from DayCraft" with live API/database status                        | ✅                                                                        |
| 8   | ESLint, Prettier, type check, Vitest, integration tests, `pnpm verify`                 | ✅ 18 tests passing                                                       |
| 9   | Git hooks: format, lint, secret scan, commit message check                             | 🟡 Hooks installed; **the owner must install gitleaks** before committing |
| 10  | `.env.example` files, `README.md`, AGENTS.md §9 commands                               | ✅                                                                        |
| 11  | First commit and push on the branch, then a PR                                         | ⏸️ Awaiting owner approval                                                |

**Verified (2026-10-16):** `pnpm verify` passes; `pnpm dev` serves the page; the API returns 200 with request IDs and strict CORS; readiness returns **503 "database: down"** when PostgreSQL is stopped and recovers automatically when it restarts.

**Exit criteria:** a fresh clone + README steps → `pnpm dev` shows "Hello from DayCraft" with the API and database both green; `pnpm verify` passes; the first commit is on a branch with a PR open.

---

## Open questions

| ID       | Question                                                                   | Needed by            |
| -------- | -------------------------------------------------------------------------- | -------------------- |
| PRD OQ-1 | Follow-ups: tasks marked "waiting", or a separate list                     | Phase 10             |
| PRD OQ-2 | Accessibility (WCAG 2.2 AA) and browser support list                       | Phase 7              |
| PRD OQ-3 | Account deletion / data export                                             | Before public launch |
| PRD OQ-4 | Expense currency details (INR/USD/EUR decided)                             | Expense phase        |
| PRD OQ-6 | Revisit the minimum password length (accepted risk)                        | Before public launch |
| REPO-1   | Repository licence (public repo; with no licence, all rights are reserved) | Phase 3              |

## Known issues

- Prisma prints an "update available 8.0.0-rc" banner during builds. It's harmless (it's a release candidate); we stay on 7.10 (D-25).

---

## Handoff

|                  |                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| **Last session** | 2026-10-16 · Claude (Claude Code)                                                                         |
| **Done**         | Phase 1 tasks 1–10 (task 9 needs gitleaks installed)                                                      |
| **In progress**  | Task 11: commit + push + PR, awaiting owner approval                                                      |
| **Next step**    | Owner installs gitleaks → approves the commit/push/PR → owner reviews and merges the PR → propose Phase 2 |
| **Branch**       | `chore/phase-1-foundation`                                                                                |
| **Blockers**     | gitleaks not installed (the pre-commit hook will refuse to commit without it)                             |

---

## Session log

| Date       | Agent  | Summary                                                                                                                                  |
| ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-15 | Claude | Requirements analysis, interactive decisions Q1–Q16 and OT-1–OT-5, wrote all Phase 0 docs                                                |
| 2026-10-16 | Claude | Bootstrap commit to `master`; Phase 1 monorepo (shared, API, web, Postgres, tooling, hooks); version decisions D-23–D-25; verify passing |
