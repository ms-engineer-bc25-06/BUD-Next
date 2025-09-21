'use client';

import { api } from '@/lib/api';
import { isSameMonth, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';

interface ChallengeRecord {
  id: string;
  childId: string;
  date: string;
  summary: string;
}

export function useHistoryRecords(selectedChildId: string) {
  const [records, setRecords] = useState<ChallengeRecord[]>([]);
  const [thisMonthChallengeCount, setThisMonthChallengeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (recordId: string) => {
    if (!confirm('この記録を削除しますか？削除した記録は元に戻せません。')) {
      return;
    }

    setDeletingId(recordId);

    try {
      await api.challenges.delete(recordId);

      setRecords((prev) => prev.filter((record) => record.id !== recordId));

      const currentMonth = new Date();
      const remainingRecords = records.filter((record) => record.id !== recordId);
      const count = remainingRecords.filter((record) =>
        isSameMonth(parseISO(record.date), currentMonth)
      ).length;
      setThisMonthChallengeCount(count);
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除中にエラーが発生しました');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (!selectedChildId) {
      setRecords([]);
      setThisMonthChallengeCount(0);
      return;
    }

    const fetchRecords = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('履歴取得開始:', selectedChildId);
        const data = (await api.voice.getHistory(selectedChildId)) as any;
        console.log('取得したデータ:', data);

        // データ構造の安全な処理
        const transcripts = data?.transcripts || [];
        console.log('transcripts配列:', transcripts);

        const recordsForChild = transcripts
          .filter((item: any) => item && item.id) // 有効なアイテムのみフィルター
          .map((item: { id: string; created_at: string; transcript?: string }) => {
            // transcriptの安全な処理
            let summary = 'チャレンジ記録';

            if (item.transcript && typeof item.transcript === 'string') {
              summary =
                item.transcript.length > 30
                  ? item.transcript.substring(0, 30) + '...'
                  : item.transcript;
            }

            return {
              id: item.id,
              childId: selectedChildId,
              date: item.created_at || new Date().toISOString(),
              summary,
            };
          })
          .sort(
            (a: ChallengeRecord, b: ChallengeRecord) =>
              parseISO(b.date).getTime() - parseISO(a.date).getTime()
          );

        console.log('処理後のレコード:', recordsForChild);
        setRecords(recordsForChild);

        // 今月のチャレンジ数計算
        const currentMonth = new Date();
        const count = recordsForChild.filter((record: ChallengeRecord) =>
          isSameMonth(parseISO(record.date), currentMonth)
        ).length;
        setThisMonthChallengeCount(count);
      } catch (error) {
        console.error('履歴取得エラー:', error);
        setError('履歴の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [selectedChildId]);

  return {
    records,
    thisMonthChallengeCount,
    loading,
    error,
    deletingId,
    handleDelete,
  };
}
