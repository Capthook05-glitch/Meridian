import { VoyageAIClient } from 'voyageai'

const voyage = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY || '',
})

export async function generateEmbedding(text: string): Promise<number[]> {
  const cleanText = text.slice(0, 16000).trim()

  if (!process.env.VOYAGE_API_KEY) {
    // Fallback: deterministic hash-based placeholder (semantic search won't work)
    return hashEmbedding(cleanText)
  }

  const response = await voyage.embed({
    input: cleanText,
    model: 'voyage-3-lite', // 512-dim, fast, cheap (~$0.02/MTok)
  })

  const vec = response.data?.[0]?.embedding ?? []

  // voyage-3-lite is 512-dim; pad to 1536 for pgvector column compatibility
  if (vec.length < 1536) {
    const padded = new Array(1536).fill(0)
    vec.forEach((v, i) => { padded[i] = v })
    return padded
  }

  return vec
}

export function embeddingToString(embedding: number[]): string {
  return `[${embedding.join(',')}]`
}

export async function generateEmbeddingForDocument(
  title: string,
  content: string,
  description?: string | null
): Promise<number[]> {
  const text = [title, description, content.slice(0, 8000)].filter(Boolean).join('\n\n')
  return generateEmbedding(text)
}

// Fallback when no API key is set (development only)
function hashEmbedding(text: string): number[] {
  const embedding = new Array(1536).fill(0)
  const encoder = new TextEncoder()
  const bytes = encoder.encode(text)
  for (let i = 0; i < bytes.length; i++) {
    const dim = (bytes[i] * 7 + i * 13) % 1536
    embedding[dim] += bytes[i] / 255.0
  }
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return magnitude > 0 ? embedding.map((val) => val / magnitude) : embedding
}
