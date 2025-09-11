# BUD-Next GCP環境設定完了

## プロジェクト情報
- プロジェクトID: bud-next
- サービスアカウント: bud-speech-service@bud-next.iam.gserviceaccount.com

## 認証ファイル
- speech-key.json (配置済み)

## 環境変数
- GOOGLE_CLOUD_PROJECT_ID=bud-next
- GOOGLE_APPLICATION_CREDENTIALS=./speech-key.json

## API有効化済み
- Cloud Speech-to-Text API
- Cloud Run API
- Container Registry API

## 課金設定
- 予算アラート: ¥50/月
- 無料クレジット: ¥44,411 (91日間)
