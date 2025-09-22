from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.utils.auth import get_current_user
from app.models.user import User
from app.models.child import Child
from app.api.routers import children, auth, ai_feedback, health, logging_control, voice
from app.routers import speech
from typing import Dict, Any
import logging
import os

# ロギング設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPIアプリケーション作成
app = FastAPI(
    title="BUD Backend API",
    description="子ども英語チャレンジサポートアプリのバックエンドAPI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS設定（Vercel + ローカル対応）
ALLOWED_ORIGINS = [
    # ローカル開発環境
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000", 
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    # Vercel本番環境
    "https://bud-next-mfcr.vercel.app",
    # Vercel プレビュー環境（動的URL対応）
    "https://bud-next-mfcr-*.vercel.app",
    "https://*.vercel.app",
]

# 本番環境では環境変数からも追加のオリジンを取得
if os.getenv("ADDITIONAL_ORIGINS"):
    additional_origins = os.getenv("ADDITIONAL_ORIGINS").split(",")
    ALLOWED_ORIGINS.extend([origin.strip() for origin in additional_origins])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Content-Type", 
        "Authorization", 
        "Accept",
        "Origin",
        "X-Requested-With",
        "X-Request-ID",
        "User-Agent",
        "Referer",
        "Accept-Encoding",
        "Accept-Language",
        "Cache-Control",
    ],
    expose_headers=["X-Request-ID"],
)

# ルーターの追加
app.include_router(children.router, prefix="/api/children", tags=["children"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(ai_feedback.router, prefix="/api", tags=["ai_feedback"])
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])
app.include_router(speech.router, prefix="/api/speech", tags=["speech"])
app.include_router(logging_control.router, prefix="/api", tags=["logging"])

# プリフライトリクエスト対応
@app.options("/{path:path}")
async def options_handler(path: str):
    """CORS プリフライトリクエストを処理"""
    return {"status": "ok"}

# ヘルスチェックエンドポイント
@app.get("/health")
async def health_check():
    """アプリケーションのヘルスチェック"""
    return {
        "status": "healthy",
        "service": "bud-backend",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.getenv("NODE_ENV", "development")
    }

# ルートエンドポイント
@app.get("/")
async def root():
    """APIルートエンドポイント"""
    return {
        "message": "BUD Backend API is running",
        "service": "bud-backend", 
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# 認証テスト用エンドポイント（認証不要）
@app.get("/api/test-no-auth")
async def test_no_auth():
    """認証なしのテストエンドポイント"""
    return {
        "message": "認証なしでAPI動作確認OK",
        "timestamp": datetime.utcnow().isoformat(),
        "server": "BUD Backend",
        "cors_allowed": True
    }

# 認証テスト用エンドポイント（認証必要）
@app.get("/api/test-auth")
async def test_auth(current_user: Dict[str, Any] = Depends(get_current_user)):
    """認証ありのテストエンドポイント"""
    return {
        "message": "認証付きAPI動作確認OK",
        "user_id": current_user.get("uid", "unknown"),
        "email": current_user.get("email", "unknown"),
        "timestamp": datetime.utcnow().isoformat(),
        "server": "BUD Backend"
    }

# データベース接続テスト
@app.get("/api/test-db")
async def test_database(db: Session = Depends(get_db)):
    """データベース接続テスト"""
    try:
        # 簡単なクエリ実行
        result = db.execute("SELECT 1 as test").fetchone()
        return {
            "message": "データベース接続OK",
            "result": result[0] if result else None,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"データベース接続エラー: {str(e)}"
        )

# デバッグ用エンドポイント
@app.get("/api/debug-env")
def debug_env():
    """環境変数デバッグ"""
    import os
    database_url = os.getenv("DATABASE_URL", "NOT_SET")
    return {
        "DATABASE_URL_first_50": database_url[:50] if database_url != "NOT_SET" else "NOT_SET",
        "NODE_ENV": os.getenv("NODE_ENV", "NOT_SET"),
        "OPENAI_API_KEY_set": "YES" if os.getenv("OPENAI_API_KEY") else "NO"
    }

# ユーザー情報取得（簡略版）
@app.get("/api/user/me")
async def get_current_user_info(current_user: Dict[str, Any] = Depends(get_current_user)):
    """現在のユーザー情報を取得"""
    return {
        "user": {
            "id": current_user.get("uid", "unknown"),
            "email": current_user.get("email", "unknown"),
            "display_name": current_user.get("name", "unknown")
        },
        "timestamp": datetime.utcnow().isoformat()
    }

# 統計情報エンドポイント
@app.get("/api/stats")
async def get_stats(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ユーザーの統計情報を取得"""
    try:
        # Firebase UIDでチェック（実際のDBスキーマに合わせて要調整）
        firebase_uid = current_user.get("uid")
        children_count = db.query(Child).filter(
            Child.user_id == firebase_uid
        ).count()
        
        return {
            "children_count": children_count,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get stats: {e}")
        raise HTTPException(
            status_code=500,
            detail="統計情報の取得に失敗しました"
        )

# エラーハンドラー
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """404エラーハンドラー"""
    return {
        "detail": "エンドポイントが見つかりません",
        "path": str(request.url.path),
        "method": request.method,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """500エラーハンドラー"""
    logger.error(f"Internal server error: {exc}")
    return {
        "detail": "サーバー内部エラーが発生しました",
        "timestamp": datetime.utcnow().isoformat()
    }

# アプリケーション起動時の処理
@app.on_event("startup")
async def startup_event():
    """アプリケーション起動時の処理"""
    logger.info("BUD Backend API が起動しました")
    logger.info(f"許可されたオリジン: {ALLOWED_ORIGINS}")
    logger.info(f"環境: {os.getenv('NODE_ENV', 'development')}")

# アプリケーション終了時の処理
@app.on_event("shutdown")
async def shutdown_event():
    """アプリケーション終了時の処理"""
    logger.info("BUD Backend API が終了しました")

@app.get("/api/test-db-sync")
def test_database_sync(db: Session = Depends(get_db)):
    """同期データベース接続テスト"""
    try:
        from sqlalchemy import text
        result = db.execute(text("SELECT version()")).fetchone()
        return {
            "status": "success",
            "postgresql_version": str(result[0]) if result else "unknown", 
            "message": "PostgreSQL同期接続成功"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "PostgreSQL同期接続失敗"
        }