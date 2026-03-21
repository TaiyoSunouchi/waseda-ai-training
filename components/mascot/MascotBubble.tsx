import Image from 'next/image'

export type MascotMood = 'happy' | 'joy' | 'smile' | 'surprised' | 'angry' | 'mascot'

const MASCOT_IMAGES: Record<MascotMood, string> = {
  happy:     '/mascot/happy.jpg',
  joy:       '/mascot/joy.jpg',
  smile:     '/mascot/smile.jpg',
  surprised: '/mascot/surprised.jpg',
  angry:     '/mascot/angry.jpg',
  mascot:    '/mascot/mascot.jpg',
}

interface MascotBubbleProps {
  mood?: MascotMood
  message: string
  size?: number
  align?: 'left' | 'right'
}

export function MascotBubble({ mood = 'happy', message, size = 88, align = 'left' }: MascotBubbleProps) {
  return (
    <div className={`flex items-end gap-4 ${align === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* ベア */}
      <div className="flex-shrink-0 drop-shadow-md" style={{ width: size, height: size }}>
        <Image
          src={MASCOT_IMAGES[mood]}
          alt="マスコットベア"
          width={size}
          height={size}
          className="object-contain w-full h-full"
        />
      </div>

      {/* 吹き出し */}
      <div className="relative">
        <div className="relative bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-2xl px-5 py-3.5 shadow-md max-w-xs">
          <p className="text-sm text-gray-700 leading-relaxed font-medium">{message}</p>
        </div>
        {/* 吹き出しの尻尾 */}
        {align === 'left' ? (
          <>
            <div className="absolute bottom-4 -left-[9px] w-0 h-0 border-y-[7px] border-y-transparent border-r-[9px] border-r-purple-100" />
            <div className="absolute bottom-4 -left-[7px] w-0 h-0 border-y-[7px] border-y-transparent border-r-[9px] border-r-white" />
          </>
        ) : (
          <>
            <div className="absolute bottom-4 -right-[9px] w-0 h-0 border-y-[7px] border-y-transparent border-l-[9px] border-l-purple-100" />
            <div className="absolute bottom-4 -right-[7px] w-0 h-0 border-y-[7px] border-y-transparent border-l-[9px] border-l-white" />
          </>
        )}
      </div>
    </div>
  )
}
