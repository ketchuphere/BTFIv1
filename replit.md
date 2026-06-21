# BTFI — Bengaluru Traffic Flow Intelligence

Smart City Traffic Operations Command Unit for the Bengaluru Traffic Police — real-time incident monitoring, ML-powered impact prediction, congestion forecasting, resource optimization, and diversion routing.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/btfi run dev` — run the React frontend (port 25331)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes to PostgreSQL (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7 + Tailwind CSS v4 + shadcn/ui
- API: Express 5 + Pino logging
- DB: PostgreSQL + Drizzle ORM (optional; app runs without it)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Build: esbuild (CJS bundle for API), Vite (static for frontend)
- Map: React Leaflet + OpenStreetMap/CARTO tiles (optional Mappls traffic overlay)

## Where things live

| Path | Purpose |
|---|---|
| `lib/api-spec/openapi.yaml` | **Source of truth** for all API contracts |
| `lib/api-client-react/src/generated/` | Generated React Query hooks (do not edit) |
| `lib/api-zod/src/generated/` | Generated Zod schemas (do not edit) |
| `artifacts/api-server/src/routes/traffic.ts` | All traffic intelligence endpoints |
| `artifacts/btfi/src/pages/` | All frontend page components |
| `artifacts/btfi/src/lib/map-tiles.ts` | Map tile config + Mappls key logic |
| `docs/architecture.md` | Full architecture reference |
| `docs/deployment.md` | Local + Replit deployment instructions |
| `.env.example` | All environment variables with descriptions |

## Architecture decisions

1. **Contract-first API** — `openapi.yaml` drives both client hooks and server validation; running codegen keeps frontend types and server schemas always in sync.
2. **Single-language stack** — All ML-equivalent logic (Random Forest scoring, LP/ILP optimization, diversion routing) is TypeScript in the Express server; no Python runtime needed.
3. **Mappls feature-flagged** — Live traffic tile overlay activates only when `VITE_MAPPLS_STATIC_KEY` is set; the app runs fully without it using CARTO/OpenStreetMap.
4. **In-memory event store** — `SAMPLE_EVENTS` in `traffic.ts` provides realistic mock data; replace with Drizzle DB queries when persistence is needed.
5. **Replit proxy routing** — The shared reverse proxy routes `/api` → Express and `/` → Vite; no custom proxy config is needed in either service.

## Product

- **Dashboard** — Live GIS map of Bengaluru incidents, KPI cards (active incidents, corridor delay, coordinated vehicles), real-time dispatch feed, Command Center alerts
- **Live Traffic** — Leaflet map with incident markers, saturation heatmap, BTP deployment overlays
- **Event Intelligence** — Cognitive Hub with split incident list + detail pane, ops milestones timeline, AI prediction attribution bars
- **Congestion Forecast** — Delay/queue timeline charts driven by the ML prediction endpoint
- **Resource Planner** — LP/ILP-optimized police/marshal/barricade allocation
- **Diversion Center** — Route diversion scheme selector + What-If simulator + downloadable operational plan
- **Reports** — Centralized analytics center with downloadable Markdown report
- **Settings** — System configuration

## User preferences

- Do NOT redesign the frontend UI/UX — layout, colors, components, and animations are finalized.
- Do NOT rewrite the API business logic — prediction models, optimization, and routing are finalized.
- Production-prep changes only: architecture, structure, env vars, deployment readiness.

## Gotchas

- **Never edit generated files** in `lib/api-client-react/src/generated/` or `lib/api-zod/src/generated/`. Edit `openapi.yaml` and run codegen.
- **PORT and BASE_PATH** are injected by the Replit artifact system automatically. Only set them manually for local dev outside Replit.
- `lib/db` schema is currently an empty placeholder. The API server does not require a database connection to run.
- The API server build must complete before routes are available. After copying new route files, always restart the `api-server` workflow.

## Pointers

- `docs/architecture.md` — full service map, data flow, and design decisions
- `docs/deployment.md` — local dev setup + Replit publish instructions
- `.env.example` — all environment variables with descriptions
- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
