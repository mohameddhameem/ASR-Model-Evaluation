from typing import List, Optional
from datetime import datetime
from app.models.schemas import (
    ASRModel,
    Dataset,
    EvaluationResult,
    ModelMetrics,
    DatasetMetadata,
)

# Mock Models
MOCK_MODELS = [
    ASRModel(
        model_id="wav2vec2-base",
        name="Wav2Vec 2.0 Base",
        version="1.0",
        description="Facebook's Wav2Vec 2.0 base model for speech recognition",
        framework="Hugging Face",
        metrics=ModelMetrics(
            accuracy=95.5,
            wer=2.3,
            cer=1.1,
            inference_time_ms=145.5
        ),
        created_date=datetime(2024, 1, 1),
        language="en"
    ),
    ASRModel(
        model_id="whisper-base",
        name="OpenAI Whisper Base",
        version="1.0",
        description="OpenAI's Whisper model for robust speech recognition",
        framework="OpenAI",
        metrics=ModelMetrics(
            accuracy=97.2,
            wer=1.8,
            cer=0.9,
            inference_time_ms=285.0
        ),
        created_date=datetime(2024, 1, 2),
        language="en"
    ),
    ASRModel(
        model_id="conformer-large",
        name="Conformer Large",
        version="1.0",
        description="Large Conformer model for speech recognition",
        framework="NeMo",
        metrics=ModelMetrics(
            accuracy=96.8,
            wer=1.5,
            cer=0.8,
            inference_time_ms=210.5
        ),
        created_date=datetime(2024, 1, 3),
        language="en"
    ),
]

# Mock Datasets
MOCK_DATASETS = [
    Dataset(
        dataset_id="librispeech-test-clean",
        name="LibriSpeech Test (Clean)",
        description="LibriSpeech test set - clean subset for ASR evaluation",
        metadata=DatasetMetadata(
            total_hours=10.5,
            sample_rate=16000,
            format="wav",
            noise_level="clean"
        ),
        created_date=datetime(2024, 1, 1),
        language="en"
    ),
    Dataset(
        dataset_id="librispeech-test-other",
        name="LibriSpeech Test (Other)",
        description="LibriSpeech test set - other subset with more challenging audio",
        metadata=DatasetMetadata(
            total_hours=8.2,
            sample_rate=16000,
            format="wav",
            noise_level="noisy"
        ),
        created_date=datetime(2024, 1, 1),
        language="en"
    ),
    Dataset(
        dataset_id="common-voice-en",
        name="Common Voice (English)",
        description="Mozilla Common Voice dataset in English",
        metadata=DatasetMetadata(
            total_hours=24.5,
            sample_rate=48000,
            format="mp3",
            noise_level="very_noisy"
        ),
        created_date=datetime(2024, 1, 15),
        language="en"
    ),
]

# Mock Evaluations
MOCK_EVALUATIONS = [
    EvaluationResult(
        evaluation_id="eval_001",
        model_id="wav2vec2-base",
        dataset_id="librispeech-test-clean",
        metrics=ModelMetrics(
            accuracy=95.5,
            wer=2.3,
            cer=1.1,
            inference_time_ms=145.5
        ),
        timestamp=datetime(2024, 1, 10),
        notes="Initial evaluation on clean speech"
    ),
    EvaluationResult(
        evaluation_id="eval_002",
        model_id="whisper-base",
        dataset_id="librispeech-test-clean",
        metrics=ModelMetrics(
            accuracy=97.2,
            wer=1.8,
            cer=0.9,
            inference_time_ms=285.0
        ),
        timestamp=datetime(2024, 1, 10),
        notes="Whisper model on clean speech"
    ),
    EvaluationResult(
        evaluation_id="eval_003",
        model_id="wav2vec2-base",
        dataset_id="librispeech-test-other",
        metrics=ModelMetrics(
            accuracy=92.1,
            wer=5.8,
            cer=3.2,
            inference_time_ms=148.0
        ),
        timestamp=datetime(2024, 1, 11),
        notes="Performance on more challenging audio"
    ),
]


def get_mock_models() -> List[ASRModel]:
    """Returns all mock ASR models."""
    return MOCK_MODELS.copy()


def get_mock_datasets() -> List[Dataset]:
    """Returns all mock datasets."""
    return MOCK_DATASETS.copy()


def get_mock_evaluations() -> List[EvaluationResult]:
    """Returns all mock evaluation results."""
    return MOCK_EVALUATIONS.copy()


def get_model_by_id(model_id: str) -> Optional[ASRModel]:
    """Get a specific model by ID."""
    for model in MOCK_MODELS:
        if model.model_id == model_id:
            return model
    return None


def get_dataset_by_id(dataset_id: str) -> Optional[Dataset]:
    """Get a specific dataset by ID."""
    for dataset in MOCK_DATASETS:
        if dataset.dataset_id == dataset_id:
            return dataset
    return None


def get_evaluations_by_model(model_id: str) -> List[EvaluationResult]:
    """Get all evaluations for a specific model."""
    return [e for e in MOCK_EVALUATIONS if e.model_id == model_id]
