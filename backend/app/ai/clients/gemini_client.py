# app/ai/clients/gemini_client.py
import asyncio
from app.ai.clients.interface import IAIClient

class GeminiClient(IAIClient):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_feedback(self, text: str, max_chars: int = 100):
        # 本番では Gemini API 呼び出し
        await asyncio.sleep(0.1)  # 擬似的な非同期処理
        return f"Feedback({text[:max_chars]})"

    async def suggest_phrases(self, text: str):
        # 本番では Gemini API 呼び出し
        await asyncio.sleep(0.1)
        return [f"{text} Phrase 1", f"{text} Phrase 2"]

