# syntax=docker/dockerfile:1
#
# DayCraft API image. Build from the REPOSITORY ROOT (the monorepo is the build context):
#   docker build -f apps/api/Dockerfile -t daycraft-api .
#
# Targets:
#   runtime (default): the API itself. Small, production dependencies only, runs as non-root.
#   migrate:           a one-off job that applies database migrations during deploys.
#
# Architecture-neutral: the same file builds linux/amd64 (local) and linux/arm64 (Oracle VM).

ARG NODE_IMAGE=node:22.23.3-alpine

# ---------- base: Node.js + the pinned pnpm version ----------
FROM ${NODE_IMAGE} AS base
ARG PNPM_VERSION=12.9.1
RUN npm install --global pnpm@${PNPM_VERSION} && npm cache clean --force
WORKDIR /repo

# ---------- build: install, compile, assemble a production-only bundle ----------
FROM base AS build

# 1) Copy only the dependency manifests first. Docker caches each step, so the slow
#    install below is reused until a package.json or the lockfile actually changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
# The root `prepare` script installs git hooks for developers. Images have no git and need no hooks.
RUN npm pkg delete scripts.prepare
RUN --mount=type=cache,id=daycraft-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store --filter "@daycraft/api..."

# 2) Copy the source and compile the shared package, then the API (pnpm builds in dependency order).
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter "@daycraft/api..." build

# 3) Assemble a standalone folder with the compiled API, its production dependencies,
#    and the shared package. Dev tools (TypeScript, test libraries, …) are left out.
RUN --mount=type=cache,id=daycraft-pnpm-store,target=/pnpm/store \
    pnpm --filter @daycraft/api deploy --prod --store-dir=/pnpm/store /out/api

# ---------- migrate-build: only the Prisma CLI (infra/migrate), locked by the same lockfile ----------
FROM base AS migrate-build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY infra/migrate/package.json infra/migrate/
RUN npm pkg delete scripts.prepare
RUN --mount=type=cache,id=daycraft-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store --filter @daycraft/migrate \
 && pnpm --filter @daycraft/migrate deploy --prod --store-dir=/pnpm/store /out/migrate

# ---------- migrate: runs `prisma migrate deploy` once per deploy, then exits ----------
FROM ${NODE_IMAGE} AS migrate
# Prisma's migration engine needs OpenSSL on Alpine.
# hadolint ignore=DL3018
RUN apk add --no-cache openssl
WORKDIR /migrate
COPY --from=migrate-build /out/migrate ./
COPY apps/api/prisma.config.ts ./
COPY apps/api/prisma ./prisma
USER 1000:1000
CMD ["node_modules/.bin/prisma", "migrate", "deploy"]

# ---------- runtime: the API (default target, listed last) ----------
FROM ${NODE_IMAGE} AS runtime
ARG APP_VERSION=dev
ENV NODE_ENV=production \
    APP_VERSION=${APP_VERSION}
WORKDIR /app
# Files stay owned by root, and the app runs as the unprivileged `node` user (UID 1000),
# so a compromised process cannot modify its own code.
COPY --from=build /out/api ./
USER 1000:1000
EXPOSE 3000
CMD ["node", "dist/main.js"]
