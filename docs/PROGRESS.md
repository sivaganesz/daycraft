# DayCraft: Progress and handoff

> **Read this first** when starting a session (see [AGENTS.md](../AGENTS.md) §3).
> The **current phase's task list is the "agreed scope"**. Agents may work on these tasks without asking; anything else needs the owner's approval.
> Keep this file short and current. History belongs in git and the session log at the bottom.

---

## Current status

|                      |                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------- |
| **Current phase**    | **Phase 3: CI for branches + branch protection**, approved 2026-10-16, in progress      |
| **Repository**       | https://github.com/sivaganesz/daycraft (public). `master` at `faa41c7` (Phase 2, PR #2) |
| **Working branch**   | `chore/phase-3-ci`                                                                      |
| **Live environment** | None yet (Phases 4–5)                                                                   |

---

## Phase overview

Every phase ends with: test locally → `pnpm verify` → commit → push → CI → PR merge → deploy → verify live. Git, CI/CD, and infrastructure steps need the owner's approval (AGENTS.md §4).

| #   | Phase                                                           | Status          |
| --- | --------------------------------------------------------------- | --------------- |
| 0   | Decisions & documentation                                       | ✅ Done         |
| 1   | Local foundation (monorepo skeleton)                            | ✅ Done (PR #1) |
| 2   | Containerization (API image, production Compose)                | ✅ Done (PR #2) |
| 3   | CI for branches + branch protection                             | 🟡 In progress  |
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

## Current phase: Phase 3, CI for branches + branch protection (**approved 2026-10-16**)

**Goal:** GitHub runs all checks automatically on every non-`master` push and every PR, and `master` can only change through a PR whose checks passed (requirement §6A, D-05, D-06).

**Out of scope:** Docker image builds in CI, deployments, VPS, DNS, Cloudflare (Phases 4–5).
**Approvals:** CI workflow contents, every GitHub setting, and all git writes need the owner's approval (AGENTS.md §4).

| #   | Task                                                                                                                                                 | Status                                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | Sync `master`, delete the merged Phase 2 branch, create `chore/phase-3-ci`                                                                           | ✅                                                    |
| 2   | Update `PROGRESS.md` for Phase 3                                                                                                                     | ✅                                                    |
| 3   | CI workflows: reusable `verify.yml` (verify with PostgreSQL service · hadolint · gitleaks) + `ci.yml` (non-`master` pushes and PRs). No image builds | 🟡 drafted, actionlint clean; awaiting owner approval |
| 4   | PR template with the AGENTS.md definition-of-done checklist                                                                                          | ✅                                                    |
| 5   | Protect `master` with a GitHub ruleset (PR required, CI checks required, no direct/force pushes or deletion; 0 reviewers)                            | ⬜ owner, after CI's first run                        |
| 6   | GitHub security features: secret scanning + push protection, private vulnerability reporting, Dependabot alerts                                      | ⬜ owner                                              |
| 7   | Decide REPO-1 (licence)                                                                                                                              | ✅ all rights reserved (D-30)                         |
| 8   | Optional: a deliberately failing PR on a throwaway branch proves merging is blocked                                                                  | ⬜ owner to decide                                    |
| 9   | Docs: ARCHITECTURE §11 status (D-29), PROGRESS. README badge moved to Phase 5 (this CI never runs on `master`)                                       | ✅                                                    |
| 10  | Commit, push, PR (the first PR checked by CI)                                                                                                        | ⏸️ Needs owner approval                               |

**Exit criteria:** CI runs automatically on non-`master` pushes and PRs; a PR with failing checks cannot be merged; `master` rejects direct and force pushes; secret scanning, push protection, and private vulnerability reporting are on.

---

## Open questions

| ID       | Question                                               | Needed by            |
| -------- | ------------------------------------------------------ | -------------------- |
| PRD OQ-1 | Follow-ups: tasks marked "waiting", or a separate list | Phase 10             |
| PRD OQ-2 | Accessibility (WCAG 2.2 AA) and browser support list   | Phase 7              |
| PRD OQ-3 | Account deletion / data export                         | Before public launch |
| PRD OQ-4 | Expense currency details (INR/USD/EUR decided)         | Expense phase        |
| PRD OQ-6 | Revisit the minimum password length (accepted risk)    | Before public launch |

## Known issues

- Prisma prints an "update available 8.0.0-rc" banner during builds. It's harmless (it's a release candidate); we stay on 7.10 (D-25).
- The owner's terminals need a VS Code restart to find gitleaks (installed 2026-10-16 via winget).

---

## Handoff

|                  |                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------- |
| **Last session** | 2026-10-16 · Claude (Claude Code)                                                   |
| **Done**         | Phase 2 merged (PR #2, `faa41c7`) and verified by a fresh clone; Phase 3 tasks 1–2  |
| **In progress**  | Phase 3 task 3: drafting the CI workflows for owner review                          |
| **Next step**    | Owner approves workflow contents → tasks 4, 9 → commit/push/PR → ruleset + settings |
| **Branch**       | `chore/phase-3-ci`                                                                  |
| **Blockers**     | None                                                                                |

---

## Session log

| Date       | Agent  | Summary                                                                                                                                  |
| ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-15 | Claude | Requirements analysis, interactive decisions Q1–Q16 and OT-1–OT-5, wrote all Phase 0 docs                                                |
| 2026-10-16 | Claude | Bootstrap commit to `master`; Phase 1 monorepo (shared, API, web, Postgres, tooling, hooks); version decisions D-23–D-25; verify passing |
| 2026-10-16 | Claude | Phase 1 merged (PR #1) and verified via a fresh clone; Phase 2 started                                                                   |
| 2026-10-16 | Claude | Phase 2 (containers, production stack, D-26–D-28) merged as PR #2, verified via a fresh clone; Phase 3 started                           |
