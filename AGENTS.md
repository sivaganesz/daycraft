# AGENTS.md: Instructions for AI coding agents

This is the **only** instruction file for AI agents (Claude, Gemini, Antigravity, Codex, Cursor, …). Tool-specific files such as `CLAUDE.md` or `GEMINI.md` only point here. **Never put rules in them.**

## 1. The project in brief

**DayCraft** (brand: Whitraworks) is a production, multi-user productivity web app: Planner, Deadlines & Follow-ups, Focus, Kanban, with Personal and Team spaces. It has **two equal goals**: a real product, and the owner learning the full software lifecycle (aiming for a Forward Deployed Engineer role). **Explain the "why" behind your work so the owner learns.**

## 2. Read these first, in this order

1. `docs/PROGRESS.md`: where we are, the current phase's tasks, and the handoff notes.
2. `docs/PRD.md`: what the product does (requirement IDs such as `PLAN-03`).
3. `docs/ARCHITECTURE.md`: how it's built, API conventions, decision log.
4. `SECURITY.md`: mandatory security rules.

**One fact, one place:** features → PRD · technical design → ARCHITECTURE · security → SECURITY · status → PROGRESS. Link to these files; don't copy from them. `docs/archive/` is history only; the current docs override it.

## 3. Session protocol

**At the start of every session:**

1. Read the files in §2.
2. **Before changing anything**, tell the owner the current phase, the last completed step, the next step, and any open questions. Wait for the owner to confirm.
3. Run `pnpm verify` (available from Phase 1) to confirm the project is healthy.

**At the end of every session** (or when stopping):

1. Update the **Handoff** section of `docs/PROGRESS.md`: what was done, what is in progress, the exact next step, open questions, and the current branch.
2. Leave no uncommitted work silently. Propose a commit (it needs approval, see §4).
3. Record new decisions, with reasons, in the ARCHITECTURE decision log or the PRD change log.

## 4. Permission policy

**"Agreed scope" = the tasks listed for the current approved phase in `docs/PROGRESS.md`.**

✅ **Allowed without asking**

- Read any file.
- Read-only git: `status`, `diff`, `log`, `show`, list branches.
- Create and edit files for tasks within the agreed scope.
- Run local checks, builds, tests, the app, and local Docker (start/stop).
- Install dependencies that are **already in the agreed stack** (ARCHITECTURE §4).
- Update the PROGRESS handoff notes.

⚠️ **Ask the owner first, every time.** Show the exact command, what it does, and why. Each approval covers that action only. Related steps may be bundled into one request.

- `git init`, `add`, `commit`, `push`, `pull`, `merge`, `rebase`, `reset`, `stash`, `tag`, `revert`, `cherry-pick`.
- Creating, switching, or deleting branches.
- Creating or merging PRs; changing any GitHub setting.
- **Any CI/CD workflow change, even within the current phase.**
- **Any VPS, DNS, Cloudflare, Oracle, Resend, Backblaze, or other external-service action.**
- Adding a dependency that is not in the agreed stack.
- Deleting files not created in the current task; destroying local data (Docker volumes, database resets).
- Any work outside the agreed scope.

⛔ **Never, even if it seems helpful**

- Push or force-push to `master`.
- Bypass checks (`--no-verify`, skipping, weakening, or deleting tests to get a pass).
- Ask for, print, log, or commit secrets.
- Touch production data without a backup and explicit approval.
- Change a decided item (✅ in ARCHITECTURE, anything in the PRD, the accepted risks in SECURITY) without the owner's approval.

## 5. Working with the owner

- Ask decisions **one question per message, in plain text** (not pop-up forms): lettered options, one marked _(Recommended)_ with the reason, and the trade-offs. End with "Your answer (letter plus any notes)?". The owner often adds notes.
- Don't ask about things that have a sensible default. State the default and continue.
- **Never start a new phase without the owner's explicit approval.**
- If the docs don't cover something, **ask; don't guess.** If you disagree with a decision, explain the risk once, respectfully, then follow the owner's choice and record it.
- Report honestly: failing tests, skipped steps, and uncertainty.

## 6. Engineering rules

- TypeScript **strict** everywhere. Validation uses the shared Zod schemas, which become DTOs on the API (`nestjs-zod`).
- Follow the **API conventions** in ARCHITECTURE §7.3 exactly (`/api/v1`, error format, `404` for others' data, `version` → `409`, UUIDs, UTC).
- All authorization goes through the **permission service**. Audit events are recorded explicitly in services (PRD §8).
- Data changes ship as **backward-compatible migrations** (expand → contract).
- Every feature or change includes tests. Endpoints include the **access-control tests** in SECURITY §2.1.
- Reference requirement IDs in code comments only where useful, and always in PR descriptions (e.g. "Implements PLAN-03").
- Keep changes small and focused, one task per branch and PR.

## 7. Git conventions

- Branches: `feature/…`, `fix/…`, `chore/…`, `docs/…`. `master` changes only through a merged PR that passed CI.
- Commits use **Conventional Commits**: `feat: …`, `fix: …`, `docs: …`, `chore: …`, `test: …`, `refactor: …`.

## 8. Definition of done (for any task)

- [ ] It meets the PRD acceptance criteria it references.
- [ ] `pnpm verify` passes locally (lint, format, type check, tests).
- [ ] Tests were added, including access-control tests for endpoints.
- [ ] Docs were updated if behaviour or design changed; `docs/PROGRESS.md` is updated.
- [ ] No secrets, no stray debugging code, no unapproved dependencies.

## 9. Commands

Run from the repository root. Setup steps: [README.md](README.md).

| Command                                   | Purpose                                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install`                            | Install dependencies and the git hooks                                                                                    |
| `pnpm db:up` / `pnpm db:down`             | Start / stop the local PostgreSQL (Docker)                                                                                |
| `pnpm dev`                                | Run shared + API (:3000) + web (:5173) with hot reload                                                                    |
| `pnpm verify`                             | **Run before every commit proposal.** Format check, build, lint, type check, all tests. Same as CI. Needs the database up |
| `pnpm test` · `pnpm lint` · `pnpm format` | Individual checks                                                                                                         |
| `pnpm --filter @daycraft/api db:migrate`  | Create/apply a Prisma migration (from Phase 6)                                                                            |

Notes:

- **Install scripts are blocked by default** (`allowBuilds` in `pnpm-workspace.yaml`). Allowing a new package to run one is a dependency change and needs approval.
- pnpm refuses **very recently published** package versions (supply-chain protection). Don't bypass it; pick an older stable version instead.
- Generated code (`apps/api/src/generated/`) is git-ignored and rebuilt by `prisma generate`.
