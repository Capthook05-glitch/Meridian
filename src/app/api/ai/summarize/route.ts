import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic, MODELS } from '@/lib/ai/client'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { document_id, text } = await request.json()
  if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 })

  const message = await anthropic.messages.create({
    model: MODELS.fast,
    max_tokens: 1024,
    system: SYSTEM_PROMPTS.summarize,
    messages: [{ role: 'user', content: text.slice(0, 12000) }],
  })

  const summary = message.content[0].type === 'text' ? message.content[0].text : ''

  // Extract key points
  const keyPointsMsg = await anthropic.messages.create({
    model: MODELS.fast,
    max_tokens: 512,
    system: SYSTEM_PROMPTS.keyPoints,
    messages: [{ role: 'user', content: text.slice(0, 8000) }],
  })

  let keyPoints: string[] = []
  if (keyPointsMsg.content[0].type === 'text') {
    try {
      keyPoints = JSON.parse(keyPointsMsg.content[0].text)
    } catch {}
  }

  // Save to document if document_id provided
  if (document_id) {
    await supabase
      .from('documents')
      .update({ ai_summary: summary, ai_key_points: keyPoints })
      .eq('id', document_id)
      .eq('user_id', user.id)
  }

  return NextResponse.json({ summary, key_points: keyPoints })
}
