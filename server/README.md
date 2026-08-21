# Student answer database (Neon + Vercel)

## 1. Create the table in Neon

1. Open https://console.neon.tech and create a project.
2. Open **SQL Editor** and run [`server/sql/001_answer_attempts.sql`](sql/001_answer_attempts.sql).
3. On the Project Dashboard, click **Connect** and copy the **pooled** connection string.

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
- Writes on submit from: `collect`, `kahoot`, `parkour`, `race`, `monopoly`
- Gameplay never waits on the network; failures only `console.warn`

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
