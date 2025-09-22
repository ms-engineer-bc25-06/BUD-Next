'use client';
import { useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export function useApiWithMock<T>(mockData: T) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = async (apiCall: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall();
      return data;
    } catch (err) {
      console.error('API呼び出し失敗。モックデータを使用します。', err);
      setError('API呼び出しに失敗しました（モックデータ使用中）');
      return mockData;
    } finally {
      setLoading(false);
    }
  };

  const LoadingUI = loading ? <LoadingSpinner /> : null;
  const ErrorUI = error ? <ErrorMessage message={error} /> : null;

  return { callApi, loading, error, LoadingUI, ErrorUI };
}
