import Anthropic from '@anthropic-ai/sdk'
import { createAnthropic } from '@ai-sdk/anthropic'

// For direct Anthropic SDK usage (non-streaming)
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// For Vercel AI SDK usage (streaming)
export const anthropicAI = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const MODELS = {
  fast: 'claude-haiku-4-5-20251001',    // For quick tasks: tagging, quick summaries
  smart: 'claude-sonnet-4-6',           // For complex tasks: RAG chat, deep analysis
} as const
