import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const spaceId = searchParams.get('space_id')
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '100')

  let dbQuery = supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (spaceId) dbQuery = dbQuery.eq('space_id', spaceId)
  if (query) dbQuery = dbQuery.ilike('title', `%${query}%`)

  const { data, error } = await dbQuery
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      title: body.title || 'Untitled',
      space_id: body.space_id || null,
      content: body.content || null,
      content_text: body.content_text || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
