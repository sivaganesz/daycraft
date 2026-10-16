# Project Understanding — Whitraworks (DayCraft workspace)

> **Status:** Analysis complete and **decisions approved** in an interactive review (see **Section 12**). Nothing has been implemented, installed, or configured yet.
> **Source:** `PROJECT_REQUIREMENTS.md` (read in full; not modified).
> **Date:** 2026-10-15
>
> ⚠️ **Where Section 12 differs from Sections 1–11, Section 12 wins.** Sections 1–11 are the original analysis, kept for reference.

## How to read this document

Throughout this document, every important statement is tagged so you can tell where it came from:

| Tag | Meaning |
|---|---|
| **[REQ]** | Explicitly stated in `PROJECT_REQUIREMENTS.md`. |
| **[ASSUMPTION]** | Something I am inferring because the document doesn't say. Needs confirmation. |
| **[REC]** | My recommendation. Not decided until you approve it. |
| **[DECISION]** | Needs your input before we implement the affected part. Collected in Section 10. |

Nothing in this document is final. In particular, **no tech stack, hosting provider, or architecture has been selected yet.** Everything in Section 6 is a proposal.

---

## 1. Project Overview

You want to build a **real, production-grade, multi-user productivity web application**. Its default name is **"Whitraworks"** [REQ]. It starts as a simple to-do app and grows step by step into a modular personal productivity workspace.

The application itself matters, but the main point is learning. **The app is the vehicle; the full software delivery lifecycle is the destination.** You want to experience everything a professional team does: choosing a stack, structuring a codebase, securing user data, containerizing, automating validation and deployment, running a Linux server, pointing a domain at it, and keeping it alive in production.

The guiding principle in the document is **incremental delivery** [REQ]. Each stage is understood, implemented, tested locally, validated, committed, pushed, deployed when it lands on `master`, and verified live before the next one starts. The document says this explicitly: *"We should not start building all the application features before this initial end-to-end flow is working."*

---

## 2. What We Are Building

### 2.1 In one sentence

A web app where anyone can register, log in, and manage **their own** tasks through several views: a daily plan, deadline/follow-up tracking, focus work, and optionally a Kanban board. Users can also switch on optional modules (shared real-time lists, an expense tracker, insights/habits) and personalize the app with their own logo, theme colour, and light/dark mode.

### 2.2 The problem it solves

A basic to-do list answers only "what do I need to do?" Real productivity problems are different:

- *"What should I do **today**, given my time?"* → Smart Daily Planner
- *"What's due soon, what's overdue, and who am I waiting on?"* → Deadline & Follow-up Tracker
- *"What matters **most** right now, and how do I stay on it?"* → Focus-Based Task Manager
- *"Where is each piece of work in its workflow?"* → Kanban
- *"How do I coordinate with someone else?"* → Real-Time Collaborative To-Do
- *"Where did my money go this month?"* → Expense Tracker
- *"Am I actually getting better? Am I keeping my habits?"* → Insights & Habit Tracker

### 2.3 Intended users

- **[REQ]** Anyone who registers. Each person has an individual account and sees only their own data.
- **[ASSUMPTION]** Initially individuals, such as professionals, students, and freelancers, using it for personal productivity. Teams and organizations are implied only by the *future* enhancements (user management, roles, invitations) and by the collaborative to-do feature.
- **[ASSUMPTION]** You are the first and main user, and you will test every deployed stage yourself.

### 2.4 Why not just a basic to-do list?

A basic to-do list would teach CRUD and little else. The richer feature set forces you into the problems real products face:

| Feature | What it forces you to learn |
|---|---|
| Multiple views over the same tasks | Domain modelling: one source of truth, many presentations |
| Optional features per user | Feature flags, modular architecture, conditional navigation |
| Real-time collaboration | WebSockets, shared-data authorization, concurrency conflicts |
| Logo upload | File uploads, validation, storage, security (malicious files) |
| Expense tracker | Money handling (never floats), aggregation queries, reporting |
| Insights & habits | Time zones, streak logic, analytics queries |
| Audit log | Cross-cutting concerns, compliance thinking, observability |
| Future roles/invitations | Designing for extension without over-building now |

---

## 3. Why We Are Building It and What You Will Learn

You learn by doing each of these for real, on a live system, with real consequences when something breaks. The table maps each learning goal to the concrete moment in this project where you'll practise it.

| Learning area | Where you'll practise it in this project |
|---|---|
| **Frontend & responsive UI** | App shell with sidebar/navbar that collapses on mobile; light/dark mode plus 7 accent colours driven by design tokens; drag-and-drop Kanban that must also work on touch screens; reusable component library. |
| **Backend & API design** | A versioned REST API (`/api/v1/...`) with validation, consistent error formats, pagination, and modules per feature; a WebSocket channel for collaboration. |
| **Database design & data management** | Relational schema for users, tasks, lists, expenses, habits, and audit logs; migrations that evolve the schema safely on a live database; indexes; backups and restores. |
| **Authentication, authorization, data isolation** | Password hashing, sessions, login rate limiting, and ownership checks on every query. You'll write automated tests that prove *User B cannot read User A's tasks*. Collaboration later adds *shared* access, which is the hard case. |
| **Git & branching** | Feature branches, meaningful commits, pull requests into `master`, protected branches, and reading CI results before merging. |
| **Docker & containerization** | Multi-stage Dockerfiles, small and secure images, Docker Compose for local dev and production, networks, volumes, and health checks. |
| **CI/CD** | Two pipeline behaviours: validation-only on feature branches, and build → publish → deploy → verify on `master`. You'll also handle secrets, caching, and concurrency control. |
| **Automated testing & code quality** | Linting, type checking, unit tests, API integration tests against a real database, end-to-end browser tests, and a post-deploy smoke test. |
| **VPS setup & server configuration** | Provisioning a Linux server, SSH key-only access, a non-root deploy user, a firewall, automatic security updates, and installing Docker. |
| **Domain & subdomains** | DNS records (A/AAAA/CNAME), pointing subdomains at the server, and automatic HTTPS certificates via a reverse proxy. |
| **Production deployment, troubleshooting, monitoring, maintenance** | Zero-surprise deploys, reading container logs, health endpoints, uptime alerts, rollbacks to a previous image, database backup drills, and dependency updates. |

The incremental approach matters for learning. Because the pipeline exists **before** features do, every later feature exercises the whole lifecycle again. By the end you won't have deployed once; you'll have deployed dozens of times and learned from each one.

---

## 4. Complete Feature Breakdown

### 4.1 Feature classification

The document uses three labels: "Basic", "Advanced", and "Additional optional". It also says **only basic features are always on; *all other features* are configurable** [REQ]. In practice, **"Advanced" features are also optional.** Here is the resulting classification:

| Feature | Doc label | Always on? | Configurable in Settings? |
|---|---|---|---|
| Authentication & user accounts | Foundation | Yes | No |
| Settings page (profile, branding, theme, features, audit log) | Foundation | Yes | No |
| Smart Daily Planner | Basic | **Yes** | No |
| Deadline & Follow-up Tracker | Basic | **Yes** | No |
| Focus-Based Task Manager | Basic | **Yes** | No |
| Drag-and-Drop Kanban To-Do | Advanced | No | **Yes** |
| Real-Time Collaborative To-Do | Advanced | No | **Yes** |
| Monthly Expense Tracker | Additional optional | No | **Yes** |
| Productivity Insights & Habit Tracker | Additional optional | No | **Yes** |
| User management | Future | — | Not now |
| Role management | Future | — | Not now |
| User invitations | Future | — | Not now |
| Permissions & access controls (expanded) | Future | — | Not now |

**[ASSUMPTION]** Optional features are **off by default** for new users, which keeps the first experience simple. → [DECISION Q9]

### 4.2 Foundation features

**Authentication & accounts** [REQ]
- Registration, login, logout.
- Secure password handling.
- Authentication (who are you?) and authorization (what may you access?).
- Each user can access only their own data.
- After login, the home page first shows a simple greeting such as **"Hey, White!"** This is the end-to-end proof that auth and deployment work.
  - **[ASSUMPTION]** "White" is an example, and the greeting uses the logged-in user's name ("Hey, {name}!").

**Not mentioned but normally expected** (see Section 9). These include forgot/reset password, email verification, account deletion, and "log out of all devices". I have **not** added them as requirements; they are listed as questions.

**Settings page** [REQ], with five sections:

| Section | Requirements | Notes |
|---|---|---|
| **A. Basic Information** | Name, email, phone number, change password | Changing email or password should require the current password [REC]. |
| **B. Application Name & Logo** | Default name "Whitraworks"; user can upload a logo; uploaded logo replaces the default in the sidebar; can change it anytime | The heading says "Application *Name* and Logo", but only logo changes are explicitly described. Can users rename the app? → [DECISION Q6] |
| **C. Theme Customization** | 7 theme colours including blue, green, black; default **black**; save selection; light and dark modes | The other 4 colours are unspecified. [REC] Black (default), Blue, Green, Purple, Teal, Orange, Rose. |
| **D. Optional Feature Management** | Enable/disable optional features; basic features permanently on; enabled ones show in sidebar; disabling removes from sidebar **without affecting unrelated features or user data** | Disabling hides; it never deletes data [REQ-derived]. |
| **E. Audit Log** | Record important actions/changes: what, who, when; used for tracking and troubleshooting | Which events, who can view them, and retention are unspecified → [DECISION Q11] |
| **F. Future Enhancements** | User management, roles, invitations, permissions | **Not built now**, but the architecture must allow them without a redesign [REQ]. |

### 4.3 App shell and UI [REQ]

- Clean, responsive layout across desktop, tablet, and mobile.
- Sidebar for navigation. It lists basic features always, and optional features only when enabled.
- Navbar "if needed". [REC] Use a slim top bar holding the page title, the light/dark toggle, and the user menu (profile, settings, logout). On mobile it also holds the hamburger that opens the sidebar as a drawer.
- Light and dark themes.
- Consistent design system with reusable components.

### 4.4 Review of each use case

The document asks me to judge whether each feature is *appropriate, practical, and purposeful* [REQ]. The names are given, but **none of the features has a functional definition** in the document. Below, each feature has a proposed scope, marked [REC], for you to approve or adjust.

**Key insight:** the three basic features and the Kanban board are **different views of one shared `Task` entity**, not four separate apps. A task has a *scheduled date* (planner), a *due date and follow-up* (deadline tracker), a *priority/focus flag* (focus manager), and a *status* (Kanban column). Building one solid task model first, then adding views, avoids four duplicated data models that drift out of sync. Example: a user marks a task "done" in the Kanban board and it immediately disappears from Today's plan, because it is the same row in the database.

#### Smart Daily Planner (Basic) — Verdict: appropriate, but "smart" must be defined
- **[REC] Scope:** a "Today" view showing tasks scheduled for today, plus overdue and unfinished tasks from previous days offered for carry-over. Includes quick-add, reordering, and an optional time estimate per task showing *"planned 6h 30m of your 8h day"*.
- **"Smart" [REC]:** rule-based suggestions, such as *"3 tasks are due tomorrow and not yet scheduled"* or *"you planned more hours than you have."* These are predictable, testable, and free. **AI-based planning is not mentioned in the requirements**, and I recommend not adding it in v1. → [DECISION Q7]
- **Dependency:** needs the user's **time zone** to know what "today" means. The document doesn't mention time zones (see Section 9).

#### Deadline & Follow-up Tracker (Basic) — Verdict: appropriate and very practical
- **[REC] Scope:** due dates on tasks; grouped views for *Overdue / Today / This week / Later*; **follow-ups**, meaning "waiting on someone" items with a person/context and a follow-up date. For example: *"Follow up with Ravi about the invoice on Friday."*
- **Open question:** should it actively **notify** users (email, push, in-app) when something is due? Notifications need email infrastructure and a background job scheduler, which adds real complexity. → [DECISION Q8]

#### Focus-Based Task Manager (Basic) — Verdict: appropriate, but the concept needs a definition
- **[REC] Scope:**
  - Users mark up to **3 "focus" tasks** for the day.
  - A **focus session timer** (Pomodoro-style, e.g. 25/5 minutes) attached to a task.
  - A distraction-free view showing just the current task.
  - Completed focus sessions are recorded. This data later feeds Productivity Insights.
- Alternative interpretations include an Eisenhower urgent/important matrix or priority-ranked lists. → [DECISION Q7]

#### Drag-and-Drop Kanban To-Do (Optional) — Verdict: appropriate
- **[REC] Scope:** a board with columns (*To Do / In Progress / Done* to start). Users drag tasks between columns and reorder within a column. The board operates on the **same tasks** as the other views.
- **Practical concerns:** drag-and-drop must work with touch (mobile/tablet) and keyboard (accessibility), and ordering must persist efficiently.
- Custom columns are a possible later extension, not v1.

#### Real-Time Collaborative To-Do (Optional) — Verdict: valuable, but the most complex and riskiest feature
- **Why it's hard:** it deliberately **breaks** the rule "each user can access only their own data". It requires a sharing model (who can see what), a way to find or invite other users (which overlaps with the *future* invitations feature), real-time push via WebSockets, and conflict handling when two people edit the same task at once.
- **[REC] Scope for v1:** a user creates a **shared list** and adds other *registered* users by email with a role (*editor* or *viewer*). Changes appear live for everyone viewing the list. Edits use "last write wins", with a version check so a stale edit is detected rather than silently overwriting. No live cursors or typing indicators in v1.
- **[REC] Build it last** among the to-do features, after the authorization foundation is mature. → [DECISION Q5]

#### Monthly Expense Tracker (Optional) — Verdict: practical but unrelated to tasks
- It has no relationship to tasks. The document accepts this explicitly [REQ: *"some use cases may not directly integrate… as long as they provide practical value"*].
- **[REC] Scope:** add expenses (amount, category, date, note), a monthly view with totals per category, an optional monthly budget with "spent vs budget", and month-to-month comparison.
- **Technical rule:** money is stored as **integer minor units** (e.g. paise/cents), never floating point. Floats cause rounding errors (0.1 + 0.2 ≠ 0.3).
- **Open question:** single currency per user, and which default? → [DECISION Q12]

#### Productivity Insights & Habit Tracker (Optional) — Verdict: appropriate; really two sub-features
- **Insights** are *read-only analytics* over data the other features produce: tasks completed per day/week, on-time vs late completion, focus minutes, and busiest days. **It depends on the task, deadline, and focus features existing first.**
- **Habit Tracker** is *its own small domain*: define habits (e.g. "Read 20 min", daily or specific weekdays), check them off each day, and see streaks.
- **[REC]** Keep both under one sidebar entry with two tabs, since the document lists them as one feature.
- **Technical trap:** streaks depend entirely on correct time-zone handling ("did I check in *today*?").

### 4.5 Feature dependencies

```
Auth & users ──► Settings (profile, theme, feature toggles, audit log)
     │
     ▼
Core Task model ──► Daily Planner ──► Deadline/Follow-up ──► Focus Manager
     │                                                          │
     ├──► Kanban (optional)                                     ▼
     ├──► Collaborative (optional; needs sharing + WebSockets)  Insights (needs task + focus data)
     │
Independent: Expense Tracker (optional), Habit Tracker (optional)
Future: User mgmt / roles / invitations  ◄── builds on authorization + collaboration groundwork
```

---

## 5. Expected User Journey

This expands your example flow using the actual requirements. Steps marked [REC] fill gaps the document doesn't specify.

1. **Arrive.** A visitor opens `https://<app-subdomain>.<your-domain>` [REQ: custom domain/subdomain]. They see a login page with the default Whitraworks branding and a "Create account" link.
2. **Register.** They enter name, email, and password [REQ]. The server validates the input, rejects duplicate emails, hashes the password, and creates the account. **[REC]** The server also creates default settings: theme black, light mode, all optional features off, and time zone detected from the browser. An audit entry `user.registered` is written.
3. **Log in securely.** Credentials are checked, and repeated failures are rate-limited [REC]. A secure session is created and an audit entry `auth.login` is written.
4. **Welcome / home.** In the first deployed version, the home page shows **"Hey, {name}!"** [REQ]. Later, the home page becomes the Daily Planner (Today view) [REC].
5. **Own data only.** Every request carries the session. The server identifies the user and returns only rows they own (or, later, rows shared with them) [REQ].
6. **Work with tasks (basic features).**
   - Plans the day in **Smart Daily Planner**, pulling in yesterday's unfinished tasks.
   - Checks **Deadlines & Follow-ups** for overdue and waiting-on items.
   - Starts a **Focus** session on the top-priority task.
7. **Customize in Settings.**
   - Updates name and phone, or changes password (current password required [REC]).
   - Uploads a company logo, which replaces the default logo in the sidebar [REQ].
   - Picks the "Blue" theme and dark mode. The UI updates instantly and the choice is saved to the account, so it follows them to other devices [REQ: "save their selection"].
8. **Enable optional features.** They toggle on **Kanban** and **Expense Tracker** [REQ]. Both appear in the sidebar right away. Later they turn Kanban off: it disappears from the sidebar, but **no tasks are deleted**. The same tasks remain visible in Planner, Deadlines, and Focus [REQ: no impact on data].
9. **Collaborate (if enabled).** They create a shared list "Home renovation", add their partner's email as editor, and both see changes live.
10. **Review history.** In **Settings → Audit Log**, they see entries such as *"Theme changed from Black to Blue — you — 15 Oct 2026, 14:02"* [REQ: what/who/when].
11. **Log out.** The session is destroyed server-side [REQ] and an audit entry `auth.logout` is written.

---

## 6. Proposed Technical Architecture

> **Nothing here is decided.** The document asks us to *"decide on a suitable tech stack"* [REQ]. Below are options, trade-offs, and my recommendation for each layer. → [DECISION Q1]

### 6.1 Overall shape [REC]

```
                        Internet
                           │  HTTPS (443)
                           ▼
              ┌────────────────────────┐
              │  Reverse proxy (Caddy) │  TLS certificates, routing,
              │  app.<your-domain>     │  security headers, compression
              └───┬────────────────┬───┘
     /  (static)  │                │  /api/*  and  /ws (WebSocket)
                  ▼                ▼
          ┌──────────────┐   ┌──────────────┐
          │ web container│   │ api container│  Node.js + TypeScript
          │ (built SPA)  │   │ REST + WS    │
          └──────────────┘   └──────┬───────┘
                                    │ private Docker network only
                                    ▼
                            ┌──────────────┐     ┌──────────────────┐
                            │  PostgreSQL  │     │ uploads volume   │
                            │  (volume)    │     │ (logos)          │
                            └──────────────┘     └──────────────────┘
       All containers run on one VPS via Docker Compose.
       The database port is NEVER exposed to the internet.
```

**Why same-origin (one subdomain, `/api` path) instead of `api.<domain>`?** With the frontend and API on the same origin, the browser sends secure cookies automatically and there is **no CORS** configuration to get wrong. You still learn subdomains: `app.` for the application, and later `staging.`, `status.` (uptime page), or anything else you want. A separate `api.` subdomain is valid too. It's more work (CORS plus cross-site cookie rules) with no real benefit for a single web client. → [DECISION Q4]

### 6.2 Frontend [REC]

| Option | Pros | Cons |
|---|---|---|
| **React + Vite + TypeScript (SPA)** ✅ | Industry standard; clean frontend/backend separation (good for learning both sides); fast dev server; static output is trivial to host | You build routing/data fetching yourself (with libraries) |
| Next.js (full-stack) | One framework for UI + API; SSR | Blurs the frontend/backend boundary you want to learn; heavier, more "magic"; SEO not needed for a logged-in app |
| Vue / Svelte | Simpler mental model | Smaller job market and ecosystem than React |

**Supporting libraries [REC]:** React Router (routing), TanStack Query (server data caching and sync), Tailwind CSS with CSS variables for theme tokens, a headless accessible component base (e.g. Radix/shadcn-style), dnd-kit (Kanban drag-and-drop with touch and keyboard support), React Hook Form + Zod (forms and validation).

**Theming design [REC]:** the 7 accent colours × light/dark are implemented as **CSS custom properties**, e.g. `--color-primary`. Switching theme changes a `data-theme` attribute, with no re-render of the app. The choice is stored on the server (to follow the user across devices) and cached locally (to avoid a flash of the wrong theme on load). One detail: a **black accent in dark mode** would be invisible on a black background. The "black" theme needs a lighter variant in dark mode, and every colour pair needs contrast checking.

### 6.3 Backend [REC]

| Option | Pros | Cons |
|---|---|---|
| **NestJS (Node.js + TypeScript)** ✅ | Opinionated modular structure (one module per feature fits our optional features perfectly); built-in guards (authorization), interceptors (audit logging), pipes (validation), WebSocket gateways (collaboration); same language as frontend | More concepts to learn upfront (decorators, dependency injection) |
| Express / Fastify (plain) | Minimal, you see every piece | You must invent structure and conventions yourself, and that easily turns messy as features grow |
| Python FastAPI | Excellent, fast, great docs | Two languages; can't share types/validation with the frontend |

**Why one language matters here:** with TypeScript on both sides in a **monorepo**, validation schemas and types (e.g. "what does a Task look like?") can be shared. When the backend changes a field, the frontend fails *type checking in CI* instead of breaking in production.

**API style [REC]:** REST under `/api/v1/...`, JSON, consistent error shape, input validation on every endpoint, plus a WebSocket channel for collaboration only.

### 6.4 Database [REC]

- **PostgreSQL** ✅. The data is highly relational (users → tasks → lists → members), and Postgres gives transactions, strong constraints, and JSONB (handy for audit-log change details). It is also the most common production database you'll meet. (MySQL would work; MongoDB fits relational, permission-heavy data poorly.)
- **ORM / migrations:** **Prisma** ✅ (excellent type safety, readable schema, mature migrations) vs Drizzle (closer to SQL, lighter). Prisma is the gentler learning path; Drizzle teaches more raw SQL.
- **Redis:** **not needed initially.** Add it only if we later need multi-instance WebSockets, job queues, or distributed rate limiting. (Resource efficiency [REQ].)

**Proposed core data model [REC]** (sketch, not final):

| Table | Purpose / key columns |
|---|---|
| `users` | id (UUID), name, email (unique), phone, password_hash, timezone, **role** (for the future), created_at |
| `sessions` | id, user_id, expires_at, ip, user_agent — enables logout and "log out everywhere" |
| `user_settings` | user_id, app_name, logo_path, theme_color, theme_mode |
| `user_features` | user_id, feature_key, enabled — optional feature toggles |
| `task_lists` | id, owner_id, name, is_shared |
| `list_members` | list_id, user_id, role (owner/editor/viewer) — collaboration; groundwork for future roles |
| `tasks` | id, owner_id, list_id, title, notes, status, priority, is_focus, scheduled_date, due_at, follow_up_at, follow_up_with, estimate_minutes, position, version, completed_at |
| `focus_sessions` | id, user_id, task_id, started_at, ended_at, duration |
| `expense_categories`, `expenses`, `budgets` | amount stored as integer minor units + currency |
| `habits`, `habit_checkins` | habit schedule; one check-in per habit per local date |
| `audit_logs` | id, actor_id, action, entity_type, entity_id, changes (JSONB, secrets excluded), ip, user_agent, created_at — append-only |

### 6.5 Authentication & authorization [REC]

| Option | Pros | Cons |
|---|---|---|
| **Server-side sessions + httpOnly secure cookie** ✅ | Simple; JavaScript can't read the cookie (resists XSS token theft); instant revocation (logout, password change, "log out everywhere") | Session lookup per request (trivial cost with an index) |
| JWT access + refresh tokens | Stateless; good for mobile apps / many services | Revocation is hard; easy to implement insecurely (e.g. storing tokens in localStorage); more moving parts |

Recommended specifics:
- **Password hashing:** Argon2id (OWASP's current first recommendation); bcrypt is an acceptable fallback.
- **Cookies:** `HttpOnly`, `Secure`, `SameSite=Lax`, plus a CSRF protection measure for state-changing requests.
- **Login protection:** rate limiting per IP and per account; generic error messages ("invalid email or password") to avoid revealing which emails exist.
- **Authorization in layers:**
  1. *Authentication guard*: is there a valid session?
  2. *Ownership/permission check* in **one central place** (a policy/permission service). Example: `can(user, 'update', task)`. Today it checks `task.owner_id === user.id`. With collaboration it also checks `list_members`. With future roles it also checks the role. **This is the key to adding roles later without a redesign** [REQ, Section 5F].
  3. *Feature guard*: requests to a disabled optional feature's API are rejected (data is kept; access is paused).
- **Data isolation is proven by tests:** every resource gets an automated test like *"User B requesting User A's task gets 404"*. This class of bug (IDOR) is among the most common real-world vulnerabilities.
- **Optional defense-in-depth (later):** PostgreSQL Row-Level Security as a second safety net.

### 6.6 File uploads (logo) [REC]

- Accept PNG/JPEG/WebP only, max ~2 MB, verified by file content (not just the extension). **Reject SVG.** SVGs can contain JavaScript (an XSS risk) unless sanitized.
- Re-encode and resize on the server (e.g. with the `sharp` library). This strips metadata and anything malicious.
- Store on a Docker volume on the VPS behind a small storage interface, so moving to S3-compatible object storage later is a one-file change. **Include the volume in backups.**

### 6.7 Real-time collaboration [REC]

- **Socket.IO** (WebSockets with automatic reconnection) ✅ vs Server-Sent Events (simpler, but one-way only) vs managed services such as Pusher/Ably (easy, but external cost/dependency and less learning).
- Design: the socket authenticates with the same session cookie. Each shared list is a "room", and the server checks list membership before letting a user join. Changes are **saved to the database first**, then broadcast to the room. Clients apply the change to their TanStack Query cache.
- Conflicts: each task has a `version` number. An update sent with an old version is rejected, and the client refreshes. This is *optimistic concurrency control*, simple and honest, and it avoids the heavy machinery of CRDTs (used by Google Docs-style editors).

### 6.8 Docker [REC]

- **Monorepo** layout (e.g. `apps/web`, `apps/api`, `packages/shared`) managed with **pnpm workspaces**.
- **Multi-stage Dockerfiles:** a "build" stage with dev tools and a small "runtime" stage containing only what's needed, running as a **non-root** user.
- **Images:** `web` (static files served by a tiny web server) and `api` (Node).
- **Compose files:**
  - `compose.dev.yml`: Postgres for local development (apps run with hot reload on your machine).
  - `compose.prod.yml`: proxy + web + api + postgres, with health checks, restart policies, named volumes, a private network, and log rotation limits.

### 6.9 VPS infrastructure [REC]

- **Provider:** any reputable one (Hetzner, DigitalOcean, Vultr, Linode, Contabo, OVH, etc.). → [DECISION Q3]
- **Size:** 2 vCPU / 4 GB RAM is comfortable (2 GB is workable). Add swap.
- **OS:** Ubuntu Server LTS.
- **Hardening checklist:** SSH keys only (password login disabled), a non-root `deploy` user, firewall allowing only 22/80/443, fail2ban, unattended security upgrades, and Docker installed from the official repository.
- **Important gotcha you'll learn:** Docker writes its own firewall rules and **bypasses UFW** for published ports. If we publish Postgres's port "just for testing", it is exposed to the whole internet even with UFW enabled. The rule: only the reverse proxy publishes ports.

### 6.10 Domain & subdomains [REC]

- You'll need a domain you control. → [DECISION Q3]
- DNS: an `A` record (and `AAAA` if IPv6) for `app.<domain>` → VPS IP. Optionally `staging.` or `status.` later.
- **Reverse proxy:**

| Option | Pros | Cons |
|---|---|---|
| **Caddy** ✅ | Automatic HTTPS (Let's Encrypt) with renewal built in; tiny config; fewer failure points | Less common in job listings than Nginx |
| Nginx + Certbot | Industry standard; huge knowledge base; teaches more of the underlying mechanics | More config; certificate renewal is a separate moving part |
| Traefik | Auto-discovers Docker containers | Label-based config is confusing for beginners |

### 6.11 Observability & maintenance [REC]

- `GET /api/health` (process alive) and `GET /api/health/ready` (database reachable), used by Docker health checks and post-deploy verification.
- Structured JSON logs (e.g. pino) with request IDs, readable via `docker compose logs`.
- An external uptime monitor (e.g. UptimeRobot free tier or self-hosted Uptime Kuma) that alerts you when the site goes down.
- Optional error tracking (e.g. Sentry free tier).
- **Database backups:** a nightly `pg_dump` plus the uploads volume, copied **off the server**, with periodic **restore tests**. A backup you've never restored isn't really a backup.

---

## 7. Git, CI/CD, Docker, and Deployment Strategy

### 7.1 Branching [REQ + REC]

- **[REQ]** `master` is the production branch. Other branches are for work in progress.
- **[REC]** Short-lived branches named by type: `feature/auth-login`, `fix/sidebar-mobile`, `chore/ci-cache`, `docs/...`.
- **[REC]** Conventional commit messages (`feat: add task due dates`, `fix: ...`). They read well in history and can later generate changelogs.
- **[REC]** Work reaches `master` **only through a pull request** whose CI checks passed. See 7.4.
- **Note:** GitHub creates new repos with a default branch named `main`. We'll set it to `master` explicitly to match your requirement [REQ].

### 7.2 Pipeline A — non-`master` branches (validate only) [REQ]

Triggered by a push to any branch except `master` (and by pull requests targeting `master`):

1. Install dependencies (cached).
2. **Lint** (ESLint) and **format check** (Prettier).
3. **Type check** (`tsc`) across all packages.
4. **Unit tests** (Vitest).
5. **Integration tests** for the API against a real, temporary PostgreSQL container.
6. **Build** the frontend and backend (a compile check only).
7. ❌ **No** Docker image build, ❌ **no** registry push, ❌ **no** deployment [REQ].

Possible gap: because Docker images are never built on branches, a broken `Dockerfile` would only be discovered on `master`, during a production deploy. Mitigations:
- **(a)** Lint Dockerfiles on branches with `hadolint`. This is lightweight and builds no image, so it fits your rule. ✅ [REC]
- **(b)** Build (without pushing) only when Docker-related files change. This bends your "no image build" rule, so I won't do it without your approval. → [DECISION Q2]

### 7.3 Pipeline B — `master` (validate → build → publish → deploy → verify) [REQ]

1. **Validate:** re-run the same checks as Pipeline A (shared as a reusable workflow, so they never diverge).
2. **Build** Docker images for `web` and `api`.
3. **Publish** them to a container registry [REQ: "if one is used"]. [REC] **GitHub Container Registry (GHCR)**: free with GitHub and integrated with Actions. Each image is tagged with the **git commit SHA** (immutable, traceable) and also `latest`.
4. **Deploy** to the VPS over SSH as the limited `deploy` user. The server pulls the exact SHA-tagged images.
5. **Apply deployment steps safely:**
   - Take a quick database backup before migrating.
   - Run database migrations as a one-off container **before** starting the new app version.
   - Start the new containers (`docker compose up -d`).
   - A `concurrency` lock ensures two deploys never run at the same time.
6. **Verify:** wait for container health checks, then call `https://app.<domain>/api/health/ready` from the pipeline. Optionally run a tiny browser smoke test (load the login page).
7. **On failure:** redeploy the **previous SHA** (rollback) and mark the pipeline red, so you're notified.

Why a registry instead of building on the VPS: building on the server uses its limited CPU/RAM (hurting the live app during builds) and makes it harder to know exactly what's running. With a registry, *the image that passed CI is byte-for-byte the image that runs in production*, and rollback is just "run the previous tag".

Secrets (SSH key, registry token, production `.env` values) live in **GitHub Environment secrets** and on the server. They are **never committed**. A `.env.example` documents required variables.

Expected downtime: a single-server Compose deploy causes a few seconds of downtime while the API container restarts. That's normal and acceptable at this stage. Zero-downtime (blue/green) deploys are a possible later learning exercise.

### 7.4 Points needing clarification

| Topic | Issue | Recommendation |
|---|---|---|
| **Direct push to `master` vs PR merge** | If anyone can push directly to `master`, untested code deploys immediately. | **Protect `master`:** require a PR plus passing CI; merging the PR triggers the deploy. → [DECISION Q2] |
| **Branch protection availability** | On GitHub's free plan, protected branches/rulesets are available for **public** repos; for **private** repos they need a paid plan (e.g. GitHub Pro). | Make the repo public, pay for Pro, or rely on discipline (never push to `master` directly). → [DECISION Q2] |
| **Git hosting** | Not specified. | **GitHub + GitHub Actions + GHCR** (most common, free tier generous). GitLab CI is a strong alternative. → [DECISION Q2] |
| **Migrations vs rollback** | Rolling back the app image doesn't roll back the database schema. | Use **backward-compatible migrations** (add columns first, remove old ones in a later release), plus the pre-migration backup. |
| **Staging environment** | Not requested; your rules say non-`master` branches never deploy. | Not now. It could be added later as a manually triggered `staging.` subdomain. |

---

## 8. Step-by-Step Implementation Roadmap

**Ordering principle [REQ]:** build a working end-to-end "walking skeleton" first (deployed, with CI/CD), then authentication, then the UI shell, then features one at a time. Every phase ends with commit → push → CI → (merge → deploy → live verification).

**One deliberate reordering [REC]:** the document lists UI (§3), then use cases (§4), then Settings (§5). Optional features can only *appear* in the sidebar once **feature toggles** exist, so I recommend building the **core of the Settings page before the optional features**. Logging is also hard to add retroactively, so I recommend **audit-log infrastructure** be built alongside authentication, while its viewer UI comes with Settings. → [DECISION Q10]

### Phase 0 — Decisions & accounts *(no code)*
- **Build:** nothing. Approve this document, answer Section 10, and get the accounts: Git host, VPS, domain.
- **Why:** every later phase depends on these choices; changing the stack later is expensive.
- **Learn:** how to evaluate trade-offs and write them down (a lightweight Architecture Decision Record habit).
- **Test:** n/a.
- **Exit criteria:** stack approved; repo created with default branch `master`; VPS and domain available.

### Phase 1 — Local foundation (monorepo skeleton)
- **Build:** monorepo (`apps/web`, `apps/api`, `packages/shared`); a "Hello from Whitraworks" page; `/api/health` endpoint; Postgres via Docker Compose; one first migration; ESLint, Prettier, TypeScript strict mode, Vitest; `.env.example`; `README` with setup steps; `.gitignore`/`.dockerignore`.
- **Why:** a clean structure from day one avoids painful reorganizing later [REQ: clean, scalable, maintainable].
- **Learn:** monorepos, project configuration, environment variables, how the frontend calls the backend.
- **Test:** `pnpm lint && pnpm typecheck && pnpm test` pass locally; the web page shows data fetched from the API.
- **Exit:** a new developer can clone, follow the README, and run everything with a couple of commands.

### Phase 2 — Containerization
- **Build:** multi-stage Dockerfiles for `web` and `api`; `compose.prod.yml` with proxy, web, api, and postgres; health checks; non-root users.
- **Why:** "it works on my machine" must become "it works in a container", which is exactly what will run on the server.
- **Learn:** images vs containers, layers and caching, volumes, networks, health checks.
- **Test:** run the full production compose stack **locally** and reach the app through the proxy.
- **Exit:** production-like stack runs locally from images.

### Phase 3 — CI for branches (Pipeline A)
- **Build:** GitHub Actions workflow for lint, typecheck, tests, build, and hadolint, on non-`master` pushes and PRs.
- **Why:** automated quality gates before anything can reach production [REQ §6A].
- **Learn:** workflow syntax, triggers, caching, service containers, reading CI logs.
- **Test:** push a branch with a deliberate lint error and watch CI fail; fix it and watch CI pass.
- **Exit:** a green check appears on PRs; a failing check blocks merging (if protection is enabled).

### Phase 4 — VPS, domain, HTTPS
- **Build:** provision and harden the server; install Docker; create the `deploy` user; DNS record for `app.<domain>`; reverse proxy with automatic HTTPS.
- **Why:** the deployment target must exist and be secure before we automate deployments onto it [REQ §1].
- **Learn:** SSH, Linux users and permissions, firewalls, DNS propagation, TLS certificates.
- **Test:** `https://app.<domain>` shows a placeholder with a valid certificate; SSH password login is refused; the database port is unreachable from outside.
- **Exit:** a secure, reachable server.

### Phase 5 — CD on `master` (Pipeline B) — the walking skeleton goes live
- **Build:** deploy workflow (validate → build → push to GHCR → SSH deploy → migrate → health-check → rollback on failure).
- **Why:** completes the doc's Stage 1, *"complete the initial setup end to end and verify that everything works"* [REQ].
- **Learn:** registries, image tagging, secrets management, deployment automation, rollbacks.
- **Test:** merge a visible change ("Hello v2") and see it live in minutes; then deliberately ship a broken health check to watch the rollback work.
- **Exit:** **"Hello from Whitraworks" is live via the pipeline, and no manual steps on the server are needed for a deploy.**

### Phase 6 — Authentication & first real deployment
- **Build:** register/login/logout; Argon2id hashing; sessions; rate limiting; central authorization service; audit-log infrastructure (records auth events); a protected home page showing **"Hey, {name}!"**; **nightly backups start now**, because real user data now exists.
- **Why:** this is the doc's Stage 2 gate, and *no feature work starts before it's verified live* [REQ].
- **Learn:** password security, sessions vs JWTs, cookies, CSRF, authorization patterns, writing security tests.
- **Test:** unit and integration tests (wrong password, duplicate email, accessing a protected route without a session, User A vs User B isolation); an end-to-end test of register → login → greeting → logout; **you test manually on the live site** [REQ].
- **Exit:** you register on the live site and see "Hey, {your name}!" You approve before Phase 7.

### Phase 7 — App shell & design system
- **Build:** responsive layout, sidebar (driven by a **feature registry**), top bar, light/dark mode, 7 accent colour tokens, reusable components (buttons, inputs, dialogs, toasts, empty states).
- **Why:** every feature page plugs into this shell; consistency comes from building it once [REQ §3].
- **Learn:** responsive design, CSS variables and theming, accessibility basics, component design.
- **Test:** component tests; manual checks at mobile/tablet/desktop widths; contrast checks for all theme combinations.
- **Exit:** a polished, empty shell that works on a phone.

### Phase 8 — Settings (core)
- **Build:** Basic Information (name, email, phone, change password); logo upload; theme colour and mode persisted to the account; optional feature toggles wired to the sidebar and API guards; audit log viewer.
- **Why:** optional features in later phases depend on toggles; personalization is required [REQ §5].
- **Learn:** form design and validation, file upload security, per-user preferences, feature flags.
- **Test:** password change invalidates other sessions; malicious or oversized uploads are rejected; toggling a feature shows/hides it without data loss; audit entries appear correctly.
- **Exit:** every Settings section works live.

### Phase 9 — Core Task model + Smart Daily Planner *(basic)*
- **Build:** task CRUD API and data model (designed to support every later view); Today view; carry-over; estimates; rule-based suggestions. The home page becomes "Today".
- **Why:** the task model is the backbone of four features. Getting it right once saves rework.
- **Learn:** domain modelling, time zones, optimistic UI updates.
- **Test:** isolation tests for tasks; "today" computed correctly across time zones; carry-over logic unit-tested.
- **Exit:** you can plan your real day with it.

### Phase 10 — Deadline & Follow-up Tracker *(basic)*
- **Build:** due dates, overdue/upcoming groupings, follow-up items. (Notifications only if approved, Q8.)
- **Learn:** date queries, indexes, grouping logic.
- **Test:** boundary tests (due exactly at midnight, different time zones).
- **Exit:** nothing slips past its deadline unnoticed.

### Phase 11 — Focus-Based Task Manager *(basic)*
- **Build:** focus picks (max 3), focus timer, recorded sessions, focus view.
- **Learn:** client-side timers that survive tab switches and refreshes; recording time data.
- **Test:** timer accuracy; sessions persist correctly.
- **Exit:** all three basic features complete.

### Phase 12 — Kanban *(optional)*
- **Build:** board with drag-and-drop between and within columns, plus efficient order persistence.
- **Learn:** drag-and-drop UX, accessibility, ordering algorithms (e.g. fractional/lexicographic positions).
- **Test:** E2E drag test; keyboard drag; mobile touch.
- **Exit:** works on touch and keyboard; disabling it hides it without data loss.

### Phase 13 — Monthly Expense Tracker *(optional)*
- **Build:** expenses, categories, monthly totals, budget, comparison.
- **Learn:** money handling, aggregate SQL queries, simple charts.
- **Test:** rounding-safe totals; month boundary tests.
- **Exit:** a full month of expenses summarizes correctly.

### Phase 14 — Productivity Insights & Habit Tracker *(optional)*
- **Build:** insight charts from task and focus data; habits with check-ins and streaks.
- **Why after Phases 9–11:** insights need their data to exist.
- **Learn:** analytics queries, time-zone-correct streaks, data visualization.
- **Test:** streak edge cases (missed day, time-zone change, daylight saving).

### Phase 15 — Real-Time Collaborative To-Do *(optional)*
- **Build:** shared lists, membership roles, WebSocket rooms, live updates, version conflicts.
- **Why last:** most complex; depends on a mature authorization layer; lays groundwork for future invitations.
- **Learn:** WebSockets, shared-resource authorization, concurrency, reverse-proxying WebSockets.
- **Test:** two-browser E2E test; a non-member cannot join a room; a removed member loses access immediately.

### Phase 16 — Production hardening & operations
*(Basics such as health checks and backups start earlier. This phase completes them.)*
- **Build:** uptime alerts, error tracking, log retention, backup **restore drill**, dependency update automation (e.g. Dependabot), security review, runbook ("what to do when the site is down").
- **Learn:** operating a live service: monitoring, incident response, maintenance.
- **Exit:** you can restore the database from a backup and roll back a deploy from memory.

### Future — User management, roles, invitations [REQ: later]
These build on the central authorization service, `users.role`, and `list_members`. Requirements will be clarified when we get there (Q5).

---

## 9. Missing Requirements, Risks, and Recommendations

None of these change your requirements. Each one explains an issue and recommends a solution for you to accept or reject.

### 9.1 Missing technical decisions
| Missing | Recommendation |
|---|---|
| Tech stack (all layers) | Section 6 proposal → Q1 |
| Git host, registry | GitHub + Actions + GHCR → Q2 |
| VPS provider/size, domain name, subdomain layout | → Q3, Q4 |
| Reverse proxy | Caddy (or Nginx for more hands-on learning) → Q4 |
| Backup strategy & storage location | Nightly off-server dumps + restore drills (Section 6.11) |
| Monitoring/alerting | Health endpoints + external uptime monitor |

### 9.2 Ambiguous requirements
| Ambiguity | Why it matters | Recommendation |
|---|---|---|
| Behaviour of all 7 features is undefined (only names given) | Can't build or test what isn't defined | Approve/adjust the scopes in §4.4 → Q7 |
| "Smart" in Smart Daily Planner | AI vs rules is a big difference in cost and complexity | Rule-based in v1 |
| "Advanced" vs "optional" | Doc implies advanced features are also toggleable | Treat Kanban and Collaborative as optional (§4.1) |
| Can users rename the application, or only change the logo? | Section heading says "Name and Logo"; text only describes logo | Allow both per user; default "Whitraworks" → Q6 |
| Branding scope: per user or global? | If per user, each person sees their own logo | Per user (matches per-user settings) → Q6 |
| Project folder is "DayCraft" but the app is "Whitraworks" | Naming of repo, images, domain | Confirm which name the repo/product uses → Q6 |
| The 4 unnamed theme colours | Need definite palette | Purple, Teal, Orange, Rose |
| Default state of optional features for new users | Onboarding experience | All off → Q9 |
| Audit log: which events, who sees it, retention | Storage growth, privacy | §9.4 → Q11 |
| Meaning of future "user management" | Platform admin managing all users vs team/workspace owners managing members are **different architectures** | Decide before the collaborative phase → Q5 |
| Phone number purpose | Verification (SMS) is costly | Optional, format-validated, not verified |
| Changing email | Email is the login identity | Require current password; verify new email once email sending exists → Q8 |

### 9.3 Requirements not mentioned that real apps usually need
I have **not** added these. Each is a question for you:
- **Forgot/reset password** and **email verification**. Both require an email-sending provider (e.g. Resend, Postmark, Amazon SES) and a mail domain setup (SPF/DKIM DNS records, which is also a good DNS learning exercise). → Q8
- **Deadline reminders/notifications** (email/in-app). Needs email plus a background job scheduler. → Q8
- **User time zone.** Required for "today", deadlines, and streaks. [REC] Auto-detect at registration and make it editable in Settings.
- **Account deletion & data export**, plus a privacy policy, if real outsiders will register. Relevant for privacy laws such as GDPR and India's DPDP Act.
- **Recurring tasks** ("every Monday"). This overlaps with the habit tracker; deliberately left out unless you want it.
- **Abuse protection** for open registration (rate limiting now; CAPTCHA only if spam appears).

### 9.4 Security concerns
| Concern | Recommendation |
|---|---|
| **Data isolation bugs (IDOR)** | Central authorization service + mandatory cross-user tests for every endpoint; UUIDs instead of guessable sequential IDs (helpful, but not a substitute for checks) |
| **Collaboration weakens isolation** | Explicit membership table; membership checked on every request **and** on WebSocket room join; access revoked immediately on removal |
| **Logo upload** | Type/size limits, content sniffing, server re-encoding, no SVG, served with safe headers |
| **Credential attacks** | Argon2id, login rate limiting, generic error messages, session invalidation on password change |
| **XSS / CSRF** | React escapes output by default; httpOnly cookies; SameSite + CSRF token; Content-Security-Policy header |
| **Audit log leaking secrets** | Never log passwords, tokens, or session IDs; store changed field names and old/new values only for non-sensitive fields; logs are append-only (no update/delete API) |
| **Audit log as personal data** | IPs and user agents are personal data → define retention (e.g. 12 months) and include them in account deletion/export |
| **Secrets** | Never in Git; GitHub Environment secrets + server `.env` with restricted file permissions; pre-commit secret scanning [REC] |
| **Server exposure** | Only ports 22/80/443; DB never published (Docker bypasses UFW); SSH keys only |

### 9.5 Infrastructure & deployment risks
| Risk | Mitigation |
|---|---|
| Single VPS = single point of failure | Acceptable for this stage; off-server backups + documented rebuild procedure (ideally scripted) |
| Data loss | Nightly off-server backups + pre-migration backup + restore drills |
| Bad migration breaks production | Backward-compatible migrations; test migrations in CI against a real Postgres |
| Broken Dockerfile only discovered on `master` | `hadolint` on branches (Q2 option b) |
| Disk filling up (images, logs) | Prune old images after deploy (keep the last few for rollback); Docker log rotation |
| Certificate renewal failure | Caddy handles it automatically; the uptime monitor also checks the certificate |
| Deploy credentials compromised | Dedicated `deploy` user and SSH key used only by CI; registry token with minimal scope |
| Direct pushes to `master` | Branch protection (Q2) |

### 9.6 Features that may be too complex for v1
| Feature | Complexity | Recommendation |
|---|---|---|
| Real-Time Collaborative To-Do | **High**: WebSockets, shared authorization, conflicts, overlaps with future invitations | Build last; minimal v1 (shared lists + live updates + version check) |
| Notifications/reminders (if requested) | Medium–High: email provider, scheduler, delivery reliability | Defer until after basic features |
| Smart Planner with AI | High cost and unpredictability | Rule-based v1 |
| Insights & Habit Tracker | Medium: analytics and time zones | After data-producing features exist |
| Audit log for *every* action | Storage noise | Log security, settings, and key data changes, not every keystroke |

### 9.7 Feature dependencies (summary)
- Everything → Auth.
- Optional features → feature toggles (Settings core) → **Settings core must precede optional features.**
- Planner, Deadlines, Focus, Kanban, Collaborative → **shared Task model.**
- Insights → task, deadline, and focus data.
- Collaborative → mature authorization + WebSockets; its sharing model should be designed with **future user management/invitations** in mind.
- Planner, Deadlines, Habits → **user time zone.**

---

## 10. Questions That Need Your Decision

Questions with a recommended default can be answered with "accept default". The roadmap marks when each one blocks work.

| # | Question | My recommended default | Blocks |
|---|---|---|---|
| **Q1** | Approve the tech stack? | React + Vite + TS · NestJS · PostgreSQL + Prisma · sessions + Argon2id · Socket.IO · pnpm monorepo · Docker Compose | Phase 1 |
| **Q2** | Git/CI setup: (a) GitHub + Actions + GHCR? (b) Deploy only via PR merge into a protected `master`? (c) Repo public, or private with GitHub Pro, or private without protection? (d) Allow a no-push Docker build on branches when Docker files change, or only `hadolint`? | (a) Yes (b) PR-only (c) your choice — affects protection (d) `hadolint` only, respecting your rule | Phase 3 |
| **Q3** | Which VPS provider/budget, and which domain do you own (or will buy)? | Any reputable provider, 2 vCPU / 4 GB, Ubuntu LTS | Phase 4 |
| **Q4** | Subdomain layout and reverse proxy? | `app.<domain>` with `/api` on the same origin; **Caddy** (choose **Nginx** if you want to learn the industry-standard config by hand) | Phase 4 |
| **Q5** | Future "user management": a **platform admin** who manages all users, or **teams/workspaces** whose owners invite members? And for collaboration, can a user share with any registered user by email? | Decide before Phase 15; meanwhile we build the central authorization service and `role` field, which suit either path | Phase 15 |
| **Q6** | Naming and branding: is the product "Whitraworks" (repo name too, or "DayCraft")? Can users change the **app name** as well as the logo? Is branding per user? | Product "Whitraworks"; per-user name + logo override | Phase 8 |
| **Q7** | Approve the feature scopes in §4.4 (especially what "Smart" and "Focus-Based" mean)? | Rule-based planner; Top-3 focus + Pomodoro timer | Phase 9 |
| **Q8** | Email capabilities: password reset, email verification, deadline reminders? (Requires an email provider and possibly a small cost.) | Add password reset + verification after Phase 8; reminders after the basic features | Phase 8+ |
| **Q9** | Optional features on or off by default for new users? | Off | Phase 8 |
| **Q10** | Approve the reordering: Settings core (incl. feature toggles) **before** feature pages, and audit-log infrastructure alongside auth? | Yes | Phase 6 |
| **Q11** | Audit log: which events, visible only to the user themself, retention period? | Auth, profile, password, settings, feature toggles, and task/expense create/delete; user sees own log; 12-month retention | Phase 6 |
| **Q12** | Expense tracker currency: single currency per user? Default? | One currency per user, chosen in Settings; default INR [ASSUMPTION — please confirm] | Phase 13 |

---

## 11. Final Understanding of the Project

**Whitraworks** is a learning project disguised as a product, and the product has to be real.

The product is a multi-user productivity app. Its core is a single well-designed task model, presented through three always-on views: *plan today*, *track deadlines and follow-ups*, and *focus on what matters*. Users can switch on optional modules from Settings: a Kanban board, real-time shared lists, an expense tracker, and insights/habits. Each user's data is strictly private unless they explicitly share it. Users can rebrand the app with their own logo and choose one of seven accent colours, in light or dark mode. An audit log records who changed what and when.

The real goal is fluency in the **full delivery lifecycle**. Code moves from a feature branch, through automated quality gates, into `master`, then into a container image in a registry, onto a hardened VPS behind HTTPS on your own subdomain, and gets verified automatically once it's live. The pipeline is built **first**, before any features, so that every feature after it is a full rehearsal of the professional workflow: understand → design → implement → test → validate → commit → deploy → verify.

The non-negotiables are clean architecture, security (especially data isolation), maintainability, resource efficiency, and **one verified step at a time**. The first milestone isn't a feature. It's a stranger being able to register on your live domain and see *"Hey, {name}!"*, delivered entirely by an automated pipeline.

---

## 12. Approved Decisions (Interactive Review — 2026-10-15)

These decisions were made by the project owner one question at a time. They **supersede** any conflicting proposal in Sections 1–11.

### 12.1 Naming & branding (Q6)
| Item | Decision |
|---|---|
| Product name | **DayCraft** |
| Brand / company | **Whitraworks** (shown as "by Whitraworks" in the footer) |
| Default sidebar | DayCraft placeholder logo (SVG, to be designed — no logo exists yet) + "DayCraft" |
| Branding scope | **Per space.** Each space (Personal or Team) can set its own display name + logo. Team spaces default to the team name. |
| Repo / images / code name | `daycraft` |

> This refines the requirement "default application name: Whitraworks". Whitraworks stays the brand; DayCraft is the product's default name.

### 12.2 Tech stack (Q1)
React + Vite + TypeScript + **Tailwind CSS** (theme colours as CSS variables) · NestJS (Node + TS) · PostgreSQL + Prisma · server-side sessions in httpOnly cookies + Argon2id · pnpm monorepo (`apps/web`, `apps/api`, `packages/shared`) · Docker Compose. *(Socket.IO only when real-time collaboration is built — now deferred.)*

### 12.3 Git & CI/CD (Q2)
| Item | Decision |
|---|---|
| Hosting / CI / registry | **GitHub + GitHub Actions + GHCR** |
| Repository | **Public**, named `daycraft`, default branch **`master`** — created by the owner |
| Path to `master` | **Pull-request merge only**, enforced by GitHub branch protection/rulesets (PR required, CI must pass, no direct or force pushes) |
| Non-`master` branches | Lint, format check, type check, unit + integration tests, build, **hadolint** — **no Docker image builds, no deploys** |
| `master` | Validate → **(1) API:** build **`linux/arm64`** image (GitHub Arm runners) → push to GHCR (tag = commit SHA) → SSH deploy to Oracle → migrate → health check → rollback on failure → **(2) Frontend:** `vite build` → upload to **Cloudflare Pages** with `wrangler` → verify live. API always deploys **before** the frontend; API changes stay backward-compatible (Q14) |
| Cloudflare Pages | **Not** connected to GitHub, so **no branch preview deployments**; only the `master` pipeline uploads (keeps the "non-`master` never deploys" rule) (Q14) |
| Public-repo safeguards | `.env*` git-ignored (only `.env.example` committed), secret scanning in CI, GitHub secret scanning + push protection enabled |

### 12.4 Infrastructure (Q3, Q4)
| Item | Decision |
|---|---|
| Server | **Oracle Cloud Always Free**, Arm `VM.Standard.A1.Flex`, **no card upgrade** |
| Region | **India South — Hyderabad** |
| Known risks accepted | Idle reclamation (mitigated by off-server backups, scripted server setup, uptime alerts — **not** by artificial load); only Always Free-eligible resources may be created; capacity retries may be needed; public IP changes if the VM is recreated (short DNS TTL) |
| Domain | **`whitraworks.online`** (registered at Hostinger; **DNS stays at Hostinger**) |
| Application (frontend) | `daycraft.whitraworks.online` → **Cloudflare Pages** (global CDN, free), via a **CNAME** at Hostinger (Q14) |
| API (REST, later WebSocket) | `daycraft-api.whitraworks.online` → **Oracle VM** (Caddy → API → PostgreSQL), via an **A record** at Hostinger. Strict CORS: only the app origin, credentials allowed |
| Frontend hosting change (Q14) | The requirement "deploy the application to the VPS" now means: **API to the VPS, frontend to Cloudflare Pages**. This is the owner's deliberate decision. Benefits: faster global first load, frontend stays up (with a friendly "service unavailable" message) if the VM is reclaimed, lighter VM. Production Docker images: **API only**. Frontend security headers come from a `_headers` file on Pages |
| Documentation (future) | `daycraft-docs.whitraworks.online` |
| Main domain | `whitraworks.online` → redirects to the app (for now) |
| Reverse proxy | **Caddy** (automatic HTTPS) |

> Auth cookies still work across `daycraft.` and `daycraft-api.` because both are on the same site (`whitraworks.online`), so `SameSite=Lax` cookies are sent.

### 12.5 Spaces, teams & roles (Q5)
- **Workspace model from day one.** Every item belongs to exactly one **space**. Each user gets a **Personal space** automatically; it can **never** have other members.
- Users can **create and join multiple Team spaces**. A sidebar **space switcher** moves between them.
- **Access rule (enforced centrally on the server):** a user can see an item only if they are a member of its space. Invited members can never reach anyone's Personal items.
- **Roles:** **Owner** (one, full control, can delete team) · **Admin** (manage members except Owner, team settings) · **Member** (view/create/edit team tasks). Viewer role and a platform-admin panel are possible later.
- **Invitations:** by email; single-use, bound to the invited email, expire in 7 days, stored hashed; resend/revoke; new users register with the email pre-filled and locked; existing users log in and accept; a different logged-in email is refused. Removed members lose access immediately; their team tasks remain.
- **Cross-space behaviour:**
  - Planner, Deadlines, Focus show **personal tasks + team tasks assigned to me** (with a space label). Kanban and the task list are per space.
  - Planning data ("planned for today", "focus task") is **per user**; due dates are shared.
  - Personal → Team move allowed (with confirmation); Team → Personal only by Owner/Admin.
  - Expenses and Habits (when built) are **Personal-only**.
- **Settings split:** **Account settings** (name, phone, password, email read-only, theme, mode, time zone, available hours, focus timer) vs **Space settings** (display name, logo, members, invitations, Kanban columns, team audit log).
- **Concurrency without real-time:** data refreshes on focus/navigation/~30 s; tasks carry a `version` number so simultaneous edits are detected, not silently overwritten.

### 12.6 Feature classification (updated)
| Feature | Status |
|---|---|
| Smart Daily Planner | **Basic — always on** |
| Deadline & Follow-up Tracker | **Basic — always on** |
| Focus-Based Task Manager | **Basic — always on** |
| Drag-and-Drop Kanban | **Basic — always on** *(moved from "Advanced")* |
| Teams & invitations | **In scope** — built after the basic features |
| Real-Time Collaborative To-Do | **Additional optional — deferred** (becomes "live updates for team spaces") |
| Monthly Expense Tracker | **Additional optional — deferred** (currency decision Q12 postponed to that phase) |
| Productivity Insights & Habit Tracker | **Additional optional — deferred** |
| Optional features default for new users | **Off** (Q9) |

### 12.7 Basic feature scopes (Q7)

**Smart Daily Planner (Q7a)**, the home page after login.
Today's plan (personal + assigned team tasks, drag to reorder) · quick add · carry-over box for unfinished tasks (`Move to today / Pick a date / Unschedule`, never silent) · optional time estimates vs available hours (default 8 h) · marking a task done updates it in every view · plan other days via date picker · **rule-based "smart" hints** (over-planned, due tomorrow but unscheduled, overdue, no focus tasks picked). No AI in v1.

**Deadline & Follow-up Tracker (Q7b)**
Due date + optional time · groups Overdue / Today / This week / Later / Recently completed · filters by space and assignee · quick actions (Done, Snooze, Change date, Plan for today) · sidebar overdue badge · **follow-ups** (what, waiting on — free text or team member, follow-up date, notes) with tabs Due / Waiting / Resolved and a follow-up history · **in-app reminders** in v1; **daily email digest deferred** until after Teams.

**Focus-Based Task Manager (Q7c)**
Priority on every task (Urgent / High / Medium / Low) · **Today's Focus: max 3** per user, chosen daily (yesterday's suggested) · **timestamp-based Pomodoro timer** (25/5, 15-min long break after 4; adjustable; pause/resume/stop; one active session; sound + optional browser notification) · full-screen **Focus Mode** · **session history** + daily summary (feeds future Insights).

**Kanban (Q7d)**
One board per space · default To Do / In Progress / Done · **custom columns** (add/rename/reorder/delete; Owner/Admin in teams), each mapped to a category (Not started / In progress / Done) so dropping into a Done-category column completes the task everywhere · column delete requires moving cards first · rich cards (priority, due, follow-up icon, assignee, checklist progress) · drag & drop with mouse, touch, and keyboard · optimistic UI · swipeable columns on mobile · quick add · side-panel task details · filters.

### 12.8 Email (Q8)
- Provider: **Resend**. Sender e.g. `DayCraft <no-reply@whitraworks.online>`; SPF/DKIM/DMARC records added at Hostinger.
- **Soft verification:** log in immediately with a "verify your email" banner; unverified users cannot create teams or invite; invited users are auto-verified.
- **Password reset:** single-use link, 30-minute expiry, logs out other sessions.
- **Changing email address: not supported.** Email is shown read-only in Settings.

### 12.9 Audit log (Q11)
- **Recorded:** security (register, login success/failure, logout, password changed/reset, email verified) · account (name/phone, theme/mode, timer settings) · spaces (create/rename/delete, logo, Kanban columns) · membership (invite sent/resent/revoked, joined, role changed, removed, left) · tasks (create, delete, complete/reopen, moved between spaces, assignee changed, due date changed).
- **Never recorded:** passwords, tokens, invite links, session IDs.
- **Entry:** actor, action, entity (type/id/name), old → new, timestamp, IP + browser for security events.
- **Visibility:** users see their own account + Personal-space log (Settings → Audit Log); team Owner/Admin see the team log; Members do not. Append-only.
- **Retention:** 12 months, purged by a nightly job.
- **UI:** readable timeline, expandable details, filters (date, type, person).

### 12.10 Theme (Q13) & other defaults
- Seven accent colours: **Black (default)**, Blue, Green, Purple, Teal, Orange, Rose — each tuned for light and dark mode; Black inverts to near-white in dark mode.
- Mode: **Light / Dark / System**, default **System**.
- Design requirement from the owner: **"super and modern"** — polished, modern visual style with smooth transitions and a well-crafted dark mode.
- Time zone: detected from the browser at sign-up, editable in Settings.

### 12.11 Updated roadmap
Every phase still ends with: test locally → validate → commit → push → CI → PR merge → deploy → verify live.

| # | Phase | Notes |
|---|---|---|
| 0 | Decisions & accounts | ✅ Decisions done. Pending: owner creates public GitHub repo `daycraft` (default branch `master`); Oracle VM, free Cloudflare account, and Resend set up when their phases arrive |
| 1 | Local foundation (monorepo skeleton) | "Hello from DayCraft" + `/api/health`, **Postgres via Docker Compose from day one**, Tailwind, lint/format/typecheck/test tooling, README |
| 2 | Containerization | Multi-stage **API** Dockerfile (arm64-ready), production Compose (Caddy + API + Postgres), run locally; frontend stays a static build |
| 3 | CI for branches | Validation pipeline + hadolint; branch protection on `master` |
| 4 | Infrastructure | Oracle VM (hardening, both Oracle firewalls, Docker, `deploy` user, Caddy HTTPS for the API) · Cloudflare Pages project (no Git connection) · Hostinger DNS: A record for `daycraft-api`, CNAME for `daycraft` |
| 5 | CD on `master`: **walking skeleton live** | API → GHCR → Oracle (migrate, health check, rollback drill), then frontend → Cloudflare Pages |
| 6 | Authentication + workspace foundation | Register/login/logout, sessions, Argon2id, rate limiting, central authorization, **Personal space auto-created**, audit-log recording, off-server backups → **"Hey, {name}!" live** |
| 7 | App shell & design system | Modern responsive layout, sidebar with space switcher + feature registry, 7 colours × Light/Dark/System, reusable components, placeholder logo |
| 8 | Settings core | Account settings, Space settings (name, logo upload), audit log viewer *(optional-feature toggle UI arrives with the first optional feature; the registry exists from Phase 7)* |
| 9 | Task model + Smart Daily Planner | Home page becomes Today |
| 10 | Deadline & Follow-up Tracker | In-app reminders |
| 11 | Focus-Based Task Manager | Priorities, Top 3, timer, Focus Mode, history |
| 12 | Kanban | Custom columns, drag & drop |
| 13 | Email (Resend) | DNS (SPF/DKIM/DMARC), soft verification, password reset |
| 14 | Teams & invitations | Team spaces, roles, invites, members, "assigned to me", team audit log |
| 15 | Production hardening | Uptime alerts, error tracking, restore drill, Dependabot, runbook |

**Deferred backlog:** daily email digest · Monthly Expense Tracker (decide currency then) · Productivity Insights & Habit Tracker · real-time live updates for team spaces · Eisenhower matrix · multiple boards per space · Viewer role · platform-admin panel · AI planning suggestions · Nginx swap as a learning exercise · Pay-As-You-Go upgrade if Oracle reclaims the VM.

### 12.12 Documentation & agent-neutral development (Q15)
- **Docs plan approved (Option A).** Write now: `docs/PRD.md` (product), `docs/ARCHITECTURE.md` (tech + decision log + API conventions), `docs/PROGRESS.md` (status, current tasks, handoff), `AGENTS.md` (AI rules + pointers), `CLAUDE.md` (pointer), `SECURITY.md` (disclosure policy + security rules). Later: `README.md` + `.env.example` (Phase 1), `docs/RUNBOOK.md` (Phases 4–5), `docs/DATA_MODEL.md` (Phase 6, concepts and rules only), `docs/DESIGN.md` (Phase 7). **Not created:** `API.md` (OpenAPI generated from NestJS instead), `TASKS.md` (merged into `PROGRESS.md`). The two original files move unchanged to `docs/archive/`.
- **One fact, one place:** features → PRD · tech → ARCHITECTURE · AI rules → AGENTS · security → SECURITY · status → PROGRESS. Other docs link instead of repeating.
- **Agent-neutral requirement (owner):** any agent (Claude, Gemini, Antigravity, …) must be able to continue reliably and consistently.
  1. **The repo is the only source of truth.** No project knowledge lives only in an agent's private memory.
  2. **`AGENTS.md` is the only instruction file.** Tool-specific files (`CLAUDE.md`, `GEMINI.md`, …) are one-line pointers to it, added when that tool is used (check the tool's current convention at that time).
  3. **Automation enforces the rules:** `pnpm verify` (same as CI), pre-commit hooks (format, lint, secret scan), `.editorconfig`/Prettier/ESLint/TS strict, commit message check, CI + protected `master`, PR template checklist, cross-user access tests.
  4. **Handoff protocol.** Start of session: read `AGENTS.md` → `PROGRESS.md` → relevant docs, explain the current state and next step back to the owner for confirmation, run `pnpm verify`. End of session: update the `PROGRESS.md` handoff section, commit work on a branch (no uncommitted changes), and record decisions with reasons in the decision log.
  5. **Working agreement for every agent:** ask decisions one at a time in plain text with a recommended option; never start a phase without owner approval; never change a decided item without asking; never skip checks; never push to `master`; ask instead of guessing.

### 12.13 Agent permission policy (Q16, Option A)
- **Free:** read files; read-only git (`status`, `diff`, `log`, `show`, branch list); create/edit files for tasks in the **current approved phase as listed in `docs/PROGRESS.md`** (= "agreed scope"); run local checks/builds/app/Docker start-stop; install dependencies already in the agreed stack; update `PROGRESS.md` handoff notes.
- **Ask first, every time** (show the exact command, what it does, and why; each approval covers that action only; related steps may be bundled into one request): `git init/add/commit/push/pull/merge/rebase/reset/stash/tag/revert/cherry-pick`; creating/switching/deleting branches; creating/merging PRs; any GitHub setting; **any CI/CD workflow change, even within the phase**; **any VPS/DNS/Cloudflare/Oracle/Resend/external-service action**; adding a dependency not in the agreed stack; deleting files not created in the current task; destroying local data; any work not listed in the current phase.
- **Never:** push or force-push to `master`; bypass checks (`--no-verify`, skipping/deleting tests); ask for, print, log, or commit secrets; touch production data without a backup and explicit approval; change a decided item without approval.
- Optional later: enforce the "ask first" git commands through each tool's own permission settings (itself an "ask first" change).

### 12.14 Next step
Writing the approved docs (no code), starting with `docs/PRD.md`.
