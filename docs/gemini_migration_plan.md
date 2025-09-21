# Gemini 移行設計メモ

## 1. 対象ファイル

| ファイル | 役割 | コメント |
| -------- | ---- | -------- |
| `app/ai_clients/openai_client.py` | AIクライアント（OpenAI依存） | Gemini APIに置き換え予定 |
| `app/services/ai_feedback_service.py` | フィードバック生成サービス | OpenAI API呼び出しをGeminiに置き換え |
| `app/services/voice_service.py` | 音声認識（Whisper API使用） | Whisper部分はGeminiの音声APIに置き換え |
| `docs/performance_guide.md` | 性能設計ガイド | ドキュメント参考。Gemini移行による性能影響の確認 |

---

## 2. 移行方針

### 2.1 API変更
- **モデル名**: `gemini-2.0-flash`  
- **呼び出しメソッド**:
  - テキスト生成: `generateContent`  
  - 音声認識: `transcriptions`（Gemini対応があれば置換）
- **認証**: プロジェクトごとの API キー（環境変数 `GEMINI_API_KEY` を使用）
- **レスポンス形式**: OpenAIのJSON形式に揃える（`choices[0].message.content`相当）

### 2.2 コード設計
- 既存の非同期呼び出しパターンは保持  
- 依存性注入に対応し、テスト容易性を確保  
- 戻り値や例外処理の統一

---

## 3. コード影響範囲

### 3.1 フィードバック生成
- `generate_feedback(transcript, max_chars)` → Gemini APIで置換
- 出力例:
```json
{
  "child_utterances": ["子ども発話1", "子ども発話2"],
  "feedback_short": "約50文字の応援コメント",
  "phrase_suggestion": { "en": "Hello", "ja": "挨拶例" },
  "note": ""
}
```
### 3.2 フレーズ提案
- suggest_phrases(transcript) → Gemini APIで置換
- 出力は文字列リストに整形

### 3.3 音声認識
- _get_client() で Gemini APIクライアント初期化
- transcribe_audio(audio_content, filename) → Geminiの音声認識API呼び出し

---

## 4. 開発・テスト方針
1.既存コードのOpenAI呼び出し部分をGeminiに置き換え

2.ユニットテストでJSON形式・戻り値の確認

3.音声ファイル認識テスト（サンプル音声で確認）

4.フロント/バックエンド統合確認

5.ドキュメント更新（APIキー管理、環境変数変更）

---

## 5. 注意点
- プロジェクトごとに使用できるモデルが異なる可能性がある
- 非同期呼び出し・例外処理は既存パターンに揃える
- OpenAIとの微妙なレスポンス差異（文字列分割・JSON整形）に注意