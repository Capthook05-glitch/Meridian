import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true })
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d, yyyy')
}

export function formatReadTime(minutes: number): string {
  if (minutes < 1) return '< 1 min'
  if (minutes === 1) return '1 min'
  return `${minutes} min`
}

export function formatDueDate(date: string | Date | null): string {
  if (!date) return 'New'
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  if (d <= now) return 'Due now'
  return `Due ${formatDistanceToNow(d, { addSuffix: true })}`
}

export function truncate(str: string, length = 120): string {
  if (str.length <= length) return str
  return str.slice(0, length).trimEnd() + '…'
}

export function getDomain(url: string): string {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function estimateReadTime(text: string): number {
  const wordsPerMinute = 225
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / wordsPerMinute))
}
