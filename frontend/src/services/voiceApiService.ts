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
   * 修正: バックエンドのai-feedbackエンドポイントに合わせる
   */
  static async getAIFeedback(
    text: string, 
    confidence: number = 1.0,
    challengeId?: string
  ): Promise<AIFeedbackResult> {
    try {
      // challengeIdがある場合は正しいエンドポイントを使用
      if (challengeId) {
        const body = {
          text,
          confidence,
          analysis_type: 'children_english'
        };
        return await ApiService.post<AIFeedbackResult>(`/api/ai-feedback/generate/${challengeId}`, body);
      } else {
        // 一時的なプレビュー用エンドポイント
        const body = {
          text,
          confidence,
          analysis_type: 'children_english'
        };
        return await ApiService.post<AIFeedbackResult>('/api/ai-feedback/preview/temp', body);
      }
    } catch (error) {
      console.error('フィードバック取得エラー:', error);
      
      // フォールバック: 簡易的なフィードバックを返す
      return {
        feedback: {
          encouragement: "よく頑張りました！素晴らしい発音でした！",
          pronunciation_tips: "今の調子で続けましょう",
          vocabulary_notes: "新しい単語をたくさん覚えましたね",
          grammar_feedback: "文法もしっかりできています"
        },
        analysis: {
          confidence_score: confidence * 100,
          speaking_level: "良い",
          strengths: ["発音が明瞭", "積極的な発話"],
          improvements: ["さらに練習を続けましょう"]
        },
        next_challenge: {
          suggestion: "次も同じように頑張ってください",
          difficulty_level: "基本"
        }
      };
    }
  }

  /**
   * Web Speech結果の処理とAIフィードバック取得
   * 修正: 正しいエンドポイントまたはフォールバック処理
   */
  static async processWebSpeechResult(
    text: string, 
    confidence: number
  ): Promise<{ transcript: string; feedback: AIFeedbackResult }> {
    try {
      // まずAPIで処理を試行
      const body = {
        text,
        confidence,
        source: 'web_speech'
      };

      return await ApiService.post<{ transcript: string; feedback: AIFeedbackResult }>(
        '/api/voice/transcribe', 
        body
      );
    } catch (error) {
      console.error('Web Speech処理エラー:', error);
      
      // フォールバック: ローカルでフィードバックを生成
      const feedback = await this.getAIFeedback(text, confidence);
      return {
        transcript: text,
        feedback
      };
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

  /**
   * 子どもの音声履歴取得（振り返り用）
   */
  static async getVoiceHistory(childId: string) {
    try {
      return await ApiService.get(`/api/voice/history/${childId}`);
    } catch (error) {
      console.error('音声履歴取得エラー:', error);
      throw error;
    }
  }
}
