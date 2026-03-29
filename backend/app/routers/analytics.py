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


@router.post("/evaluations", response_model=EvaluationResult)
async def create_evaluation(evaluation: EvaluationResult):
    """Create a new evaluation result (mock endpoint)."""
    return evaluation
