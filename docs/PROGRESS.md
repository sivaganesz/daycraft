# DayCraft: Progress and handoff

> **Read this first** when starting a session (see [AGENTS.md](../AGENTS.md) §3).
> The **current phase's task list is the "agreed scope"**. Agents may work on these tasks without asking; anything else needs the owner's approval.
> Keep this file short and current. History belongs in git and the session log at the bottom.

---

## Current status

|                      |                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------- |
| **Current phase**    | **Phase 2: Containerization**, approved 2026-10-16, in progress                         |
| **Repository**       | https://github.com/sivaganesz/daycraft (public). `master` at `58edce4` (Phase 1, PR #1) |
| **Working branch**   | `chore/phase-2-containerization`                                                        |
| **Live environment** | None yet (Phases 4–5)                                                                   |

---

## Phase overview

Every phase ends with: test locally → `pnpm verify` → commit → push → CI → PR merge → deploy → verify live. Git, CI/CD, and infrastructure steps need the owner's approval (AGENTS.md §4).

| #   | Phase                                                           | Status          |
| --- | --------------------------------------------------------------- | --------------- |
| 0   | Decisions & documentation                                       | ✅ Done         |
| 1   | Local foundation (monorepo skeleton)                            | ✅ Done (PR #1) |
| 2   | Containerization (API image, production Compose)                | 🟡 In progress  |
| 3   | CI for branches + branch protection                             | ⬜              |
| 4   | Infrastructure: Oracle VM, Cloudflare Pages, DNS, HTTPS         | ⬜              |
| 5   | CD on `master`: walking skeleton live                           | ⬜              |
| 6   | Authentication + workspace foundation → **"Hey, {name}!" live** | ⬜              |
| 7   | App shell & design system                                       | ⬜              |
| 8   | Settings core                                                   | ⬜              |
| 9   | Task model + Smart Daily Planner                                | ⬜              |
| 10  | Deadline & Follow-up Tracker                                    | ⬜              |
| 11  | Focus-Based Task Manager                                        | ⬜              |
| 12  | Kanban                                                          | ⬜              |
| 13  | Email (Resend)                                                  | ⬜              |
| 14  | Teams & invitations                                             | ⬜              |
| 15  | Production hardening                                            | ⬜              |

Phase details: [ARCHITECTURE.md](ARCHITECTURE.md) and the [original roadmap](archive/PROJECT_UNDERSTANDING.md) §8 and §12.11.

---

## Current phase: Phase 2, Containerization (**approved 2026-10-16**)

**Goal:** package the API as a production Docker image and run the full production stack (Caddy → API → PostgreSQL) **locally**, exactly as it will later run on the Oracle VM. Nothing is deployed.

**New tools:** none. Caddy (D-09) and hadolint (D-06) are already approved. Pinned images: `node:22.23.3-alpine`, `caddy:2.11.7-alpine`, `postgres:18.6-alpine`, `hadolint/hadolint` (run through Docker).
**Out of scope:** CI/CD, VPS, DNS, and external services.

| #   | Task                                                                                                                                                    | Status                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1   | Sync `master`, delete the merged Phase 1 branch, create `chore/phase-2-containerization`                                                                | ✅                                         |
| 2   | Update `PROGRESS.md` for Phase 2                                                                                                                        | ✅                                         |
| 3   | API `Dockerfile`, multi-stage: build → small non-root **runtime** image + separate **migrate** target (Prisma CLI); architecture-neutral (amd64/arm64)  | ✅ runtime 387 MB · migrate 579 MB (D-26)  |
| 4   | `.dockerignore` (no `node_modules`, `.env`, `.git` in images)                                                                                           | ✅                                         |
| 5   | `infra/compose/compose.prod.yml`: Caddy + API + PostgreSQL; private network; only Caddy publishes 80/443; health checks; restart; log rotation; volumes | ✅ plus `internal` data network, hardening |
| 6   | `infra/caddy/Caddyfile`: API host, apex redirect, security headers; hostnames from env (local: `api.localhost`)                                         | ✅                                         |
| 7   | `infra/compose/.env.prod.example` (variable names + placeholders only)                                                                                  | ✅ (`.gitignore` fixed so it's tracked)    |
| 8   | Run and test the production stack locally (HTTPS via Caddy, DB not reachable, non-root, image size, headers)                                            | ✅ see "Verified" below                    |
| 9   | hadolint the Dockerfile                                                                                                                                 | ✅ clean (numeric UIDs, D-27)              |
| 10  | Docs: ARCHITECTURE (image details), README ("production stack locally"), PROGRESS                                                                       | ✅                                         |
| 11  | Commit, push, PR                                                                                                                                        | ⏸️ Needs owner approval                    |

**Verified locally (2026-10-16):** migrations job runs (no migrations yet); `https://api.localhost/api/v1/health/ready` → 200 through Caddy, with the **certificate chain verified** against Caddy's local root; HSTS, nosniff, Referrer-Policy, and X-Frame-Options present; `Server` and `X-Powered-By` hidden; HTTP → HTTPS (308); bare domain → app (301); the database has **no published port**, **Caddy cannot reach it**, and it has **no internet access**; the API runs as UID 1000 with a read-only filesystem and **zero capabilities**; a crash of the Node.js process inside the container **recovers automatically in about 2 s**.

**Also changed:** each package now declares its own `typescript` / `@types/node` (needed for slim Docker installs); a pnpm **catalog** pins Prisma once; `prisma.config.ts` is self-contained; `.nvmrc` → 22.23.3 to match the image (D-27). The owner's local 22.22.3 still meets `engines`.

**Exit criteria:** `docker compose -f infra/compose/compose.prod.yml up` gives a healthy Caddy + API + DB stack over HTTPS on the owner's machine; the database is not reachable from outside the Docker network; hadolint is clean; `pnpm verify` still passes; the PR is open.

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
- The owner's terminals need a VS Code restart to find gitleaks (installed 2026-10-16 via winget).

---

## Handoff

|                  |                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------- |
| **Last session** | 2026-10-16 · Claude (Claude Code)                                                   |
| **Done**         | Phase 1 merged (PR #1, `58edce4`) and verified by a fresh clone; Phase 2 tasks 1–10 |
| **In progress**  | Phase 2 task 11 (commit, push, PR): awaiting owner approval                         |
| **Next step**    | Owner approves → commit + push → owner opens and merges the PR → propose Phase 3    |
| **Branch**       | `chore/phase-2-containerization`                                                    |
| **Blockers**     | None                                                                                |

---

## Session log

| Date       | Agent  | Summary                                                                                                                                  |
| ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-15 | Claude | Requirements analysis, interactive decisions Q1–Q16 and OT-1–OT-5, wrote all Phase 0 docs                                                |
| 2026-10-16 | Claude | Bootstrap commit to `master`; Phase 1 monorepo (shared, API, web, Postgres, tooling, hooks); version decisions D-23–D-25; verify passing |
| 2026-10-16 | Claude | Phase 1 merged (PR #1) and verified via a fresh clone; Phase 2 started                                                                   |
