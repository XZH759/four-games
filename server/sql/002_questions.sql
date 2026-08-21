-- Run once in Neon SQL Editor (https://console.neon.tech)
-- Master question bank (assessment + game items)

CREATE TABLE IF NOT EXISTS questions (
  question_id   TEXT PRIMARY KEY,
  domain        TEXT,
  item_type     TEXT NOT NULL DEFAULT 'single',
  stem          TEXT NOT NULL,
  -- Full item body: options / prompts / steps / table / cards / render hints
  payload       JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Provisional teaching keys for games only (nullable; not formal research answer keys)
  answer_key    JSONB,
  explain       TEXT,
  source        TEXT NOT NULL DEFAULT 'items.seed',
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS questions_domain_idx
  ON questions (domain);

CREATE INDEX IF NOT EXISTS questions_item_type_idx
  ON questions (item_type);

CREATE INDEX IF NOT EXISTS questions_active_idx
  ON questions (active)
  WHERE active = TRUE;

COMMENT ON TABLE questions IS 'Canonical question bank; question_id aligns with answer_attempts.question_id';
COMMENT ON COLUMN questions.answer_key IS 'Optional provisional game keys; formal collect arm may leave NULL';
