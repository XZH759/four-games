/** Shared event_log insert + normalization for /api/events and other handlers. */

const EVENT_TYPE_RE = /^[a-z][a-z0-9_.-]{0,63}$/i;

export function normalizeEventType(raw) {
  const value = String(raw || "").trim().slice(0, 64);
  return EVENT_TYPE_RE.test(value) ? value : null;
}

export function normalizeEvent(raw) {
  if (!raw || typeof raw !== "object") return null;
  const session_id = String(raw.session_id || "").trim().slice(0, 80);
  const event_type = normalizeEventType(raw.event_type);
  if (!session_id || !event_type) return null;

  const userIdRaw = raw.user_id;
  const user_id =
    userIdRaw == null || userIdRaw === ""
      ? null
      : Number(userIdRaw);

  return {
    session_id,
    user_id: Number.isFinite(user_id) && user_id > 0 ? Math.trunc(user_id) : null,
    participant_id:
      raw.participant_id != null ? String(raw.participant_id).trim().slice(0, 20) : null,
    display_name:
      raw.display_name != null ? String(raw.display_name).trim().slice(0, 64) : null,
    event_type,
    category: raw.category != null ? String(raw.category).trim().slice(0, 32) : null,
    page: raw.page != null ? String(raw.page).trim().slice(0, 512) : null,
    payload: raw.payload && typeof raw.payload === "object" && !Array.isArray(raw.payload)
      ? raw.payload
      : {},
  };
}

export async function insertEvents(sql, events) {
  let inserted = 0;
  for (const event of events) {
    await sql`
      INSERT INTO event_log (
        session_id, user_id, participant_id, display_name,
        event_type, category, page, payload
      ) VALUES (
        ${event.session_id},
        ${event.user_id},
        ${event.participant_id},
        ${event.display_name},
        ${event.event_type},
        ${event.category},
        ${event.page},
        ${JSON.stringify(event.payload)}::jsonb
      )
    `;
    inserted += 1;
  }
  return inserted;
}

export function eventCsv(rows) {
  const headers = [
    "id",
    "created_at",
    "session_id",
    "user_id",
    "participant_id",
    "display_name",
    "event_type",
    "category",
    "page",
    "payload",
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
