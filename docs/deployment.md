# BTFI — Deployment Guide

## Quick Start (Replit)

Workflows are pre-configured. Click **Run** or use the workflow buttons in the Replit sidebar — both services start automatically.

| Workflow | Command | Port |
|---|---|---|
| `artifacts/btfi: web` | `pnpm --filter @workspace/btfi run dev` | 25331 |
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` | 8080 |

The shared Replit reverse proxy routes `/api` to the API server and `/` to the frontend.

## Publishing (Replit Deploy)

1. Click **Publish** in the Replit toolbar.
2. The platform runs the production build automatically:
   - Frontend: `pnpm --filter @workspace/btfi run build` → static files in `artifacts/btfi/dist/public`
   - API server: `pnpm --filter @workspace/api-server run build` → CJS bundle in `artifacts/api-server/dist`
3. The deployed app is served over HTTPS at your `.replit.app` domain.

## Local Development (outside Replit)

```bash
# 1. Install dependencies
pnpm install

# 2. Copy and fill in environment variables
cp .env.example .env
# Edit .env — set DATABASE_URL, SESSION_SECRET, etc.

# 3. Start the API server (terminal 1)
PORT=8080 BASE_PATH=/api NODE_ENV=development \
  pnpm --filter @workspace/api-server run dev

# 4. Start the frontend (terminal 2)
PORT=5173 BASE_PATH=/ \
  pnpm --filter @workspace/btfi run dev
```

## Regenerating API Code

After editing `lib/api-spec/openapi.yaml`:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This updates:
- `lib/api-client-react/src/generated/` (React Query hooks)
- `lib/api-zod/src/generated/` (Zod schemas)

## Type Checking

```bash
# Full workspace check
pnpm run typecheck

# Single package
pnpm --filter @workspace/btfi run typecheck
pnpm --filter @workspace/api-server run typecheck
```

## Database (optional)

The default API uses in-memory data. To switch to PostgreSQL:

1. Set `DATABASE_URL` in your environment.
2. Define tables in `lib/db/src/schema/`.
3. Push schema: `pnpm --filter @workspace/db run push`
4. Import the Drizzle client in API routes from `@workspace/db`.

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | Yes | — | Server port (injected by Replit) |
| `BASE_PATH` | Yes (frontend) | — | Vite base path (injected by Replit) |
| `DATABASE_URL` | No | — | PostgreSQL connection string |
| `SESSION_SECRET` | No | — | Express session secret |
| `VITE_MAPPLS_STATIC_KEY` | No | — | Mappls API key for live traffic tiles |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `LOG_LEVEL` | No | `info` | Pino log level |
