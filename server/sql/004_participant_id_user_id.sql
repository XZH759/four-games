-- Run once in Neon SQL Editor after 003_users.sql
-- STEP 1 login: participant_id as durable identity; answer_attempts.user_id link

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS participant_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS users_participant_id_uidx
  ON users (participant_id)
  WHERE participant_id IS NOT NULL;

COMMENT ON COLUMN users.participant_id IS
  'Experiment participant / student ID — durable identity for login (not session_id)';
COMMENT ON COLUMN users.companion_id IS
  'Independent companion enum: researcher | explorer | creator (not gender/role)';

ALTER TABLE answer_attempts
  ADD COLUMN IF NOT EXISTS user_id BIGINT;

CREATE INDEX IF NOT EXISTS answer_attempts_user_id_idx
  ON answer_attempts (user_id);

COMMENT ON COLUMN answer_attempts.user_id IS
  'users.id from portal login; preferred join key for experiment analytics';
