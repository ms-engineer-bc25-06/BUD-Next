# 本番用Dockerfile - Cloud Run最適化版
# マルチステージビルドでイメージサイズ最小化

# ===== ビルドステージ =====
FROM python:3.11-slim-bullseye as builder

# ビルド依存関係インストール
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリ設定
WORKDIR /app

# 依存関係ファイルコピー
COPY requirements.txt .

# 依存関係インストール（キャッシュ最適化）
RUN pip install --no-cache-dir --user -r requirements.txt

# ===== 本番ステージ =====
FROM python:3.11-slim-bullseye as production

# セキュリティ: 非rootユーザー作成
RUN groupadd -r appuser && useradd -r -g appuser appuser

# 必要なランタイム依存関係のみインストール
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 作業ディレクトリ設定
WORKDIR /app

# ビルドステージからPythonパッケージコピー
COPY --from=builder /root/.local /home/appuser/.local

# アプリケーションコードコピー
COPY . .

# 権限設定
RUN chown -R appuser:appuser /app
USER appuser

# 環境変数設定
ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/google-speech-credentials.json

# ヘルスチェック設定
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# ポート公開
EXPOSE 8080

# セキュリティヘッダー付きでアプリケーション起動
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]