import { authApi } from './api/auth';
import { childrenApi } from './api/children';
import { voiceApi } from './api/voice';

// 🚀 環境に応じたAPI URL設定
const API_URL =
  process.env.NODE_ENV === 'development'
    ? '' // 開発環境：プロキシ使用（相対パス）
    : process.env.NEXT_PUBLIC_API_URL ||
      'https://bud-next-backend-688045425116.asia-northeast1.run.app';

export const api = {
  // ヘルスチェック
  health: async () => {
    try {
      const healthUrl =
        process.env.NODE_ENV === 'development' ? '/api/proxy/health' : `${API_URL}/health`;

      const response = await fetch(healthUrl);
      return response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error' };
    }
  },

  // 認証関連API
  auth: authApi,

  // 子ども管理API
  children: childrenApi,

  // 音声関連API
  voice: voiceApi,

  // 会話履歴API（音声APIのエイリアス）
  conversations: {
    list: async (childId?: string) => {
      return childId ? voiceApi.getHistory(childId) : [];
    },
    get: async (conversationId: string) => {
      return voiceApi.getTranscript(conversationId);
    },
  },

  // 🚀 チャレンジAPI - プロキシ対応版
  challenges: {
    delete: async (challengeId: string) => {
      try {
        const { getAuthHeaders } = await import('./api/auth');
        const headers = await getAuthHeaders();

        // 環境に応じたURL設定
        const deleteUrl =
          process.env.NODE_ENV === 'development'
            ? `/api/proxy/ai-feedback/${challengeId}`
            : `${API_URL}/api/ai-feedback/${challengeId}`;

        console.log(`削除開始: ${deleteUrl}`);
        console.log('認証ヘッダー:', headers);

        const response = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
        });

        console.log('削除レスポンス:', response.status, response.statusText);

        if (!response.ok) {
          let errorMessage = `削除失敗: ${response.status}`;
          try {
            const errorData = await response.json();
            console.error('削除エラーデータ:', errorData);
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch {
            try {
              const errorText = await response.text();
              console.error('削除エラーテキスト:', errorText);
              errorMessage = errorText || errorMessage;
            } catch {
              console.error('レスポンス読み取り失敗');
            }
          }
          throw new Error(errorMessage);
        }

        // レスポンスが空の場合があるので安全に処理
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
            console.log('削除成功:', result);
            return result;
          } else {
            console.log('削除成功（JSONなし）');
            return { success: true, message: '削除完了' };
          }
        } catch (parseError) {
          console.log('JSON解析失敗、削除は成功:', parseError);
          return { success: true, message: '削除完了' };
        }
      } catch (error) {
        console.error('チャレンジ記録の削除に失敗:', error);
        throw error;
      }
    },
  },

  // 🚀 AIフィードバックAPI - プロキシ対応版
  feedback: {
    generate: async (transcriptId: string) => {
      try {
        const { getAuthHeaders } = await import('./api/auth');
        const headers = await getAuthHeaders();

        // 環境に応じたURL設定
        const feedbackUrl =
          process.env.NODE_ENV === 'development'
            ? `/api/proxy/voice/transcript/${transcriptId}`
            : `${API_URL}/api/voice/transcript/${transcriptId}`;

        const response = await fetch(feedbackUrl, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'フィードバック取得に失敗しました');
        }

        return response.json();
      } catch (error) {
        console.error('フィードバック取得に失敗:', error);
        throw error;
      }
    },

    // チャレンジ詳細取得
    getChallenge: async (challengeId: string) => {
      try {
        const { getAuthHeaders } = await import('./api/auth');
        const headers = await getAuthHeaders();

        // 環境に応じたURL設定
        const challengeUrl =
          process.env.NODE_ENV === 'development'
            ? `/api/proxy/voice/challenge/${challengeId}`
            : `${API_URL}/api/voice/challenge/${challengeId}`;

        console.log(`チャレンジ詳細取得: ${challengeUrl}`);

        const response = await fetch(challengeUrl, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('チャレンジ詳細取得エラー:', errorData);
          throw new Error(errorData.detail || 'チャレンジ詳細の取得に失敗しました');
        }

        const result = await response.json();
        console.log('チャレンジ詳細取得成功:', result);
        return result;
      } catch (error) {
        console.error('チャレンジ詳細取得に失敗:', error);
        throw error;
      }
    },
  },
};
