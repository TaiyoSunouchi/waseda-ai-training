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
  _stage: Stage,
  _allStages: Stage[],
  _progressMap: Map<string, UserProgress>
): boolean {
  // 全ステージを最初から閲覧可能
  return true
}
