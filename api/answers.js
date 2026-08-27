import { neon } from "@neondatabase/serverless";

const ALLOWED_GAMES = new Set(["collect", "parkour", "race", "monopoly", "kahoot"]);

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

function normalizeAttempt(raw) {
  if (!raw || typeof raw !== "object") return null;
  const session_id = String(raw.session_id || "").trim();
  const game = String(raw.game || "").trim();
  const question_id = String(raw.question_id || "").trim();
  if (!session_id || !question_id || !ALLOWED_GAMES.has(game)) return null;
  if (raw.answer === undefined) return null;

  const level =
    raw.level_index == null || raw.level_index === ""
      ? null
      : Number(raw.level_index);
  const latency =
    raw.latency_ms == null || raw.latency_ms === ""
      ? null
      : Number(raw.latency_ms);

  const userIdRaw = raw.user_id;
  const user_id =
    userIdRaw == null || userIdRaw === ""
      ? null
      : Number(userIdRaw);

  return {
    session_id: session_id.slice(0, 80),
    user_id: Number.isFinite(user_id) && user_id > 0 ? Math.trunc(user_id) : null,
    student_name: raw.student_name != null ? String(raw.student_name).slice(0, 64) : null,
    character_id: raw.character_id != null ? String(raw.character_id).slice(0, 64) : null,
    role: raw.role != null ? String(raw.role).slice(0, 64) : null,
    game,
    question_id: question_id.slice(0, 80),
    level_index: Number.isFinite(level) ? Math.trunc(level) : null,
    answer: raw.answer,
    correct:
      raw.correct === true ? true : raw.correct === false ? false : null,
    latency_ms: Number.isFinite(latency) ? Math.trunc(latency) : null,
    meta: raw.meta && typeof raw.meta === "object" ? raw.meta : {},
  };
}

async function insertAttempts(sql, attempts) {
  let inserted = 0;
  for (const a of attempts) {
    await sql`
      INSERT INTO answer_attempts (
        session_id, user_id, student_name, character_id, role,
        game, question_id, level_index, answer, correct, latency_ms, meta
      ) VALUES (
        ${a.session_id},
        ${a.user_id},
        ${a.student_name},
        ${a.character_id},
        ${a.role},
        ${a.game},
        ${a.question_id},
        ${a.level_index},
        ${JSON.stringify(a.answer)}::jsonb,
        ${a.correct},
        ${a.latency_ms},
        ${JSON.stringify(a.meta)}::jsonb
      )
    `;
    inserted += 1;
  }
  return inserted;
}

function toCsv(rows) {
  const headers = [
    "id",
    "created_at",
    "session_id",
    "user_id",
    "student_name",
    "character_id",
    "role",
    "game",
    "question_id",
    "level_index",
    "answer",
    "correct",
    "latency_ms",
    "meta",
  ];
  const escape = (v) => {
    if (v == null) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return `"${s.replaceAll('"', '""')}"`;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (req.method === "POST") {
      const body = await readBody(req);
      const list = Array.isArray(body?.attempts)
        ? body.attempts
        : Array.isArray(body)
          ? body
          : [body];
      const attempts = list.map(normalizeAttempt).filter(Boolean);
      if (!attempts.length) {
        json(res, 400, { ok: false, error: "no valid attempts" });
        return;
      }
      if (attempts.length > 50) {
        json(res, 400, { ok: false, error: "too many attempts (max 50)" });
        return;
      }
      const sql = getSql();
      const inserted = await insertAttempts(sql, attempts);
      json(res, 201, { ok: true, inserted });
      return;
    }

    if (req.method === "GET") {
      const secret = process.env.ANSWERS_ADMIN_SECRET || "";
      const provided = req.headers["x-admin-secret"];
      if (!secret || provided !== secret) {
        json(res, 401, { ok: false, error: "unauthorized" });
        return;
      }
      const url = new URL(req.url || "/", "http://localhost");
      const limit = Math.min(500, Math.max(1, Number(url.searchParams.get("limit")) || 100));
      const game = String(url.searchParams.get("game") || "").trim();
      const format = String(url.searchParams.get("format") || "").trim();
      const sql = getSql();

      const rows = game && ALLOWED_GAMES.has(game)
        ? await sql`
            SELECT id, created_at, session_id, user_id, student_name, character_id, role,
                   game, question_id, level_index, answer, correct, latency_ms, meta
            FROM answer_attempts
            WHERE game = ${game}
            ORDER BY created_at DESC
            LIMIT ${limit}
          `
        : await sql`
            SELECT id, created_at, session_id, user_id, student_name, character_id, role,
                   game, question_id, level_index, answer, correct, latency_ms, meta
            FROM answer_attempts
            ORDER BY created_at DESC
            LIMIT ${limit}
          `;

      if (format === "csv") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", 'attachment; filename="answer_attempts.csv"');
        res.end(toCsv(rows));
        return;
      }
      json(res, 200, { ok: true, count: rows.length, rows });
      return;
    }

    json(res, 405, { ok: false, error: "method not allowed" });
  } catch (err) {
    console.error("[api/answers]", err);
    json(res, 500, { ok: false, error: "server error" });
  }
}
