export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: { id: string; username?: string | null; full_name?: string | null; avatar_url?: string | null; settings?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; username?: string | null; full_name?: string | null; avatar_url?: string | null; settings?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          content_type: 'article' | 'pdf' | 'video' | 'tweet' | 'epub' | 'rss' | 'note' | 'highlight'
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
          embedding: string | null
          created_at: string
          updated_at: string
          last_opened_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          content_type?: 'article' | 'pdf' | 'video' | 'tweet' | 'epub' | 'rss' | 'note' | 'highlight'
          url?: string | null
          domain?: string | null
          author?: string | null
          published_at?: string | null
          estimated_read_time_minutes?: number | null
          content_html?: string | null
          content_text?: string | null
          cover_image_url?: string | null
          storage_path?: string | null
          tags?: string[]
          is_favorite?: boolean
          is_archived?: boolean
          is_deleted?: boolean
          reading_progress?: number
          ai_summary?: string | null
          ai_key_points?: string[] | null
          embedding?: string | null
          created_at?: string
          updated_at?: string
          last_opened_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
        Relationships: []
      }
      highlights: {
        Row: {
          id: string
          user_id: string
          document_id: string
          text: string
          note: string | null
          color: 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple'
          location_data: Json
          tags: string[]
          is_favorite: boolean
          embedding: string | null
          sr_due_date: string | null
          sr_interval: number
          sr_ease_factor: number
          sr_repetitions: number
          sr_status: 'new' | 'learning' | 'review' | 'relearning' | 'graduated'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_id: string
          text: string
          note?: string | null
          color?: 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple'
          location_data?: Json
          tags?: string[]
          is_favorite?: boolean
          embedding?: string | null
          sr_due_date?: string | null
          sr_interval?: number
          sr_ease_factor?: number
          sr_repetitions?: number
          sr_status?: 'new' | 'learning' | 'review' | 'relearning' | 'graduated'
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['highlights']['Insert']>
        Relationships: []
      }
      notes: {
        Row: {
          id: string
          user_id: string
          space_id: string | null
          title: string
          content: Json | null
          content_text: string | null
          icon: string
          tags: string[]
          is_favorite: boolean
          is_deleted: boolean
          is_pinned: boolean
          ai_summary: string | null
          embedding: string | null
          is_public: boolean
          public_slug: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          space_id?: string | null
          title?: string
          content?: Json | null
          content_text?: string | null
          icon?: string
          tags?: string[]
          is_favorite?: boolean
          is_deleted?: boolean
          is_pinned?: boolean
          ai_summary?: string | null
          embedding?: string | null
          is_public?: boolean
          public_slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['notes']['Insert']>
        Relationships: []
      }
      note_links: {
        Row: {
          id: string
          user_id: string
          source_note_id: string
          target_note_id: string
          context_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_note_id: string
          target_note_id: string
          context_text?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['note_links']['Insert']>
        Relationships: []
      }
      spaces: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          color: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string
          color?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['spaces']['Insert']>
        Relationships: []
      }
      canvases: {
        Row: {
          id: string
          user_id: string
          space_id: string | null
          title: string
          tldraw_document: Json | null
          thumbnail_url: string | null
          is_favorite: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          space_id?: string | null
          title?: string
          tldraw_document?: Json | null
          thumbnail_url?: string | null
          is_favorite?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['canvases']['Insert']>
        Relationships: []
      }
      review_sessions: {
        Row: {
          id: string
          user_id: string
          started_at: string
          completed_at: string | null
          total_cards: number
          cards_reviewed: number
          cards_correct: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          started_at?: string
          completed_at?: string | null
          total_cards?: number
          cards_reviewed?: number
          cards_correct?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['review_sessions']['Insert']>
        Relationships: []
      }
      review_events: {
        Row: {
          id: string
          session_id: string
          user_id: string
          highlight_id: string | null
          quality: number
          new_interval: number
          new_ease_factor: number
          new_status: 'new' | 'learning' | 'review' | 'relearning' | 'graduated'
          reviewed_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          highlight_id?: string | null
          quality: number
          new_interval: number
          new_ease_factor: number
          new_status: 'new' | 'learning' | 'review' | 'relearning' | 'graduated'
          reviewed_at?: string
        }
        Update: Partial<Database['public']['Tables']['review_events']['Insert']>
        Relationships: []
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['ai_conversations']['Insert']>
        Relationships: []
      }
      ai_messages: {
        Row: {
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
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          cited_document_ids?: string[] | null
          cited_highlight_ids?: string[] | null
          cited_note_ids?: string[] | null
          model_used?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['ai_messages']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      search_knowledge_base: {
        Args: { query_embedding: string; user_id_param: string; match_threshold?: number; match_count?: number }
        Returns: Array<{ id: string; type: string; title: string; excerpt: string; similarity: number; created_at: string }>
      }
      calculate_sm2: {
        Args: { quality: number; repetitions: number; ease_factor: number; interval_days: number }
        Returns: Array<{ new_interval: number; new_ease_factor: number; new_repetitions: number; new_status: string }>
      }
    }
  }
}
