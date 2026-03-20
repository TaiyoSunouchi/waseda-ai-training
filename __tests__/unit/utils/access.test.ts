import { describe, it, expect } from 'vitest'
import { isStageAccessible } from '@/lib/utils/access'
import type { Stage, UserProgress } from '@/lib/supabase/types'

const makeStage = (id: string, order: number): Stage => ({
  id,
  course_id: 'course-1',
  title: `Stage ${order}`,
  description: null,
  order_index: order,
  pass_threshold: 70,
  created_at: '',
  updated_at: '',
})

const makeProgress = (stageId: string, status: 'passed' | 'in_progress'): UserProgress => ({
  id: '',
  user_id: 'user-1',
  stage_id: stageId,
  status,
  best_score: 80,
  attempts_count: 1,
  completed_at: null,
  created_at: '',
  updated_at: '',
})

describe('isStageAccessible', () => {
  const stages = [makeStage('s1', 1), makeStage('s2', 2), makeStage('s3', 3)]

  it('第1ステージは常にアクセス可', () => {
    const progressMap = new Map<string, UserProgress>()
    expect(isStageAccessible(stages[0], stages, progressMap)).toBe(true)
  })

  it('前ステージ合格済みなら次ステージにアクセス可', () => {
    const progressMap = new Map([['s1', makeProgress('s1', 'passed')]])
    expect(isStageAccessible(stages[1], stages, progressMap)).toBe(true)
  })

  it('前ステージが未合格なら次ステージにアクセス不可', () => {
    const progressMap = new Map([['s1', makeProgress('s1', 'in_progress')]])
    expect(isStageAccessible(stages[1], stages, progressMap)).toBe(false)
  })

  it('前ステージの進捗がなければアクセス不可', () => {
    const progressMap = new Map<string, UserProgress>()
    expect(isStageAccessible(stages[1], stages, progressMap)).toBe(false)
  })

  it('第3ステージはs2合格済みの場合アクセス可', () => {
    const progressMap = new Map([
      ['s1', makeProgress('s1', 'passed')],
      ['s2', makeProgress('s2', 'passed')],
    ])
    expect(isStageAccessible(stages[2], stages, progressMap)).toBe(true)
  })
})
