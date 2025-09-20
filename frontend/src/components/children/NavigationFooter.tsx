'use client';

import { Button } from '@/components/ui/button';
import { BookOpen, Gem, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function NavigationFooter() {
  const router = useRouter();

  return (
    <footer className="sticky bottom-0 z-10 mt-4 sm:mt-8 w-full max-w-4xl rounded-t-xl bg-white/90 p-2 sm:p-4 shadow-lg backdrop-blur-sm">
      {/* スマホでは縦並び、PCでは横並び */}
      <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center sm:gap-4 w-full">
        {/* なまえをつくる */}
        <Button
          onClick={() => router.push('/children/register')}
          className="flex-1 min-w-[140px] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 text-base rounded-lg flex justify-center items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          なまえをつくる
        </Button>

        {/* ふりかえり */}
        <Button
          variant="outline"
          onClick={() => router.push('/history')}
          className="flex-1 min-w-[140px] bg-white border-2 border-blue-300 hover:bg-blue-50 text-blue-700 font-semibold py-3 text-base rounded-lg flex justify-center items-center"
        >
          <BookOpen className="h-6 w-6 mr-2" /> {/* ← アイコンを大きく */}
          ふりかえり
        </Button>

        {/* ステップアップ */}
        <Button
          variant="outline"
          onClick={() => router.push('/upgrade')}
          className="flex-1 min-w-[140px] bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 hover:bg-gradient-to-r hover:from-amber-100 hover:to-yellow-100 text-amber-700 font-semibold py-3 text-base rounded-lg flex justify-center items-center"
        >
          <Gem className="h-5 w-5 mr-2 text-amber-500" />
          ステップアップ
        </Button>
      </div>
    </footer>
  );
}
