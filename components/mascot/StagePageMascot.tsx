'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

const MESSAGES = [
  'どのステージから始める？\n一緒に頑張ろう🎓',
  'わからなくても大丈夫！\n何度でも挑戦してね💪',
  'コンテンツを読んでから\nクイズに挑もう📖',
  '一歩一歩着実に\n進んでいこう🌈',
]

export function StagePageMascot() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 6000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex items-end gap-3 flex-row-reverse">
      {/* ベアアイコン */}
      <div className="flex-shrink-0 w-16 h-16 drop-shadow-md">
        <Image
          src="/mascot/happy.jpg"
          alt="マスコットベア"
          width={64}
          height={64}
          className="object-contain w-full h-full"
        />
      </div>

      {/* 吹き出し（右から左向き） */}
      <div className="relative w-44">
        <div className="bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-2xl rounded-br-sm px-4 py-2.5 shadow-md">
          <p className="text-xs text-gray-700 leading-relaxed font-medium whitespace-pre-line text-right h-8">
            {MESSAGES[msgIndex]}
          </p>
          {/* ドットナビ */}
          <div className="flex gap-1 mt-1.5 justify-end">
            {MESSAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setMsgIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === msgIndex ? 'bg-purple-400' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>
        {/* 吹き出し右向き三角 */}
        <div className="absolute bottom-3 -right-[9px] w-0 h-0 border-y-[7px] border-y-transparent border-l-[9px] border-l-purple-100" />
        <div className="absolute bottom-3 -right-[7px] w-0 h-0 border-y-[7px] border-y-transparent border-l-[9px] border-l-white" />
      </div>
    </div>
  )
}
