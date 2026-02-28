import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scrapeURL } from '@/lib/reader/scraper'
import { generateEmbeddingForDocument, embeddingToString } from '@/lib/ai/embeddings'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await request.json()
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

  // Check for duplicates
  const { data: existing } = await supabase
    .from('documents')
    .select('id')
    .eq('user_id', user.id)
    .eq('url', url)
    .eq('is_deleted', false)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Article already saved', id: existing.id }, { status: 409 })
  }

  // Scrape content
  let scraped
  try {
    scraped = await scrapeURL(url)
  } catch (err) {
    return NextResponse.json({ error: `Failed to scrape URL: ${err instanceof Error ? err.message : 'Unknown error'}` }, { status: 422 })
  }

  // Save to database
  const { data: doc, error } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      url,
      title: scraped.title,
      description: scraped.description,
      content_type: 'article',
      content_html: scraped.content_html,
      content_text: scraped.content_text,
      author: scraped.author,
      published_at: scraped.published_at,
      cover_image_url: scraped.cover_image_url,
      domain: scraped.domain,
      estimated_read_time_minutes: scraped.estimated_read_time_minutes,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Generate embedding asynchronously (don't await)
  if (process.env.ANTHROPIC_API_KEY) {
    generateEmbeddingForDocument(scraped.title, scraped.content_text, scraped.description)
      .then(async (embedding) => {
        await supabase
          .from('documents')
          .update({ embedding: embeddingToString(embedding) })
          .eq('id', doc.id)
      })
      .catch(console.error)
  }

  return NextResponse.json(doc, { status: 201 })
}
