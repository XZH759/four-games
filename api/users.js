import { neon } from "@neondatabase/serverless";

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

function normalizeUser(raw) {
  if (!raw || typeof raw !== "object") return null;
  const session_id = String(raw.session_id || "").trim().slice(0, 80);
  if (!session_id) return null;

  const display_name =
    raw.display_name != null ? String(raw.display_name).trim().slice(0, 64) : null;
  const character_id =
    raw.character_id != null ? String(raw.character_id).trim().slice(0, 64) : null;
  const role = raw.role != null ? String(raw.role).trim().slice(0, 64) : null;
  const gender = raw.gender != null ? String(raw.gender).trim().slice(0, 16) : null;
  const companion_id =
    raw.companion_id != null ? String(raw.companion_id).trim().slice(0, 64) : null;
  const profile =
    raw.profile && typeof raw.profile === "object" && !Array.isArray(raw.profile)
      ? raw.profile
      : {};

  return {
    session_id,
    display_name: display_name || null,
    character_id: character_id || null,
    role: role || null,
    gender: gender || null,
    companion_id: companion_id || null,
    profile,
  };
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
      const user = normalizeUser(body);
      if (!user) {
        json(res, 400, { ok: false, error: "session_id required" });
        return;
      }
      if (!user.display_name && !user.character_id && !user.role) {
        json(res, 400, { ok: false, error: "display_name or character profile required" });
        return;
      }

      const sql = getSql();
      const rows = await sql`
        INSERT INTO users (
          session_id, display_name, character_id, role, gender, companion_id, profile,
          updated_at, last_seen_at
        ) VALUES (
          ${user.session_id},
          ${user.display_name},
          ${user.character_id},
          ${user.role},
          ${user.gender},
          ${user.companion_id},
          ${JSON.stringify(user.profile)}::jsonb,
          NOW(),
          NOW()
        )
        ON CONFLICT (session_id) DO UPDATE SET
          display_name = COALESCE(EXCLUDED.display_name, users.display_name),
          character_id = COALESCE(EXCLUDED.character_id, users.character_id),
          role = COALESCE(EXCLUDED.role, users.role),
          gender = COALESCE(EXCLUDED.gender, users.gender),
          companion_id = COALESCE(EXCLUDED.companion_id, users.companion_id),
          profile = CASE
            WHEN EXCLUDED.profile = '{}'::jsonb THEN users.profile
            ELSE EXCLUDED.profile
          END,
          updated_at = NOW(),
          last_seen_at = NOW()
        RETURNING id, session_id, display_name, character_id, role, gender, companion_id, created_at, updated_at, last_seen_at
      `;

      json(res, 200, { ok: true, user: rows[0] || null });
      return;
    }

    if (req.method === "GET") {
      const url = new URL(req.url || "/", "http://localhost");
      const sessionId = String(url.searchParams.get("session_id") || "").trim().slice(0, 80);
      const secret = process.env.ANSWERS_ADMIN_SECRET || "";
      const provided = req.headers["x-admin-secret"];
      const sql = getSql();

      // Teacher export: admin secret required
      if (!sessionId) {
        if (!secret || provided !== secret) {
          json(res, 401, { ok: false, error: "unauthorized" });
          return;
        }
        const limit = Math.min(500, Math.max(1, Number(url.searchParams.get("limit")) || 100));
        const rows = await sql`
          SELECT id, session_id, display_name, character_id, role, gender, companion_id,
                 profile, created_at, updated_at, last_seen_at
          FROM users
          ORDER BY last_seen_at DESC
          LIMIT ${limit}
        `;
        json(res, 200, { ok: true, count: rows.length, rows });
        return;
      }

      // Self lookup by session_id (passwordless; no secret)
      const rows = await sql`
        SELECT id, session_id, display_name, character_id, role, gender, companion_id,
               created_at, updated_at, last_seen_at
        FROM users
        WHERE session_id = ${sessionId}
        LIMIT 1
      `;
      if (!rows.length) {
        json(res, 404, { ok: false, error: "not found" });
        return;
      }
      json(res, 200, { ok: true, user: rows[0] });
      return;
    }

    json(res, 405, { ok: false, error: "method not allowed" });
  } catch (err) {
    console.error("[api/users]", err);
    json(res, 500, { ok: false, error: "server error" });
  }
}
