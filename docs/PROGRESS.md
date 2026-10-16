# DayCraft: Progress and handoff

> **Read this first** when starting a session (see [AGENTS.md](../AGENTS.md) §3).
> The **current phase's task list is the "agreed scope"**. Agents may work on these tasks without asking; anything else needs the owner's approval.
> Keep this file short and current. History belongs in git and the session log at the bottom.

---

## Current status

| | |
|---|---|
| **Current phase** | **Phase 1: Local foundation**, approved 2026-10-16, in progress |
| **Repository** | https://github.com/sivaganesz/daycraft (public; empty). Not yet initialized locally. **Nothing committed yet.** |
| **Live environment** | None yet |

---

## Phase overview

Every phase ends with: test locally → `pnpm verify` → commit → push → CI → PR merge → deploy → verify live. Git, CI/CD, and infrastructure steps need the owner's approval (AGENTS.md §4).

| # | Phase | Status |
|---|---|---|
| 0 | Decisions & documentation | ✅ Done |
| 1 | Local foundation (monorepo skeleton) | 🟡 In progress |
| 2 | Containerization (API image, production Compose) | ⬜ |
| 3 | CI for branches + branch protection | ⬜ |
| 4 | Infrastructure: Oracle VM, Cloudflare Pages, DNS, HTTPS | ⬜ |
| 5 | CD on `master`: walking skeleton live | ⬜ |
| 6 | Authentication + workspace foundation → **"Hey, {name}!" live** | ⬜ |
| 7 | App shell & design system | ⬜ |
| 8 | Settings core | ⬜ |
| 9 | Task model + Smart Daily Planner | ⬜ |
| 10 | Deadline & Follow-up Tracker | ⬜ |
| 11 | Focus-Based Task Manager | ⬜ |
| 12 | Kanban | ⬜ |
| 13 | Email (Resend) | ⬜ |
| 14 | Teams & invitations | ⬜ |
| 15 | Production hardening | ⬜ |

Phase details: [ARCHITECTURE.md](ARCHITECTURE.md) and the [original roadmap](archive/PROJECT_UNDERSTANDING.md) §8 and §12.11.

---

## Current phase tasks: Phase 0

- [x] Analyse the requirements and agree on all decisions (Q1–Q16, OT-1–OT-5)
- [x] Move the original files to `docs/archive/` (unchanged)
- [x] `docs/PRD.md`, approved by the owner
- [x] `docs/ARCHITECTURE.md`, decisions D-01–D-22
- [x] `SECURITY.md`, `AGENTS.md`, `CLAUDE.md`, `docs/PROGRESS.md`, approved
- [x] Owner shared the GitHub repository URL
- [x] Owner approved the Phase 1 scope below, including the new tools

---

## Current phase: Phase 1, Local foundation (**approved 2026-10-16**)

**Task status:** 1 ✅ prerequisites OK (Node.js 22 kept, owner decision D-23; Docker Desktop running) · 2 🟡 config files created; bootstrap commit to `master` approved as a one-time exception (D-24) · 3–11 ⬜

> ⚠️ **One-time exception (D-24):** the bootstrap commit is the **only** direct push to `master`. All later changes go through branches and PRs.

**Goal:** a clean monorepo that runs locally. The web page calls the API, the API reaches PostgreSQL in Docker, and every quality check runs with one command. No features yet.

**Proposed tasks**
1. **Check prerequisites** on the owner's Windows machine: Git, Node.js LTS, pnpm (via Corepack), Docker Desktop.
2. **Initialize the repo** ⚠️ *needs approval*: `git init`, default branch `master`, connect to the GitHub remote. Add `.gitignore`, `.gitattributes` (LF line endings, important on Windows), and `.editorconfig`.
3. **Workspace root:** `package.json`, `pnpm-workspace.yaml`, pinned Node version (`.nvmrc` + `engines`), and a shared strict `tsconfig`.
4. **`packages/shared`:** Zod setup and the first shared schema (the health response).
5. **`apps/api`:** NestJS app with `GET /api/v1/health` and `GET /api/v1/health/ready` (checks the database), environment validation with Zod, JSON logging with request IDs, and CORS for the local web origin.
6. **Database:** `infra/compose/compose.dev.yml` with PostgreSQL (pinned version, named volume). Prisma is set up and connected. The first real tables come in Phase 6.
7. **`apps/web`:** React + Vite + TypeScript + Tailwind. A "Hello from DayCraft" page showing the live API and database status.
8. **Quality tooling:** ESLint, Prettier, TypeScript type check, Vitest (unit tests), an API integration test against PostgreSQL, and **`pnpm verify`** running all of them.
9. **Git hooks:** format, lint, and secret scan before each commit; commit message check (Conventional Commits).
10. **`.env.example`**, **`README.md`** (what DayCraft is, how to run it locally), and the commands section of `AGENTS.md` §9.
11. **First commit and push** on a branch, then a PR ⚠️ *each step needs approval*.

**New tools that need approval with this phase** (not in the ARCHITECTURE §4 list): `nestjs-zod`, `nestjs-pino`, a git-hook manager (`lefthook`, or `husky` + `lint-staged`), `commitlint`, and `gitleaks` (secret scanning).

**Exit criteria:** a fresh clone + README steps → `pnpm dev` shows "Hello from DayCraft" with the API and database both green; `pnpm verify` passes; the first commit is on a branch.

---

## Open questions

| ID | Question | Needed by |
|---|---|---|
| PRD OQ-1 | Follow-ups: tasks marked "waiting", or a separate list | Phase 10 |
| PRD OQ-2 | Accessibility (WCAG 2.2 AA) and browser support list | Phase 7 |
| PRD OQ-3 | Account deletion / data export | Before public launch |
| PRD OQ-4 | Expense currency details (INR/USD/EUR decided) | Expense phase |
| PRD OQ-6 | Revisit the minimum password length (accepted risk) | Before public launch |

## Known issues
None yet.

---

## Handoff

| | |
|---|---|
| **Last session** | 2026-10-15 · Claude (Claude Code) |
| **Done** | All Phase 0 decisions; PRD, ARCHITECTURE, SECURITY, AGENTS, CLAUDE, and PROGRESS written |
| **In progress** | Owner review of SECURITY.md, AGENTS.md, PROGRESS.md |
| **Next step** | Owner reviews the docs, shares the repo URL, and approves Phase 1. Then start Phase 1 task 1 |
| **Branch** | None (git not initialized yet) |
| **Blockers** | None |

---

## Session log
| Date | Agent | Summary |
|---|---|---|
| 2026-10-15 | Claude | Requirements analysis, interactive decisions Q1–Q16 and OT-1–OT-5, wrote all Phase 0 docs |
