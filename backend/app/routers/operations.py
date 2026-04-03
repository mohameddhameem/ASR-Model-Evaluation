from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/operations", tags=["Operations"])

class JobSegment(BaseModel):
    id: str
    start: float
    end: float
    speaker: str
    transcription: str
    translation: Optional[str] = None

class ProcessingJob(BaseModel):
    job_id: str
    filename: str
    language: str
    duration: str
    speakers: int
    status: str
    confidence: Optional[float] = None
    progress: Optional[int] = 0
    date: str
    upload_time: str
    segments: Optional[List[JobSegment]] = None

# Mock data for the queue
MOCK_QUEUE = [
    {
        "job_id": "job-001",
        "filename": "conference-audio-2026-03-15.mp4",
        "language": "en",
        "duration": "12:45",
        "speakers": 3,
        "status": "completed",
        "confidence": 0.92,
        "progress": 100,
        "date": "2026-03-29",
        "upload_time": "2026-03-29T10:30:00Z",
        "segments": [
            {"id": "s1", "start": 0.0, "end": 2.5, "speaker": "Speaker 0", "transcription": "I feel like this is my second home.", "translation": "Je me sens comme si c'était ma deuxième maison."},
            {"id": "s2", "start": 2.5, "end": 5.1, "speaker": "Speaker 1", "transcription": "That's exactly what we wanted to achieve.", "translation": "C'est exactement ce que nous voulions accomplir."}
        ]
    },
    {
        "job_id": "job-002",
        "filename": "meeting-transcription.wav",
        "language": "fr",
        "duration": "08:30",
        "speakers": 2,
        "status": "completed",
        "confidence": 0.88,
        "progress": 100,
        "date": "2026-03-29",
        "upload_time": "2026-03-29T11:15:00Z",
        "segments": [
            {"id": "s1", "start": 0.0, "end": 3.2, "speaker": "Speaker 0", "transcription": "Bonjour à tous, on commence la réunion.", "translation": "Hello everyone, let's start the meeting."}
        ]
    },
    {
        "job_id": "job-003",
        "filename": "interview-segment.mp3",
        "language": "de",
        "duration": "15:20",
        "speakers": 2,
        "status": "processing",
        "confidence": None,
        "progress": 45,
        "date": "2026-03-29",
        "upload_time": "2026-03-29T12:00:00Z"
    }
]

@router.get("/queue", response_model=List[ProcessingJob])
async def get_processing_queue():
    """Get the current batch processing queue."""
    return MOCK_QUEUE

@router.get("/details/{job_id}", response_model=ProcessingJob)
async def get_job_details(job_id: str):
    """Get the details and segments for a specific job."""
    job = next((j for j in MOCK_QUEUE if j["job_id"] == job_id), None)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return job
