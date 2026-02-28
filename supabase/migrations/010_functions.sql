-- Semantic search across documents, highlights, and notes
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(1536),
  user_id_param UUID,
  match_threshold FLOAT DEFAULT 0.55,
  match_count INT DEFAULT 20
) RETURNS TABLE (id UUID, type TEXT, title TEXT, excerpt TEXT, similarity FLOAT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, 'document'::TEXT, d.title, LEFT(COALESCE(d.content_text,''),200),
    1-(d.embedding<=>query_embedding), d.created_at
  FROM public.documents d
  WHERE d.user_id=user_id_param AND NOT d.is_deleted AND d.embedding IS NOT NULL
    AND 1-(d.embedding<=>query_embedding)>match_threshold
  UNION ALL
  SELECT h.id, 'highlight'::TEXT, LEFT(h.text,100), COALESCE(h.note,h.text),
    1-(h.embedding<=>query_embedding), h.created_at
  FROM public.highlights h
  WHERE h.user_id=user_id_param AND h.embedding IS NOT NULL
    AND 1-(h.embedding<=>query_embedding)>match_threshold
  UNION ALL
  SELECT n.id, 'note'::TEXT, n.title, LEFT(COALESCE(n.content_text,''),200),
    1-(n.embedding<=>query_embedding), n.created_at
  FROM public.notes n
  WHERE n.user_id=user_id_param AND NOT n.is_deleted AND n.embedding IS NOT NULL
    AND 1-(n.embedding<=>query_embedding)>match_threshold
  ORDER BY similarity DESC LIMIT match_count;
END; $$;

-- SM-2 spaced repetition algorithm
CREATE OR REPLACE FUNCTION calculate_sm2(
  quality INT, repetitions INT, ease_factor DECIMAL, interval_days INT
) RETURNS TABLE (new_interval INT, new_ease_factor DECIMAL, new_repetitions INT, new_status review_status)
LANGUAGE plpgsql AS $$
DECLARE ef DECIMAL; ivl INT; reps INT; status review_status;
BEGIN
  ef := ease_factor;
  IF quality < 3 THEN
    ivl := 1; reps := 0; status := 'relearning';
  ELSE
    ef := GREATEST(1.3, ef + (0.1-(5-quality)*(0.08+(5-quality)*0.02)));
    reps := repetitions + 1;
    IF reps=1 THEN ivl:=1; status:='learning';
    ELSIF reps=2 THEN ivl:=6; status:='learning';
    ELSE ivl:=ROUND(interval_days*ef); status:='review';
    END IF;
  END IF;
  IF reps>10 THEN status:='graduated'; END IF;
  RETURN QUERY SELECT ivl, ef, reps, status;
END; $$;

-- Auto-updated timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at=NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS upd_profiles ON public.profiles;
CREATE TRIGGER upd_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS upd_documents ON public.documents;
CREATE TRIGGER upd_documents BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS upd_notes ON public.notes;
CREATE TRIGGER upd_notes BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS upd_canvases ON public.canvases;
CREATE TRIGGER upd_canvases BEFORE UPDATE ON public.canvases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS upd_spaces ON public.spaces;
CREATE TRIGGER upd_spaces BEFORE UPDATE ON public.spaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS upd_ai_conversations ON public.ai_conversations;
CREATE TRIGGER upd_ai_conversations BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
