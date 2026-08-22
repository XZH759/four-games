/**
 * Passwordless user profile sync → POST /api/users (Neon).
 * Fire-and-forget; never blocks login / partner flow.
 */
import { getSessionId } from "/js/answer-log.js";

const LOGIN_KEY = "nn_login_avatar_v1";
const AVATAR_KEY = "nn_avatar_v2";
const COMPANION_KEY = "nn_companion_v1";

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

/** Build payload from local login + optional overrides. */
export function buildUserPayload(overrides = {}) {
  const login = readJson(LOGIN_KEY) || {};
  const avatar = readJson(AVATAR_KEY) || {};
  const companionId =
    overrides.companion_id ??
    localStorage.getItem(COMPANION_KEY) ??
    null;

  const display_name = String(
    overrides.display_name ?? login.name ?? avatar.name ?? "",
  )
    .trim()
    .slice(0, 64);

  const character_id =
    overrides.character_id ??
    login.characterId ??
    avatar.characterId ??
    null;

  const role = overrides.role ?? login.role ?? avatar.role ?? null;
  const gender = overrides.gender ?? login.gender ?? avatar.gender ?? null;

  const profile = {
    schemaVersion: login.schemaVersion || avatar.schemaVersion || 2,
    referenceSheet: login.referenceSheet ?? avatar.referenceSheet ?? null,
    themePack: login.themePack ?? avatar.themePack ?? null,
    ...(overrides.profile && typeof overrides.profile === "object"
      ? overrides.profile
      : {}),
  };

  return {
    session_id: getSessionId(),
    display_name: display_name || null,
    character_id: character_id ? String(character_id).slice(0, 64) : null,
    role: role ? String(role).slice(0, 64) : null,
    gender: gender ? String(gender).slice(0, 16) : null,
    companion_id: companionId ? String(companionId).slice(0, 64) : null,
    profile,
  };
}

/**
 * Upsert current browser session into Neon `users`.
 * @param {object=} overrides
 */
export function upsertUser(overrides = {}) {
  const body = buildUserPayload(overrides);
  if (!body.session_id) {
    return Promise.resolve({ ok: false, skipped: true });
  }
  if (!body.display_name && !body.character_id && !body.role) {
    return Promise.resolve({ ok: false, skipped: true });
  }

  try {
    return fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.warn("[user-log] POST failed", res.status, text);
          return { ok: false, status: res.status };
        }
        return res.json().catch(() => ({ ok: true }));
      })
      .catch((err) => {
        console.warn("[user-log] network error", err);
        return { ok: false, error: String(err) };
      });
  } catch (err) {
    console.warn("[user-log] threw", err);
    return Promise.resolve({ ok: false, error: String(err) });
  }
}
