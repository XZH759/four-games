import { neon } from "@neondatabase/serverless";

const COMPANIONS = new Set(["researcher", "explorer", "creator"]);

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

function publicUser(row) {
  if (!row) return null;
  return {
    user_id: row.id,
    id: row.id,
    participant_id: row.participant_id || null,
    session_id: row.session_id || null,
    display_name: row.display_name || null,
    companion: row.companion_id || null,
    companion_id: row.companion_id || null,
    profile:
      row.profile && typeof row.profile === "object" ? row.profile : {},
    character_id: row.character_id || null,
    role: row.role || null,
    gender: row.gender || null,
    created: row.created === true,
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
    last_seen_at: row.last_seen_at || null,
  };
}

function normalizeCompanion(raw) {
  const value = String(raw || "").trim().toLowerCase();
  return COMPANIONS.has(value) ? value : null;
}

function normalizeParticipantId(raw) {
  const id = String(raw || "").trim().slice(0, 20);
  return id || null;
}

/**
 * Legacy session upsert (nuannuan login / partner) — keeps old clients working.
 * Does not invent participant_id.
 */
function normalizeLegacyUser(raw) {
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
    normalizeCompanion(raw.companion ?? raw.companion_id) ||
    (raw.companion_id != null ? String(raw.companion_id).trim().slice(0, 64) : null);
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

/**
 * Portal STEP 1: identify / create by participant_id.
 * companion is an independent enum (researcher|explorer|creator).
 */
function normalizePortalLogin(raw) {
  if (!raw || typeof raw !== "object") return null;
  const participant_id = normalizeParticipantId(raw.participant_id);
  if (!participant_id) return null;

  const display_name = String(
    raw.display_name ?? raw.nickname ?? "",
  )
    .trim()
    .slice(0, 20);
  if (!display_name) return null;

  const companion = normalizeCompanion(raw.companion ?? raw.companion_id);
  if (!companion) return null;

  const session_id = String(raw.session_id || "").trim().slice(0, 80) || null;
  const profile =
    raw.profile && typeof raw.profile === "object" && !Array.isArray(raw.profile)
      ? raw.profile
      : {};

  return {
    participant_id,
    display_name,
    companion,
    session_id,
    profile: { ...profile, portal_step1: true },
  };
}

async function loginByParticipant(sql, login) {
  // Free session_id uniqueness if another row currently owns this browser session.
  if (login.session_id) {
    await sql`
      UPDATE users
      SET session_id = 'retired-' || id::text || '-' || EXTRACT(EPOCH FROM NOW())::bigint::text
      WHERE session_id = ${login.session_id}
        AND (participant_id IS DISTINCT FROM ${login.participant_id})
    `;
  }

  const existing = await sql`
    SELECT id, session_id, participant_id, display_name, character_id, role, gender,
           companion_id, profile, created_at, updated_at, last_seen_at
    FROM users
    WHERE participant_id = ${login.participant_id}
    LIMIT 1
  `;

  if (existing.length) {
    const rows = await sql`
      UPDATE users SET
        display_name = ${login.display_name},
        companion_id = ${login.companion},
        session_id = COALESCE(${login.session_id}, users.session_id),
        profile = CASE
          WHEN ${JSON.stringify(login.profile)}::jsonb = '{}'::jsonb THEN users.profile
          ELSE users.profile || ${JSON.stringify(login.profile)}::jsonb
        END,
        updated_at = NOW(),
        last_seen_at = NOW()
      WHERE participant_id = ${login.participant_id}
      RETURNING id, session_id, participant_id, display_name, character_id, role, gender,
                companion_id, profile, created_at, updated_at, last_seen_at
    `;
    return { ...rows[0], created: false };
  }

  // New participant — need a unique session_id
  const session_id =
    login.session_id ||
    `pid-${login.participant_id}-${Date.now().toString(36)}`;

  const rows = await sql`
    INSERT INTO users (
      session_id, participant_id, display_name, companion_id, profile,
      updated_at, last_seen_at
    ) VALUES (
      ${session_id},
      ${login.participant_id},
      ${login.display_name},
      ${login.companion},
      ${JSON.stringify(login.profile)}::jsonb,
      NOW(),
      NOW()
    )
    RETURNING id, session_id, participant_id, display_name, character_id, role, gender,
              companion_id, profile, created_at, updated_at, last_seen_at
  `;
  return { ...rows[0], created: true };
}

async function upsertBySession(sql, user) {
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
    RETURNING id, session_id, participant_id, display_name, character_id, role, gender,
              companion_id, profile, created_at, updated_at, last_seen_at
  `;
  return { ...rows[0], created: false };
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
      const sql = getSql();

      // Prefer portal STEP 1 path when participant_id is present
      const portalLogin = normalizePortalLogin(body);
      if (portalLogin) {
        const row = await loginByParticipant(sql, portalLogin);
        json(res, 200, {
          ok: true,
          created: !!row.created,
          user_id: row.id,
          user: publicUser(row),
        });
        return;
      }

      // Legacy session-based upsert (nuannuan flows)
      const legacy = normalizeLegacyUser(body);
      if (!legacy) {
        json(res, 400, {
          ok: false,
          error: "participant_id + display_name + companion, or session_id required",
        });
        return;
      }
      if (!legacy.display_name && !legacy.character_id && !legacy.role) {
        json(res, 400, { ok: false, error: "display_name or character profile required" });
        return;
      }

      const row = await upsertBySession(sql, legacy);
      json(res, 200, {
        ok: true,
        created: false,
        user_id: row.id,
        user: publicUser(row),
      });
      return;
    }

    if (req.method === "GET") {
      const url = new URL(req.url || "/", "http://localhost");
      const sessionId = String(url.searchParams.get("session_id") || "").trim().slice(0, 80);
      const participantId = normalizeParticipantId(url.searchParams.get("participant_id"));
      const secret = process.env.ANSWERS_ADMIN_SECRET || "";
      const provided = req.headers["x-admin-secret"];
      const sql = getSql();

      if (participantId) {
        const rows = await sql`
          SELECT id, session_id, participant_id, display_name, character_id, role, gender,
                 companion_id, profile, created_at, updated_at, last_seen_at
          FROM users
          WHERE participant_id = ${participantId}
          LIMIT 1
        `;
        if (!rows.length) {
          json(res, 404, { ok: false, error: "not found" });
          return;
        }
        json(res, 200, { ok: true, user_id: rows[0].id, user: publicUser(rows[0]) });
        return;
      }

      // Teacher export: admin secret required
      if (!sessionId) {
        if (!secret || provided !== secret) {
          json(res, 401, { ok: false, error: "unauthorized" });
          return;
        }
        const limit = Math.min(500, Math.max(1, Number(url.searchParams.get("limit")) || 100));
        const rows = await sql`
          SELECT id, session_id, participant_id, display_name, character_id, role, gender,
                 companion_id, profile, created_at, updated_at, last_seen_at
          FROM users
          ORDER BY last_seen_at DESC
          LIMIT ${limit}
        `;
        json(res, 200, {
          ok: true,
          count: rows.length,
          rows: rows.map((r) => ({ ...r, user_id: r.id })),
        });
        return;
      }

      // Self lookup by session_id (passwordless; no secret)
      const rows = await sql`
        SELECT id, session_id, participant_id, display_name, character_id, role, gender,
               companion_id, profile, created_at, updated_at, last_seen_at
        FROM users
        WHERE session_id = ${sessionId}
        LIMIT 1
      `;
      if (!rows.length) {
        json(res, 404, { ok: false, error: "not found" });
        return;
      }
      json(res, 200, { ok: true, user_id: rows[0].id, user: publicUser(rows[0]) });
      return;
    }

    json(res, 405, { ok: false, error: "method not allowed" });
  } catch (err) {
    console.error("[api/users]", err);
    json(res, 500, { ok: false, error: "server error", detail: String(err?.message || err) });
  }
}
