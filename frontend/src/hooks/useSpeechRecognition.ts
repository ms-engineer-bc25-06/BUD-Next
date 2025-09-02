// 音声認識カスタムフック - 重複ロジックの共通化とテスト可能化
// OPTIMIZE: 音声認識インスタンスの再利用と無駄な初期化防止
// FIXME: lastSpeechTime が未使用 - 自動停止機能の実装が不完全

import { useState, useRef, useCallback, useEffect } from 'react';
import { SPEECH_CONFIG } from '@/constants/speech';

// Web Speech APIの型定義
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export interface SpeechRecognitionHookResult {
  isListening: boolean;
  transcription: string;
  isProcessing: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscription: () => void;
}

export const useSpeechRecognition = (): SpeechRecognitionHookResult => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');
  // FIXME: 自動停止機能実装時に使用予定
  const [lastSpeechTime, setLastSpeechTime] = useState(Date.now());
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const initializeRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    
    recognition.continuous = SPEECH_CONFIG.CONTINUOUS;
    recognition.interimResults = SPEECH_CONFIG.INTERIM_RESULTS;
    recognition.lang = SPEECH_CONFIG.LANGUAGE;

    recognition.onstart = () => {
      console.log('🎤 音声認識開始');
      setIsListening(true);
      setIsProcessing(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setAccumulatedTranscript(prev => prev + finalTranscript);
        setLastSpeechTime(Date.now());
      }

      setTranscription(accumulatedTranscript + finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('❌ 音声認識エラー:', event.error);
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      console.log('🛑 音声認識終了');
      setIsListening(false);
      setIsProcessing(false);
    };

    return recognition;
  }, [isSupported, accumulatedTranscript]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      console.error('このブラウザは音声認識をサポートしていません');
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = initializeRecognition();
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsProcessing(true);
      } catch (error) {
        console.error('音声認識の開始に失敗:', error);
        setIsProcessing(false);
      }
    }
  }, [initializeRecognition, isListening, isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscription = useCallback(() => {
    setTranscription('');
    setAccumulatedTranscript('');
    setLastSpeechTime(Date.now());
    // FIXME: lastSpeechTime の自動停止機能実装時に活用予定
    void lastSpeechTime; // 一時的な警告回避
  }, [lastSpeechTime]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    transcription,
    isProcessing,
    isSupported,
    startListening,
    stopListening,
    resetTranscription,
  };
};