/**
 * Fire-and-forget student answer logger → POST /api/answers (Neon via Vercel).
 * Never blocks gameplay; failures are console-warned only.
 */

const SESSION_KEY = "ailit_session_id";
const LOGIN_KEY = "nn_login_avatar_v1";
const KAHOOT_PROFILE_KEY = "kahoot_profile";

function uuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getSessionId() {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return uuid();
  }
}

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

/** @param {{ nick?: string }=} opts */
export function getStudentContext(opts = {}) {
  const login = readJson(LOGIN_KEY) || {};
  const avatar = readJson("nn_avatar_v2") || {};
  const kahoot = readJson(KAHOOT_PROFILE_KEY) || {};
  const nick = opts.nick || kahoot.nick || kahoot.name || "";
  return {
    session_id: getSessionId(),
    student_name: String(nick || login.name || avatar.name || "").slice(0, 64) || null,
    character_id:
      login.character_id ||
      login.characterId ||
      avatar.characterId ||
      null,
    role: login.role || avatar.role || null,
  };
}

function buildAttempt(partial, ctx) {
  if (!partial || !partial.game || !partial.question_id || partial.answer === undefined) {
    return null;
  }
  return {
    session_id: ctx.session_id,
    student_name: partial.student_name ?? ctx.student_name,
    character_id: partial.character_id ?? ctx.character_id,
    role: partial.role ?? ctx.role,
    game: partial.game,
    question_id: String(partial.question_id),
    level_index: partial.level_index ?? null,
    answer: partial.answer,
    correct: partial.correct === true ? true : partial.correct === false ? false : null,
    latency_ms: partial.latency_ms ?? null,
    meta: partial.meta && typeof partial.meta === "object" ? partial.meta : {},
  };
}

/**
 * @param {object|object[]} payload
 * @param {{ nick?: string }=} opts
 */
export function logAnswers(payload, opts = {}) {
  const list = Array.isArray(payload) ? payload : [payload];
  const ctx = getStudentContext(opts);
  const attempts = list.map((item) => buildAttempt(item, ctx)).filter(Boolean);
  if (!attempts.length) return Promise.resolve({ ok: false, skipped: true });

  try {
    return fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attempts }),
      keepalive: true,
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.warn("[answer-log] POST failed", res.status, text);
        return { ok: false, status: res.status };
      }
      return res.json().catch(() => ({ ok: true }));
    }).catch((err) => {
      console.warn("[answer-log] network error", err);
      return { ok: false, error: String(err) };
    });
  } catch (err) {
    console.warn("[answer-log] threw", err);
    return Promise.resolve({ ok: false, error: String(err) });
  }
}

/** @param {object} payload */
export function logAnswer(payload, opts = {}) {
  return logAnswers([payload], opts);
}
