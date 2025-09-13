"""Speech-to-Text API Router"""

from fastapi import APIRouter, File, UploadFile, HTTPException, status
from fastapi.responses import JSONResponse
import logging
from typing import Dict, Any
from ..services.speech_service import speech_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/speech",
    tags=["speech"],
    responses={404: {"description": "Not found"}},
)

@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
) -> Dict[str, Any]:
    """
    Convert audio file to text
    
    Args:
        audio: Uploaded audio file
    
    Returns:
        Conversion result (text, confidence, success)
    """
    try:
        # Check file format
        allowed_formats = ['audio/webm', 'audio/wav', 'audio/mpeg', 'audio/mp3', 
                          'audio/x-wav', 'audio/x-m4a', 'audio/ogg']
        
        if audio.content_type and audio.content_type not in allowed_formats:
            logger.warning(f"Unsupported audio format: {audio.content_type}")
        
        # Estimate format from file extension
        file_extension = audio.filename.split('.')[-1].lower() if audio.filename else 'webm'
        
        # Read audio data
        audio_data = await audio.read()
        
        if not audio_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audio data is empty"
            )
        
        # Speech-to-Text processing
        result = await speech_service.transcribe_audio(
            audio_data=audio_data,
            audio_format=file_extension
        )
        
        # Error check
        if not result.get("success"):
            logger.error(f"Audio conversion failed: {result.get('error')}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=result.get("error", "Audio conversion failed")
            )
        
        return {
            "success": True,
            "text": result["text"],
            "confidence": result["confidence"],
            "message": "Audio conversion successful"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Audio conversion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error occurred: {str(e)}"
        )

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Speech API service health check
    
    Returns:
        Service status
    """
    try:
        health_status = speech_service.health_check()
        
        if not health_status.get("healthy"):
            logger.warning(f"Speech service unhealthy: {health_status.get('error')}")
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={
                    "status": "unhealthy",
                    "service": "speech-to-text",
                    "error": health_status.get("error")
                }
            )
        
        return {
            "status": "healthy",
            "service": "speech-to-text",
            "details": health_status
        }
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "error",
                "service": "speech-to-text",
                "error": str(e)
            }
        )