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
  // 第1ステージは常にアクセス可
  if (stage.order_index === 1) return true

  // 前ステージを取得
  const prevStage = allStages.find(s => s.order_index === stage.order_index - 1)
  if (!prevStage) return false

  // 前ステージが合格済みの場合のみアクセス可
  return progressMap.get(prevStage.id)?.status === 'passed'
}
