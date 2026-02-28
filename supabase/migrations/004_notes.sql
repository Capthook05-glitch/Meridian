CREATE TABLE IF NOT EXISTS public.spaces (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  icon        TEXT DEFAULT '📁',
  color       TEXT DEFAULT '#6366f1',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  space_id        UUID REFERENCES public.spaces(id) ON DELETE SET NULL,
  title           TEXT NOT NULL DEFAULT 'Untitled',
  content         JSONB,
  content_text    TEXT,
  icon            TEXT DEFAULT '📝',
  tags            TEXT[] NOT NULL DEFAULT '{}',
  is_favorite     BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
  is_pinned       BOOLEAN NOT NULL DEFAULT FALSE,
  ai_summary      TEXT,
  embedding       vector(1536),
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  public_slug     TEXT UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.note_links (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_note_id  UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  target_note_id  UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  context_text    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_note_id, target_note_id)
);
