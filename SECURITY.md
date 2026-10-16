# Security

DayCraft is a production web app that stores people's personal and team data. This file has two parts:

1. **Reporting a vulnerability.** For anyone who finds a security issue.
2. **Security rules.** Mandatory for every contributor, human or AI agent.

Related: product rules → [docs/PRD.md](docs/PRD.md) · technical design → [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Part 1: Reporting a vulnerability

- **Please do not open a public issue** for security problems.
- Report privately through GitHub: **Security tab → "Report a vulnerability"** (private vulnerability reporting).
- Include: what you found, steps to reproduce, the affected URL or endpoint, and the possible impact.
- This is a small, independently maintained project. We aim to acknowledge reports within **7 days** and will keep you updated while we fix the issue.
- **Supported version:** only the currently deployed production version (`master`).
- Please do not access, change, or delete other users' data, and do not run tests that degrade the service (e.g. load or denial-of-service tests).

---

## Part 2: Security rules (mandatory)

A change that breaks any of these rules must not be merged. If a rule blocks you, **ask the owner**; never work around it.

### 2.1 Data isolation and authorization

1. **Every request is checked on the server.** Hiding a button in the UI is never a security control.
2. **All access decisions go through the central permission service** (`can(user, action, resource)`). No authorization logic in controllers, queries, or the frontend.
3. Every database query for space data is **scoped to a space the user is a member of**. A Personal space has exactly one member and can never gain more.
4. **Other users' items return `404`**, not `403`, so their existence is never revealed.
5. Team roles follow the PRD §5.1 permission table exactly.
6. Disabled optional features return `403` from the API. Their data is kept, never deleted.
7. **Required tests for every endpoint that touches data:**
   - not logged in → `401`
   - another user's Personal item → `404`
   - a team the user isn't a member of → `404`
   - a role without permission → `403`
   - invalid input → `400`

### 2.2 Authentication and sessions

1. Passwords follow **PRD AUTH-12**. They are hashed with **Argon2id** and never stored, logged, or returned in readable form.
2. Sessions: a random, high-entropy token in a `__Host-` cookie (`HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`). **Only the token's hash is stored.** Sessions expire after 7 days of inactivity, 30 days at most.
3. Logout deletes the session. A password change or reset deletes **all other** sessions.
4. Login failures return a generic message (_"Invalid email or password"_). Password reset always replies _"If that email exists, we sent a link"_.
5. **Rate limits:** login, registration, password reset, email verification, and invitations.
6. **Single-use tokens** (email verification, password reset, invitation) are high-entropy, **stored only as hashes**, and have expiry times: reset 30 minutes, invitation 7 days. Invitations are bound to the invited email.
7. **CSRF protection:** `SameSite=Lax` + strict CORS (only the app origin) + an `Origin` check + a required custom header on state-changing requests.

### 2.3 Input, output, and the database

1. Validate **all** input at the API boundary with the shared Zod schemas (DTOs). Reject unknown fields.
2. Database access goes through **Prisma**. Raw SQL is allowed only through parameterized tagged templates, **never** by joining strings together.
3. In React, never use `dangerouslySetInnerHTML` with user content.
4. Error responses never include stack traces, SQL, or internal details. Those go to the server logs, along with the `requestId`.

### 2.4 File uploads (logos)

1. Only **PNG, JPEG, and WebP**, **2 MB maximum**. The type is checked from the file's **content**, not its name or extension.
2. **SVG is rejected**, because it can contain scripts.
3. Images are **re-encoded and resized on the server**, which strips metadata and anything hidden in the file.
4. Uploads are stored with **random file names**, never the user's file name. They are served with the correct `Content-Type` and `X-Content-Type-Options: nosniff`.
5. Only the space's Owner or an Admin (or the user, for their Personal space) can change a logo.

### 2.5 Secrets

1. **Never commit secrets.** `.env` files are git-ignored. Only `.env.example`, with placeholder values, is committed.
2. Production secrets live **only** in GitHub Environment secrets and in the server's `.env` file (readable only by the `deploy` user).
3. **Agents must never ask the owner to paste a secret into a chat**, and must never print, log, or commit one. The owner enters secrets directly into `.env` or GitHub.
4. Secret scanning runs before every commit and in CI, plus GitHub secret scanning with push protection.
5. **If a secret leaks:** rotate it immediately, then remove it from the code. Removing it from the code alone is not enough, because git history keeps it.

### 2.6 Logging, audit, and privacy

1. **Never log:** passwords, password hashes, session tokens, reset/verification/invitation tokens or links, API keys, or full request bodies of authentication endpoints.
2. The audit log is **append-only** through the app (PRD §8). Entries older than 12 months are deleted automatically.
3. IP addresses and browser details are personal data. They are stored only for security events and audit entries, and deleted with them.
4. **Backups** contain personal data. They are **encrypted** before leaving the server, stored on Backblaze B2, and **never** placed in the repository.

### 2.7 HTTP security headers

- **API (Caddy):** `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. CORS allows only `https://daycraft.whitraworks.online`, with credentials.
- **Frontend (Cloudflare Pages `_headers`):** a `Content-Security-Policy` that allows scripts only from our own origin and connections only to our API, `frame-ancestors 'none'`, plus the headers listed above.

### 2.8 Infrastructure

1. SSH uses **keys only**. Root login is disabled. CI uses a dedicated, non-root **`deploy`** user.
2. **Two firewalls** (the Oracle Security List and the VM's iptables) allow only ports 22, 80, and 443.
3. **Only Caddy publishes ports.** The database is never exposed, because Docker bypasses host firewall rules for published ports.
4. Containers run as **non-root** users. Base images are pinned to specific versions.
5. Automatic security updates are enabled on the VM.
6. Access tokens (GHCR, Cloudflare, Backblaze, Resend) have the **minimum permissions** they need.

### 2.9 Dependencies

1. The lockfile (`pnpm-lock.yaml`) is always committed.
2. **New dependencies require the owner's approval** (see [AGENTS.md](AGENTS.md)). Prefer well-maintained, widely used packages.
3. Automated dependency update PRs are enabled in the hardening phase.

---

## Accepted risks

Known risks the owner has consciously accepted. **Do not "fix" these without the owner's approval.**

| Risk                                                                                                      | Reason                      | Review                                                                         |
| --------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------ |
| Password minimum length is 6 (below the OWASP/NIST minimum of 8). Composition rules and a blocklist apply | Owner decision, PRD AUTH-12 | Before public launch (PRD OQ-6)                                                |
| A single VM is a single point of failure; Oracle may reclaim an idle Always Free VM                       | Free hosting                | Mitigated by encrypted off-server backups, scripted rebuild, and uptime alerts |
| No staging environment                                                                                    | Simplicity and cost         | Revisit if deploys become risky                                                |
| In-memory rate limits reset when the API restarts                                                         | One API instance            | Move to shared storage if the API scales out                                   |
