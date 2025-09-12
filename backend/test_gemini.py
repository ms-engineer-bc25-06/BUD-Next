import asyncio
from app.ai.clients.gemini_client import GeminiClient


async def main():
    client = GeminiClient(api_key="DUMMY_API_KEY")

    # フィードバック生成テスト
    feedback = await client.generate_feedback("I like apple.", max_chars=50)
    print("Gemini フィードバック:", feedback)

    # フレーズ提案テスト
    phrases = await client.suggest_phrases("I like apple.")
    print("Gemini フレーズ提案:")
    for p in phrases:
        print("-", p)


if __name__ == "__main__":
    asyncio.run(main())

