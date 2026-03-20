import type { Stage, UserProgress } from '@/lib/supabase/types'

/**
 * ステージにアクセス可能かどうかを判定する
 * - 第1ステージ（order_index === 1）は常にアクセス可
 * - それ以降は前ステージが合格済みの場合のみアクセス可
 *
 * @param stage 対象ステージ
 * @param allStages コース内の全ステージ（order_index昇順）
 * @param progressMap ユーザーの進捗Map（stage_id → UserProgress）
 */
export function isStageAccessible(
  stage: Stage,
  allStages: Stage[],
  progressMap: Map<string, UserProgress>
): boolean {
  // order_index の値ではなく、ソート後の位置で判定する。
  // こうすることで order_index に飛び番があっても正しく動作する。
  const sorted = [...allStages].sort((a, b) => a.order_index - b.order_index)
  const position = sorted.findIndex((s) => s.id === stage.id)

  if (position === -1) return false
  if (position === 0) return true // 先頭ステージは常にアクセス可

  const prevStage = sorted[position - 1]
  const prevProgress = progressMap.get(prevStage.id)
  return prevProgress?.status === 'passed'
}
