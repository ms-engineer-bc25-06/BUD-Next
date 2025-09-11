import os
import google.generativeai as genai

# 環境変数から API キーを取得
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY が設定されていません")

# Gemini API を設定
genai.configure(api_key=api_key)

# 使用するモデルを指定（正しいモデル名を確認してください）
model = genai.GenerativeModel("gemini-2.0-flash")

# テストメッセージを生成
response = model.generate_content("Hello, Gemini!")

# 結果を出力
print("Gemini からのレスポンス:")
print(response.text)
