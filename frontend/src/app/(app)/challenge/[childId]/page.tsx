// frontend/src/app/(app)/challenge/[childId]/page.tsx
'use client';

// FIXME: 巨大コンポーネント - 責任分離とテスト可能性向上が必要
// TODO: VoiceRecorder、PhraseDialog、ChallengeUIに分割

import { VoiceRecorder } from '@/components/challenge/VoiceRecorder';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useChildren } from '@/hooks/useChildren';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { type AIFeedbackResult } from '@/services/voiceApiService';
import {
  ArrowRight,
  Brain,
  Droplets,
  Flower,
  HelpCircle,
  Mic,
  Save,
  Sprout,
  Target,
  Trophy,
  Volume2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;

  // ★ 重要：すべてのHooksをコンポーネントの最上部で呼び出す
  // Reactの「Hooksの規則」に従い、条件分岐の前に全てのHooksを配置

  // カスタムHooks
  const { children, isLoading } = useChildren();

  // state管理用のHooks
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMamaPhraseDialog, setShowMamaPhraseDialog] = useState(false);
  const [showChildPhraseDialog, setShowChildPhraseDialog] = useState(false);

  // 新しい音声機能関連のstate
  const [recordingMode, setRecordingMode] = useState<'simple' | 'advanced'>('simple');
  const [aiFeedback, setAiFeedback] = useState<AIFeedbackResult | null>(null);
  const [showAIFeedback, setShowAIFeedback] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // 既存の音声録音フック（Web Speech API）
  const {
    isListening,
    transcription,
    isSupported,
    startListening,
    stopListening,
    resetTranscription,
  } = useVoiceRecording();

  // 子供の名前を取得（UUIDで検索）
  const child = children.find((c) => c.id === childId);
  const childName = child?.nickname || child?.name || 'お子さま';

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  // 子供が見つからない場合の表示
  if (!child) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
        <p className="text-gray-600 text-lg">お子さまが見つかりません</p>
        <Link href="/children" className="mt-4 text-blue-500 hover:text-blue-600">
          子供選択画面に戻る
        </Link>
      </div>
    );
  }

  // 音声認識サポートチェック
  if (!isSupported && recordingMode === 'simple') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
        <p className="text-gray-600 text-lg">お使いのブラウザは音声認識に対応していません。</p>
        <Button
          onClick={() => setRecordingMode('advanced')}
          className="mt-4 bg-green-500 hover:bg-green-600"
        >
          高品質録音モードを試す
        </Button>
        <Link href="/children" className="mt-4 text-blue-500 hover:text-blue-600">
          子供選択画面に戻る
        </Link>
      </div>
    );
  }

  // 新しい音声機能：高品質録音+AIフィードバック
  const handleAdvancedTranscription = async (text: string, feedback: AIFeedbackResult | null) => {
    console.log('高品質音声認識結果:', { text, feedback });

    setIsLoadingAI(false);

    if (feedback) {
      setAiFeedback(feedback);
      setShowAIFeedback(true);
    }

    // 既存のtranscription stateにも設定（既存UIとの互換性のため）
    // 注意: これは一時的な対応。理想的にはstate管理を統一すべき
    if (text) {
      // transcriptionを直接更新する方法がないため、保存処理を直接実行
      await saveAdvancedTranscription(text, feedback);
    }
  };

  const saveAdvancedTranscription = async (text: string, feedback: AIFeedbackResult | null) => {
    if (!text.trim()) {
      alert('音声が認識されませんでした。');
      return;
    }

    setIsProcessing(true);

    try {
      // 拡張された保存処理（AIフィードバック付き）
      const result = await api.voice.saveTranscription({
        childId,
        transcription: text,
        aiFeedback: feedback,
        source: 'google_speech',
      });

      if (result && typeof result === 'object' && 'transcript_id' in result) {
        router.push(`/record/${result.transcript_id}`);
      } else {
        console.error('Unexpected API response:', result);
        alert('保存は完了しましたが、結果の取得に失敗しました。');
        router.push('/children');
      }
    } catch (error) {
      console.error('文字起こしの保存に失敗:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopListening = () => {
    stopListening();
  };

  const saveTranscription = async () => {
    if (!transcription.trim()) {
      alert('文字起こしされた内容がありません。');
      return;
    }

    setIsProcessing(true);

    try {
      // 既存の保存処理
      const result = await api.voice.saveTranscription({
        childId,
        transcription,
      });

      if (result && typeof result === 'object' && 'transcript_id' in result) {
        router.push(`/record/${result.transcript_id}`);
      } else {
        console.error('Unexpected API response:', result);
        alert('保存は完了しましたが、結果の取得に失敗しました。');
        router.push('/children');
      }
    } catch (error) {
      console.error('文字起こしの保存に失敗:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsProcessing(false);
    }
  };

  // AIフィードバック表示コンポーネント
  const AIFeedbackDialog = () => (
    <Dialog open={showAIFeedback} onOpenChange={setShowAIFeedback}>
      <DialogContent className="sm:max-w-[500px] rounded-xl p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            AIからのフィードバック
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            あなたの英語スピーキングを分析しました！
          </DialogDescription>
        </DialogHeader>

        {aiFeedback && (
          <div className="mt-4 space-y-4">
            {/* 励ましメッセージ */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                すばらしい！
              </h4>
              <p className="text-green-700">{aiFeedback.feedback.encouragement}</p>
            </div>

            {/* スピーキングレベルと自信度 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-1">レベル</h4>
                <p className="text-blue-700 text-lg font-bold">
                  {aiFeedback.analysis.speaking_level}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-1">自信度</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${aiFeedback.analysis.confidence_score * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-purple-700">
                    {Math.round(aiFeedback.analysis.confidence_score * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* 良かった点 */}
            {aiFeedback.analysis.strengths.length > 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  良かった点
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                  {aiFeedback.analysis.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 改善点 */}
            {aiFeedback.analysis.improvements.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  次回のポイント
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                  {aiFeedback.analysis.improvements.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 発音のコツ */}
            {aiFeedback.feedback.pronunciation_tips && (
              <div className="p-3 bg-indigo-50 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-1">発音のコツ</h4>
                <p className="text-indigo-700 text-sm">{aiFeedback.feedback.pronunciation_tips}</p>
              </div>
            )}

            {/* 次のチャレンジ */}
            {aiFeedback.next_challenge && (
              <div className="p-3 bg-pink-50 rounded-lg">
                <h4 className="font-semibold text-pink-800 mb-1">次のチャレンジ</h4>
                <p className="text-pink-700 text-sm">{aiFeedback.next_challenge.suggestion}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <Button
            onClick={() => setShowAIFeedback(false)}
            className="flex-1 rounded-full bg-gray-400 hover:bg-gray-500 text-white"
          >
            とじる
          </Button>
          <Button
            onClick={() => {
              setShowAIFeedback(false);
              // もう一度チャレンジ
              resetTranscription();
              setAiFeedback(null);
            }}
            className="flex-1 rounded-full bg-blue-400 hover:bg-blue-500 text-white"
          >
            もう一度
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // メイン画面のレンダリング
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      {/* ヘッダー部分 */}
      <header className="w-full max-w-xl flex justify-between items-center mb-2">
        <Link
          href="/children"
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <XCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-1" />
          <span className="text-sm sm:text-base font-medium">やめる</span>
        </Link>

        {/* 録音モード切り替え */}
        <div className="flex gap-1">
          <Button
            variant={recordingMode === 'simple' ? 'default' : 'outline'}
            onClick={() => setRecordingMode('simple')}
            size="sm"
            className="text-xs"
          >
            かんたん
          </Button>
          <Button
            variant={recordingMode === 'advanced' ? 'default' : 'outline'}
            onClick={() => setRecordingMode('advanced')}
            size="sm"
            className="text-xs"
          >
            高品質
          </Button>
        </div>
      </header>

      {/* マーキー表示エリア（文字起こし結果がある時のみ表示） */}
      {transcription && (
        <div className="w-full max-w-xl mb-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-md border border-blue-200">
            <div className="text-xs text-gray-500 mb-1 text-center">📝 文字起こし結果</div>
            <div
              className="overflow-hidden whitespace-nowrap bg-gradient-to-r from-blue-50 to-purple-50 rounded-md p-2 border"
              style={{ height: '40px', display: 'flex', alignItems: 'center' }}
            >
              <div
                className="text-gray-800 font-medium animate-marquee"
                style={{
                  animation: 'marquee 20s linear infinite',
                  minWidth: '100%',
                }}
              >
                {transcription.replace(/\n+/g, ' 🔸 ')}
              </div>
            </div>
            {isListening && (
              <div className="text-xs text-blue-600 text-center mt-1 flex items-center justify-center">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                録音中...
              </div>
            )}
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="flex flex-1 flex-col items-center justify-center w-full max-w-xl pt-2 pb-4">
        <div className="mb-8 flex flex-col items-center">
          {/* チャレンジ中テキスト */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
            {isListening || isLoadingAI
              ? isLoadingAI
                ? 'AI分析中...'
                : 'チャレンジ中・・・'
              : transcription
                ? 'お疲れさま！保存するをおしてね'
                : `${childName} がんばってね！`}
          </h2>

          {/* モード表示 */}
          <div className="mb-4 text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-full">
            {recordingMode === 'simple' ? '🎤 かんたんモード' : '🎯 高品質モード + AI分析'}
          </div>

          {/* アニメーションアイコン */}
          <div className="flex items-center space-x-6">
            <div className="animate-bounce">
              <Droplets className="h-10 w-10 text-blue-400" />
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400 animate-pulse" />
            <div className="animate-pulse">
              <Sprout className="h-12 w-12 text-green-500" />
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400 animate-pulse delay-200" />
            <div className="animate-bounce delay-300">
              <Flower className="h-10 w-10 text-pink-500" />
            </div>
          </div>
        </div>

        {/* 録音コンポーネント選択 */}
        {recordingMode === 'advanced' ? (
          // 新しい高品質録音コンポーネント
          <div className="w-full max-w-md">
            <VoiceRecorder
              onTranscriptionComplete={handleAdvancedTranscription}
              isLoading={isLoadingAI}
            />
          </div>
        ) : (
          // 既存の簡単録音ボタン
          <div className="flex flex-col items-center">
            {!transcription && (
              <Button
                onClick={isListening ? handleStopListening : startListening}
                className={cn(
                  'w-40 h-40 sm:w-48 sm:h-48 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300',
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-blue-400 hover:bg-blue-500'
                )}
                size="icon"
              >
                {isListening ? (
                  <>
                    <Mic className="h-16 w-16 sm:h-20 sm:w-20 text-white" />
                    <span className="mt-2 text-white text-base sm:text-lg font-semibold">
                      ストップ
                    </span>
                  </>
                ) : (
                  <>
                    <Mic className="h-16 w-16 sm:h-20 sm:w-20 text-white" />
                    <span className="mt-2 text-white text-base sm:text-lg font-semibold">
                      スタート
                    </span>
                  </>
                )}
              </Button>
            )}

            {/* 録音中でも表示する簡易ストップボタン（文字起こし結果がある時） */}
            {transcription && isListening && (
              <Button
                onClick={handleStopListening}
                className="w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-xl bg-red-500 hover:bg-red-600 animate-pulse"
                size="icon"
              >
                <Mic className="h-12 w-12 text-white" />
                <span className="mt-1 text-white text-sm font-semibold">ストップ</span>
              </Button>
            )}

            {/* 保存ボタン（録音完了後に表示） */}
            {transcription && !isListening && (
              <Button
                onClick={saveTranscription}
                disabled={isProcessing}
                className={cn(
                  'py-3 mt-8 text-lg font-semibold rounded-full shadow-md w-40',
                  isProcessing
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105'
                )}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    まっててね...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    保存する
                  </>
                )}
              </Button>
            )}

            {/* 詳細な文字起こし結果表示（折りたたみ可能） */}
            {transcription && !isListening && (
              <details className="w-full max-w-md mt-6">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 p-2 bg-white/50 rounded-md border border-gray-200">
                  📄 詳細を見る（クリックで展開）
                </summary>
                <div className="mt-2 p-4 bg-white rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">文字起こし詳細</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {transcription.split('\n').map((line, index) => (
                      <p
                        key={index}
                        className="text-gray-700 bg-gray-50 p-2 rounded border text-sm"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </details>
            )}
          </div>
        )}

        {/* フレーズヘルプボタン */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs mt-12">
          <Button
            onClick={() => setShowMamaPhraseDialog(true)}
            className="flex-1 py-4 text-lg font-bold rounded-full shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 bg-purple-300 text-white hover:bg-purple-400"
          >
            <Volume2 className="mr-3 h-6 w-6" />
            おねがい
          </Button>
          <Button
            onClick={() => setShowChildPhraseDialog(true)}
            className="flex-1 py-4 text-lg font-bold rounded-full shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 bg-yellow-300 text-white hover:bg-yellow-400"
          >
            <HelpCircle className="mr-3 h-6 w-6" />
            たすけて
          </Button>
        </div>
      </main>

      {/* AIフィードバックダイアログ */}
      <AIFeedbackDialog />

      {/* お願いフレーズダイアログ */}
      <Dialog open={showMamaPhraseDialog} onOpenChange={setShowMamaPhraseDialog}>
        <DialogContent className="sm:max-w-[425px] rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">おねがいフレーズ</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm">
              外国の方に話しかける前に使えます。
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3 text-lg text-gray-700">
            <p className="font-semibold">Hello! Excuse me, my child is learning English.</p>
            <p className="text-sm text-gray-500">（すみません。子供が英語を勉強しています。）</p>
            <p className="font-semibold">Would you mind speaking a little with my child?</p>
            <p className="text-sm text-gray-500">（少しお話しできますか？）</p>
          </div>
          <Button
            onClick={() => setShowMamaPhraseDialog(false)}
            className="mt-6 w-full rounded-full bg-blue-400 hover:bg-blue-500 text-white"
          >
            もどる
          </Button>
        </DialogContent>
      </Dialog>

      {/* 助けてフレーズダイアログ */}
      <Dialog open={showChildPhraseDialog} onOpenChange={setShowChildPhraseDialog}>
        <DialogContent className="sm:max-w-[425px] rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">おたすけフレーズ</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm">
              こまったときに、これをつかってみよう！
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3 text-lg text-gray-700">
            <p className="font-semibold">Again, please.</p>
            <p className="text-sm text-gray-500">（もう一回いって）</p>
            <p className="font-semibold">Slowly, please.</p>
            <p className="text-sm text-gray-500">（ゆっくりいって）</p>
            <p className="font-semibold">Sorry, I do not understand.</p>
            <p className="text-sm text-gray-500">（ごめんね、わからなかった）</p>
            <p className="font-semibold">Thank you! Bye-bye.</p>
            <p className="text-sm text-gray-500">（ありがとう！バイバイ。）</p>
          </div>
          <Button
            onClick={() => setShowChildPhraseDialog(false)}
            className="mt-6 w-full rounded-full bg-blue-400 hover:bg-blue-500 text-white"
          >
            とじる
          </Button>
        </DialogContent>
      </Dialog>

      {/* マーキーアニメーション用のCSS */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-marquee {
          animation: marquee 20s linear infinite;
        }

        /* 長いテキストの場合はスピードを調整 */
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
