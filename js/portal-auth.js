/**
 * Park entrance STEP 1 auth (nickname + participant_id + companion).
 * companion is an independent enum — not gender/role/character_id.
 */
export const PORTAL_KEY = "ailit_portal_user_v1";
export const LOGIN_KEY = "nn_login_avatar_v1";
export const USER_ID_KEY = "ailit_user_id";
export const ONBOARDING_KEY = "awp_onboarding_step";
const CASTLE_WALLET_KEY = "ailit_castle_wallet_v1";

export const PORTAL_COMPANIONS = [
  {
    id: "researcher",
    icon: "🔍",
    accent: "green",
    labelKey: "portal.companion.researcher",
    descKey: "portal.companion.researcherDesc",
    /** Fixed asset slot — replace PNG later without layout changes */
    asset: "/portal/assets/companions/researcher.svg",
  },
  {
    id: "explorer",
    icon: "🧭",
    accent: "orange",
    labelKey: "portal.companion.explorer",
    descKey: "portal.companion.explorerDesc",
    asset: "/portal/assets/companions/explorer.svg",
  },
  {
    id: "creator",
    icon: "💡",
    accent: "purple",
    labelKey: "portal.companion.creator",
    descKey: "portal.companion.creatorDesc",
    asset: "/portal/assets/companions/creator.svg",
  },
];

/** @deprecated use PORTAL_COMPANIONS — kept for lobby label helpers */
export const PORTAL_ROLES = PORTAL_COMPANIONS;

export function validateNickname(name) {
  const n = String(name || "").trim();
  if (!n) return { ok: false, code: "nickEmpty" };
  if (n.length > 20) return { ok: false, code: "nickLength" };
  return { ok: true, name: n };
}

export function validateParticipantId(id) {
  const n = String(id || "").trim();
  if (!n) return { ok: false, code: "pidEmpty" };
  if (n.length > 20) return { ok: false, code: "pidLength" };
  return { ok: true, id: n };
}

export function validateCompanion(id) {
  const ok = PORTAL_COMPANIONS.some((c) => c.id === id);
  if (!ok) return { ok: false, code: "companion" };
  return { ok: true, id };
}

export function loadPortalUser() {
  try {
    const raw = JSON.parse(localStorage.getItem(PORTAL_KEY) || "null");
    if (!raw || typeof raw !== "object") return null;
    const participant_id = String(raw.participant_id || "").trim();
    const user_id = Number(raw.user_id);
    const display_name = String(raw.display_name || raw.nickname || "").trim();
    if (!participant_id || !Number.isFinite(user_id) || user_id <= 0) return null;
    if (!display_name) return null;
    const profile =
      raw.profile && typeof raw.profile === "object" && !Array.isArray(raw.profile)
        ? { ...raw.profile }
        : {};
    return {
      user_id: Math.trunc(user_id),
      participant_id: participant_id.slice(0, 20),
      display_name: display_name.slice(0, 20),
      companion: raw.companion || "explorer",
      logged_in_at: raw.logged_in_at || null,
      previous_login_at: raw.previous_login_at || null,
      profile,
      avatar_key: raw.avatar_key || profile.avatar_key || "explorer",
      badge_key: raw.badge_key || profile.badge_key || "curious",
      agree_research: raw.agree_research === true || profile.agree_research === true,
      onboarding_step: Number(raw.onboarding_step ?? profile.onboarding_step ?? 0),
    };
  } catch {
    return null;
  }
}

export function savePortalUser(user) {
  const profile =
    user.profile && typeof user.profile === "object" && !Array.isArray(user.profile)
      ? { ...user.profile }
      : {};
  const avatar_key = user.avatar_key || profile.avatar_key || "explorer";
  const badge_key = user.badge_key || profile.badge_key || "curious";
  const agree_research = user.agree_research === true || profile.agree_research === true;
  const onboarding_step = Number(user.onboarding_step ?? profile.onboarding_step ?? 0);
  const payload = {
    user_id: Number(user.user_id),
    participant_id: String(user.participant_id).slice(0, 20),
    display_name: String(user.display_name).slice(0, 20),
    companion: user.companion || "explorer",
    logged_in_at: user.logged_in_at || Date.now(),
    previous_login_at: user.previous_login_at || null,
    avatar_key,
    badge_key,
    agree_research,
    onboarding_step: Number.isFinite(onboarding_step) ? onboarding_step : 0,
    profile: {
      ...profile,
      avatar_key,
      badge_key,
      agree_research,
      onboarding_step: Number.isFinite(onboarding_step) ? onboarding_step : 0,
    },
  };
  localStorage.setItem(PORTAL_KEY, JSON.stringify(payload));
  try {
    localStorage.setItem(USER_ID_KEY, String(payload.user_id));
  } catch {
    /* ignore */
  }
  syncPortalToLegacy(payload);
  return payload;
}

export function getStoredUserId() {
  const portal = loadPortalUser();
  if (portal?.user_id) return portal.user_id;
  try {
    const n = Number(localStorage.getItem(USER_ID_KEY));
    return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
  } catch {
    return null;
  }
}

export function isPortalLoggedIn() {
  const u = loadPortalUser();
  return !!(u?.participant_id && u?.user_id && u?.display_name);
}

export function clearPortalUser() {
  try {
    localStorage.removeItem(PORTAL_KEY);
    localStorage.removeItem(USER_ID_KEY);
    const legacy = JSON.parse(localStorage.getItem(LOGIN_KEY) || "null");
    if (legacy?.portal === true) localStorage.removeItem(LOGIN_KEY);
  } catch {
    /* storage can be unavailable in hardened browsers */
  }
}

/**
 * Mirror portal profile into existing local keys used by lobby / games.
 * Does NOT map companion → gender or character_id.
 */
export function syncPortalToLegacy(user) {
  if (!user?.display_name) return;
  const login = {
    schemaVersion: 3,
    name: user.display_name,
    participant_id: user.participant_id || null,
    user_id: user.user_id || null,
    companion: user.companion || null,
    avatarKey: user.avatar_key || user.profile?.avatar_key || null,
    badgeKey: user.badge_key || user.profile?.badge_key || null,
    portal: true,
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

export function companionLabelKey(companionId) {
  return (
    PORTAL_COMPANIONS.find((c) => c.id === companionId)?.labelKey ||
    "portal.companion.explorer"
  );
}

/** @deprecated use companionLabelKey */
export function roleLabelKey(roleId) {
  return companionLabelKey(roleId);
}
