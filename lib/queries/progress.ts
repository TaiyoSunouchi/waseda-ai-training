import { createClient } from '@/lib/supabase/server'
import type { UserProgress } from '@/lib/supabase/types'

export async function getUserProgress(userId: string, stageId: string): Promise<{ data: UserProgress | null; error: string | undefined }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('stage_id', stageId)
    .single()
  return { data: data as unknown as UserProgress | null, error: error?.message }
}

export async function getAllProgress() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_progress')
    .select(`
      *,
      profiles (id, email, full_name),
      stages (id, title, course_id, courses (id, title))
    `)
    .order('updated_at', { ascending: false })
  return { data: data as unknown as Array<Record<string, unknown>> | null, error: error?.message }
}
