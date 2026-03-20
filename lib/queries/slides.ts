import { createClient } from '@/lib/supabase/server'
import type { Slide } from '@/lib/supabase/types'

export async function getSlides(stageId: string): Promise<{ data: Slide[] | null; error: string | undefined }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('slides')
    .select('*')
    .eq('stage_id', stageId)
    .order('order_index', { ascending: true })
  return { data: data as Slide[] | null, error: error?.message }
}

export async function getSlideSignedUrl(fileUrl: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase.storage
    .from('slides')
    .createSignedUrl(fileUrl, 3600)
  return data?.signedUrl ?? null
}
