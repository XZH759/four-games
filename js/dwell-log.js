/**
 * Dwell time logger → POST /api/dwell (Neon via Vercel).
 * Tracks per-question and whole-game session duration in milliseconds.
 */
import { getStudentContext } from "/js/answer-log.js";
import { loadPortalUser } from "/js/portal-auth.js";
import { logEvent } from "/js/event-log.js";

function buildRecord(game, scope, questionId, dwellMs, meta = {}) {
  const ctx = getStudentContext();
  const portal = loadPortalUser();
  return {
    session_id: ctx.session_id,
    user_id: ctx.user_id,
    participant_id: portal?.participant_id || null,
    display_name: ctx.student_name,
    game,
    question_id: questionId || null,
    scope,
    dwell_ms: Math.max(0, Math.round(dwellMs)),
    meta,
  };
}

async function postDwell(records) {
  const res = await fetch("/api/dwell", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ records }),
    keepalive: true,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST /api/dwell ${res.status} ${text}`.trim());
  }
  return res.json().catch(() => ({ ok: true }));
}

function mirrorEvent(scope, game, questionId, dwellMs, meta) {
  void logEvent({
    event_type: scope === "game" ? "game.session_dwell" : "game.question_dwell",
    category: "game",
    payload: {
      game,
      question_id: questionId || null,
      scope,
      dwell_ms: Math.max(0, Math.round(dwellMs)),
      ...meta,
    },
  });
}

/**
 * @param {string} game collect | parkour | race | monopoly | kahoot
 */
export function createDwellTracker(game) {
  const gameStartedAt = performance.now();
  let questionStartedAt = null;
  let currentQuestionId = null;
  let gameEnded = false;

  function flushQuestion(questionId, meta = {}) {
    const id = String(questionId ?? currentQuestionId ?? "").trim();
    if (!id || questionStartedAt == null) return null;
    const dwellMs = performance.now() - questionStartedAt;
    questionStartedAt = null;
    currentQuestionId = null;
    const record = buildRecord(game, "question", id, dwellMs, meta);
    void postDwell([record]).catch((err) => console.warn("[dwell-log]", err));
    mirrorEvent("question", game, id, dwellMs, meta);
    return Math.round(dwellMs);
  }

  function endGame(meta = {}) {
    if (gameEnded) return null;
    gameEnded = true;
    if (questionStartedAt != null) {
      flushQuestion(currentQuestionId, { ...meta, autoClose: true });
    }
    const dwellMs = performance.now() - gameStartedAt;
    const record = buildRecord(game, "game", null, dwellMs, meta);
    void postDwell([record]).catch((err) => console.warn("[dwell-log]", err));
    mirrorEvent("game", game, null, dwellMs, meta);
    return Math.round(dwellMs);
  }

  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", () => endGame({ reason: "pagehide" }), { once: true });
  }

  return {
    beginQuestion(questionId, meta = {}) {
      if (questionStartedAt != null && currentQuestionId) {
        flushQuestion(currentQuestionId, { ...meta, replaced: true });
      }
      currentQuestionId = String(questionId);
      questionStartedAt = performance.now();
      return currentQuestionId;
    },
    endQuestion(questionId, meta = {}) {
      return flushQuestion(questionId, meta);
    },
    questionDwellMs() {
      if (questionStartedAt == null) return null;
      return Math.round(performance.now() - questionStartedAt);
    },
    endGame,
  };
}

/** @param {object|object[]} payload */
export function logDwell(payload) {
  const list = Array.isArray(payload) ? payload : [payload];
  const records = list
    .map((item) => normalizeClientRecord(item))
    .filter(Boolean);
  if (!records.length) return Promise.resolve({ ok: false, skipped: true });
  return postDwell(records).catch((err) => {
    console.warn("[dwell-log]", err);
    return { ok: false, error: String(err) };
  });
}

function normalizeClientRecord(raw) {
  if (!raw?.game || !raw?.scope) return null;
  const dwellMs = Number(raw.dwell_ms);
  if (!Number.isFinite(dwellMs) || dwellMs < 0) return null;
  const ctx = getStudentContext();
  const portal = loadPortalUser();
  return {
    session_id: raw.session_id ?? ctx.session_id,
    user_id: raw.user_id ?? ctx.user_id,
    participant_id: raw.participant_id ?? portal?.participant_id ?? null,
    display_name: raw.display_name ?? ctx.student_name,
    game: raw.game,
    question_id: raw.question_id ?? null,
    scope: raw.scope,
    dwell_ms: Math.trunc(dwellMs),
    meta: raw.meta && typeof raw.meta === "object" ? raw.meta : {},
  };
}
