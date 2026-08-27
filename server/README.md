# Student answer database (Neon + Vercel)

## 1. Create the tables in Neon

1. Open https://console.neon.tech and create a project.
2. Open **SQL Editor** and run these scripts in order:
   - [`server/sql/001_answer_attempts.sql`](sql/001_answer_attempts.sql) — answer log
   - [`server/sql/002_questions.sql`](sql/002_questions.sql) — question bank
   - [`server/sql/003_users.sql`](sql/003_users.sql) — user profiles
   - [`server/sql/004_participant_id_user_id.sql`](sql/004_participant_id_user_id.sql) — participant_id + answer_attempts.user_id
3. On the Project Dashboard, click **Connect** and copy the **pooled** connection string.

### Table overview

| Table | Purpose | Key |
|-------|---------|-----|
| `answer_attempts` | Append-only answer log | `id` |
| `questions` | All assessment/game items | `question_id` (e.g. `E-1-Q1`) |
| `users` | Player profile from login | `participant_id` (durable) + `session_id` (browser) |
| `users.id` → `answer_attempts.user_id` | Preferred analytics join | Stable Neon `user_id` from portal STEP 1 |

`answer_attempts.question_id` aligns with `questions.question_id`.  
`answer_attempts.user_id` aligns with `users.id` after portal login.  
`session_id` remains for backward compatibility. No foreign keys in v1 (keeps logging fire-and-forget).

### Seed questions into Neon

**Option A — Neon SQL Editor (recommended)**  
After `002_questions.sql`, run [`server/sql/002b_questions_seed.sql`](sql/002b_questions_seed.sql).  
It upserts all 18 items from `items.seed.json` (with provisional game keys when available).

**Option B — local script**  
Needs `DATABASE_URL` in `.env.local`:

```bash
npm install
node server/scripts/seed-questions.mjs
```

Regenerate the SQL dump after editing the seed JSON:

```bash
node server/scripts/generate-questions-seed-sql.mjs
```

The `users` table stays empty until login upsert is wired.

## 2. Configure Vercel

In the Vercel project → **Settings → Environment Variables**:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon pooled connection string |
| `ANSWERS_ADMIN_SECRET` | Long random secret for teacher export |

Redeploy after saving env vars.

## 3. Local API preview

Plain `npx serve` cannot run `/api`. Use:

```bash
npm install
npx vercel dev
```

Copy `.env.example` → `.env.local` (or set env in the Vercel CLI) with the same variables.

## 4. Client wiring

- Shared logger: `/js/answer-log.js`
- Passwordless user sync: `/js/user-log.js` → `POST /api/users` on character login confirm and companion confirm
- Writes on submit from: `collect`, `kahoot`, `parkour`, `race`, `monopoly`
- Gameplay never waits on the network; failures only `console.warn`

### Passwordless login (no password)

1. Park entrance `/portal/` (STEP 1): nickname + **Participant ID** + companion enum (`researcher` \| `explorer` \| `creator`) → `POST /api/users` by `participant_id` → returns stable `user_id` → redirect `/`.
2. Existing participant: same ID returns the same `users.id` (updates nickname / companion / last_seen).
3. Answer submits attach `user_id` via `js/answer-log.js` so `answer_attempts` joins to `users`.
4. Legacy `/nuannuan/login` still upserts by `session_id` (fire-and-forget).
5. Teacher list:

```bash
curl -H "x-admin-secret: YOUR_SECRET" \
  "https://YOUR_DOMAIN/api/users?limit=100"
```

## 5. Teacher export

```bash
curl -H "x-admin-secret: YOUR_SECRET" \
  "https://YOUR_DOMAIN/api/answers?limit=200&format=csv" \
  -o answers.csv
```

JSON:

```bash
curl -H "x-admin-secret: YOUR_SECRET" \
  "https://YOUR_DOMAIN/api/answers?game=collect&limit=100"
```
