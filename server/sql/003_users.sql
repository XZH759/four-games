-- Run once in Neon SQL Editor (https://console.neon.tech)
-- Player / student profiles (self-reported login; no password auth in v1)

CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL PRIMARY KEY,
  -- Durable browser session id (ailit_session_id); one row per client session
  session_id      TEXT NOT NULL UNIQUE,
  display_name    TEXT,
  character_id    TEXT,
  role            TEXT,
  gender          TEXT,
  companion_id    TEXT,
  -- Extra login / avatar fields (theme, accessories, etc.)
  profile         JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_display_name_idx
  ON users (display_name);

CREATE INDEX IF NOT EXISTS users_character_id_idx
  ON users (character_id);

CREATE INDEX IF NOT EXISTS users_last_seen_at_idx
  ON users (last_seen_at DESC);

COMMENT ON TABLE users IS 'Self-reported player profiles keyed by client session_id';
COMMENT ON COLUMN users.session_id IS 'Matches answer_attempts.session_id for join/analytics';
