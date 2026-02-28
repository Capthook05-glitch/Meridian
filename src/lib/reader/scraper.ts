import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import { estimateReadTime, getDomain } from '@/lib/utils/format'

export interface ScrapedArticle {
  title: string
  description: string | null
  content_html: string
  content_text: string
  author: string | null
  published_at: string | null
  cover_image_url: string | null
  domain: string
  estimated_read_time_minutes: number
}

export async function scrapeURL(url: string): Promise<ScrapedArticle> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MeridianBot/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  const dom = new JSDOM(html, { url })
  const reader = new Readability(dom.window.document)
  const article = reader.parse()

  if (!article) {
    throw new Error('Could not parse article content from URL')
  }

  // Extract OG image
  const ogImage =
    dom.window.document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
    dom.window.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
    null

  // Extract description
  const description =
    article.excerpt ||
    dom.window.document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
    dom.window.document.querySelector('meta[name="description"]')?.getAttribute('content') ||
    null

  // Extract published date
  const publishedAt =
    dom.window.document.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
    dom.window.document.querySelector('time[datetime]')?.getAttribute('datetime') ||
    null

  const contentText = article.textContent || ''

  return {
    title: article.title || new URL(url).hostname,
    description: description?.slice(0, 300) || null,
    content_html: article.content || '',
    content_text: contentText,
    author: article.byline || null,
    published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
    cover_image_url: ogImage,
    domain: getDomain(url),
    estimated_read_time_minutes: estimateReadTime(contentText),
  }
}
