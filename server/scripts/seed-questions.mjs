/**
 * Seed Neon `questions` from items.seed.json.
 * Merges provisional answer keys / explain from monopoly/questions.js when present.
 *
 * Usage:
 *   node server/scripts/seed-questions.mjs
 * Requires DATABASE_URL in the environment or .env.local
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../..");

function loadEnvLocal() {
  if (process.env.DATABASE_URL) return;
  try {
    const text = readFileSync(resolve(root, ".env.local"), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* optional file */
  }
}

function loadGameMeta(questionsJs) {
  const map = new Map();
  const parts = questionsJs.split(/\n\s*\{\s*\n\s*id:\s*/).slice(1);
  for (const part of parts) {
    const idM = part.match(/^"([^"]+)"/);
    if (!idM) continue;
    const id = idM[1];
    const answerM = part.match(/\n\s*answer:\s*(-?\d+)/);
    const answersM = part.match(/\n\s*answers:\s*(\[[^\]]*\])/);
    const explainM = part.match(/\n\s*explain:\s*"((?:\\.|[^"\\])*)"/);
    const answer_key = {};
    if (answerM) answer_key.answer = Number(answerM[1]);
    if (answersM) {
      try {
        answer_key.answers = JSON.parse(answersM[1]);
      } catch {
        /* ignore bad answers array */
      }
    }
    map.set(id, {
      answer_key: Object.keys(answer_key).length ? answer_key : null,
      explain: explainM ? JSON.parse(`"${explainM[1]}"`) : null,
    });
  }
  return map;
}

function buildPayload(item) {
  const payload = { ...item };
  delete payload.id;
  delete payload.domain;
  delete payload.type;
  delete payload.stem;
  return payload;
}

loadEnvLocal();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const seed = JSON.parse(readFileSync(resolve(root, "items.seed.json"), "utf8"));
const gameMeta = loadGameMeta(readFileSync(resolve(root, "monopoly/questions.js"), "utf8"));
const sql = neon(databaseUrl);

let upserted = 0;
for (const item of seed.items) {
  const meta = gameMeta.get(item.id) || {};
  const payload = buildPayload(item);
  const answerKeyJson = meta.answer_key ? JSON.stringify(meta.answer_key) : null;

  await sql`
    INSERT INTO questions (
      question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at
    ) VALUES (
      ${item.id},
      ${item.domain ?? null},
      ${item.type || "single"},
      ${item.stem},
      ${JSON.stringify(payload)}::jsonb,
      ${answerKeyJson}::jsonb,
      ${meta.explain ?? null},
      ${"items.seed"},
      ${true},
      NOW()
    )
    ON CONFLICT (question_id) DO UPDATE SET
      domain = EXCLUDED.domain,
      item_type = EXCLUDED.item_type,
      stem = EXCLUDED.stem,
      payload = EXCLUDED.payload,
      answer_key = EXCLUDED.answer_key,
      explain = EXCLUDED.explain,
      source = EXCLUDED.source,
      active = EXCLUDED.active,
      updated_at = NOW()
  `;
  upserted += 1;
}

const rows = await sql`
  SELECT question_id, domain, item_type,
         (answer_key IS NOT NULL) AS has_key
  FROM questions
  ORDER BY question_id
`;
console.log(JSON.stringify({ ok: true, upserted, questions_total: rows.length, ids: rows }, null, 2));
