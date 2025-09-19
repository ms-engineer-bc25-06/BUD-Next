'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ConfirmPageContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <Card
        className="
          w-full 
          max-w-md 
          rounded-xl 
          bg-white/80 
          shadow-lg 
          backdrop-blur-sm 
          p-4 sm:p-6
          text-center
        "
      >
        <CardContent className="p-0">
          <h1 className="mb-4 text-xl font-bold text-gray-800 sm:text-2xl">チェックしよう！</h1>
          <p className="mb-6 text-center text-gray-600 text-sm sm:text-base">
            すべてチェックできたら、がんばってみよう！
          </p>

          <div className="mb-8 space-y-4 text-left">
            {/* 1つめ */}
            <div className="flex items-start">
              <CheckCircle className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-500 sm:h-6 sm:w-6" />
              <div>
                <p className="text-base font-semibold text-gray-700 sm:text-lg">
                  話しかけても大丈夫？
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  相手の行動や時間を見て、話しかけても大丈夫か確認しよう。
                </p>
              </div>
            </div>

            {/* 2つめ */}
            <div className="flex items-start">
              <CheckCircle className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-500 sm:h-6 sm:w-6" />
              <div>
                <p className="text-base font-semibold text-gray-700 sm:text-lg">
                  「はなしたい！」って思ってる？
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  話す前におねがいボタンで話したい気持ちを伝えよう。
                </p>
              </div>
            </div>

            {/* 3つめ */}
            <div className="flex items-start">
              <CheckCircle className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-500 sm:h-6 sm:w-6" />
              <div>
                <p className="text-base font-semibold text-gray-700 sm:text-lg">
                  録音の準備はできてるかな？
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  チャレンジの記録を残すことができるよ。
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={childId ? `/challenge/${childId}` : '#'} passHref>
              <Button
                className="
                  w-full 
                  py-3 
                  text-base 
                  sm:py-4 
                  sm:text-lg 
                  font-semibold 
                  rounded-full 
                  shadow-md 
                  transition-transform 
                  transform 
                  hover:scale-105 
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-offset-2 
                  focus:ring-green-400 
                  bg-green-500 
                  text-white 
                  hover:bg-green-600
                "
                size="lg"
                disabled={!childId}
              >
                準備OK！はじめる
              </Button>
            </Link>

            <Link href="/children" passHref>
              <Button
                className="
                  w-full 
                  py-3 
                  text-base 
                  sm:py-4 
                  sm:text-lg 
                  font-semibold 
                  rounded-full 
                  shadow-md 
                  transition-transform 
                  transform 
                  hover:scale-105 
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-offset-2 
                  focus:ring-orange-400 
                  bg-orange-400 
                  text-white 
                  hover:bg-orange-500
                "
                size="lg"
                variant="outline"
              >
                あとにする
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ChallengeConfirmPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <ConfirmPageContent />
    </Suspense>
  );
}
