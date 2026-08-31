/**
 * Fire-and-forget app event logger → POST /api/events (Neon via Vercel).
 * Never blocks UI; failures are console-warned only.
 */
import { getStudentContext } from "/js/answer-log.js";
import { loadPortalUser } from "/js/portal-auth.js";

function currentPage() {
  if (typeof location === "undefined") return null;
  return `${location.pathname || ""}${location.search || ""}`.slice(0, 512) || null;
}

function categoryFromType(eventType) {
  const head = String(eventType || "").split(".")[0];
  return head || "app";
}

function buildEvent(partial) {
  if (!partial?.event_type) return null;
  const ctx = getStudentContext();
  const portal = loadPortalUser();
  return {
    session_id: partial.session_id ?? ctx.session_id,
    user_id: partial.user_id ?? ctx.user_id,
    participant_id: partial.participant_id ?? portal?.participant_id ?? null,
    display_name: partial.display_name ?? ctx.student_name,
    event_type: String(partial.event_type),
    category: partial.category || categoryFromType(partial.event_type),
    page: partial.page ?? currentPage(),
    payload: partial.payload && typeof partial.payload === "object" ? partial.payload : {},
  };
}

async function postEvents(events) {
  const res = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events }),
    keepalive: true,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST /api/events ${res.status} ${text}`.trim());
  }
  return res.json().catch(() => ({ ok: true }));
}

/**
 * @param {object|object[]} payload
 */
export function logEvents(payload) {
  const list = Array.isArray(payload) ? payload : [payload];
  const events = list.map((item) => buildEvent(item)).filter(Boolean);
  if (!events.length) return Promise.resolve({ ok: false, skipped: true });

  try {
    return postEvents(events)
      .catch((err) => {
        console.warn("[event-log] network error", err);
        return { ok: false, error: String(err) };
      });
  } catch (err) {
    console.warn("[event-log] threw", err);
    return Promise.resolve({ ok: false, error: String(err) });
  }
}

/** @param {object} payload */
export function logEvent(payload) {
  return logEvents([payload]);
}

/** Record a page view once per full navigation. */
export function trackPageView(extra = {}) {
  return logEvent({
    event_type: "page.view",
    category: "navigation",
    payload: {
      title: typeof document !== "undefined" ? document.title : null,
      ...extra,
    },
  });
}
