import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/supabase/types'

export async function getUsers(): Promise<{ data: Profile[] | null; error: string | undefined }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return { data: data as unknown as Profile[] | null, error: error?.message }
}

export async function getCurrentUser(): Promise<{ data: Profile | null; error: string | undefined }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: '未認証' }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return { data: data as unknown as Profile | null, error: error?.message }
}
