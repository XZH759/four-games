-- Run once in Neon SQL Editor (https://console.neon.tech)
-- Student answer attempts — append-only research log

CREATE TABLE IF NOT EXISTS answer_attempts (
  id            BIGSERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id    TEXT NOT NULL,
  student_name  TEXT,
  character_id  TEXT,
  role          TEXT,
  game          TEXT NOT NULL,
  question_id   TEXT NOT NULL,
  level_index   INTEGER,
  answer        JSONB NOT NULL,
  correct       BOOLEAN,
  latency_ms    INTEGER,
  meta          JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS answer_attempts_created_at_idx
  ON answer_attempts (created_at DESC);

CREATE INDEX IF NOT EXISTS answer_attempts_game_idx
  ON answer_attempts (game);

CREATE INDEX IF NOT EXISTS answer_attempts_session_idx
  ON answer_attempts (session_id);
