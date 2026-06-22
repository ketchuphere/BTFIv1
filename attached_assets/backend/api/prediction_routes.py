from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pydantic import BaseModel, Field

from services.congestion_service import CongestionService
from services.impact_service import ImpactService
from services.optimization_service import OptimizationService
from services.routing_service import RoutingService

app = FastAPI(
    title="BTFI - Bengaluru Traffic Flow Intelligence",
    version="1.0.0",
    description="API layer over the existing BTFI ML pipeline.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATASET_PATH = Path(__file__).resolve().parents[2] / "data" / "astram_event_data.csv"


def _load_events_frame() -> pd.DataFrame:
    if not DATASET_PATH.exists():
        return pd.DataFrame()
    frame = pd.read_csv(DATASET_PATH, low_memory=False)
    for col in ("start_datetime", "closed_datetime"):
        if col in frame.columns:
            frame[col] = pd.to_datetime(frame[col], errors="coerce")
    return frame


class ImpactInput(BaseModel):
    id: str = "EVENT_001"
    event_type: str = "unknown"
    latitude: float = 12.9716
    longitude: float = 77.5946
    endlatitude: float = 12.9716
    endlongitude: float = 77.5946
    address: str = "unknown"
    event_cause: str = "unknown"
    requires_road_closure: bool = False
    start_datetime: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    closed_datetime: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    status: str = "active"
    authenticated: str = "yes"
    priority: str = "Medium"
    corridor: str = "unknown"
    zone: str = "unknown"
    junction: str = "unknown"
    description: str = ""
    veh_type: str = "unknown"
    veh_no: str = "unknown"
    kgid: str = "unknown"
    created_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    created_by_id: str = "system"
    last_modified_by_id: str = "system"
    gba_identifier: str = "unknown"


class CongestionInput(ImpactInput):
    impact_score_scaled: float = Field(..., description="Impact score from impact pipeline")


class OptimizationInput(BaseModel):
    id: str = "EVENT_001"
    event_type: str = "unknown"
    latitude: float = 12.9716
    longitude: float = 77.5946
    priority: str = "Medium"
    corridor: str = "unknown"
    impact_score_scaled: float = 0


class DiversionInput(BaseModel):
    id: str = "EVENT_001"
    event_type: str = "unknown"
    latitude: float = 12.9716
    longitude: float = 77.5946
    endlatitude: float = 12.9716
    endlongitude: float = 77.5946
    corridor: str = "unknown"
    impact_score_scaled: float = 0


@app.get("/health")
def health():
    return {"status": "healthy", "service": "BTFI", "timestamp": datetime.now(timezone.utc)}


@app.get("/events/recent")
def events_recent():
    frame = _load_events_frame()
    if frame.empty:
        return []
    subset = frame.tail(10).copy()
    events = []
    for _, row in subset.iterrows():
        events.append(
            {
                "id": row.get("id"),
                "type": row.get("event_type", "unknown"),
                "location": row.get("address", row.get("corridor", "unknown")),
                "status": row.get("status", "active"),
                "timestamp": row.get("start_datetime").isoformat() if pd.notna(row.get("start_datetime")) else None,
            }
        )
    return events


@app.get("/events/stats")
def events_stats():
    frame = _load_events_frame()
    if frame.empty:
        return {
            "totalActive": 0,
            "criticalCount": 0,
            "avgResponseTime": 0,
            "resolvedToday": 0,
            "corridorsCovered": 0,
            "responseTimeMinutes": 0,
        }

    status_series = frame["status"].astype(str).str.lower() if "status" in frame.columns else pd.Series(["unknown"] * len(frame))
    priority_series = frame["priority"].astype(str).str.lower() if "priority" in frame.columns else pd.Series(["low"] * len(frame))
    active = frame[status_series.eq("active")]
    resolved = frame[status_series.isin(["resolved", "closed"])]
    critical = active[priority_series.loc[active.index].eq("high")]
    avg_response = 8 if active.empty else max(1, int(round(len(frame) / max(len(active), 1))))

    return {
        "totalActive": int(len(active)),
        "criticalCount": int(len(critical)),
        "avgResponseTime": avg_response,
        "resolvedToday": int(len(resolved)),
        "corridorsCovered": int(frame["corridor"].nunique()) if "corridor" in frame.columns else 0,
        "responseTimeMinutes": avg_response,
    }


@app.post("/api/predict-impact")
def predict_impact(payload: ImpactInput):
    try:
        result = ImpactService().predict(payload.model_dump())
        return {
            "success": True,
            "impact_prediction": {
                "impact_score": result["impact_score"],
                "risk_level": result["risk_level"],
                "confidence": result["confidence"],
            },
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/analyze-event")
def analyze_event(payload: ImpactInput):
    try:
        impact = ImpactService().predict(payload.model_dump())
        congestion_input = payload.model_dump()
        congestion_input["impact_score_scaled"] = impact["impact_score"]
        congestion = CongestionService().predict(congestion_input)

        overview = (
            f"Event {payload.id} in {payload.corridor} has an impact score of {impact['impact_score']:.2f} "
            f"with {impact['risk_level']} risk. The congestion forecast indicates {congestion['congestion_level']} "
            f"conditions and an expected queue length of {congestion['queue_length']:.0f} vehicles."
        )
        anomalies = [
            f"Road closure required: {'yes' if payload.requires_road_closure else 'no'}",
            f"Priority band: {payload.priority}",
            f"Event type: {payload.event_type}",
        ]
        plan = [
            f"Monitor the corridor {payload.corridor} in real time.",
            "Coordinate field teams around the predicted queue growth.",
            "Prepare diversion signage and rapid response resources.",
        ]
        signal = (
            f"Use the impact score and congestion output to trigger adaptive signal timing on {payload.corridor}."
        )
        return {
            "success": True,
            "source": "BTFI ML pipeline",
            "analysis": {
                "strategicOverview": overview,
                "criticalAnomalies": anomalies,
                "tacticalPlan": plan,
                "signalOptimizations": signal,
            },
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/predict-congestion")
def predict_congestion(payload: CongestionInput):
    try:
        result = CongestionService().predict(payload.model_dump())
        return {
            "success": True,
            "congestion_prediction": {
                "expected_delay": result["expected_delay"],
                "queue_length": result["queue_length"],
                "congestion_level": result["congestion_level"],
                "confidence": result["confidence"],
            },
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/optimize-resources")
def optimize_resources(payload: OptimizationInput):
    try:
        result = OptimizationService().optimize(payload.model_dump())
        return {
            "success": True,
            "resource_plan": {
                "predicted_congestion_level": result["predicted_congestion_level"],
                "predicted_delay": result["predicted_delay"],
                "predicted_queue": result["predicted_queue"],
                "recommended_resources": result["recommended_resources"],
                "explanation": result["explanation"],
            },
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/generate-diversion")
def generate_diversion(payload: DiversionInput):
    try:
        result = RoutingService().generate(payload.model_dump())
        return {
            "success": True,
            "diversion_plan": {
                "predicted_congestion_level": result["predicted_congestion_level"],
                "diversion_status": result["diversion_status"],
                "diversion_reason": result["diversion_reason"],
                "alternative_route": result["alternative_route"],
                "path_cost": result["path_cost"],
            },
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/generate-report")
def generate_report(event_id: str, predictions: dict):
    return {
        "success": True,
        "file": f"BTFI_{event_id}.md",
        "content": (
            "# BTFI Operational Report\n\n"
            f"Event ID: {event_id}\n"
            f"Impact Score: {predictions.get('impact_score')}\n"
            f"Congestion: {predictions.get('congestion_level')}\n"
            f"Queue Length: {predictions.get('queue_length')}\n"
            f"Generated: {datetime.now(timezone.utc)}\n"
        ),
    }
