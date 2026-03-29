# Backend

Express.js REST API with mock data.

## Setup

```bash
npm install
npm start
```

Runs on http://localhost:8000

## API Endpoints

**Health Check**
- GET /health

**ASR Models** (5 endpoints)
- GET /api/asr/models - List models
- GET /api/asr/models/{model_id} - Get model
- POST /api/asr/models - Create model
- PUT /api/asr/models/{model_id} - Update model
- DELETE /api/asr/models/{model_id} - Delete model

**Datasets** (5 endpoints)
- GET /api/datasets - List datasets
- GET /api/datasets/{dataset_id} - Get dataset
- POST /api/datasets - Create dataset
- PUT /api/datasets/{dataset_id} - Update dataset
- DELETE /api/datasets/{dataset_id} - Delete dataset

**Analytics** (3 endpoints)
- GET /api/analytics/evaluations - List evaluations
- GET /api/analytics/evaluations/model/{id} - Model evaluations
- GET /api/analytics/summary - Summary stats

## Mock Data

3 ASR models, 3 datasets, 3 evaluations included.

**Models:**
- Wav2Vec 2.0 - 95.5% accuracy
- Whisper - 97.2% accuracy
- Conformer - 96.8% accuracy

**Datasets:**
- LibriSpeech (clean)
- LibriSpeech (other)
- Common Voice

**Stats:**
- Total Evaluations: 3
- Average Accuracy: 94.93%
- Average WER: 3.3

## Testing

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/asr/models
curl http://localhost:8000/api/datasets
curl http://localhost:8000/api/analytics/summary
```

## Structure

```
server.js      # Express app
package.json   # Dependencies
data/
  mockData.js  # Mock datasets
```

## Tech Stack

Express 4.18.2, Node.js v24.14.0+

## CORS

Enabled for all origins - frontend can connect from any domain.
