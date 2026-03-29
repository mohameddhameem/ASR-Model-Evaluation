/**
 * ASR Service - Handles all ASR-related API calls
 * Currently mocked, ready for backend integration
 */

import { apiClient } from './api';
import { TranscriptionSegment } from '../types';

export interface TranscriptionResult {
  text: string;
  confidence: number;
  segments: TranscriptionSegment[];
  language: string;
}

export interface ASROptions {
  model: string;
  language?: string;
  contextWords?: string;
  enableSampling?: boolean;
  temperature?: number;
  topP?: number;
}

export class ASRService {
  /**
   * Transcribe audio file
   */
  static async transcribeAudio(
    fileUrl: string,
    options: ASROptions
  ): Promise<TranscriptionResult> {
    // TODO: Replace with real API call
    // const response = await apiClient.post<TranscriptionResult>('/asr/transcribe', {
    //   fileUrl,
    //   ...options,
    // });

    // Mock response for now
    return {
      text: 'This is a mock transcription of the audio content.',
      confidence: 0.95,
      segments: [
        {
          id: 'seg-1',
          start: 0,
          end: 2.5,
          speaker: 'Speaker 0',
          transcription: 'Hello, this is a test.',
          translation: 'Bonjour, ceci est un test.',
        },
      ],
      language: options.language || 'en',
    };
  }

  /**
   * Get available ASR models
   */
  static async getAvailableModels(): Promise<string[]> {
    // TODO: Replace with real API call
    return ['whisper', 'vibe', 'azure'];
  }

  /**
   * Get ASR model info
   */
  static async getModelInfo(model: string): Promise<any> {
    // TODO: Replace with real API call
    return {
      name: model,
      version: '1.0',
      supported_languages: ['en', 'fr', 'de', 'zh', 'es', 'ja'],
    };
  }
}
