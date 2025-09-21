# services/gemini_feedback_service.py
"""AIフィードバックサービス - Gemini API版"""

import google.generativeai as genai
import os
from typing import Optional
import asyncio
import logging
import json

logger = logging.getLogger(__name__)

class GeminiFeedbackService:
    def __init__(self):
        # Gemini API設定
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY が設定されていません")
            self.model = None
        else:
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-pro')
                logger.info("Gemini API クライアント初期化完了")
            except Exception as e:
                logger.error(f"Gemini API 初期化エラー: {e}")
                self.model = None

    async def generate_feedback(self, transcript: str, child_age: Optional[int] = None) -> str:
        """音声文字起こしからAIフィードバックを生成（Gemini API版）"""
        
        if not self.model:
            logger.warning("Gemini API が利用できません。フォールバックフィードバックを返します")
            return self._get_fallback_feedback(transcript)

        prompt = f"""
以下は子どもが外国人と英語で話そうとした記録です: "{transcript}"

この子の「英語チャレンジ」を以下の観点で温かく評価してください：

🌟 【勇気ポイント】
- 外国人に話しかけた勇気（これだけでも素晴らしい！）
- 英語で何かを伝えようとした挑戦心
- 完璧でなくても諦めずに続けた粘り強さ

💫 【成長の芽】
- 単語一つでも英語を使えた（大きな前進！）
- 相手とのコミュニケーションが少しでも成立した
- 新しい表現や場面に挑戦した

🎯 【次への期待】
- 今回の経験が次の挑戦への自信になる
- 「英語って通じるんだ！」という実感
- 外国人との交流への興味が深まる

【重要】完璧な英語でなくても、話しかけた勇気と挑戦する気持ちが最も価値があります。
この子の頑張りを具体的に褒め、「また話してみたい！」と思えるような励ましを日本語で100文字程度で提供してください。

たとえ一言しか話せなくても、それは大きな成功です。

フィードバック:
"""

        try:
            logger.info(f"Gemini API フィードバック生成開始 - transcript: {transcript[:50]}...")
            
            response = await self._call_gemini_api(prompt)
            feedback = response.strip()
            
            logger.info(f"フィードバック生成成功 - 長さ: {len(feedback)}")
            return feedback

        except Exception as e:
            logger.error(f"Gemini API エラー: {e}")
            return self._get_fallback_feedback(transcript)

    async def generate_feedback_with_details(self, transcript: str, child_age: Optional[int] = None) -> dict:
        """詳細なフィードバック生成（JSON形式）"""
        
        if not self.model:
            logger.warning("Gemini API が利用できません。フォールバックフィードバックを返します")
            return self._get_fallback_feedback_json(transcript)

        prompt = f"""
以下は子どもが外国人と英語で話そうとした記録です: "{transcript}"

手順:
1) 推定話者分離: 「子どもが話した可能性が高い発話」を抽出（短い文・言い直し・ためらい・やさしい語彙など）
2) この子の「英語チャレンジ」を以下の観点で温かく評価（約50文字）:
   🌟【勇気ポイント】外国人に話しかけた勇気、英語で伝えようとした挑戦心
   💫【成長の芽】単語一つでも英語を使えた、コミュニケーションが成立した
   🎯【次への期待】この経験が次の挑戦への自信になる
   【重要】完璧でなくても、話しかけた勇気と挑戦する気持ちが最も価値がある
3) 会話文脈に沿った簡単な英語フレーズを1つ提案し、どんな場面で使うかを簡潔に説明（年齢: {child_age if child_age is not None else "不明"}）

出力は必ず次のJSON形式だけで返してください:
{{
  "child_utterances": ["子どもと推定した発話1", "発話2"],
  "feedback_short": "🌟💫🎯の観点を含む約50文字の短い応援コメント",
  "phrase_suggestion": {{ "en": "Hello", "ja": "初めて会った人への挨拶" }},
  "note": "話者推定で迷った点があれば簡潔に。なければ空文字"
}}
"""

        try:
            logger.info(f"Gemini API 詳細フィードバック生成開始")
            
            response = await self._call_gemini_api(prompt, temperature=0.3)
            
            # JSONパース試行
            try:
                feedback_json = json.loads(response.strip())
                logger.info("JSON形式のフィードバック生成成功")
                return feedback_json
            except json.JSONDecodeError:
                logger.warning("JSON パース失敗。テキスト形式で返します")
                return {
                    "child_utterances": [transcript],
                    "feedback_short": response.strip()[:100],
                    "phrase_suggestion": {"en": "Good job!", "ja": "よくできました！"},
                    "note": "JSON形式での生成に失敗しました"
                }

        except Exception as e:
            logger.error(f"Gemini API 詳細フィードバックエラー: {e}")
            return self._get_fallback_feedback_json(transcript)

    async def _call_gemini_api(self, prompt: str, temperature: float = 0.7) -> str:
        """Gemini API呼び出し（非同期）"""
        loop = asyncio.get_event_loop()

        def _sync_call():
            # Gemini API 設定
            generation_config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=300,
                top_p=0.9,
                top_k=40
            )
            
            # API呼び出し
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            return response.text

        return await loop.run_in_executor(None, _sync_call)

    async def generate_general_feedback(self, transcript: str) -> str:
        """一般的な音声フィードバック生成"""
        
        if not self.model:
            return self._get_fallback_feedback(transcript)
            
        prompt = f"""
以下は子どもが話した内容です: "{transcript}"

子どもの発話を以下の観点で温かく評価してください：

1. 話してくれたことへの感謝
2. 良かった点の具体的な褒め言葉  
3. 次に向けての優しい励まし

フィードバックは150文字以内で、子どもが理解しやすい言葉で書いてください。
"""

        try:
            response = await self._call_gemini_api(prompt)
            return response.strip()

        except Exception as e:
            logger.error(f"一般フィードバック生成エラー: {e}")
            return self._get_fallback_feedback(transcript)

    def _get_fallback_feedback(self, transcript: str) -> str:
        """フォールバックフィードバック"""
        return f"「{transcript[:30]}...」とても上手に話せたね！外国人と話す勇気が素晴らしい！次回も頑張ろう！😊"

    def _get_fallback_feedback_json(self, transcript: str) -> dict:
        """フォールバックフィードバック（JSON形式）"""
        return {
            "child_utterances": [transcript],
            "feedback_short": "英語で話そうとした勇気が素晴らしい！次も頑張ろう！😊",
            "phrase_suggestion": {"en": "Hello!", "ja": "こんにちは！"},
            "note": "AI フィードバックサービスが一時的に利用できません"
        }

    def is_available(self) -> bool:
        """Gemini API が利用可能かチェック"""
        return self.model is not None

# グローバルインスタンス
gemini_feedback_service = GeminiFeedbackService()