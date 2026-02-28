export type ContentType = 'article' | 'pdf' | 'video' | 'tweet' | 'epub' | 'rss' | 'note' | 'highlight'
export type ReviewStatus = 'new' | 'learning' | 'review' | 'relearning' | 'graduated'
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple'

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  settings: UserSettings
  created_at: string
  updated_at: string
}

export interface UserSettings {
  theme: 'dark' | 'light'
  defaultView: 'library' | 'notes' | 'canvas'
  aiModel: string
  reviewDailyGoal: number
  readerFontSize?: number
  readerMaxWidth?: number
}

export interface Document {
  id: string
  user_id: string
  title: string
  description: string | null
  content_type: ContentType
  url: string | null
  domain: string | null
  author: string | null
  published_at: string | null
  estimated_read_time_minutes: number | null
  content_html: string | null
  content_text: string | null
  cover_image_url: string | null
  storage_path: string | null
  tags: string[]
  is_favorite: boolean
  is_archived: boolean
  is_deleted: boolean
  reading_progress: number
  ai_summary: string | null
  ai_key_points: string[] | null
  created_at: string
  updated_at: string
  last_opened_at: string | null
  highlights?: Highlight[]
}

export interface Highlight {
  id: string
  user_id: string
  document_id: string
  text: string
  note: string | null
  color: HighlightColor
  location_data: Record<string, unknown>
  tags: string[]
  is_favorite: boolean
  sr_due_date: string | null
  sr_interval: number
  sr_ease_factor: number
  sr_repetitions: number
  sr_status: ReviewStatus
  created_at: string
  updated_at: string
  document?: Document
}

export interface Space {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  user_id: string
  space_id: string | null
  title: string
  content: Record<string, unknown> | null
  content_text: string | null
  icon: string
  tags: string[]
  is_favorite: boolean
  is_deleted: boolean
  is_pinned: boolean
  ai_summary: string | null
  is_public: boolean
  public_slug: string | null
  created_at: string
  updated_at: string
  space?: Space
}

export interface NoteLink {
  id: string
  user_id: string
  source_note_id: string
  target_note_id: string
  context_text: string | null
  created_at: string
  source_note?: Note
  target_note?: Note
}

export interface Canvas {
  id: string
  user_id: string
  space_id: string | null
  title: string
  tldraw_document: Record<string, unknown> | null
  thumbnail_url: string | null
  is_favorite: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface ReviewSession {
  id: string
  user_id: string
  started_at: string
  completed_at: string | null
  total_cards: number
  cards_reviewed: number
  cards_correct: number
  created_at: string
}

export interface ReviewEvent {
  id: string
  session_id: string
  user_id: string
  highlight_id: string | null
  quality: number
  new_interval: number
  new_ease_factor: number
  new_status: ReviewStatus
  reviewed_at: string
}

export interface AIConversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  messages?: AIMessage[]
}

export interface AIMessage {
  id: string
  conversation_id: string
  user_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  cited_document_ids: string[] | null
  cited_highlight_ids: string[] | null
  cited_note_ids: string[] | null
  model_used: string | null
  created_at: string
}

export interface SearchResult {
  id: string
  type: 'document' | 'highlight' | 'note'
  title: string
  excerpt: string
  similarity: number
  created_at: string
}

export interface SM2Result {
  new_interval: number
  new_ease_factor: number
  new_repetitions: number
  new_status: ReviewStatus
}

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5
