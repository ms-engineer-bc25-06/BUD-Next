from typing import Any, Dict

from fastapi import APIRouter, Depends, Request

from app.middleware.traceability_logging import user_logger
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/test")
def auth_test(request: Request, current_user: Dict[str, Any] = Depends(get_current_user)):
    """認証テスト用エンドポイント"""

    # トレーサビリティログ
    request_id = request.headers.get("X-Request-ID", "unknown")
    user_logger.log_user_action(
        "auth_test", current_user["user_id"], {"endpoint": "/api/auth/test"}, request_id
    )

    return {
        "message": "認証テスト成功",
        "user_id": current_user["user_id"],
        "email": current_user["email"],
        "name": current_user["name"],
    }

@router.post("/login")
def auth_login(request: Request, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Firebase認証後のバックエンド認証確認"""
    request_id = request.headers.get("X-Request-ID", "unknown")
    user_logger.log_user_action(
        "auth_login", current_user["user_id"], {"endpoint": "/api/auth/login"}, request_id
    )
    return {
        "success": True,
        "message": "認証成功",
        "user": {
            "id": current_user["user_id"],
            "email": current_user["email"],
            "name": current_user["name"]
        }
    }
