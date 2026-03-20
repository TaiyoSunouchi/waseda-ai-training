import { cn } from '@/lib/utils/cn'
import { CheckCircle, XCircle } from 'lucide-react'

interface QuizOption {
  id: string
  text: string
  order_index: number
}

interface Quiz {
  id: string
  question: string
  order_index: number
  quiz_options: QuizOption[]
}

interface QuizQuestionProps {
  quiz: Quiz
  index: number
  selectedOptionId: string | null
  onSelect: (optionId: string) => void
  disabled: boolean
  showResult: boolean
  correctOptionId?: string
  explanation?: string | null
}

export function QuizQuestion({
  quiz,
  index,
  selectedOptionId,
  onSelect,
  disabled,
  showResult,
  correctOptionId,
  explanation,
}: QuizQuestionProps) {
  return (
    <div className="card-premium p-6">
      <p className="font-semibold text-[#0B2447] mb-4 leading-relaxed">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#0B2447]/10 text-[#0B2447] text-xs font-bold mr-2.5 flex-shrink-0 align-middle">
          Q{index}
        </span>
        {quiz.question}
      </p>

      <div className="space-y-2">
        {quiz.quiz_options.map((option) => {
          const isSelected = selectedOptionId === option.id
          const isCorrect = showResult && option.id === correctOptionId
          const isWrong = showResult && isSelected && option.id !== correctOptionId

          return (
            <button
              key={option.id}
              onClick={() => !disabled && onSelect(option.id)}
              disabled={disabled}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150',
                isSelected && !showResult && 'border-[#0B2447] bg-[#0B2447]/5 text-[#0B2447] font-medium',
                !isSelected && !showResult && !disabled && 'border-[#E8EEF7] bg-white hover:border-[#0B2447]/30 hover:bg-[#F2F5FA] text-gray-700',
                isCorrect && 'border-green-500 bg-green-50 text-green-800 font-medium',
                isWrong && 'border-red-400 bg-red-50 text-red-700',
                !isSelected && !isCorrect && showResult && 'border-[#E8EEF7] bg-white text-gray-500',
                disabled && !showResult && 'cursor-not-allowed opacity-60'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{option.text}</span>
                {showResult && isCorrect && (
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                )}
                {showResult && isWrong && (
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {showResult && explanation && (
        <div className="mt-4 p-4 bg-[#F0F4FA] rounded-xl border border-[#DDE3EE]">
          <p className="text-xs font-semibold text-[#0B2447] mb-1 uppercase tracking-wide">解説</p>
          <p className="text-sm text-gray-700">{explanation}</p>
        </div>
      )}
    </div>
  )
}
