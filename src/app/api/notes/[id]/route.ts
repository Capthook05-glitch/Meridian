import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding, embeddingToString } from '@/lib/ai/embeddings'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  const { data, error } = await supabase
    .from('notes')
    .update(body)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update embedding if content changed
  if (body.content_text && process.env.ANTHROPIC_API_KEY) {
    generateEmbedding(`${body.title || ''}\n\n${body.content_text}`)
      .then(async (embedding) => {
        await supabase
          .from('notes')
          .update({ embedding: embeddingToString(embedding) })
          .eq('id', id)
      })
      .catch(console.error)
  }

  // Handle wikilinks: parse [[Title]] patterns and upsert note_links
  if (body.content_text) {
    const wikilinkPattern = /\[\[([^\]]+)\]\]/g
    const matches = [...body.content_text.matchAll(wikilinkPattern)]
    const titles = [...new Set(matches.map((m) => m[1].trim()))]

    if (titles.length > 0) {
      // Delete old links from this source
      await supabase.from('note_links').delete().eq('source_note_id', id).eq('user_id', user.id)

      // Find target notes by title
      const { data: targets } = await supabase
        .from('notes')
        .select('id, title')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .in('title', titles)

      if (targets && targets.length > 0) {
        await supabase.from('note_links').upsert(
          targets.map((t) => ({
            user_id: user.id,
            source_note_id: id,
            target_note_id: t.id,
          })),
          { onConflict: 'source_note_id,target_note_id' }
        )
      }
    }
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('notes')
    .update({ is_deleted: true })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
