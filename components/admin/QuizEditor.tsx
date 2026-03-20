'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { createQuiz, updateQuiz, deleteQuiz } from '@/lib/actions/quizzes'
import { generateQuizFromContent } from '@/lib/actions/generate-quiz'
import { QuizQuestionForm } from './QuizQuestionForm'
import type { QuizWithOptions } from '@/lib/supabase/types'
import type { QuizInput } from '@/lib/validations/quiz'

interface QuizEditorProps {
  stageId: string
  quizzes: QuizWithOptions[]
}

export function QuizEditor({ stageId, quizzes: initialQuizzes }: QuizEditorProps) {
  const [quizzes, setQuizzes] = useState(initialQuizzes)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AI生成
  const [generating, setGenerating] = useState(false)
  const [genCount, setGenCount] = useState(5)
  const [genResult, setGenResult] = useState<string | null>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    setGenResult(null)
    setError(null)
    const result = await generateQuizFromContent(stageId, genCount)
    if (result?.error) {
      setError(result.error)
    } else {
      setGenResult(`✓ ${result.data?.inserted}問を生成しました`)
      setTimeout(() => window.location.reload(), 1000)
    }
    setGenerating(false)
  }

  const handleCreate = async (input: QuizInput) => {
    setLoading(true)
    setError(null)
    const result = await createQuiz(stageId, input)
    if (result?.error) {
      setError(result.error)
    } else {
      setShowForm(false)
    }
    setLoading(false)
    window.location.reload()
  }

  const handleUpdate = async (quizId: string, input: QuizInput) => {
    setLoading(true)
    setError(null)
    const result = await updateQuiz(quizId, stageId, input)
    if (result?.error) {
      setError(result.error)
    } else {
      setEditingId(null)
    }
    setLoading(false)
    window.location.reload()
  }

  const handleDelete = async (quizId: string, question: string) => {
    if (!confirm(`「${question}」を削除しますか？`)) return
    setLoading(true)
    const result = await deleteQuiz(quizId)
    if (result?.error) {
      setError(result.error)
    } else {
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId))
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* AI生成パネル */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">AIで問題を自動生成</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          コンテンツの内容を読み込んで4択問題を自動作成します。生成後は個別に編集・削除できます。
        </p>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-700 whitespace-nowrap">生成する問題数:</label>
          <input
            type="number"
            min={1}
            max={20}
            value={genCount}
            onChange={(e) => setGenCount(Math.max(1, Math.min(20, Number(e.target.value))))}
            className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center"
          />
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AIで問題を生成する
              </>
            )}
          </button>
        </div>
        {genResult && (
          <p className="mt-3 text-sm text-emerald-700 font-medium">{genResult}</p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 登録済みクイズ */}
      <div className="space-y-4">
        {quizzes.length === 0 && !showForm && (
          <p className="text-center py-6 text-gray-400 text-sm">
            クイズがまだありません。AIで生成するか手動で追加してください。
          </p>
        )}
        {quizzes.map((quiz, idx) => (
          <div key={quiz.id} className="bg-white border rounded-xl p-5">
            {editingId === quiz.id ? (
              <QuizQuestionForm
                defaultValues={{
                  question: quiz.question,
                  explanation: quiz.explanation ?? '',
                  options: quiz.quiz_options
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((o) => ({
                      text: o.text,
                      is_correct: o.is_correct,
                      order_index: o.order_index,
                    })),
                }}
                onSubmit={(input) => handleUpdate(quiz.id, input)}
                onCancel={() => setEditingId(null)}
                loading={loading}
              />
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <p className="font-medium text-gray-900">
                    <span className="text-blue-600 mr-2">Q{idx + 1}.</span>
                    {quiz.question}
                  </p>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => setEditingId(quiz.id)}
                      className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1 border rounded"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(quiz.id, quiz.question)}
                      className="text-sm text-red-600 hover:bg-red-50 px-2 py-1 border rounded"
                    >
                      削除
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {quiz.quiz_options
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((opt) => (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2 text-sm ${opt.is_correct ? 'text-green-700 font-medium' : 'text-gray-600'}`}
                      >
                        <span>{opt.is_correct ? '✓' : '○'}</span>
                        <span>{opt.text}</span>
                      </div>
                    ))}
                </div>
                {quiz.explanation && (
                  <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                    解説: {quiz.explanation}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* 手動追加フォーム */}
      {showForm ? (
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-4">新しいクイズを追加</h3>
          <QuizQuestionForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            loading={loading}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 rounded-xl text-sm transition-colors"
        >
          + 手動でクイズを追加する
        </button>
      )}
    </div>
  )
}
