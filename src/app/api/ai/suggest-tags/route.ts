import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic, MODELS } from '@/lib/ai/client'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { text, existing_tags = [] } = await request.json()
  if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 })

  const existingTagsStr = existing_tags.length > 0
    ? `\nExisting tags in the system: ${existing_tags.join(', ')}`
    : ''

  const message = await anthropic.messages.create({
    model: MODELS.fast,
    max_tokens: 256,
    system: SYSTEM_PROMPTS.tagSuggestion + existingTagsStr,
    messages: [{ role: 'user', content: text.slice(0, 4000) }],
  })

  let tags: string[] = []
  if (message.content[0].type === 'text') {
    try {
      tags = JSON.parse(message.content[0].text)
      tags = tags.filter((t: unknown) => typeof t === 'string').map((t: string) => t.toLowerCase().trim())
    } catch {}
  }

  return NextResponse.json({ tags })
}
