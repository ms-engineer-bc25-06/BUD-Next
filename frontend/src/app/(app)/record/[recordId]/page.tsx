'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale'; // 日本語ロケールをインポート
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// API連携用の型定義（直後ページ用：シンプル）
interface RecordData {
  id: string;
  childId: string;
  childName: string;
  timestamp: Date;
  aiFeedback: string;
  phraseSuggestion?: {
    en: string;
    ja: string;
  };
}

// APIレスポンスの型定義
interface TranscriptResponse {
  id: string;
  child_id: string;
  transcript: string;
  ai_feedback?: string;
  comment?: string;
  created_at: string;
  status: string;
}

interface ChildResponse {
  id: string;
  name?: string;
  nickname?: string;
}

export default function RecordCompletionPage() {
  const params = useParams();
  const recordId = params.recordId as string;

  const [record, setRecord] = useState<RecordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recordId) {
      setError('記録IDが指定されていません');
      setLoading(false);
      return;
    }

    const fetchRecord = async () => {
      try {
        setLoading(true);
        setError(null);

        // 直後ページ用のAPI呼び出し（getTranscript）
        const data = (await api.voice.getTranscript(recordId)) as TranscriptResponse;

        // 子ども情報も取得
        let childName = 'お子さま';
        try {
          const childData = (await api.children.get(data.child_id)) as ChildResponse;
          childName = childData.nickname || childData.name || 'お子さま';
        } catch (childError) {
          console.error('子ども情報取得エラー:', childError);
        }

        // ai_feedbackをJSON.parseしてfeedback_shortを取得（失敗時は従来表示）
        // 🟩【修正ポイント】まずcommentではなくai_feedbackを優先的に使う
        let aiText = data.ai_feedback || data.comment || 'AIフィードバックを生成中です...';

        let phraseSuggestion = undefined;

        try {
          // 🟩【修正ポイント】ai_feedbackかcommentがJSON形式ならパースする
          const feedbackData = data.ai_feedback || data.comment;

          if (
            feedbackData &&
            typeof feedbackData === 'string' &&
            feedbackData.trim().startsWith('{') // 🟩JSONっぽいかチェック
          ) {
            const parsed = JSON.parse(feedbackData); // 🟩ここが「パース」
            aiText = parsed?.feedback_short || aiText;
            phraseSuggestion = parsed?.phrase_suggestion;
          }
        } catch (e) {
          console.error('AIフィードバックのJSONパースに失敗:', e);
          // JSON parseに失敗した場合は元のテキストを使用（旧データ対応）
        }

        // APIレスポンスを画面表示用の形式に変換
        setRecord({
          id: data.id,
          childId: data.child_id,
          childName: childName,
          timestamp: new Date(data.created_at),
          aiFeedback: aiText, // JSON形式ならfeedback_short、旧形式なら元テキスト
          phraseSuggestion: phraseSuggestion,
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
  }, [recordId]);

  // ローディング中の表示
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6 lg:p-8 text-center">
        <Card className="w-full max-w-md rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">記録を読み込み中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // エラー状態または記録が見つからない場合
  if (error || !record) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6 lg:p-8 text-center">
        <Card className="w-full max-w-md rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-sm">
          <CardContent className="p-0">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">記録が見つかりません</h1>
            <p className="text-gray-600 mb-6">
              {error || '指定された記録IDのデータが見つかりませんでした。'}
            </p>
            <Link href="/children" passHref>
              <Button className="w-full py-3 text-lg font-semibold rounded-full bg-blue-400 text-white hover:bg-blue-500">
                ホームに戻る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 正常表示
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6 lg:p-8 text-center">
      <main className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center py-8">
        <h1 className="mb-8 text-4xl font-extrabold text-pink-600 sm:text-5xl md:text-6xl drop-shadow-lg">
          よくがんばったね！
        </h1>

        {/* メインのフィードバックカード */}
        <Card className="w-full rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-sm mb-8">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-xl font-bold text-gray-800 sm:text-2xl">
              {record.childName}へのメッセージ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-left">
            {/* AIフィードバック表示（JSON形式ならfeedback_short、旧形式なら元テキスト） */}
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
              {record.aiFeedback}
            </p>

            {/* フレーズ提案の表示 */}
            {record.phraseSuggestion && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-semibold text-blue-800 mb-2">次回使えるフレーズ：</p>
                <p className="text-lg font-bold text-blue-600">{record.phraseSuggestion.en}</p>
                <p className="text-sm text-gray-600 mt-1">{record.phraseSuggestion.ja}</p>
              </div>
            )}

            <div className="mt-6 text-sm text-gray-500">
              <p>記録日時: {format(record.timestamp, 'yyyy年MM月dd日 HH:mm', { locale: ja })}</p>
            </div>
          </CardContent>
        </Card>

        {/* ホームに戻るボタン */}
        <Link href="/children" passHref>
          <Button className="w-full max-w-xs py-4 sm:py-5 text-xl sm:text-2xl font-bold rounded-full shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 bg-blue-400 text-white hover:bg-blue-500">
            ホームに戻る
          </Button>
        </Link>
      </main>
    </div>
  );
}
