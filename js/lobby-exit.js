/**
 * Ensures every game page has a discreet “back to lobby” control.
 * Safe to import multiple times / call repeatedly.
 */
import { t, onLangChange } from "/js/i18n.js";

const STYLE_HREF = "/js/lobby-exit.css?v=1";

function ensureStylesheet() {
  if (document.querySelector(`link[href="${STYLE_HREF}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = STYLE_HREF;
  document.head.appendChild(link);
}

function syncExit(el) {
  if (!el) return;
  el.textContent = t("common.exitLobby");
  const title = t("common.exitLobbyTitle");
  el.title = title;
  el.setAttribute("aria-label", title);
}

export function mountLobbyExit({ href = "/" } = {}) {
  ensureStylesheet();
  let el = document.querySelector("a.exit-quiet");
  if (!el) {
    el = document.createElement("a");
    el.className = "exit-quiet";
    document.body.appendChild(el);
    onLangChange(() => syncExit(el));
  }
  el.href = href;
  syncExit(el);
  return el;
}

// Auto-mount when loaded as a module on game pages
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => mountLobbyExit(), { once: true });
  } else {
    mountLobbyExit();
  }
}
