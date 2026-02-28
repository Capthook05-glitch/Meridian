CREATE TABLE IF NOT EXISTS public.review_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  total_cards     INTEGER NOT NULL DEFAULT 0,
  cards_reviewed  INTEGER NOT NULL DEFAULT 0,
  cards_correct   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.review_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL REFERENCES public.review_sessions(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  highlight_id    UUID REFERENCES public.highlights(id) ON DELETE CASCADE,
  quality         INTEGER NOT NULL CHECK (quality BETWEEN 0 AND 5),
  new_interval    INTEGER NOT NULL,
  new_ease_factor DECIMAL(4,2) NOT NULL,
  new_status      review_status NOT NULL,
  reviewed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
