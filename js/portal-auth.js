/**
 * Passwordless park entrance login (nickname + role, no password).
 */
import { STORAGE_KEY as CASTLE_WALLET_KEY } from "/castle/castle.js";

export const PORTAL_KEY = "ailit_portal_user_v1";
export const LOGIN_KEY = "nn_login_avatar_v1";

export const PORTAL_ROLES = [
  { id: "researcher", icon: "🔍", labelKey: "portal.role.researcher", descKey: "portal.role.researcherDesc" },
  { id: "explorer", icon: "🧭", labelKey: "portal.role.explorer", descKey: "portal.role.explorerDesc" },
  { id: "creator", icon: "💡", labelKey: "portal.role.creator", descKey: "portal.role.creatorDesc" },
];

export function validateNickname(name) {
  const n = String(name || "").trim();
  if (!n) return { ok: false, code: "empty" };
  if (n.length > 16) return { ok: false, code: "length" };
  return { ok: true, name: n };
}

export function loadPortalUser() {
  try {
    const raw = JSON.parse(localStorage.getItem(PORTAL_KEY) || "null");
    if (!raw || typeof raw !== "object") return null;
    if (!raw.display_name) return null;
    return {
      display_name: String(raw.display_name).slice(0, 64),
      role: raw.role || "explorer",
      guest: !!raw.guest,
      logged_in_at: raw.logged_in_at || null,
    };
  } catch {
    return null;
  }
}

export function savePortalUser(user) {
  const payload = {
    display_name: user.display_name,
    role: user.role || "explorer",
    guest: !!user.guest,
    logged_in_at: user.logged_in_at || Date.now(),
  };
  localStorage.setItem(PORTAL_KEY, JSON.stringify(payload));
  syncPortalToLegacy(payload);
  return payload;
}

export function isPortalLoggedIn() {
  return !!loadPortalUser()?.display_name;
}

/** Mirror portal profile into existing local keys used by games / lobby. */
export function syncPortalToLegacy(user) {
  if (!user?.display_name) return;
  const role = user.role || "explorer";
  const login = {
    schemaVersion: 2,
    name: user.display_name,
    role,
    characterId: `portal-${role}`,
    gender: "female",
    selection: null,
    themePack: null,
    portal: true,
    guest: !!user.guest,
  };
  localStorage.setItem(LOGIN_KEY, JSON.stringify(login));

  try {
    const raw = JSON.parse(localStorage.getItem(CASTLE_WALLET_KEY) || "{}");
    raw.name = user.display_name;
    localStorage.setItem(CASTLE_WALLET_KEY, JSON.stringify(raw));
  } catch {
    /* wallet optional */
  }
}

export function guestNickname(lang = "zh") {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return lang === "en" ? `Guest ${n}` : `游客${n}`;
}

export function roleLabelKey(roleId) {
  return PORTAL_ROLES.find((r) => r.id === roleId)?.labelKey || "portal.role.explorer";
}
