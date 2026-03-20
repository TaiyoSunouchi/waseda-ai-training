/**
 * スコアを計算する
 * @param correct 正解数
 * @param total 総問数
 * @returns 0-100のスコア（整数）
 */
export function computeScore(correct: number, total: number): number {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

/**
 * 合格かどうかを判定する
 * @param score スコア（0-100）
 * @param threshold 合格ライン（0-100）
 * @returns 合格かどうか
 */
export function isPassed(score: number, threshold: number): boolean {
  return score >= threshold
}
