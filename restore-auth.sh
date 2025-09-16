#!/bin/bash
echo "🔄 Google認証ファイル復元中..."
cp ~/bud-google-credentials-backup.json backend/google-speech-credentials.json
chmod 600 backend/google-speech-credentials.json
docker-compose restart backend
echo "✅ Google Speech API認証復元完了"