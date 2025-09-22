'use client';

import { api } from '@/lib/api';
import { useEffect, useState } from 'react';

// 🟩 追加: APIレスポンス型（バックエンドに合わせて定義）
interface ChallengeResponse {
  id: string;
  child_id: string;
  transcript: string;
  ai_feedback?: string; // JSON文字列で返ってくる場合がある
  comment?: string; // 旧仕様の文字列
  created_at: string;
}

// 🟩 useRecordDetail が返すレコード型
interface RecordDetail {
  id: string;
  childId: string;
  title: string;
  timestamp: Date;
  transcript: string;
  aiFeedback: {
    praise: string;
    advice: string;
  };
  phraseData: { en: string; ja: string } | null;
}

export function useRecordDetail(recordId: string, childId: string) {
  const [record, setRecord] = useState<RecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // コメントを2分割する関数
  const splitAIFeedback = (comment: string) => {
    const sentences = comment.split(/[。！\n]/).filter((s) => s.trim());

    if (sentences.length >= 2) {
      const midPoint = Math.ceil(sentences.length / 2);
      return {
        praise: sentences.slice(0, midPoint).join('。') + '。',
        advice: sentences.slice(midPoint).join('。') + '。',
      };
    } else {
      return {
        praise: comment,
        advice: '',
      };
    }
  };

  useEffect(() => {
    if (!recordId || !childId) {
      setError('記録IDまたは子どもIDが指定されていません');
      setLoading(false);
      return;
    }

    const fetchRecord = async () => {
      try {
        setLoading(true);
        setError(null);

        // 🟩 型を明示する
        const data = (await api.voice.getChallenge(recordId)) as ChallengeResponse;

        if (data.child_id !== childId) {
          throw new Error('指定されたチャレンジ記録が見つかりませんでした');
        }

        // 🟩 AIフィードバックを抽出
        const rawFeedback = data.ai_feedback || data.comment || 'AIフィードバックを生成中です...';

        let praise = '';
        let advice = '';
        let phraseData: { en: string; ja: string } | null = null;

        try {
          // JSON形式ならパース
          const parsed = JSON.parse(rawFeedback);
          console.log('✅ Parsed AI Feedback:', parsed);
          praise = parsed?.feedback_short || '';
          phraseData = parsed?.phrase_suggestion || null;
        } catch {
          // 旧仕様の文字列を2分割
          const splitComment = splitAIFeedback(rawFeedback);
          praise = splitComment.praise;
          advice = splitComment.advice;
        }

        // 🟩 画面用に整形
        setRecord({
          id: data.id,
          childId: data.child_id,
          title: 'チャレンジ記録',
          timestamp: new Date(data.created_at),
          transcript: data.transcript || '音声認識処理中...',
          aiFeedback: {
            praise: praise,
            advice: advice,
          },
          phraseData: phraseData,
        });
      } catch (error) {
        console.error('記録取得エラー:', error);
        setError(error instanceof Error ? error.message : '記録の取得に失敗しました');
        setRecord(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [recordId, childId]);

  return { record, loading, error };
}
