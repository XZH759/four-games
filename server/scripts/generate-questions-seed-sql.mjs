/**
 * Generate server/sql/002b_questions_seed.sql from items.seed.json
 * and provisional keys in monopoly/questions.js.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const seed = JSON.parse(readFileSync(resolve(root, "items.seed.json"), "utf8"));
const gameJs = readFileSync(resolve(root, "monopoly/questions.js"), "utf8");

const meta = new Map();
for (const part of gameJs.split(/\n\s*\{\s*\n\s*id:\s*/).slice(1)) {
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
      /* ignore */
    }
  }
  meta.set(id, {
    answer_key: Object.keys(answer_key).length ? answer_key : null,
    explain: explainM ? JSON.parse(`"${explainM[1]}"`) : null,
  });
}

function esc(s) {
  return String(s).replaceAll("'", "''");
}

function lit(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "object") return `'${esc(JSON.stringify(v))}'::jsonb`;
  return `'${esc(v)}'`;
}

const lines = [
  "-- Auto-generated from items.seed.json + monopoly/questions.js keys",
  "-- Run in Neon SQL Editor after 002_questions.sql",
  "BEGIN;",
  "",
];

for (const item of seed.items) {
  const m = meta.get(item.id) || {};
  const payload = { ...item };
  delete payload.id;
  delete payload.domain;
  delete payload.type;
  delete payload.stem;
  lines.push(
    "INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (",
  );
  lines.push(`  ${lit(item.id)},`);
  lines.push(`  ${lit(item.domain || null)},`);
  lines.push(`  ${lit(item.type || "single")},`);
  lines.push(`  ${lit(item.stem)},`);
  lines.push(`  ${lit(payload)},`);
  lines.push(`  ${lit(m.answer_key)},`);
  lines.push(`  ${lit(m.explain)},`);
  lines.push(`  'items.seed',`);
  lines.push(`  TRUE,`);
  lines.push(`  NOW()`);
  lines.push(`) ON CONFLICT (question_id) DO UPDATE SET`);
  lines.push(`  domain = EXCLUDED.domain,`);
  lines.push(`  item_type = EXCLUDED.item_type,`);
  lines.push(`  stem = EXCLUDED.stem,`);
  lines.push(`  payload = EXCLUDED.payload,`);
  lines.push(`  answer_key = EXCLUDED.answer_key,`);
  lines.push(`  explain = EXCLUDED.explain,`);
  lines.push(`  source = EXCLUDED.source,`);
  lines.push(`  active = EXCLUDED.active,`);
  lines.push(`  updated_at = NOW();`);
  lines.push("");
}

lines.push("COMMIT;");
lines.push("");
lines.push(
  "-- SELECT question_id, domain, item_type, (answer_key IS NOT NULL) AS has_key FROM questions ORDER BY question_id;",
);

const out = resolve(root, "server/sql/002b_questions_seed.sql");
writeFileSync(out, lines.join("\n"), "utf8");
console.log(JSON.stringify({ ok: true, rows: seed.items.length, out: "server/sql/002b_questions_seed.sql" }));
