// frontend/src/components/challenge/VoiceRecorder.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Mic, Square, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string, feedback: any) => void;
  isLoading?: boolean;
}

export function VoiceRecorder({ 
  onTranscriptionComplete, 
  isLoading = false 
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMethod, setRecordingMethod] = useState<'web' | 'upload'>('web');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Web Speech API (リアルタイム)
  const startWebSpeech = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('このブラウザは音声認識をサポートしていません');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // 英語設定
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      
      console.log('Web Speech結果:', { transcript, confidence });
      
      // AIフィードバック取得（既存APIサービスとの統合）
      try {
        const { voiceRecorderAPI } = await import('@/services/apiIntegration');
        const { transcript: processedText, feedback, error } = await voiceRecorderAPI.processWebSpeechWithFeedback(transcript, confidence);
        
        if (error) {
          console.error('フィードバック取得エラー:', error);
          onTranscriptionComplete(transcript, null);
        } else {
          onTranscriptionComplete(processedText, feedback);
        }
      } catch (error) {
        console.error('フィードバック取得エラー:', error);
        onTranscriptionComplete(transcript, null);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('音声認識エラー:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  // MediaRecorder API (高品質)
  const startMediaRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await uploadAudioFile(audioBlob);
        
        // ストリームを停止
        stream.getTracks().forEach(track => track.stop());
      };

      setIsRecording(true);
      mediaRecorder.start();

      // 30秒で自動停止
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          stopRecording();
        }
      }, 30000);

    } catch (error) {
      console.error('録音開始エラー:', error);
      alert('マイクへのアクセスが拒否されました');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // 音声ファイルアップロード（既存APIサービスとの統合）
  const uploadAudioFile = async (audioBlob: Blob) => {
    try {
      const { voiceRecorderAPI } = await import('@/services/apiIntegration');
      const { transcript, feedback, confidence, error } = await voiceRecorderAPI.processAudioFileWithFeedback(audioBlob);

      if (error) {
        console.error('音声アップロードエラー:', error);
        onTranscriptionComplete('', { error });
      } else {
        console.log('Google Speech結果:', { transcript, confidence });
        onTranscriptionComplete(transcript, feedback);
      }
    } catch (error) {
      console.error('音声アップロードエラー:', error);
      onTranscriptionComplete('', { error: '音声変換に失敗しました' });
    }
  };

  // ファイル選択アップロード
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (5MB制限)
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズが大きすぎます（5MB以下にしてください）');
      return;
    }

    await uploadAudioFile(file);
  };

  return (
    <div className="space-y-4">
      {/* 録音方法選択 */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={recordingMethod === 'web' ? 'default' : 'outline'}
          onClick={() => setRecordingMethod('web')}
          size="sm"
        >
          リアルタイム認識
        </Button>
        <Button
          variant={recordingMethod === 'upload' ? 'default' : 'outline'}
          onClick={() => setRecordingMethod('upload')}
          size="sm"
        >
          高品質録音
        </Button>
      </div>

      {/* 録音ボタン */}
      {recordingMethod === 'web' ? (
        <Button
          onClick={startWebSpeech}
          disabled={isRecording || isLoading}
          className={`w-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}
        >
          <Mic className="mr-2" />
          {isRecording ? '話してください...' : '録音開始 (Web Speech)'}
        </Button>
      ) : (
        <div className="space-y-2">
          <Button
            onClick={isRecording ? stopRecording : startMediaRecording}
            disabled={isLoading}
            className={`w-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}
          >
            {isRecording ? <Square className="mr-2" /> : <Mic className="mr-2" />}
            {isRecording ? '録音停止' : '高品質録音開始'}
          </Button>
          
          {/* ファイルアップロード */}
          <div className="relative">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            <Button variant="outline" className="w-full" disabled={isLoading}>
              <Upload className="mr-2" />
              音声ファイルをアップロード
            </Button>
          </div>
        </div>
      )}

      {/* ステータス表示 */}
      {isRecording && (
        <div className="text-center text-sm text-gray-600">
          🎤 録音中... (最大30秒)
        </div>
      )}
      
      {isLoading && (
        <div className="text-center text-sm text-gray-600">
          🤖 AI分析中...
        </div>
      )}
    </div>
  );
}