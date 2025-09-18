// frontend/src/lib/api/auth.ts (モック版)

import { logger } from '@/utils/logger';

/**
 * Firebase認証を使わないモック版ヘッダー
 * - Authorizationを付けずに常にContent-Typeのみ返す
 */
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  logger.debug('✅ getAuthHeaders: モック版ヘッダーを返します');
  return {
    'Content-Type': 'application/json',
  };
};

/**
 * ダミーユーザー
 */
const dummyUser = {
  uid: 'dummy-user-id',
  email: 'dummy@example.com',
  displayName: 'テストユーザー',
};

/**
 * 認証APIモック
 * - login / getProfile / test 全てモックデータ返却
 */
export const authApi = {
  /**
   * ログインAPIモック
   */
  login: async () => {
    logger.debug('✅ authApi.login: モック版を返します');
    return {
      success: true,
      user: dummyUser,
      token: 'dummy-token',
    };
  },

  /**
   * プロフィール取得モック
   */
  getProfile: async () => {
    logger.debug('✅ authApi.getProfile: モック版プロフィール返します');
    return {
      email: dummyUser.email,
      displayName: dummyUser.displayName,
    };
  },

  /**
   * 認証テストモック
   */
  test: async () => {
    logger.debug('✅ authApi.test: モック版認証テスト返します');
    return {
      status: 'ok',
      user: dummyUser,
    };
  },
};
