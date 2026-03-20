import type { StageWithProgress } from '@/lib/supabase/types'

/**
 * コース全体の進捗率を計算する
 * @param stages ステージ一覧（進捗付き）
 * @returns 0-100の進捗率（整数）
 */
export function computeCourseProgress(stages: StageWithProgress[]): number {
  if (stages.length === 0) return 0
  const passed = stages.filter(
    (s) => s.user_progress?.status === 'passed'
  ).length
  return Math.round((passed / stages.length) * 100)
}

/**
 * 合格済みステージ数を返す
 */
export function countPassedStages(stages: StageWithProgress[]): number {
  return stages.filter((s) => s.user_progress?.status === 'passed').length
}
