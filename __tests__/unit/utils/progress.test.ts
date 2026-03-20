import { describe, it, expect } from 'vitest'
import { computeCourseProgress, countPassedStages } from '@/lib/utils/progress'
import type { StageWithProgress } from '@/lib/supabase/types'

const makeStage = (status?: 'not_started' | 'in_progress' | 'passed'): StageWithProgress => ({
  id: Math.random().toString(),
  course_id: 'course-1',
  title: 'Test Stage',
  description: null,
  order_index: 1,
  pass_threshold: 70,
  created_at: '',
  updated_at: '',
  user_progress: status
    ? {
        id: '',
        user_id: '',
        stage_id: '',
        status,
        best_score: 70,
        attempts_count: 1,
        completed_at: null,
        created_at: '',
        updated_at: '',
      }
    : null,
  isAccessible: true,
})

describe('computeCourseProgress', () => {
  it('ステージが0のとき0を返す', () => {
    expect(computeCourseProgress([])).toBe(0)
  })

  it('全て合格のとき100を返す', () => {
    const stages = [makeStage('passed'), makeStage('passed')]
    expect(computeCourseProgress(stages)).toBe(100)
  })

  it('半分合格のとき50を返す', () => {
    const stages = [makeStage('passed'), makeStage('in_progress')]
    expect(computeCourseProgress(stages)).toBe(50)
  })

  it('未開始のとき0を返す', () => {
    const stages = [makeStage('not_started'), makeStage()]
    expect(computeCourseProgress(stages)).toBe(0)
  })
})

describe('countPassedStages', () => {
  it('合格済みステージ数を返す', () => {
    const stages = [makeStage('passed'), makeStage('in_progress'), makeStage('passed')]
    expect(countPassedStages(stages)).toBe(2)
  })
})
