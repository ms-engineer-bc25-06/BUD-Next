# app/ai/clients/interface.py
from abc import ABC, abstractmethod

class IAIClient(ABC):

    @abstractmethod
    async def generate_feedback(self, text: str, max_chars: int):
        """テキストに対してフィードバックを生成"""
        pass

    @abstractmethod
    async def suggest_phrases(self, text: str):
        """テキストに対してフレーズを提案"""
        pass
