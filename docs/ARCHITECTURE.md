# DayCraft: Architecture

|                  |                                       |
| ---------------- | ------------------------------------- |
| **Status**       | Approved design · not yet implemented |
| **Last updated** | 2026-10-15                            |

> **What this document is:** the single source of truth for **how** DayCraft is built, hosted, and delivered, and **why** (see the [Decision log](#13-decision-log)).
> **Related:** product behaviour → [PRD.md](PRD.md) · security rules → [SECURITY.md](../SECURITY.md) · current status → [PROGRESS.md](PROGRESS.md).
> **Labels used here:** ✅ **Decided** (approved by the owner) · 📝 **Planned** (approved direction; exact details are settled in the phase noted) · ❓ **Open** (needs a decision, see [§14](#14-open-technical-questions)).
> **Changing this document:** changing a ✅ item requires the owner's approval and a new decision log entry.

---

## 1. System overview

```
                               Users (browser: desktop / tablet / mobile)
                                │                                    │
              loads the app     │                                    │  API calls (JSON, cookies)
                                ▼                                    ▼
          ┌───────────────────────────────────┐      ┌──────────────────────────────────────────┐
          │  Cloudflare Pages (global CDN)    │      │  Oracle Cloud VM — Always Free, Arm       │
          │  daycraft.whitraworks.online      │      │  India South (Hyderabad), Ubuntu LTS      │
          │  Static React build (HTML/JS/CSS) │      │                                           │
          └───────────────────────────────────┘      │  ┌─────────────────────────────────────┐ │
                                                     │  │ Caddy (ports 80/443 only)           │ │
                                                     │  │  daycraft-api.whitraworks.online    │ │
                                                     │  │  whitraworks.online → redirect      │ │
                                                     │  └──────────────┬──────────────────────┘ │
                                                     │                 │ private Docker network  │
                                                     │  ┌──────────────▼──────┐  ┌────────────┐ │
                                                     │  │ api (NestJS)        │──│ PostgreSQL │ │
                                                     │  └──────────┬──────────┘  └────────────┘ │
                                                     │             │ uploads volume (logos)      │
                                                     └─────────────┼─────────────────────────────┘
                                                                   ▼
                                                     Resend (email) · off-server backups
```

✅ **Two deploy targets:** the **frontend** is a static build on **Cloudflare Pages**; the **API + database** run on **one Oracle VM** with Docker Compose.
✅ **Only Caddy is exposed to the internet.** PostgreSQL and the API are reachable only on the private Docker network.

---

## 2. Domains and DNS

✅ DNS is managed at **Hostinger** (nameservers are not moved).

| Host                               | Purpose                        | DNS record                               | Served by        |
| ---------------------------------- | ------------------------------ | ---------------------------------------- | ---------------- |
| `daycraft.whitraworks.online`      | Web app                        | **CNAME** → the Cloudflare Pages project | Cloudflare Pages |
| `daycraft-api.whitraworks.online`  | REST API (later WebSocket)     | **A** → VM public IP (short TTL)         | Caddy → api      |
| `whitraworks.online`               | Redirects to the app (for now) | **A** → VM public IP                     | Caddy            |
| `daycraft-docs.whitraworks.online` | Documentation (future)         | 📝 decided when built                    | —                |
| Email sending domain               | Resend                         | 📝 SPF / DKIM / DMARC records (Phase 13) | Resend           |

**Why login cookies work across the two subdomains:** browsers treat `daycraft.` and `daycraft-api.` as the **same site** (`whitraworks.online`), so the `SameSite=Lax` session cookie is sent with API calls. CORS still has to allow the app's origin explicitly (§7.3).

---

## 3. Environments

| Environment    | Where                        | Purpose                                                                            |
| -------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| **Local**      | Owner's machine              | Web and API run with hot reload. PostgreSQL runs in Docker Compose.                |
| **CI**         | GitHub Actions               | Runs checks with a temporary PostgreSQL. Never deploys from non-`master` branches. |
| **Production** | Cloudflare Pages + Oracle VM | The live app. Changed only by the `master` pipeline.                               |

✅ There is **no staging environment** and **no branch preview deployments**.

---

## 4. Tech stack

| Layer                  | Choice                                                                                                                                          | Status          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Language               | **TypeScript** (strict mode) everywhere                                                                                                         | ✅              |
| Package manager / repo | **pnpm workspaces** monorepo                                                                                                                    | ✅              |
| Runtime                | **Node.js 22 LTS** (owner choice, D-23), pinned with `.nvmrc` + `engines`. ⚠️ Support ends around April 2027; upgrade planned before then       | ✅              |
| Frontend               | **React + Vite**                                                                                                                                | ✅              |
| Styling                | **Tailwind CSS**, with theme colours as CSS variables                                                                                           | ✅              |
| UI components          | Accessible headless primitives (Radix-based, shadcn-style, owned in-repo)                                                                       | 📝 Phase 7      |
| Routing / server state | React Router · TanStack Query                                                                                                                   | 📝 Phase 1      |
| Forms / validation     | React Hook Form · **Zod** schemas in `packages/shared`. On the API, `nestjs-zod` turns each schema into a NestJS **DTO class** (`createZodDto`) | ✅ (D-19)       |
| Drag and drop          | dnd-kit (mouse, touch, and keyboard)                                                                                                            | 📝 Phase 12     |
| Backend                | **NestJS**                                                                                                                                      | ✅              |
| Database               | **PostgreSQL**, current stable major (pinned in Phase 1)                                                                                        | ✅ / 📝 version |
| ORM / migrations       | **Prisma**                                                                                                                                      | ✅              |
| Password hashing       | **Argon2id**                                                                                                                                    | ✅              |
| Sessions               | Server-side sessions in an httpOnly cookie                                                                                                      | ✅              |
| Email                  | **Resend**                                                                                                                                      | ✅              |
| Reverse proxy          | **Caddy** (automatic HTTPS)                                                                                                                     | ✅              |
| Containers             | Docker, Docker Compose                                                                                                                          | ✅              |
| CI/CD                  | **GitHub Actions**                                                                                                                              | ✅              |
| Image registry         | **GHCR** (GitHub Container Registry)                                                                                                            | ✅              |
| Frontend hosting       | **Cloudflare Pages**                                                                                                                            | ✅              |
| Server                 | **Oracle Cloud Always Free**, Arm `VM.Standard.A1.Flex`, no card upgrade                                                                        | ✅              |
| Real-time (deferred)   | Socket.IO                                                                                                                                       | 📝 when built   |
| Testing                | Vitest (unit) · API integration tests against real PostgreSQL · Playwright (end-to-end + post-deploy smoke test)                                | 📝 Phase 1 / 3  |
| Logging                | Structured JSON logs (pino) with request IDs                                                                                                    | 📝 Phase 1      |

**Rule for agents:** adding any library not listed here requires the owner's approval (see [AGENTS.md](../AGENTS.md)).

---

## 5. Repository structure (📝 finalized in Phase 1)

```
daycraft/
├── apps/
│   ├── web/                 React + Vite frontend (static build → Cloudflare Pages)
│   └── api/                 NestJS backend (Docker image → Oracle VM)
├── packages/
│   └── shared/              Zod schemas, shared types, constants (e.g. feature registry keys)
├── infra/
│   ├── compose/             compose.dev.yml (local PostgreSQL), compose.prod.yml (Caddy + api + PostgreSQL)
│   ├── caddy/               Caddyfile
│   └── scripts/             server setup, backup, restore, deploy helpers
├── .github/
│   ├── workflows/           ci.yml (branches + PRs), deploy.yml (master)
│   └── pull_request_template.md
├── docs/                    PRD, ARCHITECTURE, PROGRESS, (later) RUNBOOK, DATA_MODEL, DESIGN; archive/
├── AGENTS.md · CLAUDE.md · SECURITY.md · README.md · .env.example · .editorconfig
└── package.json · pnpm-workspace.yaml
```

---

## 6. Frontend architecture

- **Single-page app (SPA).** It is built to static files. Cloudflare Pages serves `index.html` for unknown paths, so deep links like `/settings` work on refresh.
- **API access:** a single API client calls `https://daycraft-api.whitraworks.online` (configured at build time with `VITE_API_URL`) using `credentials: "include"`. It never stores tokens in `localStorage`.
- **Server state:** TanStack Query handles caching, refetching on window focus, polling about every 30 s on shared views (PRD TEAM-10), and optimistic updates (Kanban).
- **Feature registry:** one list in `packages/shared` defines every feature's key, route, icon, and type (basic or optional). The sidebar and route guards read from it, and the API reads the same keys. Basic features are always on.
- **Theming:** Tailwind uses CSS variables (e.g. `--color-primary`). The 7 accent colours × Light/Dark/System are switched with attributes on `<html>`. The choice is saved to the account and cached locally, to avoid a flash of the wrong theme.
- **Frontend security headers** (CSP, etc.) are set in a Cloudflare Pages `_headers` file.
- **If the API is down:** the app shows a friendly _"Service temporarily unavailable"_ screen.

---

## 7. Backend architecture

### 7.1 Module layout (📝)

One NestJS module per domain: `health`, `auth`, `users`, `spaces`, `memberships`, `invitations`, `tasks`, `planner`, `deadlines`/`followups`, `focus`, `kanban`, `settings`, `audit`, `mail`, `files`, `features`.

Each module has three layers: **controller** (HTTP: input/output only) → **service** (business rules + authorization + audit) → **Prisma** (data access).

### 7.2 Request pipeline

1. **Session guard:** resolves the user from the session cookie, or returns `401`.
2. **Validation:** controllers receive **DTO classes** generated from the shared Zod schemas (`createZodDto`). A global Zod validation pipe checks the body, query, and params, or returns `400`. The same schema validates the form in the browser.
3. **Authorization:** one central **permission service**, `can(user, action, resource)`, answers every access question. It checks space membership and role (and later, platform roles). **No authorization logic may live anywhere else.** This is what makes Viewer or platform-admin roles cheap to add later.
4. **Feature guard:** requests to a **disabled optional feature** return `403` (the data is kept).
5. **Service logic + audit:** services record audit events **explicitly**, because they know the old → new values.

### 7.3 API conventions (✅ apply to every endpoint)

| Topic             | Convention                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base URL          | `https://daycraft-api.whitraworks.online/api/v1/...`                                                                                              |
| Format            | JSON, `camelCase` fields                                                                                                                          |
| IDs               | UUIDs (time-ordered UUIDv7 preferred), never sequential numbers                                                                                   |
| Time              | ISO 8601 in **UTC**; the client converts to the user's time zone                                                                                  |
| Money (later)     | Integer **minor units** + currency code (`INR`, `USD`, `EUR`), never floating point                                                               |
| Errors            | `{ "error": { "code": "TASK_NOT_FOUND", "message": "…", "details": {…}, "requestId": "…" } }`                                                     |
| Status codes      | `400` validation · `401` not logged in · `403` not allowed · `404` not found · `409` conflict (version mismatch, duplicates) · `429` rate limited |
| Other users' data | Returns **`404`, not `403`**, so the existence of others' items is never revealed                                                                 |
| Concurrency       | Editable resources carry a `version`. Updates send it back; a mismatch returns `409` (PRD TEAM-10)                                                |
| Lists             | Cursor-based pagination: `?cursor=…&limit=…`                                                                                                      |
| CORS              | Allow **only** `https://daycraft.whitraworks.online` (plus the local dev origin in development), with credentials                                 |
| Docs              | OpenAPI/Swagger **generated from the code** (no hand-written API.md). Served in development; published later at `daycraft-docs.`                  |

### 7.4 Background jobs (📝)

In-process scheduled jobs (`@nestjs/schedule`; safe because there is a single API instance): purge audit entries older than 12 months; remove expired sessions and invitations. A queue (e.g. Redis-based) is added only if needed.

---

## 8. Authentication and sessions

| Topic         | Design                                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Passwords     | **Argon2id** (parameters per current OWASP guidance). Policy: PRD AUTH-12                                                                                    |
| Session       | A random, high-entropy token in an httpOnly cookie. **Only a hash of the token is stored** in the `sessions` table, along with user, expiry, IP, and browser |
| Cookie        | `__Host-` prefixed, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, set by the API host                                                                      |
| CSRF          | `SameSite=Lax` + strict CORS + `Origin` header check + a required custom request header on state-changing requests                                           |
| Revocation    | Logout deletes the session. A password change or reset deletes **all other** sessions                                                                        |
| Rate limiting | Login, registration, password reset, and invitations are rate-limited per IP and per account                                                                 |
| Lifetime      | Expires after **7 days of inactivity**, absolute maximum **30 days** (D-21)                                                                                  |

Full rules: [SECURITY.md](../SECURITY.md).

---

## 9. Data architecture

- ✅ **PostgreSQL** with **Prisma** migrations. `schema.prisma` is the source of truth for tables and columns. Concepts and rules will be documented in `docs/DATA_MODEL.md` (Phase 6).
- ✅ **Workspace model:** every domain row has a `spaceId`. Access is decided by `memberships` (user, space, role). Per-user planning data (planned date, focus pick, focus sessions) is keyed by `userId`. See PRD §3.
- ✅ **Migrations are backward-compatible ("expand → contract"):** add new columns first, switch the code, and remove old columns in a later release. That way rolling back the app image never breaks the database.
- ✅ **Before each production migration**, the deploy takes a quick database backup.
- 📝 **Logo storage:** a Docker volume on the VM (`/data/uploads`), accessed through a small storage interface so it can move to object storage later. Uploads are validated and re-encoded on the server (SECURITY.md).

---

## 10. Infrastructure (Oracle VM)

| Topic                 | Design                                                                                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shape                 | `VM.Standard.A1.Flex` (Arm), within Always Free limits. **Only Always Free-eligible resources may be created**                                                                          |
| OS                    | Ubuntu Server LTS (arm64)                                                                                                                                                               |
| Access                | SSH **keys only**; root login disabled; a dedicated non-root **`deploy`** user (used by CI)                                                                                             |
| Firewalls             | Oracle **Security List** _and_ the VM's own **iptables** rules. Both allow only 22, 80, 443                                                                                             |
| ⚠️ Docker gotcha      | Docker bypasses host firewall rules for published ports, so **only Caddy publishes ports**. The database is never published                                                             |
| Compose services      | `caddy`, `api`, `postgres`, with health checks, `restart: unless-stopped`, named volumes, log rotation limits, non-root containers                                                      |
| Secrets               | A production `.env` on the server (readable only by `deploy`), plus GitHub Environment secrets. Never committed                                                                         |
| Idle-reclamation risk | Accepted. Mitigated by off-server backups, **scripted server setup** (`infra/scripts`), and uptime alerts, **not** by generating artificial load. A rebuild is documented in RUNBOOK.md |
| Public IP             | Changes if the VM is recreated. The DNS A records use a short TTL                                                                                                                       |

---

## 11. CI/CD

### 11.1 Branch and PR rules (✅)

- `master` = production. It is changed **only by merging a PR** that passed CI. Enforced by GitHub rulesets: PR required, status checks required, no direct pushes, no force pushes.
- Branch names: `feature/…`, `fix/…`, `chore/…`, `docs/…`. Commits follow **Conventional Commits** (`feat: …`, `fix: …`, `docs: …`).

### 11.2 Pipeline A: non-`master` pushes and PRs (`ci.yml`)

Install (cached) → lint + format check → type check → unit tests → API integration tests (temporary PostgreSQL) → build web and API → **hadolint**.
✅ **No Docker image builds. No deployments.**

### 11.3 Pipeline B: `master` (`deploy.yml`)

1. Re-run Pipeline A (shared, reusable workflow, so both stay identical).
2. **API:** build a `linux/arm64` image on a GitHub-hosted Arm runner → push to GHCR as `ghcr.io/<owner>/daycraft-api:<commit-sha>` (+ `latest`).
3. **Deploy API:** SSH as `deploy` → pre-migration backup → `docker compose pull` → run migrations (one-off container) → `docker compose up -d` → wait for health checks → check `https://daycraft-api.whitraworks.online/api/v1/health/ready` from the pipeline.
4. **On failure:** redeploy the previous SHA and mark the run as failed.
5. **Frontend (only after the API succeeds):** `vite build` → upload to Cloudflare Pages with `wrangler` → smoke test that the live site loads.
6. A **`concurrency`** lock means two deploys never run at the same time.

✅ **API first, then frontend.** API changes are always backward-compatible, so the old frontend keeps working during the deploy.
✅ **Cloudflare Pages is not connected to GitHub**, so nothing else can deploy it.
🔐 **Secret names** (values live only in GitHub and on the server): `VM_HOST`, `VM_SSH_KEY`, `VM_KNOWN_HOSTS`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, plus app runtime secrets in the server `.env`. 📝 Final list in Phase 5.

### 11.4 Local quality gates (📝 Phase 1)

- `pnpm verify` runs **exactly** what CI runs.
- Pre-commit hooks: format, lint, secret scan.
- Commit message check.

---

## 12. Observability and operations

| Topic          | Design                                                                                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Health         | `GET /api/v1/health` (process alive) and `GET /api/v1/health/ready` (database reachable), used by Docker, the deploy pipeline, and uptime monitoring                                         |
| Logs           | JSON (pino) with a `requestId` per request, readable with `docker compose logs`. Rotated by Docker                                                                                           |
| Uptime alerts  | **UptimeRobot** (free tier) checks the app and the API health endpoint and alerts the owner (D-21)                                                                                           |
| Error tracking | Optional later (e.g. Sentry free tier)                                                                                                                                                       |
| Backups        | Nightly `pg_dump` + uploads volume, **encrypted**, → **Backblaze B2** (D-22), plus a pre-migration backup. Retention: 7 daily / 4 weekly / 3 monthly. **Restore drills** happen periodically |
| Runbook        | `docs/RUNBOOK.md` (Phases 4–5): deploy, roll back, restore, rotate secrets, rebuild the VM, "site is down" checklist                                                                         |

---

## 13. Decision log

Each entry records **what** was decided, **why**, and the main **alternative** rejected. Agents must not reverse an entry without the owner's approval.

| ID   | Decision                                                                                                                                                                    | Why                                                                                                                                                                                                                                             | Rejected alternative                                                           |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| D-01 | Product **DayCraft**, brand **Whitraworks**                                                                                                                                 | Domain and brand are Whitraworks; this product is DayCraft                                                                                                                                                                                      | App named "Whitraworks"                                                        |
| D-02 | TypeScript monorepo: React + Vite, NestJS, PostgreSQL + Prisma                                                                                                              | One language end to end, shared Zod schemas, modular backend suited to optional features and roles                                                                                                                                              | Next.js full-stack (blurs the frontend/backend split); FastAPI (two languages) |
| D-03 | Tailwind CSS with CSS-variable themes                                                                                                                                       | Fast and consistent styling; 7 colours × modes switch instantly                                                                                                                                                                                 | Plain CSS / CSS-in-JS                                                          |
| D-04 | GitHub + Actions + GHCR, **public** repo                                                                                                                                    | All in one place; public repo gets enforced branch protection for free                                                                                                                                                                          | GitLab; Docker Hub                                                             |
| D-05 | `master` changes **only via PR merge**, enforced                                                                                                                            | Review moment and CI gate before production                                                                                                                                                                                                     | Direct pushes                                                                  |
| D-06 | Branches: checks + **hadolint only**, no image builds                                                                                                                       | Owner's rule: save resources on branches                                                                                                                                                                                                        | Test-building images on branches                                               |
| D-07 | **Oracle Always Free** Arm VM, Hyderabad, no card upgrade                                                                                                                   | Free with no time limit, generous resources                                                                                                                                                                                                     | Azure for Students (credit runs out in about 3 months)                         |
| D-08 | Separate **API subdomain** with strict CORS                                                                                                                                 | Clean separation, CORS learning, ready for other clients                                                                                                                                                                                        | Same-origin `/api` path                                                        |
| D-09 | **Caddy** reverse proxy                                                                                                                                                     | Automatic HTTPS, minimal config, fewer failure points                                                                                                                                                                                           | Nginx + Certbot (possible later exercise); Traefik                             |
| D-10 | **Workspace model** from day one (Personal + Team spaces)                                                                                                                   | Teams, invitations, and roles later without a data migration                                                                                                                                                                                    | Ownership by user only                                                         |
| D-11 | Server-side **sessions** in an httpOnly cookie                                                                                                                              | Instant revocation, no tokens in JavaScript                                                                                                                                                                                                     | JWT access/refresh tokens                                                      |
| D-12 | **Resend** for email, soft verification                                                                                                                                     | Developer-friendly, free tier, good deliverability                                                                                                                                                                                              | Brevo, SES, Hostinger SMTP                                                     |
| D-13 | Frontend on **Cloudflare Pages**, API on Oracle, no branch previews                                                                                                         | Global CDN, frontend survives VM loss, lighter VM                                                                                                                                                                                               | Everything on the VM                                                           |
| D-14 | Central **permission service** (`can(...)`)                                                                                                                                 | One place for all access rules; roles are cheap to extend                                                                                                                                                                                       | Checks scattered across controllers                                            |
| D-15 | Generated **OpenAPI** instead of a hand-written API.md                                                                                                                      | Docs never go out of sync with the code                                                                                                                                                                                                         | Manual API docs                                                                |
| D-16 | Agent-neutral docs: `AGENTS.md` canonical, tool files are pointers; rules enforced by automation                                                                            | Any agent can continue reliably                                                                                                                                                                                                                 | Tool-specific instruction files                                                |
| D-17 | Password policy: minimum 6 + composition rules (**accepted risk**)                                                                                                          | Owner's decision (PRD AUTH-12)                                                                                                                                                                                                                  | Minimum 8–10 with a blocklist only                                             |
| D-18 | API path prefix **`/api/v1`**                                                                                                                                               | Common convention; leaves room for other paths (e.g. `/docs`) on the API host                                                                                                                                                                   | `/v1` only                                                                     |
| D-19 | Validation: **shared Zod schemas + DTO classes via `nestjs-zod`**                                                                                                           | Standard NestJS DTO style plus one schema shared by the browser and the server                                                                                                                                                                  | Plain `class-validator` DTOs (rules duplicated in the frontend)                |
| D-20 | 404 (not 403) for other users' items; UUIDv7 IDs; hashed session tokens; all authorization in the permission service                                                        | Prevents leaking that items exist and guessable IDs; a database leak doesn't expose sessions; a single place for access rules                                                                                                                   | —                                                                              |
| D-22 | Off-server backups on **Backblaze B2**: nightly `pg_dump` + uploads, **encrypted** before upload, kept as 7 daily / 4 weekly / 3 monthly. Never stored in the (public) repo | Independent of Oracle (survives account or VM loss); free tier; standard S3 interface                                                                                                                                                           | Oracle Object Storage (same provider); Cloudflare R2 (needs a payment method)  |
| D-23 | **Node.js 22 LTS** for local, CI, and the API image                                                                                                                         | Owner's choice (already installed). Maintenance support ends around April 2027, so an **upgrade to a newer LTS is planned** before then                                                                                                         | Node.js 24 LTS (recommended for its longer support)                            |
| D-24 | **One-time bootstrap commit pushed directly to `master`** (Phase 0 docs + repo config files only), to create the branch in the empty repo                                   | A PR needs an existing target branch. Owner-approved exception (Q17); all later changes go through PRs                                                                                                                                          | Owner pushing it manually                                                      |
| D-25 | Pinned versions at Phase 1: **NestJS 11** (not 12), **TypeScript 6.0**, **Prisma 7.10** (stable), **PostgreSQL 18**                                                         | `nestjs-zod` (D-19) supports only NestJS ≤ 11; `typescript-eslint` supports TypeScript < 6.1; Prisma's "latest" tag pointed to an 8.0 release candidate; PostgreSQL 18 is the newest major with Arm images. NestJS 11 is still actively patched | NestJS 12 with a custom Zod helper, or `class-validator` DTOs (Q18)            |
| D-21 | Sessions expire after 7 days of inactivity, 30 days maximum (OT-1) · UptimeRobot (OT-3) · Mailpit for local email (OT-4) · versions pinned at Phase 1 (OT-5)                | Owner accepted the defaults                                                                                                                                                                                                                     | —                                                                              |

---

## 14. Open technical questions

| #    | Question                                                                        | Recommended default                                                                     | Needed by         |
| ---- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------- |
| OT-1 | ~~Session lifetime~~ **Resolved (D-21):** 7 days of inactivity, 30 days maximum | —                                                                                       | —                 |
| OT-2 | ~~Off-server backup destination~~ **Resolved (D-22):** Backblaze B2             | —                                                                                       | —                 |
| OT-3 | ~~Uptime monitor~~ **Resolved (D-21):** UptimeRobot free tier                   | —                                                                                       | —                 |
| OT-4 | ~~Local email testing~~ **Resolved (D-21):** Mailpit in dev Compose             | —                                                                                       | —                 |
| OT-5 | Exact Node.js and PostgreSQL versions                                           | **Resolved:** Node.js 22 LTS (D-23); PostgreSQL current stable major, pinned in Phase 1 | Phase 1           |
| OT-6 | Upgrade Node.js 22 → a newer LTS                                                | Upgrade before support ends (around April 2027)                                         | Before April 2027 |
| OT-7 | Upgrade NestJS 11 → 12, and TypeScript 6 → 7                                    | When `nestjs-zod` supports NestJS 12 and `typescript-eslint` supports TypeScript 7      | Check each phase  |
