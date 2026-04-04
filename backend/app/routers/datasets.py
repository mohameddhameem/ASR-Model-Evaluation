from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import Dataset
from app.services import get_mock_datasets, get_dataset_by_id

router = APIRouter(prefix="/api/datasets", tags=["Datasets"])


@router.get("/", response_model=List[Dataset])
async def list_datasets():
    """
    Get all available datasets.
    
    IMPLEMENTATION NOTE: The frontend expects 'duration' in 'MM:SS' format 
    and 'language' as a 2-letter ISO code (e.g., 'en', 'fr').
    """
    return get_mock_datasets()


@router.get("/{dataset_id}", response_model=Dataset)
async def get_dataset(dataset_id: str):
    """Get a specific dataset by ID."""
    dataset = get_dataset_by_id(dataset_id)
    if dataset is None:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
    return dataset


@router.post("/", response_model=Dataset)
async def create_dataset(dataset: Dataset):
    """Create a new dataset (mock endpoint)."""
    return dataset


@router.put("/{dataset_id}", response_model=Dataset)
async def update_dataset(dataset_id: str, dataset: Dataset):
    """Update a dataset (mock endpoint)."""
    existing = get_dataset_by_id(dataset_id)
    if existing is None:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
    return dataset


@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str):
    """Delete a dataset (mock endpoint)."""
    existing = get_dataset_by_id(dataset_id)
    if existing is None:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
    return {"message": f"Dataset {dataset_id} deleted successfully"}
