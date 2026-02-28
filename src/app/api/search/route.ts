import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/ai/embeddings'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const mode = searchParams.get('mode') || 'hybrid' // 'semantic', 'fulltext', 'hybrid'

  if (!query) return NextResponse.json({ results: [] })

  const results: unknown[] = []

  // Semantic search
  if (mode === 'semantic' || mode === 'hybrid') {
    const embedding = await generateEmbedding(query)
    const embeddingStr = `[${embedding.join(',')}]`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: semanticResults } = await (supabase as any).rpc('search_knowledge_base', {
      query_embedding: embeddingStr,
      user_id_param: user.id,
      match_threshold: 0.55,
      match_count: 15,
    })

    if (semanticResults) results.push(...semanticResults.map((r: Record<string, unknown>) => ({ ...r, source: 'semantic' })))
  }

  // Full-text search (documents + notes)
  if (mode === 'fulltext' || mode === 'hybrid') {
    const { data: ftsDocs } = await supabase
      .from('documents')
      .select('id, title, description, content_type, created_at')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,content_text.ilike.%${query}%`)
      .limit(10)

    const { data: ftsNotes } = await supabase
      .from('notes')
      .select('id, title, content_text, created_at')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .or(`title.ilike.%${query}%,content_text.ilike.%${query}%`)
      .limit(10)

    if (ftsDocs) {
      results.push(...ftsDocs.map((d) => ({
        id: d.id, type: 'document', title: d.title,
        excerpt: d.description || '', similarity: 0.8, created_at: d.created_at, source: 'fulltext',
      })))
    }
    if (ftsNotes) {
      results.push(...ftsNotes.map((n) => ({
        id: n.id, type: 'note', title: n.title,
        excerpt: n.content_text?.slice(0, 200) || '', similarity: 0.8, created_at: n.created_at, source: 'fulltext',
      })))
    }
  }

  // Deduplicate by id
  const seen = new Set<string>()
  const deduped = results.filter((r: unknown) => {
    const item = r as { id: string }
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })

  // Sort by similarity desc
  deduped.sort((a: unknown, b: unknown) => {
    const aItem = a as { similarity: number }
    const bItem = b as { similarity: number }
    return bItem.similarity - aItem.similarity
  })

  return NextResponse.json({ results: deduped.slice(0, 20), query })
}
