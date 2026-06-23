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
  → Impact Score (0–100)
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
  → Primary route, secondary route, ETA saving
        │
        ▼
  Traffic Operations Dashboard(Future Plans)
  (React + Leaflet GIS, real-time KPIs, downloadable operational plans)
```

---

## Local Development

### Frontend

```bash
cd BTFI/frontend
npm install
npm run build
npm run dev
```

### Backend

```bash
cd BTFI/backend
pip install -r requirements.txt
uvicorn main:app --reload
```
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


## Production Notes

- Keep `node_modules`, `.next`, cache folders, and build outputs out of version control.
- Keep the ML pipeline code in `ml_pipeline/event_impact_pipeline.py` unchanged.
- The frontend dashboard should only consume backend responses, not hardcoded traffic values.

## Data Flow

1. Frontend submits an event to the backend.
2. Backend normalizes the payload.
3. Backend calls the existing ML pipeline.
4. Backend returns model-derived scores and operational recommendations.
5. Frontend renders the returned values without local prediction logic.

