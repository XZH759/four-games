import { neon } from "@neondatabase/serverless";
import { dwellCsv, insertDwellRecords, normalizeDwell } from "./lib/dwell-log.js";

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
      const list = Array.isArray(body?.records)
        ? body.records
        : Array.isArray(body)
          ? body
          : [body];
      const records = list.map(normalizeDwell).filter(Boolean);
      if (!records.length) {
        json(res, 400, { ok: false, error: "no valid dwell records" });
        return;
      }
      if (records.length > 100) {
        json(res, 400, { ok: false, error: "too many records (max 100)" });
        return;
      }
      const sql = getSql();
      const inserted = await insertDwellRecords(sql, records);
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
      const limit = Math.min(2000, Math.max(1, Number(url.searchParams.get("limit")) || 200));
      const game = String(url.searchParams.get("game") || "").trim();
      const scope = String(url.searchParams.get("scope") || "").trim();
      const format = String(url.searchParams.get("format") || "").trim();
      const sql = getSql();

      let rows;
      if (game && scope) {
        rows = await sql`
          SELECT id, created_at, session_id, user_id, participant_id, display_name,
                 game, question_id, scope, dwell_ms, meta
          FROM dwell_log
          WHERE game = ${game} AND scope = ${scope}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;
      } else if (game) {
        rows = await sql`
          SELECT id, created_at, session_id, user_id, participant_id, display_name,
                 game, question_id, scope, dwell_ms, meta
          FROM dwell_log
          WHERE game = ${game}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;
      } else if (scope) {
        rows = await sql`
          SELECT id, created_at, session_id, user_id, participant_id, display_name,
                 game, question_id, scope, dwell_ms, meta
          FROM dwell_log
          WHERE scope = ${scope}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;
      } else {
        rows = await sql`
          SELECT id, created_at, session_id, user_id, participant_id, display_name,
                 game, question_id, scope, dwell_ms, meta
          FROM dwell_log
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;
      }

      if (format === "csv") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", 'attachment; filename="dwell_log.csv"');
        res.end(dwellCsv(rows));
        return;
      }
      json(res, 200, { ok: true, count: rows.length, rows });
      return;
    }

    json(res, 405, { ok: false, error: "method not allowed" });
  } catch (err) {
    console.error("[api/dwell]", err);
    json(res, 500, { ok: false, error: "server error" });
  }
}
