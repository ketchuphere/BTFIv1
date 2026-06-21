# BTFI — Architecture

## Overview

BTFI is a **pnpm monorepo** built on Node.js 24 and TypeScript 5.9. It consists of two deployable artifacts (frontend + API server) and four shared libraries connected through workspace references and a contract-first OpenAPI spec.

```
artifacts-monorepo/
├── artifacts/
│   ├── api-server/          # Express 5 REST API (port 8080)
│   └── btfi/                # React 19 + Vite frontend (port 25331)
├── lib/
│   ├── api-spec/            # OpenAPI 3.1 source of truth (openapi.yaml)
│   ├── api-client-react/    # Orval-generated React Query hooks
│   ├── api-zod/             # Orval-generated Zod request/response schemas
│   └── db/                  # Drizzle ORM schema (PostgreSQL, unused by default)
├── scripts/                 # Shared utility scripts
├── pnpm-workspace.yaml      # Catalog pins and workspace config
└── tsconfig.base.json       # Shared strict TypeScript defaults
```

## Request Flow

```
Browser → Replit Proxy (localhost:80)
        → /        → artifacts/btfi (Vite dev server)
        → /api     → artifacts/api-server (Express)
```

The shared reverse proxy handles path-based routing. No client-side proxy config is needed.

## API Contract (source of truth)

All API endpoints are defined in **`lib/api-spec/openapi.yaml`**.

Running `pnpm --filter @workspace/api-spec run codegen` regenerates:
- `lib/api-client-react/src/generated/` — React Query hooks for the frontend
- `lib/api-zod/src/generated/` — Zod schemas for server-side validation

**Never edit generated files by hand.** Edit `openapi.yaml`, then run codegen.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/healthz` | Health check |
| POST | `/api/predict-impact` | Random Forest impact score |
| POST | `/api/predict-congestion` | Congestion timeline forecast |
| POST | `/api/optimize-resources` | LP/ILP resource allocation |
| POST | `/api/create-diversion` | Diversion route generation |
| POST | `/api/analyze-event` | Strategic event analysis |
| GET | `/api/events/recent` | Recent traffic events |
| GET | `/api/events/stats` | Aggregate event statistics |

## Frontend Pages

| Route | Page | Data source |
|---|---|---|
| `/` | Dashboard | `/api/events/recent`, `/api/events/stats` |
| `/live-traffic` | Live Traffic GIS | `/api/events/recent` |
| `/event-intelligence` | Cognitive Event Hub | `/api/events/recent` |
| `/congestion` | Congestion Forecast | `/api/predict-congestion` |
| `/resources` | Resource Planner | `/api/optimize-resources` |
| `/diversion` | Diversion Center | `/api/create-diversion` |
| `/reports` | Analytics Center | `/api/events/stats`, `/api/events/recent` |
| `/settings` | Settings | — |

## Environment Variables

See `.env.example` for the full list. The critical ones:

- `PORT` — injected by Replit; required at startup
- `BASE_PATH` — injected by Replit; required at startup
- `VITE_MAPPLS_STATIC_KEY` — optional; enables live Mappls traffic tile overlay
- `DATABASE_URL` — required only if using the `lib/db` Drizzle ORM layer
- `SESSION_SECRET` — required for session middleware

## Key Decisions

1. **Contract-first API** — OpenAPI spec drives both client hooks and server validation schemas, eliminating drift between frontend and backend types.
2. **No Python/FastAPI** — All ML-equivalent logic (Random Forest scoring, LP/ILP optimization, diversion routing) is implemented in TypeScript inside the Express server for a single-language deployment.
3. **Mappls optional** — The Mappls traffic tile layer is feature-flagged via `VITE_MAPPLS_STATIC_KEY`; the app works fully without it using OpenStreetMap/CARTO tiles.
4. **In-memory event store** — `SAMPLE_EVENTS` in `traffic.ts` provides realistic mock data. Replace with Drizzle DB queries when a persistent store is needed.
