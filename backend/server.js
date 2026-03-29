import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { mockModels, mockDatasets, mockEvaluations, mockProcessingJobs, mockAnalyticsData } from './data/mockData.js';

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'ASR Model Evaluation API',
    version: '1.0.0',
    docs: '/docs'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/docs', (req, res) => {
  res.json({
    endpoints: [
      { method: 'GET', path: '/api/asr/models', description: 'Get all ASR models' },
      { method: 'GET', path: '/api/datasets', description: 'Get all datasets' },
      { method: 'GET', path: '/api/analytics/summary', description: 'Get analytics summary' },
      { method: 'GET', path: '/api/operations/queue', description: 'Get processing queue' }
    ]
  });
});

// ASR Routes
app.get('/api/asr/models', (req, res) => {
  res.json(mockModels);
});

app.get('/api/asr/models/:modelId', (req, res) => {
  const model = mockModels.find(m => m.model_id === req.params.modelId);
  if (!model) {
    return res.status(404).json({ error: `Model ${req.params.modelId} not found` });
  }
  res.json(model);
});

// Datasets Routes
app.get('/api/datasets', (req, res) => {
  res.json(mockDatasets);
});

app.get('/api/datasets/:datasetId', (req, res) => {
  const dataset = mockDatasets.find(d => d.dataset_id === req.params.datasetId);
  if (!dataset) {
    return res.status(404).json({ error: `Dataset ${req.params.datasetId} not found` });
  }
  res.json(dataset);
});

app.post('/api/datasets', (req, res) => {
  res.status(201).json(req.body);
});

app.put('/api/datasets/:datasetId', (req, res) => {
  const dataset = mockDatasets.find(d => d.dataset_id === req.params.datasetId);
  if (!dataset) {
    return res.status(404).json({ error: `Dataset ${req.params.datasetId} not found` });
  }
  res.json(req.body);
});

app.delete('/api/datasets/:datasetId', (req, res) => {
  const dataset = mockDatasets.find(d => d.dataset_id === req.params.datasetId);
  if (!dataset) {
    return res.status(404).json({ error: `Dataset ${req.params.datasetId} not found` });
  }
  res.json({ message: `Dataset ${req.params.datasetId} deleted successfully` });
});

// Analytics Routes
app.get('/api/analytics/evaluations', (req, res) => {
  res.json(mockEvaluations);
});

app.get('/api/analytics/evaluations/model/:modelId', (req, res) => {
  const evaluations = mockEvaluations.filter(e => e.model_id === req.params.modelId);
  res.json(evaluations);
});

app.get('/api/analytics/summary', (req, res) => {
  const modelsEvaluated = new Set(mockEvaluations.map(e => e.model_id)).size;
  const datasetsUsed = new Set(mockEvaluations.map(e => e.dataset_id)).size;
  const avgAccuracy = mockEvaluations.length > 0
    ? (mockEvaluations.reduce((sum, e) => sum + e.metrics.accuracy, 0) / mockEvaluations.length).toFixed(2)
    : 0;
  const avgWer = mockEvaluations.length > 0
    ? (mockEvaluations.reduce((sum, e) => sum + e.metrics.wer, 0) / mockEvaluations.length).toFixed(2)
    : 0;

  res.json({
    total_evaluations: mockEvaluations.length,
    models_evaluated: modelsEvaluated,
    datasets_used: datasetsUsed,
    average_accuracy: parseFloat(avgAccuracy),
    average_wer: parseFloat(avgWer)
  });
});

app.post('/api/analytics/evaluations', (req, res) => {
  res.status(201).json(req.body);
});

// Operations / Processing Queue Routes
app.get('/api/operations/queue', (req, res) => {
  res.json(mockProcessingJobs);
});

app.get('/api/operations/jobs', (req, res) => {
  const status = req.query.status;
  const jobs = status 
    ? mockProcessingJobs.filter(j => j.status === status)
    : mockProcessingJobs;
  res.json(jobs);
});

app.get('/api/operations/summary', (req, res) => {
  const processing = mockProcessingJobs.filter(j => j.status === 'processing').length;
  const completed = mockProcessingJobs.filter(j => j.status === 'completed').length;
  const queued = mockProcessingJobs.filter(j => j.status === 'queued').length;
  const avgConfidence = mockProcessingJobs
    .filter(j => j.confidence !== null)
    .reduce((sum, j) => sum + (j.confidence || 0), 0) / 
    mockProcessingJobs.filter(j => j.confidence !== null).length || 0;
  
  res.json({
    total_jobs: mockProcessingJobs.length,
    processing,
    completed,
    queued,
    average_confidence: parseFloat(avgConfidence.toFixed(2))
  });
});

// Analytics Routes
app.get('/api/analytics/performance', (req, res) => {
  res.json(mockAnalyticsData);
});

app.get('/api/analytics/models', (req, res) => {
  const enrichedModels = mockModels.map(model => {
    const evaluations = mockEvaluations.filter(e => e.model_id === model.model_id);
    return {
      ...model,
      evaluations_count: evaluations.length,
      average_metrics: {
        accuracy: evaluations.length > 0 
          ? (evaluations.reduce((sum, e) => sum + e.metrics.accuracy, 0) / evaluations.length).toFixed(2)
          : 0,
        wer: evaluations.length > 0
          ? (evaluations.reduce((sum, e) => sum + e.metrics.wer, 0) / evaluations.length).toFixed(2)
          : 0
      }
    };
  });
  res.json(enrichedModels);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ ASR Model Evaluation API running on http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/docs`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});
