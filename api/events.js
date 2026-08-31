import { neon } from "@neondatabase/serverless";
import { eventCsv, insertEvents, normalizeEvent } from "./lib/event-log.js";

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
      const list = Array.isArray(body?.events)
        ? body.events
        : Array.isArray(body)
          ? body
          : [body];
      const events = list.map(normalizeEvent).filter(Boolean);
      if (!events.length) {
        json(res, 400, { ok: false, error: "no valid events" });
        return;
      }
      if (events.length > 100) {
        json(res, 400, { ok: false, error: "too many events (max 100)" });
        return;
      }
      const sql = getSql();
      const inserted = await insertEvents(sql, events);
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
      const limit = Math.min(1000, Math.max(1, Number(url.searchParams.get("limit")) || 100));
      const eventType = String(url.searchParams.get("event_type") || "").trim();
      const category = String(url.searchParams.get("category") || "").trim();
      const format = String(url.searchParams.get("format") || "").trim();
      const sql = getSql();

      let rows;
      if (eventType && category) {
        rows = await sql`
          SELECT id, created_at, session_id, user_id, participant_id, display_name,
                 event_type, category, page, payload
          FROM event_log
          WHERE event_type = ${eventType} AND category = ${category}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;
      } else if (eventType) {
        rows = await sql`
          SELECT id, created_at, session_id, user_id, participant_id, display_name,
                 event_type, category, page, payload
          FROM event_log
          WHERE event_type = ${eventType}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;
      } else if (category) {
        rows = await sql`
          SELECT id, created_at, session_id, user_id, participant_id, display_name,
                 event_type, category, page, payload
          FROM event_log
          WHERE category = ${category}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;
      } else {
        rows = await sql`
          SELECT id, created_at, session_id, user_id, participant_id, display_name,
                 event_type, category, page, payload
          FROM event_log
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;
      }

      if (format === "csv") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", 'attachment; filename="event_log.csv"');
        res.end(eventCsv(rows));
        return;
      }
      json(res, 200, { ok: true, count: rows.length, rows });
      return;
    }

    json(res, 405, { ok: false, error: "method not allowed" });
  } catch (err) {
    console.error("[api/events]", err);
    json(res, 500, { ok: false, error: "server error" });
  }
}
