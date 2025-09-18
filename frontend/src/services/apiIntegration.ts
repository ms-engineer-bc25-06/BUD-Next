// frontend/src/services/apiIntegration.ts
// 既存のApiServiceクラスと新しい音声機能を統合するヘルパー

import { api } from '@/lib/api'; // 既存のAPIサービス
import { VoiceApiService, type AIFeedbackResult } from './voiceApiService';

// 既存のapi.voice.saveTranscription を拡張
export const enhancedVoiceAPI = {
  // 既存のsaveTranscription機能をラップして拡張
  saveTranscription: async (request: {
    childId: string;
    transcription: string;
    aiFeedback?: AIFeedbackResult | null;
    source?: 'web_speech' | 'google_speech' | 'upload';
  }) => {
    try {
      // AIフィードバックがある場合は拡張APIを使用
      if (request.aiFeedback) {
        return await VoiceApiService.saveTranscriptionWithFeedback(request);
      } else {
        // 既存のAPIを使用
        return await api.voice.saveTranscription({
          childId: request.childId,
          transcription: request.transcription
        });
      }
    } catch (error) {
      console.error('音声保存エラー:', error);
      throw error;
    }
  },

  // 新しい音声機能のアクセサー（静的メソッドに対応）
  transcribeAudio: VoiceApiService.transcribeAudio,
  getAIFeedback: VoiceApiService.getAIFeedback,
  processWebSpeechResult: VoiceApiService.processWebSpeechResult,
  checkHealth: VoiceApiService.checkHealth,
};

// VoiceRecorderコンポーネント用の統合されたAPI関数
export const voiceRecorderAPI = {
  // Web Speech結果の処理とフィードバック取得
  processWebSpeechWithFeedback: async (text: string, confidence: number) => {
    try {
      // AIフィードバックを取得
      const feedback = await VoiceApiService.getAIFeedback(text, confidence);
      
      return {
        transcript: text,
        feedback: feedback,
        error: null
      };
    } catch (error) {
      console.error('Web Speech処理エラー:', error);
      return {
        transcript: text,
        feedback: null,
        error: error instanceof Error ? error.message : '処理に失敗しました'
      };
    }
  },

  // 音声ファイルの変換とフィードバック取得
  processAudioFileWithFeedback: async (audioFile: File | Blob) => {
    try {
      // 1. 音声ファイルを文字起こし
      const transcriptionResult = await VoiceApiService.transcribeAudio(audioFile);
      const { transcript, confidence } = transcriptionResult;

      // 2. AIフィードバックを取得
      const feedback = await VoiceApiService.getAIFeedback(transcript, confidence);

      return {
        transcript,
        feedback: feedback,
        confidence,
        error: null
      };
    } catch (error) {
      console.error('音声ファイル処理エラー:', error);
      return {
        transcript: '',
        feedback: null,
        error: error instanceof Error ? error.message : '処理に失敗しました'
      };
    }
  },

  // APIヘルスチェック
  checkAPIHealth: async () => {
    try {
      return await VoiceApiService.checkHealth();
    } catch (error) {
      console.error('ヘルスチェックエラー:', error);
      return null;
    }
  }
};