from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import ASRModel
from app.services import get_mock_models, get_model_by_id

router = APIRouter(prefix="/api/asr", tags=["ASR"])


@router.get("/models", response_model=List[ASRModel])
async def list_asr_models():
    """Get all available ASR models."""
    return get_mock_models()


@router.get("/models/{model_id}", response_model=ASRModel)
async def get_asr_model(model_id: str):
    """Get a specific ASR model by ID."""
    model = get_model_by_id(model_id)
    if model is None:
        raise HTTPException(status_code=404, detail=f"Model {model_id} not found")
    return model


@router.post("/models", response_model=ASRModel)
async def create_asr_model(model: ASRModel):
    """Create a new ASR model (mock endpoint)."""
    return model


@router.put("/models/{model_id}", response_model=ASRModel)
async def update_asr_model(model_id: str, model: ASRModel):
    """Update an ASR model (mock endpoint)."""
    existing = get_model_by_id(model_id)
    if existing is None:
        raise HTTPException(status_code=404, detail=f"Model {model_id} not found")
    return model


@router.delete("/models/{model_id}")
async def delete_asr_model(model_id: str):
    """Delete an ASR model (mock endpoint)."""
    existing = get_model_by_id(model_id)
    if existing is None:
        raise HTTPException(status_code=404, detail=f"Model {model_id} not found")
    return {"message": f"Model {model_id} deleted successfully"}
