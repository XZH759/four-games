/**
 * User profile sync → POST /api/users (Neon).
 * Portal STEP 1 awaits response for stable user_id.
 * Legacy nuannuan flows remain fire-and-forget.
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
    overrides.companion ??
    overrides.companion_id ??
    login.companion ??
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
  const participant_id =
    overrides.participant_id ?? login.participant_id ?? null;

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
    participant_id: participant_id ? String(participant_id).slice(0, 20) : null,
    display_name: display_name || null,
    nickname: display_name || null,
    character_id: character_id ? String(character_id).slice(0, 64) : null,
    role: role ? String(role).slice(0, 64) : null,
    gender: gender ? String(gender).slice(0, 16) : null,
    companion: companionId ? String(companionId).slice(0, 64) : null,
    companion_id: companionId ? String(companionId).slice(0, 64) : null,
    profile,
  };
}

async function postUsers(body) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || `POST /api/users failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Portal STEP 1 login — must succeed and return user_id.
 * @param {{ display_name: string, participant_id: string, companion: string, profile?: object }} payload
 */
export async function loginPortalUser(payload) {
  const body = {
    session_id: getSessionId(),
    participant_id: String(payload.participant_id || "").trim().slice(0, 20),
    display_name: String(payload.display_name || "").trim().slice(0, 20),
    nickname: String(payload.display_name || "").trim().slice(0, 20),
    companion: String(payload.companion || "").trim().toLowerCase(),
    profile: {
      portal: true,
      ...(payload.profile && typeof payload.profile === "object"
        ? payload.profile
        : {}),
    },
  };
  const data = await postUsers(body);
  const user = data.user || {};
  const user_id = Number(data.user_id ?? user.user_id ?? user.id);
  if (!Number.isFinite(user_id) || user_id <= 0) {
    throw new Error("server did not return user_id");
  }
  return {
    ok: true,
    created: !!data.created,
    user_id: Math.trunc(user_id),
    user: {
      user_id: Math.trunc(user_id),
      participant_id: user.participant_id || body.participant_id,
      display_name: user.display_name || body.display_name,
      companion: user.companion || user.companion_id || body.companion,
      profile:
        user.profile && typeof user.profile === "object"
          ? user.profile
          : body.profile,
    },
  };
}

/**
 * Upsert current browser session into Neon `users` (legacy / fire-and-forget).
 * @param {object=} overrides
 */
export function upsertUser(overrides = {}) {
  const body = buildUserPayload(overrides);
  if (!body.session_id) {
    return Promise.resolve({ ok: false, skipped: true });
  }
  if (
    !body.participant_id &&
    !body.display_name &&
    !body.character_id &&
    !body.role
  ) {
    return Promise.resolve({ ok: false, skipped: true });
  }

  try {
    return postUsers(body)
      .then((data) => ({ ok: true, ...data }))
      .catch((err) => {
        console.warn("[user-log] network error", err);
        return { ok: false, error: String(err) };
      });
  } catch (err) {
    console.warn("[user-log] threw", err);
    return Promise.resolve({ ok: false, error: String(err) });
  }
}
