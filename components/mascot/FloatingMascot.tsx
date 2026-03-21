'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { X, ChevronDown } from 'lucide-react'

const MESSAGES = [
  { text: 'コンテンツをしっかり読んでから\nクイズに挑戦しよう📖', mood: 'smile' },
  { text: 'わからないところは\n何度でも見返してOK！', mood: 'happy' },
  { text: 'ここまで来たあなたは\nもう十分すごい！✨', mood: 'joy' },
  { text: '焦らなくて大丈夫。\n一歩一歩進んでいこう🌈', mood: 'smile' },
  { text: '疑問を持つことが\n一番の学びだよ🔍', mood: 'happy' },
  { text: '今日も一緒に頑張ろう！💪', mood: 'happy' },
] as const

type Mood = 'happy' | 'joy' | 'smile'

export function FloatingMascot() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pathname = usePathname()
  // ダッシュボード（コース一覧）とステージ選択ページでは非表示
  const isHidden = pathname === '/dashboard' || /^\/courses\/[^/]+$/.test(pathname)

  // hydration対応
  useEffect(() => { setMounted(true) }, [])

  // 初回は2秒後に自動オープン
  useEffect(() => {
    if (!mounted) return
    const t = setTimeout(() => setOpen(true), 2000)
    return () => clearTimeout(t)
  }, [mounted])

  // open中はメッセージを8秒ごとに切り替え
  useEffect(() => {
    if (!open) return
    timerRef.current = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 8000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [open])

  if (!mounted || dismissed || isHidden) return null

  const msg = MESSAGES[msgIndex]
  const mood: Mood = msg.mood as Mood
  const imgSrc = mood === 'joy' ? '/mascot/joy.jpg' : mood === 'smile' ? '/mascot/smile.jpg' : '/mascot/happy.jpg'

  return (
    // 左下に配置（右下の「クイズに進む」「次へ」ボタンと重ならないよう）
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-2">

      {/* 吹き出し（open時のみ） */}
      {open && (
        <div className="relative ml-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* バブル本体 */}
          <div className="relative bg-white border border-purple-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg max-w-[200px]">
            {/* 閉じるボタン */}
            <button
              onClick={() => setDismissed(true)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-gray-300 hover:bg-gray-400 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="閉じる"
            >
              <X className="w-3 h-3" />
            </button>

            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line font-medium">
              {msg.text}
            </p>

            {/* ページネーション */}
            <div className="flex gap-1 mt-2 justify-center">
              {MESSAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setMsgIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === msgIndex ? 'bg-purple-400' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>

          {/* 吹き出し下向き三角（ベアの方向） */}
          <div className="absolute -bottom-[8px] left-5">
            <div className="w-0 h-0 border-x-[7px] border-x-transparent border-t-[8px] border-t-purple-100" />
          </div>
          <div className="absolute -bottom-[6px] left-5">
            <div className="w-0 h-0 border-x-[7px] border-x-transparent border-t-[8px] border-t-white" />
          </div>
        </div>
      )}

      {/* ベアアバター */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-xl hover:scale-105 active:scale-95 transition-transform duration-200 bg-white"
        aria-label="マスコット"
      >
        <Image
          src={imgSrc}
          alt="マスコットベア"
          width={64}
          height={64}
          className="object-cover w-full h-full"
        />
        {/* 折りたたみアイコン */}
        <div className={`absolute bottom-0 right-0 w-5 h-5 bg-purple-400 rounded-full flex items-center justify-center transition-transform duration-200 ${open ? '' : 'rotate-180'}`}>
          <ChevronDown className="w-3 h-3 text-white" />
        </div>
      </button>
    </div>
  )
}
