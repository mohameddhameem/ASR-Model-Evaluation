/**
 * Shared mock data constants used as fallback when the backend is unreachable.
 *
 * These mirror the data in backend/app/routers/operations.py and
 * backend/server.js so that frontend fallback and backend data stay in sync.
 * When the real backend is connected, these should be removed.
 */

export type MockJobSegment = {
  id: string;
  start: number;
  end: number;
  speaker: string;
  transcription: string;
  translation?: string;
};

export type MockProcessingJob = {
  job_id: string;
  filename: string;
  language: string;
  duration: string;
  speakers: number;
  status: 'completed' | 'processing' | 'queued' | 'error';
  confidence: number | null;
  date: string;
  upload_time: string;
  segments?: MockJobSegment[];
};

export const MOCK_PROCESSING_QUEUE: MockProcessingJob[] = [
  {
    job_id: 'job-001',
    filename: 'conference-audio-2026-03-15.mp4',
    language: 'en',
    duration: '12:45',
    speakers: 3,
    status: 'completed',
    confidence: 0.92,
    date: '2026-03-29',
    upload_time: '2026-03-29T10:30:00Z',
  },
  {
    job_id: 'job-002',
    filename: 'meeting-transcription.wav',
    language: 'fr',
    duration: '8:30',
    speakers: 2,
    status: 'completed',
    confidence: 0.88,
    date: '2026-03-29',
    upload_time: '2026-03-29T11:15:00Z',
  },
  {
    job_id: 'job-003',
    filename: 'interview-segment.mp3',
    language: 'de',
    duration: '15:20',
    speakers: 2,
    status: 'processing',
    confidence: null,
    date: '2026-03-29',
    upload_time: '2026-03-29T12:00:00Z',
  },
  {
    job_id: 'job-004',
    filename: 'lecture-hall-recording.m4a',
    language: 'zh',
    duration: '45:00',
    speakers: 1,
    status: 'completed',
    confidence: 0.95,
    date: '2026-03-29',
    upload_time: '2026-03-29T14:30:00Z',
  },
  {
    job_id: 'job-005',
    filename: 'podcast-episode-42.mp3',
    language: 'en',
    duration: '32:15',
    speakers: 2,
    status: 'completed',
    confidence: 0.91,
    date: '2026-03-29',
    upload_time: '2026-03-29T16:00:00Z',
  },
];
