-- Run once in Neon SQL Editor after 005_event_log.sql
-- Per-game and per-question dwell time (milliseconds on screen / in session)

CREATE TABLE IF NOT EXISTS dwell_log (
  id              BIGSERIAL PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id      TEXT NOT NULL,
  user_id         BIGINT,
  participant_id  TEXT,
  display_name    TEXT,
  game            TEXT NOT NULL,
  question_id     TEXT,
  scope           TEXT NOT NULL CHECK (scope IN ('question', 'game')),
  dwell_ms        INTEGER NOT NULL CHECK (dwell_ms >= 0),
  meta            JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS dwell_log_created_at_idx
  ON dwell_log (created_at DESC);

CREATE INDEX IF NOT EXISTS dwell_log_game_idx
  ON dwell_log (game);

CREATE INDEX IF NOT EXISTS dwell_log_scope_idx
  ON dwell_log (scope);

CREATE INDEX IF NOT EXISTS dwell_log_session_id_idx
  ON dwell_log (session_id);

CREATE INDEX IF NOT EXISTS dwell_log_user_id_idx
  ON dwell_log (user_id);

CREATE INDEX IF NOT EXISTS dwell_log_game_question_idx
  ON dwell_log (game, question_id)
  WHERE question_id IS NOT NULL;

COMMENT ON TABLE dwell_log IS 'Question-level and whole-game dwell durations in milliseconds';
COMMENT ON COLUMN dwell_log.scope IS 'question = single item on screen; game = entire play session until unload';
COMMENT ON COLUMN dwell_log.question_id IS 'Null when scope = game';
