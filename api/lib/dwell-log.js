/** Shared dwell_log insert + normalization for /api/dwell. */

const ALLOWED_GAMES = new Set(["collect", "parkour", "race", "monopoly", "kahoot"]);
const ALLOWED_SCOPES = new Set(["question", "game"]);

export function normalizeDwell(raw) {
  if (!raw || typeof raw !== "object") return null;
  const session_id = String(raw.session_id || "").trim().slice(0, 80);
  const game = String(raw.game || "").trim();
  const scope = String(raw.scope || "").trim();
  const dwell_ms = Number(raw.dwell_ms);
  if (!session_id || !ALLOWED_GAMES.has(game) || !ALLOWED_SCOPES.has(scope)) return null;
  if (!Number.isFinite(dwell_ms) || dwell_ms < 0) return null;

  const userIdRaw = raw.user_id;
  const user_id =
    userIdRaw == null || userIdRaw === "" ? null : Number(userIdRaw);

  return {
    session_id,
    user_id: Number.isFinite(user_id) && user_id > 0 ? Math.trunc(user_id) : null,
    participant_id:
      raw.participant_id != null ? String(raw.participant_id).trim().slice(0, 20) : null,
    display_name:
      raw.display_name != null ? String(raw.display_name).trim().slice(0, 64) : null,
    game,
    question_id:
      raw.question_id != null && String(raw.question_id).trim()
        ? String(raw.question_id).trim().slice(0, 80)
        : null,
    scope,
    dwell_ms: Math.trunc(dwell_ms),
    meta: raw.meta && typeof raw.meta === "object" && !Array.isArray(raw.meta)
      ? raw.meta
      : {},
  };
}

export async function insertDwellRecords(sql, records) {
  let inserted = 0;
  for (const row of records) {
    await sql`
      INSERT INTO dwell_log (
        session_id, user_id, participant_id, display_name,
        game, question_id, scope, dwell_ms, meta
      ) VALUES (
        ${row.session_id},
        ${row.user_id},
        ${row.participant_id},
        ${row.display_name},
        ${row.game},
        ${row.question_id},
        ${row.scope},
        ${row.dwell_ms},
        ${JSON.stringify(row.meta)}::jsonb
      )
    `;
    inserted += 1;
  }
  return inserted;
}

export function dwellCsv(rows) {
  const headers = [
    "id",
    "created_at",
    "session_id",
    "user_id",
    "participant_id",
    "display_name",
    "game",
    "question_id",
    "scope",
    "dwell_ms",
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
