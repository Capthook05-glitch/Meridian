import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding, embeddingToString } from '@/lib/ai/embeddings'
import { getNextReviewDate } from '@/lib/spaced-repetition/sm2'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const documentId = searchParams.get('document_id')
  const limit = parseInt(searchParams.get('limit') || '100')

  let query = supabase
    .from('highlights')
    .select('*, document:documents(id, title, url, domain)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (documentId) query = query.eq('document_id', documentId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { text, document_id, color = 'yellow', note, location_data = {} } = body

  if (!text || !document_id) {
    return NextResponse.json({ error: 'text and document_id are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('highlights')
    .insert({
      user_id: user.id,
      document_id,
      text,
      note,
      color,
      location_data,
      sr_due_date: getNextReviewDate(0).toISOString(),
      sr_status: 'new',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Generate embedding
  if (process.env.ANTHROPIC_API_KEY) {
    generateEmbedding(note ? `${text}\n\n${note}` : text)
      .then(async (embedding) => {
        await supabase
          .from('highlights')
          .update({ embedding: embeddingToString(embedding) })
          .eq('id', data.id)
      })
      .catch(console.error)
  }

  return NextResponse.json(data, { status: 201 })
}
