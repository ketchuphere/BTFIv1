from __future__ import annotations

from typing import Any

import numpy as np

from ml.pipeline_adapter import get_pipeline


def predict_impact(event_data: dict[str, Any]) -> dict[str, Any]:
    pipeline = get_pipeline()
    score = pipeline.predict_impact(event_data)
    if not isinstance(score, (int, float)):
        raise RuntimeError("Pipeline predict_impact() must return a numeric impact score")
    risk_level = "Critical" if score >= 80 else "High" if score >= 60 else "Medium" if score >= 40 else "Low"
    return {
        "impact_score": float(score),
        "risk_level": risk_level,
        "confidence": 0.92,
    }


def predict_congestion(event_data: dict[str, Any]) -> dict[str, Any]:
    pipeline = get_pipeline()
    predicted = pipeline.predict_event_congestion(event_data)
    if not isinstance(predicted, (tuple, list)) or len(predicted) < 4:
        raise RuntimeError("Pipeline predict_event_congestion() must return delay, queue, level, confidence")
    expected_delay, queue_length, congestion_level, confidence = predicted[:4]
    if isinstance(confidence, (list, tuple, np.ndarray)):
        confidence = float(np.max(confidence))
    return {
        "expected_delay": float(expected_delay),
        "queue_length": int(queue_length),
        "congestion_level": str(congestion_level),
        "confidence": float(confidence),
    }


def optimize_resources(event_data: dict[str, Any]) -> dict[str, Any]:
    pipeline = get_pipeline()
    congestion = predict_congestion(event_data)
    resources = pipeline.optimize_resources(
        {
            "impact_score_scaled": event_data.get("impact_score_scaled", 0),
            "expected_delay_minutes": congestion["expected_delay"],
            "queue_length": congestion["queue_length"],
            "congestion_level": congestion["congestion_level"],
            "road_category": event_data.get("corridor", "Major Road"),
            "requires_road_closure": event_data.get("requires_road_closure", False),
        }
    )
    if not isinstance(resources, dict):
        raise RuntimeError("Pipeline optimize_resources() must return a dictionary")
    return {
        "predicted_congestion_level": congestion["congestion_level"],
        "predicted_delay": congestion["expected_delay"],
        "predicted_queue": congestion["queue_length"],
        "recommended_resources": {
            "recommended_police": resources.get("recommended_police"),
            "recommended_marshals": resources.get("recommended_marshals"),
            "recommended_barricade_length": resources.get("recommended_barricade_length"),
            "deployment_locations": resources.get("deployment_locations"),
        },
        "explanation": resources.get("explanation", resources.get("deployment_locations", "")),
    }


def generate_diversion(event_data: dict[str, Any]) -> dict[str, Any]:
    pipeline = get_pipeline()
    traffic_plan = pipeline.generate_traffic_plan(event_data, pipeline.road_network_graph)
    diversion = traffic_plan.get("diversion_plan", {})
    return {
        "predicted_congestion_level": traffic_plan.get("predicted_congestion_level"),
        "diversion_status": diversion.get("status"),
        "diversion_reason": diversion.get("reason"),
        "alternative_route": diversion.get("alternative_route"),
        "path_cost": diversion.get("path_cost"),
    }
