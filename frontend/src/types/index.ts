/**
 * Core Data Types for ASR Model Evaluation SPA
 */

/**
 * Represents a dataset item (audio file or video file)
 */
export type DatasetItem = {
  id: string;
  name: string;
  url: string;
  type: string;
  duration?: string;
  transcriptionVerified: boolean;
  lidVerified: boolean;
  detectedLanguage?: string;
  verifiedLanguage?: string;
  uploadDate: string;
};

/**
 * User preferences for app-wide settings
 */
export type UserPreferences = {
  asrModel: string;
  lidModel: string;
  contextWords: string;
  enableSampling: boolean;
  temperature: number;
  topP: number;
};

/**
 * Global app context type
 */
export type AppContextType = {
  datasets: DatasetItem[];
  addDatasetItem: (item: DatasetItem) => void;
  updateDatasetItem: (id: string, updates: Partial<DatasetItem>) => void;
  activeDatasetId: string | null;
  setActiveDatasetId: (id: string) => void;
  userPreferences: UserPreferences;
  updateUserPreferences: (prefs: UserPreferences) => void;
};

/**
 * Transcription segment with speaker diarization
 */
export type TranscriptionSegment = {
  id: string;
  start: number;
  end: number;
  speaker: string;
  transcription: string;
  translation: string;
};

/**
 * Language option type
 */
export type Language = {
  value: string;
  label: string;
};

/**
 * ASR model options
 */
export enum ASRModel {
  AUTO = 'auto',
  WHISPER = 'whisper',
  VIBEVOICE = 'vibe',
  AZURE = 'azure',
}

/**
 * LID model options
 */
export enum LIDModel {
  WHISPER = 'whisper-lid',
  SPEECHBRAIN = 'speechbrain',
  VIBEVOICE = 'vibe-lid',
}

/**
 * Processing status types
 */
export enum ProcessingStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
}
