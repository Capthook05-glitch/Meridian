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

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
}

async function fetchHTML(url: string): Promise<string> {
  // First attempt with full browser headers
  let response = await fetch(url, {
    headers: BROWSER_HEADERS,
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  })

  // Some sites block the Sec-Fetch headers — retry with minimal headers
  if (response.status === 403 || response.status === 429) {
    response = await fetch(url, {
      headers: {
        'User-Agent': BROWSER_HEADERS['User-Agent'],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
    })
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
  }

  return response.text()
}

export async function scrapeURL(url: string): Promise<ScrapedArticle> {
  const html = await fetchHTML(url)
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
