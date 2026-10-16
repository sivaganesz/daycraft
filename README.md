# DayCraft

**Plan your day, track deadlines and follow-ups, focus on what matters, and work as a team.**
DayCraft by Whitraworks.

> 🚧 **Status:** early development, Phase 1 of 15 (local foundation). Not live yet.
> Progress: [docs/PROGRESS.md](docs/PROGRESS.md)

## What it will do

- **Smart Daily Planner:** plan today, carry over unfinished work, rule-based hints
- **Deadlines & Follow-ups:** overdue/upcoming groups and "waiting on someone" tracking
- **Focus:** a daily top 3, a Pomodoro timer, and a distraction-free Focus Mode
- **Kanban:** drag-and-drop boards with custom columns
- **Personal and Team spaces:** private personal work, shared team work, email invitations

Full requirements: [docs/PRD.md](docs/PRD.md)

## Tech stack

TypeScript monorepo (pnpm) · **React + Vite + Tailwind CSS** · **NestJS** · **PostgreSQL + Prisma** · Zod (shared validation) · Docker · GitHub Actions · Cloudflare Pages (web) · Oracle Cloud (API).
Details and the reasons behind each choice: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

```
apps/web         React frontend
apps/api         NestJS API
packages/shared  Zod schemas and types shared by both
infra/           Docker Compose and (later) server configuration
docs/            Product, architecture, and progress docs
```

## Run it locally

### Prerequisites

| Tool                                                              | Version                 | Check              |
| ----------------------------------------------------------------- | ----------------------- | ------------------ |
| [Node.js](https://nodejs.org)                                     | 22.22 or newer 22.x LTS | `node -v`          |
| [pnpm](https://pnpm.io)                                           | 12.9+                   | `pnpm -v`          |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | running                 | `docker info`      |
| [gitleaks](https://github.com/gitleaks/gitleaks)                  | any recent              | `gitleaks version` |

On Windows, install gitleaks with `winget install Gitleaks.Gitleaks`. It runs before every commit to block accidental secrets.

### Setup

```bash
pnpm install                          # installs dependencies and the git hooks
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
pnpm db:up                            # starts PostgreSQL in Docker
pnpm dev                              # starts the shared package, API, and web app
```

On PowerShell, use `Copy-Item` instead of `cp`.

Then open **http://localhost:5173**. You should see **"Hello from DayCraft"** with **API** and **Database** both operational.

- API health: http://localhost:3000/api/v1/health
- API readiness (checks the database): http://localhost:3000/api/v1/health/ready

## Commands

| Command        | What it does                                                                          |
| -------------- | ------------------------------------------------------------------------------------- |
| `pnpm dev`     | Run everything with hot reload                                                        |
| `pnpm verify`  | **Everything CI checks**: format, build, lint, type check, tests (needs `pnpm db:up`) |
| `pnpm test`    | Unit and integration tests                                                            |
| `pnpm lint`    | ESLint                                                                                |
| `pnpm format`  | Format all files with Prettier                                                        |
| `pnpm db:up`   | Start the local PostgreSQL                                                            |
| `pnpm db:down` | Stop it (your data is kept in a Docker volume)                                        |

## Contributing

- `master` is production and changes **only through pull requests** that pass CI.
- Branches: `feature/…`, `fix/…`, `chore/…`, `docs/…`. Commits follow [Conventional Commits](https://www.conventionalcommits.org) (checked automatically).
- **AI coding agents:** start with [AGENTS.md](AGENTS.md).

## Security

Please report vulnerabilities privately. See [SECURITY.md](SECURITY.md).
