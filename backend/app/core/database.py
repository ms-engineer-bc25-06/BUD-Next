import os
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
import logging

logger = logging.getLogger(__name__)

# 環境変数から直接DATABASE_URLを取得
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/bud")

logger.info(f"🔍 DATABASE_URL configured: {DATABASE_URL[:50]}...")

# psycopg2が含まれている場合は除去（Cloud SQLでは不要）
if "+psycopg2" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("+psycopg2", "")
    logger.info(f"🔧 psycopg2除去後: {DATABASE_URL[:50]}...")

# 同期エンジンのみ使用（非同期エンジンを削除）
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
)

# 同期セッション
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# 同期用の依存性注入関数
def get_db() -> Generator:
    """データベースセッションの依存性注入"""
    db = SessionLocal()
    try:
        logger.debug("データベースセッション作成")
        yield db
    except Exception as e:
        logger.error(f"データベースセッションエラー: {e}")
        db.rollback()
        raise
    finally:
        logger.debug("データベースセッション終了")
        db.close()

# データベース接続テスト関数
def test_database_connection() -> bool:
    """データベース接続テスト"""
    try:
        db = SessionLocal()
        result = db.execute(text("SELECT 1")).fetchone()
        db.close()
        logger.info("✅ データベース接続テスト成功")
        return True
    except Exception as e:
        logger.error(f"❌ データベース接続テスト失敗: {e}")
        return False

# データベース初期化（必要に応じて）
def create_tables():
    """テーブル作成"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ テーブル作成完了")
    except Exception as e:
        logger.error(f"❌ テーブル作成失敗: {e}")
        raise