export const mockModels = [
  {
    model_id: 'wav2vec2-base',
    name: 'Wav2Vec 2.0 Base',
    version: '1.0',
    description: "Facebook's Wav2Vec 2.0 base model for speech recognition",
    framework: 'Hugging Face',
    metrics: {
      accuracy: 95.5,
      wer: 2.3,
      cer: 1.1,
      inference_time_ms: 145.5
    },
    created_date: '2024-01-01T00:00:00Z',
    language: 'en'
  },
  {
    model_id: 'whisper-base',
    name: 'OpenAI Whisper Base',
    version: '1.0',
    description: "OpenAI's Whisper model for robust speech recognition",
    framework: 'OpenAI',
    metrics: {
      accuracy: 97.2,
      wer: 1.8,
      cer: 0.9,
      inference_time_ms: 285.0
    },
    created_date: '2024-01-02T00:00:00Z',
    language: 'en'
  },
  {
    model_id: 'conformer-large',
    name: 'Conformer Large',
    version: '1.0',
    description: 'Large Conformer model for speech recognition',
    framework: 'NeMo',
    metrics: {
      accuracy: 96.8,
      wer: 1.5,
      cer: 0.8,
      inference_time_ms: 210.5
    },
    created_date: '2024-01-03T00:00:00Z',
    language: 'en'
  }
];

export const mockDatasets = [
  {
    dataset_id: 'librispeech-test-clean',
    name: 'LibriSpeech Test (Clean)',
    description: 'LibriSpeech test set - clean subset for ASR evaluation',
    metadata: {
      total_hours: 10.5,
      sample_rate: 16000,
      format: 'wav',
      noise_level: 'clean'
    },
    created_date: '2024-01-01T00:00:00Z',
    language: 'en'
  },
  {
    dataset_id: 'librispeech-test-other',
    name: 'LibriSpeech Test (Other)',
    description: 'LibriSpeech test set - other subset with more challenging audio',
    metadata: {
      total_hours: 8.2,
      sample_rate: 16000,
      format: 'wav',
      noise_level: 'noisy'
    },
    created_date: '2024-01-01T00:00:00Z',
    language: 'en'
  },
  {
    dataset_id: 'common-voice-en',
    name: 'Common Voice (English)',
    description: 'Mozilla Common Voice dataset in English',
    metadata: {
      total_hours: 24.5,
      sample_rate: 48000,
      format: 'mp3',
      noise_level: 'very_noisy'
    },
    created_date: '2024-01-15T00:00:00Z',
    language: 'en'
  }
];

export const mockEvaluations = [
  {
    evaluation_id: 'eval_001',
    model_id: 'wav2vec2-base',
    dataset_id: 'librispeech-test-clean',
    metrics: {
      accuracy: 95.5,
      wer: 2.3,
      cer: 1.1,
      inference_time_ms: 145.5
    },
    timestamp: '2024-01-10T00:00:00Z',
    notes: 'Initial evaluation on clean speech'
  },
  {
    evaluation_id: 'eval_002',
    model_id: 'whisper-base',
    dataset_id: 'librispeech-test-clean',
    metrics: {
      accuracy: 97.2,
      wer: 1.8,
      cer: 0.9,
      inference_time_ms: 285.0
    },
    timestamp: '2024-01-10T00:00:00Z',
    notes: 'Whisper model on clean speech'
  },
  {
    evaluation_id: 'eval_003',
    model_id: 'wav2vec2-base',
    dataset_id: 'librispeech-test-other',
    metrics: {
      accuracy: 92.1,
      wer: 5.8,
      cer: 3.2,
      inference_time_ms: 148.0
    },
    timestamp: '2024-01-11T00:00:00Z',
    notes: 'Performance on more challenging audio'
  }
];

export const mockProcessingJobs = [
  {
    job_id: 'job_001',
    filename: 'interview_recording_2024.wav',
    status: 'processing',
    progress: 65,
    model_id: 'whisper-base',
    language: 'en',
    duration: '12:34',
    speakers_detected: 2,
    confidence: null,
    created_at: '2024-03-29T10:15:00Z',
    estimated_completion: '2024-03-29T10:18:30Z'
  },
  {
    job_id: 'job_002',
    filename: 'customer_support_call.mp3',
    status: 'completed',
    progress: 100,
    model_id: 'conformer-large',
    language: 'fr',
    duration: '08:45',
    speakers_detected: 2,
    confidence: 0.94,
    created_at: '2024-03-29T09:30:00Z',
    completed_at: '2024-03-29T09:35:15Z',
    segments: [
      {
        id: 'seg_001',
        start: 0.2,
        end: 2.5,
        speaker: 'Speaker 0',
        transcription: 'Bonjour, comment puis-je vous aider?',
        translation: 'Hello, how can I help you?'
      },
      {
        id: 'seg_002',
        start: 2.8,
        end: 5.1,
        speaker: 'Speaker 1',
        transcription: 'Je voudrais parler à un agent.',
        translation: 'I would like to speak to an agent.'
      },
      {
        id: 'seg_003',
        start: 5.4,
        end: 8.2,
        speaker: 'Speaker 0',
        transcription: 'Bien sûr, vous êtes connecté avec notre équipe de support.',
        translation: 'Of course, you are connected with our support team.'
      }
    ]
  },
  {
    job_id: 'job_003',
    filename: 'podcast_episode_34.wav',
    status: 'completed',
    progress: 100,
    model_id: 'whisper-base',
    language: 'en',
    duration: '45:22',
    speakers_detected: 1,
    confidence: 0.91,
    created_at: '2024-03-29T08:00:00Z',
    completed_at: '2024-03-29T08:52:45Z',
    segments: [
      {
        id: 'seg_001',
        start: 0.5,
        end: 3.2,
        speaker: 'Speaker 0',
        transcription: 'Welcome back to another episode of our tech podcast.',
        translation: 'Bienvenue dans un nouvel épisode de notre podcast technologique.'
      },
      {
        id: 'seg_002',
        start: 3.5,
        end: 6.8,
        speaker: 'Speaker 0',
        transcription: 'Today we are discussing the latest advances in machine learning.',
        translation: 'Aujourd\'hui, nous discutons des dernières avancées en apprentissage automatique.'
      },
      {
        id: 'seg_003',
        start: 7.1,
        end: 10.5,
        speaker: 'Speaker 0',
        transcription: 'This technology is revolutionizing how we process data.',
        translation: 'Cette technologie révolutionne notre façon de traiter les données.'
      }
    ]
  },
  {
    job_id: 'job_004',
    filename: 'meeting_notes_german.wav',
    status: 'queued',
    progress: 0,
    model_id: 'conformer-large',
    language: 'de',
    duration: '32:18',
    speakers_detected: null,
    confidence: null,
    created_at: '2024-03-29T11:00:00Z',
    estimated_completion: '2024-03-29T11:35:00Z'
  },
  {
    job_id: 'job_005',
    filename: 'training_video.mp4',
    status: 'completed',
    progress: 100,
    model_id: 'wav2vec2-base',
    language: 'en',
    duration: '28:15',
    speakers_detected: 3,
    confidence: 0.88,
    created_at: '2024-03-29T07:15:00Z',
    completed_at: '2024-03-29T07:40:20Z',
    segments: [
      {
        id: 'seg_001',
        start: 1.2,
        end: 4.5,
        speaker: 'Speaker 0',
        transcription: 'Good morning everyone, welcome to today training session.',
        translation: 'Bonjour à tous, bienvenue à la session de formation d\'aujourd\'hui.'
      },
      {
        id: 'seg_002',
        start: 4.8,
        end: 8.3,
        speaker: 'Speaker 1',
        transcription: 'We will be covering important features of the platform.',
        translation: 'Nous couvrirons les fonctionnalités importantes de la plateforme.'
      },
      {
        id: 'seg_003',
        start: 8.6,
        end: 12.1,
        speaker: 'Speaker 2',
        transcription: 'First, let\'s understand the basic architecture.',
        translation: 'Premièrement, comprenons l\'architecture de base.'
      },
      {
        id: 'seg_004',
        start: 12.4,
        end: 15.8,
        speaker: 'Speaker 0',
        transcription: 'The system is designed with scalability in mind.',
        translation: 'Le système est conçu en tenant compte de l\'évolutivité.'
      }
    ]
  }
];

export const mockAnalyticsData = {
  performance_metrics: {
    average_latency_rtf: 0.082,
    average_wer: 3.1,
    average_cer: 1.8,
    gpu_load_percent: 74.2,
    throughput_files_per_hour: 15.5
  },
  time_series: {
    latency_trend: [
      { day: 'Mon', latency: 0.085, utilization: 68, wer: 4.2 },
      { day: 'Tue', latency: 0.082, utilization: 71, wer: 4.0 },
      { day: 'Wed', latency: 0.079, utilization: 74, wer: 3.9 },
      { day: 'Thu', latency: 0.081, utilization: 72, wer: 4.1 },
      { day: 'Fri', latency: 0.078, utilization: 76, wer: 3.8 },
      { day: 'Sat', latency: 0.075, utilization: 62, wer: 3.7 },
      { day: 'Sun', latency: 0.080, utilization: 65, wer: 3.9 }
    ]
  },
  inference_by_length: [
    { length: 'Audio < 10s', whisper: 450, conformer: 380, wav2vec2: 320 },
    { length: 'Audio 10s-30s', whisper: 1200, conformer: 980, wav2vec2: 850 },
    { length: 'Audio 30s-1m', whisper: 2500, conformer: 2100, wav2vec2: 1800 },
    { length: 'Audio 1m-5m', whisper: 8400, conformer: 7200, wav2vec2: 6400 },
    { length: 'Audio > 5m', whisper: 15600, conformer: 13200, wav2vec2: 11800 }
  ],
  language_distribution: [
    { name: 'English', whisper: 3.2, conformer: 2.8, wav2vec2: 3.5 },
    { name: 'Mandarin', whisper: 5.1, conformer: 4.5, wav2vec2: 5.8 },
    { name: 'French', whisper: 2.8, conformer: 2.4, wav2vec2: 3.1 },
    { name: 'Spanish', whisper: 3.0, conformer: 2.7, wav2vec2: 3.4 },
    { name: 'German', whisper: 2.6, conformer: 2.3, wav2vec2: 2.9 }
  ]
};
