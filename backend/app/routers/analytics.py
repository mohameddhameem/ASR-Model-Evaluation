from fastapi import APIRouter
from typing import List, Dict
from app.models.schemas import EvaluationResult
from app.services import (
    get_mock_evaluations,
    get_evaluations_by_model,
)

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/evaluations", response_model=List[EvaluationResult])
async def list_evaluations():
    """Get all evaluation results."""
    return get_mock_evaluations()


@router.get("/evaluations/model/{model_id}", response_model=List[EvaluationResult])
async def get_model_evaluations(model_id: str):
    """Get evaluations for a specific model."""
    evaluations = get_evaluations_by_model(model_id)
    return evaluations


@router.get("/summary")
async def get_analytics_summary() -> Dict:
    """Get analytics summary."""
    evaluations = get_mock_evaluations()
    models_evaluated = set(e.model_id for e in evaluations)
    datasets_used = set(e.dataset_id for e in evaluations)

    avg_accuracy = (
        sum(e.metrics.accuracy for e in evaluations) / len(evaluations)
        if evaluations
        else 0
    )
    avg_wer = (
        sum(e.metrics.wer for e in evaluations) / len(evaluations)
        if evaluations
        else 0
    )

    return {
        "total_evaluations": len(evaluations),
        "models_evaluated": len(models_evaluated),
        "datasets_used": len(datasets_used),
        "average_accuracy": round(avg_accuracy, 2),
        "average_wer": round(avg_wer, 2),
    }


@router.get("/performance")
async def get_performance_analytics() -> Dict:
    """
    Get deep-dive performance metrics for model comparison.
    
    IMPLEMENTATION PLACEHOLDER: 
    1. Calculate Real-Time Factor (RTF) across models.
    2. Aggregate WER trends by audio length (0-30s, 30-60s, etc.).
    3. Monitor GPU utilization telemetry.
    """
    return {
        "performance_metrics": {
            "average_latency_rtf": 0.082,
            "average_wer": 4.10,
            "gpu_load_percent": 74.2
        },
        "inference_by_length": [
            {"length": "0-30s", "whisper": 0.05, "conformer": 0.08, "wav2vec2": 0.12},
            {"length": "30-60s", "whisper": 0.09, "conformer": 0.11, "wav2vec2": 0.15},
            {"length": "60s+", "whisper": 0.14, "conformer": 0.18, "wav2vec2": 0.22}
        ]
    }


@router.post("/evaluations", response_model=EvaluationResult)
async def create_evaluation(evaluation: EvaluationResult):
    """Create a new evaluation result (mock endpoint)."""
    return evaluation
