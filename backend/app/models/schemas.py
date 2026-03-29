from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ModelMetrics(BaseModel):
    accuracy: float
    wer: float
    cer: float
    inference_time_ms: float


class ASRModel(BaseModel):
    model_id: str
    name: str
    version: str
    description: str
    framework: str
    metrics: ModelMetrics
    created_date: datetime
    language: str


class DatasetMetadata(BaseModel):
    total_hours: float
    sample_rate: int
    format: str
    noise_level: str


class Dataset(BaseModel):
    dataset_id: str
    name: str
    description: str
    metadata: DatasetMetadata
    created_date: datetime
    language: str


class EvaluationResult(BaseModel):
    evaluation_id: str
    model_id: str
    dataset_id: str
    metrics: ModelMetrics
    timestamp: datetime
    notes: Optional[str] = None
