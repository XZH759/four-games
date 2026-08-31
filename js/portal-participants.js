/**
 * Allowed participant_id list for portal STEP 1 login.
 * Source of truth: /data/participant-ids.json
 */
const LIST_URL = "/data/participant-ids.json";

let cachedIds = null;

export async function loadParticipantIds() {
  if (cachedIds) return cachedIds;
  const res = await fetch(LIST_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`participant list (${res.status})`);
  const data = await res.json();
  const ids = Array.isArray(data?.ids)
    ? data.ids.map((id) => String(id).trim()).filter(Boolean)
    : [];
  if (!ids.length) throw new Error("participant list empty");
  cachedIds = ids;
  return cachedIds;
}

export function validateParticipantInList(id, allowedIds) {
  const value = String(id || "").trim();
  if (!value) return { ok: false, code: "pidEmpty" };
  if (!Array.isArray(allowedIds) || !allowedIds.includes(value)) {
    return { ok: false, code: "pidInvalid" };
  }
  return { ok: true, id: value };
}
