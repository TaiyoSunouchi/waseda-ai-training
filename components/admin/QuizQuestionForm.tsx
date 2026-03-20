'use client'

import { useState } from 'react'
import type { QuizInput, QuizOptionInput } from '@/lib/validations/quiz'

interface QuizQuestionFormProps {
  defaultValues?: Partial<QuizInput>
  onSubmit: (input: QuizInput) => void
  onCancel: () => void
  loading: boolean
}

const defaultOptions: QuizOptionInput[] = [
  { text: '', is_correct: true, order_index: 1 },
  { text: '', is_correct: false, order_index: 2 },
  { text: '', is_correct: false, order_index: 3 },
  { text: '', is_correct: false, order_index: 4 },
]

export function QuizQuestionForm({ defaultValues, onSubmit, onCancel, loading }: QuizQuestionFormProps) {
  const [question, setQuestion] = useState(defaultValues?.question ?? '')
  const [explanation, setExplanation] = useState(defaultValues?.explanation ?? '')
  const [options, setOptions] = useState<QuizOptionInput[]>(
    defaultValues?.options ?? defaultOptions
  )
  const [error, setError] = useState<string | null>(null)

  const setCorrect = (idx: number) => {
    setOptions((prev) =>
      prev.map((o, i) => ({ ...o, is_correct: i === idx }))
    )
  }

  const updateOptionText = (idx: number, text: string) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, text } : o)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!question.trim()) {
      setError('問題文を入力してください')
      return
    }
    if (options.some((o) => !o.text.trim())) {
      setError('全ての選択肢を入力してください')
      return
    }
    if (!options.some((o) => o.is_correct)) {
      setError('正解を1つ選択してください')
      return
    }

    onSubmit({ question: question.trim(), explanation: explanation.trim() || undefined, options })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          問題文 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="問題文を入力してください"
        />
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          選択肢（正解を1つ選んでください）
        </p>
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={opt.is_correct}
                onChange={() => setCorrect(idx)}
                className="w-4 h-4 text-blue-600"
              />
              <input
                type="text"
                value={opt.text}
                onChange={(e) => updateOptionText(idx, e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`選択肢 ${idx + 1}`}
              />
              {opt.is_correct && (
                <span className="text-xs text-green-600 font-medium">正解</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">解説（任意）</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="正解の解説を入力してください"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? '保存中...' : '保存する'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
