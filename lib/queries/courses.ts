import { createClient } from '@/lib/supabase/server'
import type { Course } from '@/lib/supabase/types'

export async function getCourses(): Promise<{ data: Course[] | null; error: string | undefined }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('order_index', { ascending: true })
  return { data: data as Course[] | null, error: error?.message }
}

export async function getPublishedCourses(): Promise<{ data: Course[] | null; error: string | undefined }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true })
  return { data: data as Course[] | null, error: error?.message }
}

export async function getCourse(courseId: string): Promise<{ data: Course | null; error: string | undefined }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()
  return { data: data as Course | null, error: error?.message }
}
