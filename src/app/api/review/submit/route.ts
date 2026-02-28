import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateSM2, getNextReviewDate } from '@/lib/spaced-repetition/sm2'
import type { ReviewQuality } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { highlight_id, quality, session_id } = await request.json()

  if (!highlight_id || quality === undefined || !session_id) {
    return NextResponse.json({ error: 'highlight_id, quality, and session_id are required' }, { status: 400 })
  }

  // Get current highlight state
  const { data: highlight, error: fetchError } = await supabase
    .from('highlights')
    .select('sr_interval, sr_ease_factor, sr_repetitions')
    .eq('id', highlight_id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !highlight) {
    return NextResponse.json({ error: 'Highlight not found' }, { status: 404 })
  }

  // Calculate new SM-2 values
  const result = calculateSM2(
    quality as ReviewQuality,
    highlight.sr_repetitions || 0,
    highlight.sr_ease_factor || 2.5,
    highlight.sr_interval || 0
  )

  const nextReviewDate = getNextReviewDate(result.new_interval)

  // Update highlight
  await supabase
    .from('highlights')
    .update({
      sr_interval: result.new_interval,
      sr_ease_factor: result.new_ease_factor,
      sr_repetitions: result.new_repetitions,
      sr_status: result.new_status,
      sr_due_date: nextReviewDate.toISOString(),
    })
    .eq('id', highlight_id)
    .eq('user_id', user.id)

  // Record review event
  await supabase.from('review_events').insert({
    session_id,
    user_id: user.id,
    highlight_id,
    quality,
    new_interval: result.new_interval,
    new_ease_factor: result.new_ease_factor,
    new_status: result.new_status,
  })

  // Update session stats via direct query
  const { data: session } = await supabase
    .from('review_sessions')
    .select('cards_reviewed, cards_correct')
    .eq('id', session_id)
    .single()

  if (session) {
    await supabase
      .from('review_sessions')
      .update({
        cards_reviewed: (session.cards_reviewed || 0) + 1,
        cards_correct: (session.cards_correct || 0) + (quality >= 3 ? 1 : 0),
      })
      .eq('id', session_id)
  }

  return NextResponse.json({ ...result, next_review_date: nextReviewDate.toISOString() })
}
