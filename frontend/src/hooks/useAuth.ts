'use client';

// Firebase を使わずに常にログイン済み状態にするモック版
export function useAuth() {
  // ダミーユーザー情報
  const user = {
    uid: 'dummy-user-id',
    email: 'dummy@example.com',
    displayName: 'テストユーザー',
  };

  // ログイン関数（何もしないが成功扱い）
  const loginWithGoogle = async () => {
    console.log('【モック】Googleログイン成功');
    return { success: true, user };
  };

  // ログアウト関数（何もしないが成功扱い）
  const logout = async () => {
    console.log('【モック】ログアウト');
    return { success: true };
  };

  return {
    user,
    loading: false,
    loginWithGoogle,
    logout,
    isAuthenticated: true, // 常にログイン済み扱い
  };
}
