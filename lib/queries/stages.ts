import { createClient } from '@/lib/supabase/server'
import { isStageAccessible } from '@/lib/utils/access'
import type { Stage, UserProgress, StageWithProgress } from '@/lib/supabase/types'

export async function getStages(courseId: string): Promise<{ data: Stage[] | null; error: string | undefined }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('stages')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })
  return { data: data as unknown as Stage[] | null, error: error?.message }
}

export async function getStage(stageId: string): Promise<{ data: Stage | null; error: string | undefined }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('stages')
    .select('*')
    .eq('id', stageId)
    .single()
  return { data: data as unknown as Stage | null, error: error?.message }
}

export async function getStagesWithProgress(
  courseId: string,
  userId: string
): Promise<{ data: StageWithProgress[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data: stagesRaw } = await supabase
    .from('stages')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })

  const stages = stagesRaw as unknown as Stage[] | null
  if (!stages) return { data: null, error: 'ステージの取得に失敗しました' }

  const stageIds = stages.map((s) => s.id)

  const { data: progressRaw } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .in('stage_id', stageIds)

  const progressData = progressRaw as unknown as UserProgress[] | null
  const progressMap = new Map<string, UserProgress>(
    (progressData ?? []).map((p) => [p.stage_id, p])
  )

  const stagesWithProgress: StageWithProgress[] = stages.map((stage) => ({
    ...stage,
    user_progress: progressMap.get(stage.id) ?? null,
    isAccessible: isStageAccessible(stage, stages, progressMap),
  }))

  return { data: stagesWithProgress, error: null }
}

export async function getMaxOrderIndex(courseId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('stages')
    .select('order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: false })
    .limit(1)
    .single()
  return (data as unknown as { order_index: number } | null)?.order_index ?? 0
}
