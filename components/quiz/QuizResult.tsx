'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { QuizQuestion } from './QuizQuestion'
import { RotateCcw, ChevronRight, BookOpen } from 'lucide-react'
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

interface QuizResultProps {
  result: QuizAttemptResult
  courseId: string
  stageId: string
  quizzes: Quiz[]
  onRetryWrongAnswers?: (wrongQuizIds: string[]) => void
}

export function QuizResult({ result, courseId, stageId, quizzes, onRetryWrongAnswers }: QuizResultProps) {
  const { score, correctAnswers, totalQuestions, passed, perQuestionResults, nextStageId } = result

  const wrongQuizIds = perQuestionResults.filter((r) => !r.isCorrect).map((r) => r.quizId)

  return (
    <div className="space-y-6">
      {/* スコアカード */}
      <div
        className={`rounded-2xl p-8 text-center border ${
          passed
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
        }`}
      >
        <div className="flex justify-center mb-3">
          <Image
            src={passed ? '/mascot/joy.jpg' : '/mascot/surprised.jpg'}
            alt="マスコットベア"
            width={96}
            height={96}
            className={`object-contain drop-shadow-lg ${passed ? 'animate-bounce' : ''}`}
            style={{ animationDuration: passed ? '1.2s' : undefined, animationIterationCount: passed ? '3' : undefined }}
          />
        </div>
        <h2 className={`text-2xl font-bold mb-1 ${passed ? 'text-green-800' : 'text-red-700'}`}>
          {passed ? '合格おめでとう！🎉' : 'もう一息！一緒に頑張ろう💪'}
        </h2>
        <p className={`text-xs mb-2 ${passed ? 'text-green-600' : 'text-red-500'}`}>
          {passed ? 'よく頑張ったね！次のステージへ進もう' : 'コンテンツを見直してもう一度挑戦しよう'}
        </p>
        <p className={`text-5xl font-bold my-3 ${passed ? 'text-green-900' : 'text-red-900'}`}>
          {score}<span className="text-2xl ml-1">点</span>
        </p>
        <p className="text-gray-600 text-sm">
          {correctAnswers} / {totalQuestions} 問正解
        </p>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3 justify-center flex-wrap">
        {/* 間違えた問題を解き直す */}
        {wrongQuizIds.length > 0 && onRetryWrongAnswers && (
          <Button
            variant="outline"
            onClick={() => onRetryWrongAnswers(wrongQuizIds)}
          >
            <RotateCcw className="w-4 h-4" />
            間違えた問題を解き直す（{wrongQuizIds.length}問）
          </Button>
        )}
        {/* 不合格時：最初から挑戦 */}
        {!passed && (
          <Link href={`/courses/${courseId}/stages/${stageId}/quiz`}>
            <Button variant="outline">
              <RotateCcw className="w-4 h-4" />
              もう一度挑戦する
            </Button>
          </Link>
        )}
        {/* 合格時：次ステージ or コース完了 */}
        {passed && nextStageId && (
          <Link href={`/courses/${courseId}/stages/${nextStageId}/slides`}>
            <Button>
              次のステージへ
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
        {passed && !nextStageId && (
          <Link href={`/courses/${courseId}`}>
            <Button>
              コース完了！一覧へ戻る
            </Button>
          </Link>
        )}
        <Link href={`/courses/${courseId}/stages/${stageId}/slides`}>
          <Button variant="outline">
            <BookOpen className="w-4 h-4" />
            コンテンツを見直す
          </Button>
        </Link>
      </div>

      {/* 問題別結果 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#0B2447]">問題別結果</h3>
        {quizzes.map((quiz, idx) => {
          const qResult = perQuestionResults.find((r) => r.quizId === quiz.id)
          return (
            <QuizQuestion
              key={quiz.id}
              quiz={quiz}
              index={idx + 1}
              selectedOptionId={qResult?.selectedOptionId ?? null}
              onSelect={() => {}}
              disabled={true}
              showResult={true}
              correctOptionId={qResult?.correctOptionId}
              explanation={qResult?.explanation}
            />
          )
        })}
      </div>
    </div>
  )
}
