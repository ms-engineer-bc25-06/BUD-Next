# 🌱 BUD-Next - 子ども向け音声チャレンジアプリ

[![Deploy Status](https://img.shields.io/badge/Deploy-Cloud%20Run-blue)](https://bud-next-frontend-688045425116.asia-northeast1.run.app) [![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20FastAPI%20%7C%20Cloud%20Run-green)](#tech-stack) [![AI Powered](https://img.shields.io/badge/AI-Gemini%20%7C%20Speech%20to%20Text-orange)](#ai-features)

> **子どもたちの「話す勇気」を育む音声チャレンジプラットフォーム**  
> AI フィードバックと親のサポートで、楽しく自信を築けるアプリケーション

## 🎯 プロジェクト概要

BUD-Next は、内向的な子どもたちが「話すこと」に自信を持てるよう支援する音声チャレンジアプリケーションです。現代の教育現場で求められる「発話機会の創出」と「個別支援」を、最新の AI 技術とクラウドインフラで実現しています。

### 🎬 実動作デモ

**以前バージョンの完全動作**: [実際のアプリケーション動作映像](リンク予定)  
**技術解説記事**: [Zenn - BUD プロジェクト詳細解説](リンク予定)

---

## 🚀 ハッカソンでの技術的チャレンジ

### 📈 大規模技術スタック移行への挑戦

このハッカソンでは、既存の動作する BUD アプリケーションを**次世代技術スタックに完全移行**することに挑戦しました。

| 従来技術     | →   | 新技術スタック        | 移行理由                   |
| ------------ | --- | --------------------- | -------------------------- |
| OpenAI GPT   | →   | **Google Gemini**     | コスト効率・日本語特化     |
| 従来インフラ | →   | **Google Cloud Run**  | スケーラビリティ・運用効率 |
| モノリス     | →   | **Next.js + FastAPI** | モダン開発・保守性         |

### 🔧 解決に取り組んだ複雑な技術課題

#### 1. **Mixed Content セキュリティ問題**

```
HTTPS フロントエンド → HTTP バックエンド通信ブロック
解決: FastAPI redirect_slashes=False 設定による307リダイレクト回避
```

#### 2. **Cloud Run デプロイ時の認証連携**

```
Firebase Authentication ↔ Cloud SQL ↔ FastAPI の3層連携
解決: 環境変数・シークレット管理の最適化
```

#### 3. **データベーススキーマ不一致**

```
本番環境とローカル環境でのテーブル構造差異
現在進行中: Cloud SQL Studio でのマイグレーション実行
```

---

## 💻 技術アーキテクチャ

### フロントエンド

- **Next.js 15** (App Router) - モダン React フレームワーク
- **shadcn/ui + Tailwind CSS** - 高品質 UI コンポーネント
- **Firebase Authentication** - セキュアな認証基盤

### バックエンド

- **FastAPI** - 高速 API フレームワーク
- **SQLAlchemy + PostgreSQL** - 型安全なデータベース操作
- **Google Gemini API** - AI フィードバック生成

### インフラ・DevOps

- **Google Cloud Run** - サーバーレスコンテナ実行
- **Cloud SQL (PostgreSQL)** - マネージドデータベース
- **GitHub Actions** - CI/CD パイプライン

### AI・音声処理

- **Google Speech-to-Text** - 高精度日本語音声認識
- **Web Speech API** - ブラウザネイティブ音声処理
- **Google Gemini Pro** - 子ども向け最適化フィードバック

---

## 🔄 現在の開発状況

### ✅ 完了済み機能

- Firebase Google 認証システム
- Cloud Run 本番デプロイ環境
- FastAPI REST API 基盤
- Next.js レスポンシブ UI
- Gemini AI 統合基盤
- Speech-to-Text API 連携

### ⚠️ 課題解決中

- データベーススキーマ統一 (Cloud SQL Studio 使用)
- フロントエンド・バックエンド完全統合
- 本番環境でのエンドツーエンドテスト

### 🎯 学習成果

数日間の集中開発で習得した技術：

- Cloud Run デプロイメント戦略
- CORS・セキュリティ設定の実践
- PostgreSQL 本番運用
- Next.js App Router 活用
- マイクロサービス間連携

---

## 🌟 独自性・技術的価値

### 1. **リアルタイム音声処理パイプライン**

ブラウザ音声入力 → Speech API → Gemini 分析 → 即座にフィードバック

### 2. **子ども向け AI プロンプト最適化**

```python
# 実装例: 子ども特化型フィードバック生成
prompt = f"""
{child_speech}について、小学生が理解できる温かい日本語で、
具体的な改善点と励ましを3行以内で返してください。
"""
```

### 3. **プログレッシブ Web 対応**

モバイルファーストな UI 設計で、学校・家庭どちらでも利用可能

---

## 🔗 デプロイ・リポジトリ

### 本番環境 URL

- **フロントエンド**: https://bud-next-frontend-688045425116.asia-northeast1.run.app
- **バックエンド API**: https://bud-next-backend-688045425116.asia-northeast1.run.app/docs

### 開発環境セットアップ

```bash
# リポジトリクローン
git clone https://github.com/ms-engineer-bc25-06/BUD-Next

# バックエンド起動
cd backend && source venv/bin/activate
docker-compose up -d

# フロントエンド起動
cd frontend && npm install && npm run dev
```

---

## 📚 関連リソース

- **技術解説記事**: [Zenn - BUD プロジェクト詳細](https://zenn.dev/mse2506/articles/aa8773c7205be7)
- **動作デモ動画**: [完全動作版アプリケーション](https://www.youtube.com/watch?v=-k5iV_b7Doo)
- **API 仕様書**: [Swagger UI](https://bud-next-backend-688045425116.asia-northeast1.run.app/docs)

---

## 🏆 ハッカソンでの挑戦意義

このプロジェクトは単なる「動くアプリ」作成ではなく、**実用的なプロダクトの本格的な技術移行**に挑戦しました。実際の開発現場で頻繁に発生する課題（認証連携、デプロイメント、データベース移行）に真正面から取り組み、モダンな技術スタックでの解決手法を実践的に学習できました。

完璧な動作には至らなくとも、**技術的成長と問題解決プロセス**そのものに大きな価値があると確信しています。

---

_Made with 💙 for children's growth and confidence building_
