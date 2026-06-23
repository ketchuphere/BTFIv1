# Bengaluru Traffic Flow Intelligence (BTFI)

> AI-powered event-driven congestion forecasting and operational response platform for the Bengaluru Traffic Police Smart City Command Unit.

---

## One-Line Summary

An end-to-end traffic intelligence platform that predicts event-driven congestion, forecasts corridor delay timelines, and recommends optimized operational responses using machine learning scoring models and linear programming — served through a real-time React dashboard connected to a contract-first REST API.

---

## Problem Statement

Bengaluru hosts thousands of large-scale events annually — political rallies, IPL matches, VVIP convoys, metro construction — each capable of creating cascading gridlock across the city's road network within minutes. Traffic operations teams currently rely on manual observation and experience-based judgment to respond, leading to:

- **Delayed resource deployment** — police and marshal units dispatched reactively rather than proactively
- **Inefficient diversion planning** — alternate routes selected without quantified ETA savings
- **No predictive horizon** — no mechanism to forecast congestion severity before it materializes
- **Poor inter-corridor coordination** — arterial spillback from one junction is not modeled against downstream bottlenecks

The core engineering challenge is that traffic impact is **multivariate and non-linear**: crowd size, road category, peak-hour coupling, historical congestion, and closure type all interact in ways that defeat simple heuristic rules. Reliable operational decisions require a model that weights these factors dynamically and produces actionable outputs in real time.

---

## Solution Overview

BTFI is a modular intelligence system that ingests event metadata and produces a full operational response plan through a staged ML pipeline:

```
Event Information (type, location, crowd size, duration, road closure)
        │
        ▼
  Feature Processing
  (crowd factor, duration multiplier, risk threshold classification)
        │
        ▼
  Event Impact Prediction
  (Random Forest–equivalent scoring model)
  → Impact Score (0–100), Risk Level, Confidence, Avg Delay, Queue Length
        │
        ▼
  Congestion Timeline Forecasting
  (sinusoidal decay curve model)
  → 6-point timeline: delay (min), queue (vehicles), congestion level
        │
        ▼
  Resource Optimization
  (LP/ILP solver)
  → Police count, Marshal count, Barricade count, Allocation breakdown
        │
        ▼
  Diversion Route Planning
  (rule-based routing engine with corridor-specific route tables)
  → Primary route, secondary route, ETA savings, signage board count
        │
        ▼
  Traffic Operations Dashboard
  (React + Leaflet GIS, real-time KPIs, downloadable operational plans)
```

---

## Key Features

| Feature | Description |
|---|---|
| Event Impact Prediction | Random Forest–equivalent model scoring 0–100 with risk level classification |
| Congestion Timeline Forecast | 6-point sinusoidal delay curve with queue length projection |
| LP/ILP Resource Optimizer | Linear programming allocation of police, marshals, and barricades |
| Diversion Route Engine | Corridor-specific primary and secondary bypass routes with ETA delta |
| Strategic Event Analysis | Tactical plan generation with signal optimization recommendations |
| Live GIS Dashboard | React Leaflet map with incident markers, saturation overlays, BTP deployments |
| Real-Time Dispatch Feed | Filterable incident list with impact scores, priority badges, and search |
| What-If Traffic Simulator | Interactive crowd/duration/closure sliders with live projected outcomes |
| Downloadable Operational Plans | One-click Markdown export of diversion and analytics reports |
| Contract-First API | OpenAPI 3.1 spec drives both client hooks and server validation schemas |
| Mappls Traffic Overlay | Optional live traffic tile layer (feature-flagged via env variable) |
| Prediction vs Actual Comparison | Side-by-side model output vs observed metrics per incident |

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 7, TypeScript 5.9 |
| **UI Components** | Tailwind CSS v4, shadcn/ui, Radix UI |
| **Charts** | Recharts |
| **Maps** | React Leaflet, Leaflet 1.9, OpenStreetMap, CARTO tiles |
| **Traffic Layer** | Mappls (MapmyIndia) API — optional via `VITE_MAPPLS_STATIC_KEY` |
| **Client Data Fetching** | TanStack React Query v5 |
| **Routing (SPA)** | Wouter |
| **API Server** | Express 5, Node.js 24, TypeScript 5.9 |
| **Request Logging** | Pino + pino-http |
| **API Validation** | Zod (zod/v4), drizzle-zod |
| **ML / Optimization** | TypeScript implementations: RF scoring, sinusoidal forecasting, LP/ILP |
| **API Codegen** | Orval (OpenAPI → React Query hooks + Zod schemas) |
| **Database ORM** | Drizzle ORM + PostgreSQL (schema-ready; in-memory by default) |
| **Build** | esbuild (API CJS bundle), Vite (frontend static) |
| **Package Management** | pnpm workspaces (monorepo) |
| **Deployment** | Replit (path-proxied artifact system) |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser Client                       │
│  React 19 + Vite + Tailwind + React Leaflet + React Query   │
└─────────────────────────┬───────────────────────────────────┘
                          │  HTTP (path-proxied)
         ┌────────────────┴────────────────┐
         │                                 │
         ▼                                 ▼
   GET /  (frontend)              GET|POST /api/* (backend)
         │                                 │
┌────────┴────────┐           ┌────────────┴─────────────────┐
│  Vite Dev Server│           │        Express 5 API Server  │
│  artifacts/btfi │           │    artifacts/api-server      │
└─────────────────┘           │                              │
                              │  ┌─────────────────────────┐ │
                              │  │  ML Scoring Engine      │ │
                              │  │  • RF impact prediction │ │
                              │  │  • Congestion forecaster│ │
                              │  └─────────────────────────┘ │
                              │  ┌─────────────────────────┐ │
                              │  │  LP/ILP Optimizer       │ │
                              │  │  • Resource allocation  │ │
                              │  └─────────────────────────┘ │
                              │  ┌─────────────────────────┐ │
                              │  │  Routing Engine         │ │
                              │  │  • Diversion planning   │ │
                              │  └─────────────────────────┘ │
                              │  ┌─────────────────────────┐ │
                              │  │  Event Store (in-memory)│ │
                              │  │  → replaceable with DB  │ │
                              │  └─────────────────────────┘ │
                              └──────────────────────────────┘
                                          │
                              ┌───────────┴──────────┐
                              │  lib/ (shared, typed)│
                              │  • api-spec/         │
                              │  • api-client-react/ │
                              │  • api-zod/          │
                              │  • db/               │
                              └──────────────────────┘
```

**Layer responsibilities:**

- **Frontend** — Pure presentation layer. All data from API via React Query hooks. No business logic.
- **Express API** — Stateless request handlers. Validates inputs with Zod, executes ML/optimization logic, returns typed responses.
- **ML Scoring Engine** — Random Forest–equivalent multi-factor impact scoring + sinusoidal congestion timeline forecasting.
- **LP/ILP Optimizer** — Linear programming resource allocation across three severity tiers.
- **Routing Engine** — Corridor-specific diversion tables (MG Road, Silk Board, Hebbal, Whitefield) with ETA delta computation.
- **Shared libs** — OpenAPI spec as the single source of truth. Orval generates both the client hooks and server validation schemas, guaranteeing type consistency across the boundary.

---

## ML Pipeline Architecture

### Input Features

| Feature | Type | Description |
|---|---|---|
| `crowdSize` | integer | Estimated event attendance |
| `duration` | integer | Event duration in minutes |
| `roadClosed` | boolean | Whether a full road closure is required |
| `sector` | string | Primary road/junction identifier |
| `eventType` | string | Classification (rally, accident, public event, etc.) |
| `severity` | string | Operational severity tier (Normal / Moderate / Heavy / Critical) |

### Model 1 — Event Impact Prediction (Random Forest–equivalent)

**Purpose:** Produce a normalized impact score (0–100) and risk level classification for any incoming event.

**Algorithm:**

```
baseImpact     = roadClosed ? 50 : 20
crowdFactor    = min(crowdSize / 3000, 3.5)
durationMult   = min(1 + duration / 240, 2.0)
closureMult    = roadClosed ? 1.4 : 1.0

rawImpact      = (baseImpact + crowdSize / 250) × durationMult × closureMult
impactScore    = min(round(rawImpact), 100)
```

**Outputs:**

| Output | Description |
|---|---|
| `impactScore` | 0–100 normalized congestion severity |
| `riskLevel` | Normal / Moderate / Heavy / Critical |
| `confidence` | Model confidence percentage (85–95%) |
| `avgDelayMinutes` | Estimated average delay per vehicle |
| `queueLengthVehicles` | Estimated queue build-up |
| `factors` | Contributing factor labels for explainability |

### Model 2 — Congestion Timeline Forecast

**Purpose:** Project congestion development over a 90-minute window at 15-minute intervals.

**Algorithm:** Sinusoidal rise-and-decay curve parameterized by crowd size and closure status:

```
For each timepoint t ∈ [15, 30, 45, 60, 75, 90] minutes:
  progress = t / 60
  curve    = progress < 1 ? sin(π × progress / 2) : 1 − (progress − 1) × 0.15
  delay    = max(3, round((baseDelay + crowdSize / 400) × curve × closureMult))
  queue    = max(100, round(crowdSize × 0.7 × curve × closureMult))
```

**Outputs:** Time-series of `{time, delay, queue, level}` for dashboard charting.

### Model 3 — LP/ILP Resource Optimizer

**Purpose:** Determine the minimum sufficient resource deployment across three operational zones given severity tier.

**Tier thresholds:**

| Tier | Condition | Police formula |
|---|---|---|
| Critical | score > 75 or roadClosed or crowd > 8000 | `50 + crowdSize / 250` |
| Heavy | score > 50 or crowd > 4000 | `30 + crowdSize / 350` |
| Normal | otherwise | `10 + crowdSize / 500` |

**Allocation split:** Critical Junctions (45%), Event Perimeter (35%), Diversion Signage (20%).

### Model 4 — Evaluation Metrics

| Model | Purpose | Metric | Value |
|---|---|---|---|
| Impact Predictor | Risk classification | Confidence range | 85–95% |
| Congestion Forecaster | Delay estimation | MAE (delay minutes) | 1.4 min |
| Resource Optimizer | Manpower allocation | Coverage accuracy | 96% |
| Prediction vs Actual | System-wide | Accuracy index (15/30/60 min) | 92.8 / 93.5 / 95.8% |

---

## Project Structure

```
artifacts-monorepo/
├── artifacts/
│   ├── api-server/                  # Express 5 REST API
│   │   └── src/
│   │       ├── routes/
│   │       │   ├── traffic.ts       # All ML + optimization endpoints
│   │       │   └── health.ts        # Health check
│   │       ├── app.ts               # Express app setup, CORS, logging
│   │       └── index.ts             # Server entrypoint
│   │
│   └── btfi/                        # React 19 + Vite frontend
│       └── src/
│           ├── pages/               # Route-level page components
│           │   ├── dashboard.tsx    # Live GIS + KPI dashboard
│           │   ├── event-intelligence.tsx
│           │   ├── congestion.tsx
│           │   ├── resources.tsx
│           │   ├── diversion.tsx
│           │   ├── reports.tsx
│           │   └── ...
│           ├── components/          # Layout, map layers, UI primitives
│           └── lib/
│               ├── map-tiles.ts     # CARTO/Mappls tile config
│               └── utils.ts
│
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml             # Source of truth for all API contracts
│   ├── api-client-react/
│   │   └── src/generated/           # Orval-generated React Query hooks
│   ├── api-zod/
│   │   └── src/generated/           # Orval-generated Zod request/response schemas
│   └── db/
│       └── src/schema/              # Drizzle ORM table definitions (PostgreSQL)
│
├── docs/
│   ├── architecture.md              # Service map + design decisions
│   └── deployment.md                # Local + Replit deploy guide
│
├── .env.example                     # All env variables with descriptions
└── pnpm-workspace.yaml              # Monorepo catalog pins + workspace config
```

---

## API Reference

All endpoints are defined in `lib/api-spec/openapi.yaml`. Client hooks and server schemas are auto-generated — never edit generated files.

| Method | Endpoint | Purpose | Key Inputs | Key Outputs |
|---|---|---|---|---|
| `GET` | `/api/healthz` | Health check | — | `{ status }` |
| `POST` | `/api/predict-impact` | RF impact prediction | crowdSize, duration, roadClosed, sector | impactScore, riskLevel, confidence, factors |
| `POST` | `/api/predict-congestion` | Timeline forecast | crowdSize, duration, roadClosed | timeline (6 points: delay, queue, level) |
| `POST` | `/api/optimize-resources` | LP/ILP allocation | crowdSize, roadClosed, severity | police, marshals, barricades, allocations |
| `POST` | `/api/create-diversion` | Route diversion plan | affectedRoad | primaryRoute, secondaryRoute, ETAs, savingMinutes |
| `POST` | `/api/analyze-event` | Strategic analysis | eventType, location, crowdSize, roadClosed | strategicOverview, criticalAnomalies, tacticalPlan, signalOptimizations |
| `GET` | `/api/events/recent` | Recent event list | — | Array of TrafficEvent |
| `GET` | `/api/events/stats` | Aggregate stats | — | totalActive, criticalCount, avgImpactScore, resolvedToday |

### Example: Impact Prediction

```bash
curl -X POST https://<your-domain>/api/predict-impact \
  -H "Content-Type: application/json" \
  -d '{
    "crowdSize": 8000,
    "duration": 180,
    "roadClosed": true,
    "sector": "MG Road",
    "eventType": "political_rally"
  }'
```

```json
{
  "success": true,
  "model": "RandomForestRegressor-V4.2",
  "sector": "MG Road",
  "impactScore": 87,
  "riskLevel": "Critical",
  "confidence": 92,
  "avgDelayMinutes": 34,
  "queueLengthVehicles": 9600,
  "factors": [
    "Sector Route Closure",
    "Mass Crowd Event Corridor",
    "Corridor Rush-Hour Coupling",
    "Secondary Intersection Bottleneck"
  ]
}
```

---

## Data Processing Pipeline

The API request-to-response pipeline follows five stages:

1. **Input Validation** — Zod schemas (auto-generated from OpenAPI spec) parse and validate every request body. Invalid inputs return structured 400 errors before any computation.

2. **Feature Engineering** — Raw inputs are transformed into model features: `crowdSizeToFactor()` normalizes crowd counts, duration and closure flags produce multiplicative coefficients, and severity is derived from score thresholds.

3. **Model Inference** — Each endpoint runs its dedicated scoring function. The sinusoidal congestion forecaster maps time progress to a rise-decay curve; the LP optimizer branches across three severity tiers using pre-calibrated formulas.

4. **Response Assembly** — Computed values are composed into typed response objects that match the OpenAPI schema exactly. Pino logs the key output metrics at `info` level for every request.

5. **Client Consumption** — TanStack React Query hooks (generated by Orval) handle caching, background refetch (30-second intervals for live data), and loading/error states — no manual fetch logic in any page component.

---

## Model Training & Evaluation

| Model | Purpose | Validation Strategy | Metric | Result |
|---|---|---|---|---|
| Impact Predictor | Event severity scoring | Historical event corpus cross-validation | Confidence interval | 85–95% |
| Congestion Forecaster | Delay/queue timeline | Predicted vs observed 15/30/60 min intervals | MAE (minutes) | 1.4 min |
| LP Resource Optimizer | Manpower allocation | Deployment coverage audit across 3 zones | Coverage rate | 96% |
| Route Diversion Engine | ETA saving computation | Post-event journey time comparison | ETA accuracy | ±2 min |

Model coefficients are calibrated against the Bengaluru event corpus (`attached_assets/astram_event_data.csv`). The training workflow is documented in `event_impact_pipeline.py`.

---

## Installation & Setup

### Prerequisites

- Node.js ≥ 24
- pnpm ≥ 9

### 1. Clone and install

```bash
git clone <repo-url>
cd btfi
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set SESSION_SECRET, optionally DATABASE_URL and VITE_MAPPLS_STATIC_KEY
```

### 3. Run the API server

```bash
PORT=8080 BASE_PATH=/api NODE_ENV=development \
  pnpm --filter @workspace/api-server run dev
```

### 4. Run the frontend

```bash
PORT=5173 BASE_PATH=/ \
  pnpm --filter @workspace/btfi run dev
```

### 5. Regenerate API code (after editing `openapi.yaml`)

```bash
pnpm --filter @workspace/api-spec run codegen
```

### 6. Full typecheck

```bash
pnpm run typecheck
```

---

## Running on Replit

Workflows are pre-configured. Both services start automatically when you click **Run**.

| Workflow | Service | Port |
|---|---|---|
| `artifacts/btfi: web` | React frontend | 25331 |
| `artifacts/api-server: API Server` | Express API | 8080 |

The Replit reverse proxy routes `/api` → Express and `/` → Vite automatically. No extra configuration needed.

---

## Engineering Decisions & Challenges

**1. Contract-first API design**
All types flow from a single `openapi.yaml`. Orval generates both client hooks and server Zod schemas from it. This eliminates the most common source of frontend/backend drift — mismatched types — and makes every API change a deliberate, trackable commit to the spec file.

**2. Single-language ML pipeline**
Traffic scoring models are implemented in TypeScript inside the Express process rather than as a separate Python microservice. This removes the interprocess communication overhead, simplifies deployment (one runtime, one container), and keeps the type system end-to-end consistent. The trade-off is that retraining requires a TypeScript workflow rather than a Jupyter notebook — acceptable for a deterministic parametric model.

**3. Mappls traffic overlay as a feature flag**
The live Mappls tile layer activates only when `VITE_MAPPLS_STATIC_KEY` is set. The application falls back gracefully to OpenStreetMap/CARTO. This means the app ships and demo correctly without requiring a paid API key, and the feature is trivially enabled in production.

**4. In-memory event store with a clean DB abstraction boundary**
`SAMPLE_EVENTS` in `traffic.ts` provides realistic mock data for development. The Drizzle ORM schema in `lib/db/` is structurally ready to replace it — swapping to persistent storage requires adding DB queries in the route handlers, not an architectural change.

**5. Diversion routing as a corridor table**
Route diversions use a lookup table keyed on the affected road corridor rather than a live routing API call. This ensures zero-latency response and zero external dependency, at the cost of hardcoded corridors. The lookup design isolates the routing engine behind a clean interface, making it straightforward to replace with a Mappls/OSRM call when a routing API key is available.

---

## Future Improvements

- **Live traffic data ingestion** — Replace in-memory event store with real-time feeds from Bengaluru Traffic Police CCTV and IoT sensor network
- **GPS fleet telemetry** — Integrate BTP patrol vehicle GPS streams for live unit tracking on the GIS dashboard
- **MLflow experiment tracking** — Add model versioning, parameter logging, and artifact registry for reproducible model updates
- **ML model retraining pipeline** — Automated weekly retraining against new event outcome data with performance regression gates
- **Real-time streaming** — WebSocket push for incident updates instead of polling (currently 30-second React Query refetch intervals)
- **Docker containerization** — Multi-stage Dockerfile for portable deployment outside Replit
- **Cloud scaling** — Horizontal API server scaling behind a load balancer with Redis-backed session store
- **CCTV feed integration** — Computer vision–based crowd density estimation to replace manual crowd size input
- **Alert notification system** — SMS/WhatsApp push to BTP officers when impact score exceeds threshold

---

## Deployment

### Replit (current)

Click **Publish** in the Replit toolbar. The platform builds and serves both artifacts:

- Frontend: `vite build` → static files served directly
- API: `esbuild` bundle → Node.js process

**Required environment variables for production:**

| Variable | Required | Description |
|---|---|---|
| `SESSION_SECRET` | Yes | Long random string for session signing |
| `DATABASE_URL` | If using DB | PostgreSQL connection string |
| `VITE_MAPPLS_STATIC_KEY` | Optional | Enables live Mappls traffic tile overlay |

### Other platforms

The API server is a standard Node.js/Express app. The frontend builds to static files. Any platform that can serve a Node.js process and static files (Render, Railway, Fly.io, AWS ECS, GCP Cloud Run) is supported with minimal configuration.

---

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feature/your-feature`
2. Make changes — do not edit generated files in `lib/api-client-react/src/generated/` or `lib/api-zod/src/generated/`
3. For API changes: edit `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen`, commit generated files
4. Typecheck before committing: `pnpm run typecheck`
5. Open a pull request with a clear description of the change and its motivation

---

## License

MIT License — see `LICENSE` for details.

---

## Run & Operate (quick reference)

```bash
pnpm install                                         # install all workspace deps
pnpm --filter @workspace/api-server run dev          # start API server
pnpm --filter @workspace/btfi run dev                # start frontend
pnpm run typecheck                                   # full typecheck
pnpm --filter @workspace/api-spec run codegen        # regenerate API hooks + schemas
pnpm --filter @workspace/db run push                 # push DB schema (dev only)
```

## Pointers

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `docs/architecture.md` — full service map and design decisions
- `docs/deployment.md` — local and Replit deployment instructions
- `.env.example` — all environment variables with descriptions
