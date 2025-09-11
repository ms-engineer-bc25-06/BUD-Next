# 🤖 BUD-Next

> 次世代AI駆動型親子英語学習プラットフォーム

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Ready-4285F4.svg)](https://cloud.google.com/)

## 🌟 概要

BUD-Nextは、Google Cloud AI技術を活用した次世代の親子英語学習支援システムです。
既存のBUDプロジェクト（Section9_TeamC）をベースに、AI Agentによる革新的な学習体験を提供します。

## 🎯 ハッカソン対応

このプロジェクトは **「AI Agentが、現実を豊かにする」** をテーマとした
ハッカソンへの参加作品として開発されています。

### Google Cloud要件対応
- ✅ **実行プロダクト**: Google Cloud Run
- ✅ **AI技術**: Gemini API + Speech-to-Text API

## 🚀 技術スタック

### AI & Cloud（新規実装予定）
- **Gemini API** - 高品質AIフィードバック生成
- **Google Speech-to-Text** - 高精度音声認識  
- **Google Cloud Run** - スケーラブル実行環境

### 既存基盤
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Backend**: FastAPI + PostgreSQL
- **Authentication**: Firebase
- **Development**: Monorepo + Husky + ESLint/Prettier + Ruff

## 📈 進化ポイント

既存BUDプロジェクトからの主な進化：
1. **OpenAI → Gemini**: より高品質・低コストなAIフィードバック
2. **Web Speech → Google Speech-to-Text**: 高精度音声認識
3. **ローカル → Cloud Run**: スケーラブルなクラウド実行環境

## 🏗️ セットアップ
```bash
# 環境変数設定
cp .env.example .env

# Docker環境起動  
docker-compose up -d

# 開発ツール準備
npm install
npm run prepare
👥 開発チーム

開発者A: AI・バックエンド担当
開発者B: フロントエンド・UX担当
開発者C: インフラ・DevOps担当


🚀 AI Agentと共に、子どもたちの英語学習を豊かにしましょう！
Base Project: Section9_TeamC
