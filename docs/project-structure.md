# 🏗️ BUD プロジェクト構成ガイド

## 📋 概要

BUD（子ども英語チャレンジサポートアプリ）のプロジェクト構成と開発ガイドライン

## 🎯 アーキテクチャ概要

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React/TypeScript │    │ • Python/SQLAlchemy │    │ • Firebase Auth │
│ • App Router    │    │ • PostgreSQL    │    │ • OpenAI API    │
│ • shadcn/ui     │    │ • Alembic       │    │ • Web Speech    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📁 ディレクトリ構成

### ルートディレクトリ

```
Section9_TeamC/
├── 📊 README.md              # プロジェクト概要
├── 🛠️ SETUP.md              # 環境構築手順
├── 🏗️ PROJECT_STRUCTURE.md  # 本ファイル（構成説明）
├── 🐳 compose.yml           # Docker開発環境
├── 🐳 compose.prod.yml      # Docker本番環境
│
├── 🎨 frontend/             # フロントエンド（Next.js）
├── 🔧 backend/              # バックエンド（FastAPI）
├── 📚 docs/                 # 設計ドキュメント
├── 🏭 infrastructure/       # インフラ構成
├── 📜 scripts/              # 自動化スクリプト
└── ⚙️ config/               # 共通設定ファイル
```

---

## 🎨 フロントエンド構成

```
frontend/
├── 📦 package.json          # 依存関係・スクリプト
├── ⚙️ next.config.js        # Next.js設定
├── 🎭 tailwind.config.ts    # Tailwind CSS設定
├── 🔍 tsconfig.json         # TypeScript設定
├── 🧪 vitest.config.ts      # 単体テスト設定
├── 🎬 playwright.config.ts  # E2Eテスト設定
│
└── src/
    ├── 📱 app/              # Next.js App Router
    │   ├── 🏠 layout.tsx            # ルートレイアウト
    │   ├── 📄 page.tsx              # ホームページ
    │   └── (app)/                   # 認証必須エリア
    │       ├── 🔒 layout.tsx        # 認証レイアウト
    │       ├── 👶 children/         # 子ども管理
    │       ├── 🎯 challenge/        # チャレンジ
    │       ├── 📚 history/          # 履歴表示
    │       └── 📊 record/           # 記録詳細
    │
    ├── 🧩 components/       # 再利用可能コンポーネント
    │   ├── 🔐 auth/         # 認証関連コンポーネント
    │   └── 🎨 ui/           # UIコンポーネントライブラリ
    │
    ├── 🪝 hooks/           # カスタムフック
    │   ├── useAuth.ts      # 認証状態管理
    │   └── useChildren.ts  # 子ども状態管理
    │
    ├── 📚 lib/             # 共通ライブラリ
    │   ├── 🔌 api/         # API通信（機能別分離）
    │   │   ├── auth.ts     # 認証API
    │   │   ├── children.ts # 子ども管理API
    │   │   └── voice.ts    # 音声API
    │   ├── 🔥 firebase.ts  # Firebase設定
    │   └── 🛠️ utils.ts     # ユーティリティ関数
    │
    ├── 🎨 styles/          # スタイルファイル
    ├── 📝 types/           # TypeScript型定義
    └── 🧪 __tests__/       # テストファイル
```

---

## 🔧 バックエンド構成

```
backend/
├── 📦 requirements.txt     # Python依存関係
├── ⚙️ pyproject.toml       # Python設定・フォーマット
├── 🗃️ alembic.ini          # DBマイグレーション設定
├── 🐳 Dockerfile.dev       # 開発用Docker
├── 🐳 Dockerfile.prod      # 本番用Docker
│
├── 🗃️ alembic/             # DBマイグレーション
│   └── versions/           # マイグレーションファイル
│
├── 🗄️ database/            # DB初期化
│   └── init.sql           # 初期スキーマ
│
└── app/                    # アプリケーションコード
    ├── 🚀 main.py          # FastAPIアプリケーション
    │
    ├── 🌐 api/             # API層
    │   └── routers/        # APIルーター
    │       ├── auth.py     # 認証API
    │       ├── children.py # 子ども管理API
    │       ├── voice.py    # 音声API
    │       ├── ai_feedback.py # AIフィードバック
    │       └── health.py   # ヘルスチェック
    │
    ├── ⚙️ core/            # コア機能
    │   ├── config.py       # 設定管理
    │   └── database.py     # DB接続
    │
    ├── 📊 models/          # データモデル（SQLAlchemy）
    │   ├── user.py         # ユーザーモデル
    │   ├── child.py        # 子どもモデル
    │   └── challenge.py    # チャレンジモデル
    │
    ├── 📋 schemas/         # API仕様（Pydantic）
    │   ├── user.py         # ユーザースキーマ
    │   └── child.py        # 子どもスキーマ
    │
    ├── 🏢 services/        # ビジネスロジック
    │   ├── ai_feedback_service.py # AIフィードバック
    │   ├── user_service.py        # ユーザー管理
    │   └── voice_service.py       # 音声処理
    │
    ├── 🛠️ utils/           # ユーティリティ
    │   └── auth.py         # 認証ヘルパー
    │
    └── 🧪 tests/           # テストファイル
        ├── conftest.py     # テスト設定
        └── test_*.py       # 各種テスト
```

---

## 🔄 データフロー

```
[ユーザー操作]
    ↓
[Next.js フロントエンド]
    ↓ HTTP/JSON
[FastAPI バックエンド]
    ↓ SQLAlchemy ORM
[PostgreSQL データベース]

[外部サービス連携]
Firebase Auth ←→ [認証] ←→ FastAPI
OpenAI API    ←→ [AI処理] ←→ FastAPI
```

---

## 🆕 新機能追加ガイド

### 新しいページ追加

```bash
# 1. ページファイル作成
frontend/src/app/(app)/[機能名]/page.tsx

# 2. 必要に応じてAPIクライアント追加
frontend/src/lib/api/[機能名].ts

# 3. カスタムフック作成
frontend/src/hooks/use[機能名].ts
```

### 新しい API 追加

```bash
# 1. APIルーター作成
backend/app/api/routers/[機能名].py

# 2. データモデル追加
backend/app/models/[機能名].py

# 3. スキーマ定義
backend/app/schemas/[機能名].py

# 4. ビジネスロジック
backend/app/services/[機能名]_service.py

# 5. main.pyにルーター登録
app.include_router([機能名].router, prefix="/api/[機能名]")
```

---

## 🔧 開発環境セットアップ

### 必要なファイル

```bash
# 環境変数設定
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Firebase認証設定
# backend/serviceAccountKey.json （Firebaseから取得）
```

### 起動コマンド

```bash
# Docker環境（推奨）
docker-compose up

# ローカル環境
cd backend && python -m uvicorn app.main:app --reload
cd frontend && npm run dev
```

---

## 📋 命名規則

### ディレクトリ命名

- **kebab-case**: URL 関連（`/challenge/[childId]`）
- **camelCase**: React 関連（`useChildren`, `getChild`）
- **snake_case**: Python 関連（`get_current_user`, `ai_feedback`）

### ファイル命名

- **Pages**: `page.tsx`, `layout.tsx`
- **Components**: `PascalCase.tsx` （例：`ChildCard.tsx`）
- **Hooks**: `use[機能名].ts` （例：`useChildren.ts`）
- **API**: `[機能名].py` （例：`children.py`）
- **Services**: `[機能名]_service.py`

### 特殊な命名

- **(app)**: Next.js Route Groups（認証必須エリア）
- **[childId]**: Dynamic Routes（動的ルーティング）

---

## 🚨 注意事項

### セキュリティ

- **機密ファイル**: `serviceAccountKey.json`は`backend/`にのみ配置
- **環境変数**: `.env`ファイルは`.gitignore`で除外
- **API Key**: 本番環境では環境変数から取得

### 開発ルール

- **バックアップファイル**: 本番ディレクトリに置かない
- **テスト結果**: `test-results/`, `playwright-report/`は`.gitignore`
- **Node modules**: `node_modules/`, `venv/`は`.gitignore`

---

## 🆘 トラブルシューティング

### よくある問題

1. **Firebase 認証エラー**

   - `serviceAccountKey.json`の配置確認
   - 環境変数`FIREBASE_PROJECT_ID`の設定確認

2. **DB 接続エラー**

   - Docker Compose での起動確認
   - PostgreSQL 接続情報の確認

3. **ビルドエラー**
   - Node.js/Python バージョン確認
   - 依存関係の再インストール

### 助けが必要な場合

- **Issue 作成**: GitHub Issue でバグ報告
- **開発相談**: Slack `#section9-teamc`チャンネル
- **設計相談**: `docs/`配下の設計書を確認
