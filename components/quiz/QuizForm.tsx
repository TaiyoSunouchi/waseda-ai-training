'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { CheckCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { submitQuizAttempt, checkSingleAnswer } from '@/lib/actions/quiz-attempt'
import { QuizQuestion } from './QuizQuestion'
import { QuizResult } from './QuizResult'
import type { QuizAttemptResult } from '@/lib/actions/quiz-attempt'

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

interface QuizFormProps {
  stageId: string
  courseId: string
  quizzes: Quiz[]
}

interface AnsweredResult {
  selectedOptionId: string
  isCorrect: boolean
  correctOptionId: string
  explanation: string | null
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function QuizForm({ stageId, courseId, quizzes }: QuizFormProps) {
  // どの問題セットを解くか（通常 or 復習）
  const [activeQuizzes, setActiveQuizzes] = useState(quizzes)
  const [isRetryMode, setIsRetryMode] = useState(false)

  // 画面制御
  const [screen, setScreen] = useState<'quiz' | 'retry-complete'>('quiz')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<'answering' | 'revealed'>('answering')

  // 回答状態
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null)
  const [answeredResults, setAnsweredResults] = useState<Record<string, AnsweredResult>>({})

  // ローディング・エラー
  const [checking, setChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 最終結果
  const [result, setResult] = useState<QuizAttemptResult | null>(null)
  // 復習モード中も「次のステージへ」を表示するために保存
  const [retryNextStageId, setRetryNextStageId] = useState<string | null>(null)

  // activeQuizzesが変わったときだけシャッフル
  const shuffledQuizzes = useMemo(
    () => activeQuizzes.map((q) => ({ ...q, quiz_options: shuffle(q.quiz_options) })),
    [activeQuizzes]
  )

  const currentQuiz = shuffledQuizzes[currentIndex]
  const isLastQuestion = currentIndex === shuffledQuizzes.length - 1
  const currentAnsweredResult = answeredResults[currentQuiz?.id]

  // 「回答する」ボタン押下：サーバーで正誤チェック
  const handleConfirmAnswer = async () => {
    if (!pendingOptionId || !currentQuiz) return
    setChecking(true)
    setError(null)

    const res = await checkSingleAnswer(currentQuiz.id, pendingOptionId)
    if (res.error) {
      setError(res.error)
      setChecking(false)
      return
    }

    setAnsweredResults((prev) => ({
      ...prev,
      [currentQuiz.id]: {
        selectedOptionId: pendingOptionId,
        isCorrect: res.data!.isCorrect,
        correctOptionId: res.data!.correctOptionId,
        explanation: res.data!.explanation,
      },
    }))
    setPhase('revealed')
    setChecking(false)
  }

  // 「次の問題へ」「結果を見る」「復習完了」ボタン押下
  const handleNext = async () => {
    if (!isLastQuestion) {
      setCurrentIndex((i) => i + 1)
      setPhase('answering')
      setPendingOptionId(null)
      return
    }

    // 復習モード終了
    if (isRetryMode) {
      setScreen('retry-complete')
      return
    }

    // 通常モード：全回答をサーバーに提出して採点
    setSubmitting(true)
    setError(null)

    const answerList = shuffledQuizzes.map((q) => ({
      quiz_id: q.id,
      selected_option_id: answeredResults[q.id]?.selectedOptionId ?? '',
    }))

    const res = await submitQuizAttempt({ stage_id: stageId, answers: answerList })
    if (res.error) {
      setError(res.error)
      setSubmitting(false)
      return
    }

    setResult(res.data!)
    setSubmitting(false)
  }

  // QuizResultから「間違えた問題を解き直す」コールバック
  const handleRetryWrongAnswers = (wrongQuizIds: string[]) => {
    // resultがある場合（初回呼び出し）は nextStageId を保存、ない場合（nested retry）は既存値を維持
    if (result?.nextStageId !== undefined) {
      setRetryNextStageId(result.nextStageId)
    }
    const wrongQuizzes = quizzes.filter((q) => wrongQuizIds.includes(q.id))
    setActiveQuizzes(wrongQuizzes)
    setIsRetryMode(true)
    setScreen('quiz')
    setCurrentIndex(0)
    setPhase('answering')
    setPendingOptionId(null)
    setAnsweredResults({})
    setResult(null)
    setError(null)
  }

  // 最初からリセット
  const handleResetAll = () => {
    setActiveQuizzes(quizzes)
    setIsRetryMode(false)
    setScreen('quiz')
    setCurrentIndex(0)
    setPhase('answering')
    setPendingOptionId(null)
    setAnsweredResults({})
    setResult(null)
    setError(null)
  }

  // --- 採点結果画面 ---
  if (result) {
    return (
      <QuizResult
        result={result}
        courseId={courseId}
        stageId={stageId}
        quizzes={shuffledQuizzes}
        onRetryWrongAnswers={handleRetryWrongAnswers}
      />
    )
  }

  // --- 復習完了画面 ---
  if (screen === 'retry-complete') {
    const correctCount = Object.values(answeredResults).filter((r) => r.isCorrect).length
    const wrongQuizIds = Object.entries(answeredResults)
      .filter(([, r]) => !r.isCorrect)
      .map(([id]) => id)

    return (
      <div className="card-premium p-10 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle className="w-9 h-9 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-[#0B2447]">復習完了！</h2>
        <p className="text-gray-600">
          {correctCount} / {shuffledQuizzes.length} 問正解
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          {wrongQuizIds.length > 0 && (
            <Button variant="outline" onClick={() => handleRetryWrongAnswers(wrongQuizIds)}>
              もう一度間違えた問題を解く
            </Button>
          )}
          <Button variant="outline" onClick={handleResetAll}>
            最初からやり直す
          </Button>
          {retryNextStageId && (
            <Link href={`/courses/${courseId}/stages/${retryNextStageId}/slides`}>
              <Button>
                次のステージへ
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
          {!retryNextStageId && (
            <Link href={`/courses/${courseId}`}>
              <Button variant="outline">
                コース一覧へ戻る
              </Button>
            </Link>
          )}
        </div>
      </div>
    )
  }

  // --- クイズ画面（1問ずつ） ---
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {isRetryMode ? '間違えた問題の復習' : 'クイズ'}
        </h2>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {shuffledQuizzes.length} 問
        </span>
      </div>

      {/* プログレスバー */}
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className="bg-[#0B2447] h-1.5 rounded-full transition-all duration-300"
          style={{
            width: `${((currentIndex + (phase === 'revealed' ? 1 : 0)) / shuffledQuizzes.length) * 100}%`,
          }}
        />
      </div>

      {/* 問題 */}
      <QuizQuestion
        quiz={currentQuiz}
        index={currentIndex + 1}
        selectedOptionId={
          phase === 'revealed'
            ? (currentAnsweredResult?.selectedOptionId ?? null)
            : pendingOptionId
        }
        onSelect={(optionId) => {
          if (phase === 'answering') setPendingOptionId(optionId)
        }}
        disabled={phase === 'revealed'}
        showResult={phase === 'revealed'}
        correctOptionId={currentAnsweredResult?.correctOptionId}
        explanation={currentAnsweredResult?.explanation}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ボタン */}
      <div className="flex justify-end">
        {phase === 'answering' ? (
          <Button
            onClick={handleConfirmAnswer}
            disabled={!pendingOptionId || checking}
            size="lg"
          >
            {checking ? '確認中...' : '回答する'}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={submitting} size="lg">
            {submitting
              ? '採点中...'
              : isLastQuestion
                ? isRetryMode
                  ? '復習完了'
                  : '結果を見る'
                : '次の問題へ'}
          </Button>
        )}
      </div>
    </div>
  )
}
