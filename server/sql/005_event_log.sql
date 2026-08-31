-- Run once in Neon SQL Editor after 004_participant_id_user_id.sql
-- Append-only audit / analytics log for all app events (navigation, login, fashion journey, etc.)

CREATE TABLE IF NOT EXISTS event_log (
  id              BIGSERIAL PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id      TEXT NOT NULL,
  user_id         BIGINT,
  participant_id  TEXT,
  display_name    TEXT,
  event_type      TEXT NOT NULL,
  category        TEXT,
  page            TEXT,
  payload         JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS event_log_created_at_idx
  ON event_log (created_at DESC);

CREATE INDEX IF NOT EXISTS event_log_event_type_idx
  ON event_log (event_type);

CREATE INDEX IF NOT EXISTS event_log_session_id_idx
  ON event_log (session_id);

CREATE INDEX IF NOT EXISTS event_log_user_id_idx
  ON event_log (user_id);

CREATE INDEX IF NOT EXISTS event_log_participant_id_idx
  ON event_log (participant_id)
  WHERE participant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS event_log_category_idx
  ON event_log (category);

COMMENT ON TABLE event_log IS 'Append-only client/server event stream for experiment analytics';
COMMENT ON COLUMN event_log.event_type IS 'Dot-separated type, e.g. portal.login, fashion.module_unlock, page.view';
COMMENT ON COLUMN event_log.category IS 'Coarse grouping: portal, fashion, collect, lobby, game, system';
COMMENT ON COLUMN event_log.page IS 'Path + query at event time, e.g. /portal/ or /collect?level=1';
