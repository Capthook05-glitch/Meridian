import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { streamText } from 'ai'
import { anthropicAI, MODELS } from '@/lib/ai/client'
import { generateEmbedding } from '@/lib/ai/embeddings'
import { buildRAGPrompt, SYSTEM_PROMPTS } from '@/lib/ai/prompts'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages, conversation_id } = await request.json()
  const lastMessage = messages[messages.length - 1]

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(lastMessage.content)
  const embeddingStr = `[${queryEmbedding.join(',')}]`

  // Search knowledge base (cast needed: custom RPC not in generated types)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: searchResults } = await (supabase as any).rpc('search_knowledge_base', {
    query_embedding: embeddingStr,
    user_id_param: user.id,
    match_threshold: 0.6,
    match_count: 8,
  })

  const context = searchResults || []

  // Build RAG prompt
  const ragPrompt = context.length > 0
    ? buildRAGPrompt(lastMessage.content, context)
    : lastMessage.content

  // Replace last message content with RAG-enhanced prompt
  const enhancedMessages = [
    ...messages.slice(0, -1),
    { ...lastMessage, content: ragPrompt },
  ]

  // Stream response
  const result = streamText({
    model: anthropicAI(MODELS.smart),
    system: SYSTEM_PROMPTS.chat,
    messages: enhancedMessages,
    maxOutputTokens: 2048,
    onFinish: async ({ text }) => {
      // Save messages to DB (cast needed due to Supabase v12 type inference in callbacks)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any
      if (conversation_id) {
        const ctx = context as Array<{ type: string; id: string }>
        await db.from('ai_messages').insert({
          conversation_id,
          user_id: user.id,
          role: 'user',
          content: lastMessage.content,
        })
        await db.from('ai_messages').insert({
          conversation_id,
          user_id: user.id,
          role: 'assistant',
          content: text,
          cited_document_ids: ctx.filter((r) => r.type === 'document').map((r) => r.id),
          cited_highlight_ids: ctx.filter((r) => r.type === 'highlight').map((r) => r.id),
          cited_note_ids: ctx.filter((r) => r.type === 'note').map((r) => r.id),
          model_used: MODELS.smart,
        })
      }
    },
  })

  return result.toTextStreamResponse({
    headers: {
      'X-Context-Count': String(context.length),
    },
  })
}
