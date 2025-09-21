"""Google Cloud Speech-to-Text API Service"""

import os
import logging
from typing import Dict, Any, Optional
from google.cloud import speech
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class SpeechToTextService:
    """Google Cloud Speech-to-Text API Service"""
    
    def __init__(self):
        """Initialize service"""
        try:
            # Initialize Speech client
            self.client = speech.SpeechClient()
            
            # Basic configuration
            self.config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
                sample_rate_hertz=48000,
                language_code="ja-JP",
                max_alternatives=1,
                profanity_filter=True,
                enable_word_time_offsets=False,
                enable_automatic_punctuation=True,
            )
            
            # Thread pool for CPU-intensive tasks
            self.thread_pool = ThreadPoolExecutor(max_workers=4)
            
            logger.info("SpeechToTextService initialized successfully")
            
        except Exception as e:
            logger.error(f"SpeechToTextService initialization failed: {e}")
            raise
    
    async def transcribe_audio(self, audio_data: bytes, 
                             audio_format: str = "webm") -> Dict[str, Any]:
        """
        Convert audio data to text
        
        Args:
            audio_data: Audio data in bytes
            audio_format: Audio format (webm, wav, mp3, etc.)
        
        Returns:
            Conversion result dictionary
        """
        try:
            # File size check (10MB limit)
            max_size = 10 * 1024 * 1024
            if len(audio_data) > max_size:
                return {
                    "success": False,
                    "text": "",
                    "confidence": 0.0,
                    "error": f"File size too large (limit: {max_size // (1024*1024)}MB)"
                }
            
            # Minimum size check
            if len(audio_data) < 100:
                return {
                    "success": False,
                    "text": "",
                    "confidence": 0.0,
                    "error": "Audio data too small"
                }
            
            # Adjust config for format
            config = self._adjust_config_for_format(audio_format)
            
            # Execute speech recognition
            result = await self._recognize_speech(audio_data, config)
            
            return result
            
        except Exception as e:
            logger.error(f"Speech recognition error: {e}")
            return {
                "success": False,
                "text": "",
                "confidence": 0.0,
                "error": f"Speech recognition processing error: {str(e)}"
            }
    
    def _adjust_config_for_format(self, audio_format: str) -> speech.RecognitionConfig:
        """Adjust configuration based on audio format"""
        config = self.config
        
        if audio_format.lower() in ['wav', 'wave']:
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code="ja-JP",
                max_alternatives=1,
                profanity_filter=True,
                enable_automatic_punctuation=True,
            )
        elif audio_format.lower() in ['mp3']:
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.MP3,
                sample_rate_hertz=16000,
                language_code="ja-JP",
                max_alternatives=1,
                profanity_filter=True,
                enable_automatic_punctuation=True,
            )
        
        return config
    
    async def _recognize_speech(self, audio_data: bytes, 
                              config: speech.RecognitionConfig) -> Dict[str, Any]:
        """Execute speech recognition asynchronously"""
        loop = asyncio.get_event_loop()
        
        def _sync_recognize():
            """Synchronous speech recognition processing"""
            audio = speech.RecognitionAudio(content=audio_data)
            response = self.client.recognize(config=config, audio=audio)
            return response
        
        try:
            # Run CPU-bound task in separate thread
            response = await loop.run_in_executor(
                self.thread_pool, _sync_recognize
            )
            
            # Process results
            if not response.results:
                return {
                    "success": False,
                    "text": "",
                    "confidence": 0.0,
                    "error": "Could not recognize speech"
                }
            
            # Get the most confident result
            result = response.results[0]
            alternative = result.alternatives[0]
            
            # Check confidence
            confidence = getattr(alternative, 'confidence', 0.0)
            if confidence < 0.3:
                logger.warning(f"Low confidence speech recognition result: {confidence}")
            
            return {
                "success": True,
                "text": alternative.transcript.strip(),
                "confidence": confidence,
                "error": None
            }
            
        except Exception as e:
            logger.error(f"Speech recognition execution error: {e}")
            return {
                "success": False,
                "text": "",
                "confidence": 0.0,
                "error": f"Speech recognition execution error: {str(e)}"
            }
    
    def health_check(self) -> Dict[str, Any]:
        """Service health check"""
        try:
            if not self.client:
                return {"healthy": False, "error": "Speech client not initialized"}
            
            if not self.config:
                return {"healthy": False, "error": "Speech config not configured"}
            
            return {
                "healthy": True,
                "service": "SpeechToTextService",
                "language": self.config.language_code,
                "encoding": str(self.config.encoding),
                "sample_rate": self.config.sample_rate_hertz
            }
            
        except Exception as e:
            return {"healthy": False, "error": str(e)}
    
    def __del__(self):
        """Destructor - release resources"""
        if hasattr(self, 'thread_pool'):
            self.thread_pool.shutdown(wait=False)


# Service instance (singleton)
speech_service = SpeechToTextService()