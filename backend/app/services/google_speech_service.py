# services/google_speech_service.py
"""Google Speech-to-Text API サービス"""

import os
import asyncio
import logging
from typing import Optional, Dict, Any
from google.cloud import speech

logger = logging.getLogger(__name__)

class GoogleSpeechService:
    """Google Speech-to-Text API サービス"""
    
    def __init__(self):
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Speech API クライアント初期化"""
        try:
            self.client = speech.SpeechClient()
            logger.info("Google Speech API クライアント初期化成功")
        except Exception as e:
            logger.error(f"Google Speech API クライアント初期化失敗: {e}")
            self.client = None
    
    async def transcribe_audio(
        self, 
        audio_data: bytes, 
        sample_rate: int = 48000,
        language_code: str = "ja-JP"
    ) -> Dict[str, Any]:
        """音声データをテキストに変換"""
        if not self.client:
            return {
                "success": False,
                "error": "Speech API クライアントが初期化されていません",
                "text": "",
                "confidence": 0.0
            }
        
        try:
            logger.info(f"音声変換開始 - サイズ: {len(audio_data)} bytes")
            
            # 音声設定
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
                sample_rate_hertz=sample_rate,
                language_code=language_code,
                enable_automatic_punctuation=True,
                model="latest_long",
                use_enhanced=True,
            )
            
            # 音声データ設定
            audio = speech.RecognitionAudio(content=audio_data)
            
            # 非同期で音声認識実行
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                self.client.recognize, 
                config, 
                audio
            )
            
            # 結果処理
            if response.results:
                result = response.results[0]
                alternative = result.alternatives[0]
                
                logger.info(f"音声変換成功 - テキスト長: {len(alternative.transcript)}")
                
                return {
                    "success": True,
                    "text": alternative.transcript,
                    "confidence": alternative.confidence,
                    "language": language_code,
                    "audio_size": len(audio_data)
                }
            else:
                logger.warning("音声変換結果が空です")
                return {
                    "success": False,
                    "error": "音声を認識できませんでした",
                    "text": "",
                    "confidence": 0.0
                }
                
        except Exception as e:
            logger.error(f"音声変換エラー: {e}")
            return {
                "success": False,
                "error": str(e),
                "text": "",
                "confidence": 0.0
            }
    
    def is_available(self) -> bool:
        """Speech API が利用可能かチェック"""
        return self.client is not None

# グローバルインスタンス
google_speech_service = GoogleSpeechService()