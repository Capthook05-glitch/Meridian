import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date().toISOString()
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')

  const { data, error } = await supabase
    .from('highlights')
    .select('*, document:documents(id, title, url, domain)')
    .eq('user_id', user.id)
    .lte('sr_due_date', now)
    .not('sr_due_date', 'is', null)
    .order('sr_due_date', { ascending: true })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also get count
  const { count } = await supabase
    .from('highlights')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .lte('sr_due_date', now)
    .not('sr_due_date', 'is', null)

  return NextResponse.json({ cards: data, total_due: count || 0 })
}
