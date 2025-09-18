// frontend/src/services/voiceApiService.ts
// 既存のApiServiceクラスの構造に合わせた音声API拡張

import { ApiService } from './apiService';

// 音声機能の型定義
export interface VoiceTranscriptionResult {
  transcript: string;
  confidence: number;
  language: string;
  duration: number;
  words?: Array<{
    word: string;
    start_time: number;
    end_time: number;
    confidence: number;
  }>;
}

export interface AIFeedbackResult {
  feedback: {
    encouragement: string;
    pronunciation_tips?: string;
    vocabulary_notes?: string;
    grammar_feedback?: string;
  };
  analysis: {
    confidence_score: number;
    speaking_level: string;
    strengths: string[];
    improvements: string[];
  };
  next_challenge?: {
    suggestion: string;
    difficulty_level: string;
  };
}

export interface VoiceHealthStatus {
  speech_api: boolean;
  voice_api: boolean;
  backend: boolean;
  error?: string;
}

export interface SaveTranscriptionRequest {
  childId: string;
  transcription: string;
  aiFeedback?: AIFeedbackResult | null;
  source?: 'web_speech' | 'google_speech' | 'upload';
  confidence?: number;
  duration?: number;
}

// 既存のApiServiceクラスに合わせた静的メソッド音声サービス
export class VoiceApiService {
  /**
   * Google Speech-to-Text API による音声文字起こし
   */
  static async transcribeAudio(audioFile: File | Blob): Promise<VoiceTranscriptionResult> {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      // FormDataの場合は直接fetchを使用（既存のApiServiceはJSONのみ対応のため）
      const { BASE_URL } = await import('@/constants/api').then(m => m.API_CONFIG);
      const { getAuthHeaders } = await import('@/lib/api/auth');
      
      const headers = await getAuthHeaders();
      // Content-Typeはブラウザが自動設定するため削除
      delete headers['Content-Type'];
      
      const response = await fetch(`${BASE_URL}/api/speech/transcribe`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const { handleApiError } = await import('@/utils/error-handler');
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { detail: `音声変換に失敗しました(${response.status})` };
        }
        throw handleApiError(new Error(errorData.detail || `Speech API Error: ${response.status}`));
      }

      return await response.json();
    } catch (error) {
      console.error('音声変換エラー:', error);
      throw error;
    }
  }

  /**
   * Gemini AI によるフィードバック取得
   */
  static async getAIFeedback(
    text: string, 
    confidence: number = 1.0
  ): Promise<AIFeedbackResult> {
    const body = {
      text,
      confidence,
      analysis_type: 'children_english'
    };

    try {
      return await ApiService.post<AIFeedbackResult>('/api/voice/feedback', body);
    } catch (error) {
      console.error('フィードバック取得エラー:', error);
      throw error;
    }
  }

  /**
   * Web Speech結果の処理とAIフィードバック取得
   */
  static async processWebSpeechResult(
    text: string, 
    confidence: number
  ): Promise<{ transcript: string; feedback: AIFeedbackResult }> {
    const body = {
      text,
      confidence,
      source: 'web_speech'
    };

    try {
      return await ApiService.post<{ transcript: string; feedback: AIFeedbackResult }>(
        '/api/voice/transcribe', 
        body
      );
    } catch (error) {
      console.error('Web Speech処理エラー:', error);
      throw error;
    }
  }

  /**
   * APIヘルスチェック
   */
  static async checkHealth(): Promise<VoiceHealthStatus> {
    try {
      const [speechHealth, voiceHealth] = await Promise.allSettled([
        ApiService.get<{ status: string }>('/api/speech/health'),
        ApiService.get<{ status: string }>('/api/voice/test')
      ]);

      return {
        speech_api: speechHealth.status === 'fulfilled',
        voice_api: voiceHealth.status === 'fulfilled',
        backend: true
      };
    } catch (error) {
      console.error('ヘルスチェックエラー:', error);
      return {
        speech_api: false,
        voice_api: false,
        backend: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 拡張された文字起こし保存（AIフィードバック付き）
   */
  static async saveTranscriptionWithFeedback(
    request: SaveTranscriptionRequest
  ): Promise<{ transcript_id: string }> {
    const body = {
      childId: request.childId,
      transcription: request.transcription,
      source: request.source || 'web_speech',
      confidence: request.confidence || 1.0,
      duration: request.duration,
      aiFeedback: request.aiFeedback
    };

    try {
      return await ApiService.post<{ transcript_id: string }>('/api/voice/save', body);
    } catch (error) {
      console.error('音声保存エラー:', error);
      throw error;
    }
  }
}