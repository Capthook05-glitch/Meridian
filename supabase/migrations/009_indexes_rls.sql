-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON public.documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON public.documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_highlights_document_id ON public.highlights(document_id);
CREATE INDEX IF NOT EXISTS idx_highlights_user_id ON public.highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_highlights_sr_due_date ON public.highlights(sr_due_date);
CREATE INDEX IF NOT EXISTS idx_highlights_embedding ON public.highlights USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_embedding ON public.notes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_note_links_source ON public.note_links(source_note_id);
CREATE INDEX IF NOT EXISTS idx_note_links_target ON public.note_links(target_note_id);
CREATE INDEX IF NOT EXISTS idx_canvases_user_id ON public.canvases(user_id);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "own" ON public.profiles;
CREATE POLICY "own" ON public.profiles FOR ALL USING (auth.uid() = id);
DROP POLICY IF EXISTS "own" ON public.documents;
CREATE POLICY "own" ON public.documents FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "own" ON public.highlights;
CREATE POLICY "own" ON public.highlights FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "own" ON public.notes;
CREATE POLICY "own" ON public.notes FOR ALL USING (auth.uid() = user_id OR is_public = TRUE);
DROP POLICY IF EXISTS "own" ON public.note_links;
CREATE POLICY "own" ON public.note_links FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "own" ON public.spaces;
CREATE POLICY "own" ON public.spaces FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "own" ON public.canvases;
CREATE POLICY "own" ON public.canvases FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "own" ON public.tags;
CREATE POLICY "own" ON public.tags FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "own" ON public.review_sessions;
CREATE POLICY "own" ON public.review_sessions FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "own" ON public.review_events;
CREATE POLICY "own" ON public.review_events FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "own" ON public.ai_conversations;
CREATE POLICY "own" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "own" ON public.ai_messages;
CREATE POLICY "own" ON public.ai_messages FOR ALL USING (auth.uid() = user_id);
