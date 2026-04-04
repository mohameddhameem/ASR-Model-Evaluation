# ASR Model Evaluation API Specification

This document outlines the core endpoints expected by the React frontend. Implement the logic for these placeholders to ensure full system functionality.

## 1. Datasets
Manage audio/video media files available for processing.

### `GET /api/datasets`
- **Frontend Source**: `Layout.tsx` (Global data loading)
- **Expected Payload**: A list of `DatasetItem` objects.
- **Fields**: `id`, `name`, `duration` (formatted "MM:SS"), `language` (ISO 2-letter), `status`.

## 2. Model Analytics
Provide performance telemetry for the Model Analytics dashboard.

### `GET /api/analytics/performance`
- **Frontend Source**: `ModelAnalytics.tsx`
- **Data Shape**:
    - `performance_metrics`: `average_latency_rtf` (float), `average_wer` (float), `gpu_load_percent` (float).
    - `inference_by_length`: List of objects: `[{ "length": "0-30s", "whisper": 0.05, "conformer": 0.08, ... }]`.

## 3. Operations & Job Queue
Manage asynchronous batch processing tasks.

### `GET /api/operations/queue`
- **Frontend Source**: `OperationsDashboard.tsx`
- **Expected Schema**: A list of `ProcessingJob` objects.
- **Key Fields**: `job_id`, `status` (`"completed"` | `"processing"` | `"error"`), `progress` (0-100), `segments` (List of transcription bits).

### `GET /api/operations/details/{job_id}`
- **Frontend Source**: `OperationsDashboard.tsx`
- **Return Type**: Detailed breakdown of a single job, including per-speaker transcription segments.

## 4. Training & Optimization
Trigger model improvements based on verified datasets.

### `POST /api/training/trigger`
- **Frontend Source**: `TrainingPipeline.tsx`
- **Payload**:
    ```json
    {
      "model_id": "string",
      "target_wer": "float",
      "config": {
        "learningRate": "float",
        "batchSize": "int",
        "epochs": "int"
      },
      "dataset_id": "optional string"
    }
    ```
- **Goal**: Initiate a background fine-tuning process and return a job tracking ID.
