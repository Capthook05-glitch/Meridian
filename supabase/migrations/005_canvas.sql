CREATE TABLE IF NOT EXISTS public.canvases (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  space_id        UUID REFERENCES public.spaces(id) ON DELETE SET NULL,
  title           TEXT NOT NULL DEFAULT 'Untitled Canvas',
  tldraw_document JSONB,
  thumbnail_url   TEXT,
  is_favorite     BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
