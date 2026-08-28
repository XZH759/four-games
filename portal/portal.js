import { initI18n, onLangChange, applyDom, t, getLang } from "/js/i18n.js";
import { loginPortalUser } from "/js/user-log.js";
import {
  PORTAL_COMPANIONS,
  ONBOARDING_KEY,
  validateNickname,
  validateParticipantId,
  validateCompanion,
  loadPortalUser,
  savePortalUser,
  clearPortalUser,
  companionLabelKey,
  isProfileComplete,
  isPortalLoggedIn,
} from "/js/portal-auth.js";

const HOME_URL = "/";
const VIEW_STEP = { welcome: 1, profile: 2, returning: 3, loading: 4 };
const COMPANION_ART = {
  researcher: { face: "🐻", prop: "🔎", accent: "#63a97a", bg: "#eaf7ee" },
  explorer: { face: "🦁", prop: "🧭", accent: "#ea963d", bg: "#fff1df" },
  creator: { face: "🐰", prop: "🎨", accent: "#9a75d2", bg: "#f3edff" },
};

const LOOKS = [
  { id: "explorer", asset: "/companions/ava/icon.png", key: "portal.profile.look.explorer", bg: "#ffe8c4" },
  { id: "mage", asset: "/companions/gladys/icon.png", key: "portal.profile.look.mage", bg: "#eee3ff" },
  { id: "pilot", asset: "/companions/diana/icon.png", key: "portal.profile.look.pilot", bg: "#e1f0fa" },
  { id: "artist", asset: "/companions/eileen/icon.png", key: "portal.profile.look.artist", bg: "#fbe4e8" },
];

const BADGES = [
  { id: "curious", image: "/assets/park/pin-badges/badge-0.png", key: "portal.profile.badge.curious", descKey: "portal.profile.badge.curiousDesc" },
  { id: "brave", image: "/assets/park/pin-badges/badge-2.png", key: "portal.profile.badge.brave", descKey: "portal.profile.badge.braveDesc" },
  { id: "creative", image: "/assets/park/pin-badges/badge-4.png", key: "portal.profile.badge.creative", descKey: "portal.profile.badge.creativeDesc" },
];

const SCENE = {
  welcome: { step: "01", kicker: "portal.scene.welcomeKicker", title: "portal.scene.welcomeTitle", copy: "portal.scene.welcomeCopy" },
  profile: { step: "02", kicker: "portal.scene.profileKicker", title: "portal.scene.profileTitle", copy: "portal.scene.profileCopy" },
  returning: { step: "03", kicker: "portal.scene.returningKicker", title: "portal.scene.returningTitle", copy: "portal.scene.returningCopy" },
  loading: { step: "04", kicker: "portal.scene.loadingKicker", title: "portal.scene.loadingTitle", copy: "portal.scene.loadingCopy" },
};

const els = {
  views: [...document.querySelectorAll("[data-view]")],
  flowSteps: [...document.querySelectorAll("[data-flow-step]")],
  sceneStep: document.getElementById("scene-step-number"),
  sceneKicker: document.getElementById("scene-kicker"),
  sceneTitle: document.getElementById("scene-title"),
  sceneCopy: document.getElementById("scene-copy"),
  form: document.getElementById("portal-form"),
  nick: document.getElementById("portal-nick"),
  pid: document.getElementById("portal-pid"),
  nickCount: document.getElementById("nick-count"),
  pidCount: document.getElementById("pid-count"),
  error: document.getElementById("portal-error"),
  companionGrid: document.getElementById("companion-grid"),
  enter: document.getElementById("btn-enter"),
  continueWrap: document.getElementById("portal-continue"),
  continueBtn: document.getElementById("btn-continue"),
  profileForm: document.getElementById("profile-form"),
  profileNick: document.getElementById("profile-nick"),
  profilePid: document.getElementById("profile-pid"),
  profileAvatar: document.getElementById("profile-avatar"),
  profileAvatarBtn: document.getElementById("profile-avatar-btn"),
  profileCompanionArt: document.getElementById("profile-companion-art"),
  profileCompanionName: document.getElementById("profile-companion-name"),
  profileCompanionDesc: document.getElementById("profile-companion-desc"),
  lookGrid: document.getElementById("look-grid"),
  badgeGrid: document.getElementById("badge-grid"),
  consent: document.getElementById("research-consent"),
  profileError: document.getElementById("profile-error"),
  profileSubmit: document.getElementById("btn-create-profile"),
  profileBack: document.getElementById("btn-profile-back"),
  returningAvatar: document.getElementById("returning-avatar"),
  returningName: document.getElementById("returning-name"),
  returningRole: document.getElementById("returning-role"),
  returningPoints: document.getElementById("returning-points"),
  returningLast: document.getElementById("returning-last"),
  returningCompanion: document.getElementById("returning-companion"),
  castleChapter: document.getElementById("castle-chapter"),
  castleProgressLabel: document.getElementById("castle-progress-label"),
  castleProgress: document.getElementById("castle-progress"),
  castleItems: document.getElementById("castle-items"),
  sprintStage: document.getElementById("sprint-stage"),
  sprintProgressLabel: document.getElementById("sprint-progress-label"),
  sprintProgress: document.getElementById("sprint-progress"),
  sprintBest: document.getElementById("sprint-best"),
  resume: document.getElementById("btn-resume"),
  startFresh: document.getElementById("btn-start-fresh"),
  switchAccount: document.getElementById("btn-switch-account"),
  resetModal: document.getElementById("reset-modal"),
  loadingAvatar: document.getElementById("loading-avatar"),
  loadingName: document.getElementById("loading-name"),
  loadingCompanion: document.getElementById("loading-companion"),
  loadingCompanionChip: document.getElementById("loading-companion-chip"),
  loadingLevel: document.getElementById("loading-level"),
  loadingItems: document.getElementById("loading-items"),
  loadingPercent: document.getElementById("loading-percent"),
  loadingProgress: document.getElementById("loading-progress"),
  loadingFill: document.getElementById("loading-fill"),
  syncItems: [...document.querySelectorAll("#sync-list li")],
  skipLoading: document.getElementById("btn-skip-loading"),
  toast: document.getElementById("portal-toast"),
  heroWelcomeBubble: document.getElementById("hero-welcome-bubble"),
  heroLoadingToast: document.getElementById("hero-loading-toast"),
  returningTitleName: document.getElementById("returning-title-name"),
  returningLevelTag: document.getElementById("returning-level-tag"),
  returningGems: document.getElementById("returning-gems"),
  returningCompanionChip: document.getElementById("returning-companion-chip"),
};

const state = {
  view: "welcome",
  companion: "explorer",
  avatarKey: "explorer",
  badgeKey: "curious",
  user: loadPortalUser(),
  busy: false,
  loadingTimer: 0,
  loadingRedirectTimer: 0,
  loadingFinished: false,
  loadingSync: null,
  pendingOnboarding: false,
};

initI18n({ toggleHost: "#lang-host" });

function announce(message) {
  if (!message || !els.toast) return;
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  clearTimeout(announce.timer);
  announce.timer = setTimeout(() => els.toast.classList.remove("is-visible"), 1900);
}

function safeReadJson(key, fallback = {}) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value && typeof value === "object" ? value : fallback;
  } catch {
    return fallback;
  }
}

function setText(element, value) {
  if (element) element.textContent = String(value ?? "");
}

function lookById(id) {
  return LOOKS.find((look) => look.id === id) || LOOKS[0];
}

function lookAsset(lookId = state.avatarKey) {
  return lookById(lookId).asset;
}

function companionArt(companionId) {
  const art = COMPANION_ART[companionId] || COMPANION_ART.explorer;
  return art;
}

function companionDescKey(companionId) {
  return PORTAL_COMPANIONS.find((c) => c.id === companionId)?.descKey || "portal.companion.explorerDesc";
}

function shouldOpenProfile(user, created) {
  if (created) return true;
  return user && !isProfileComplete(user);
}

function nextViewAfterLogin(saved, created) {
  return shouldOpenProfile(saved, created) ? "profile" : "returning";
}

function companionName(companion = state.user?.companion || state.companion) {
  return t(companionLabelKey(companion));
}

function sceneFor(view = state.view) {
  const scene = SCENE[view] || SCENE.welcome;
  setText(els.sceneStep, scene.step);
  setText(els.sceneKicker, t(scene.kicker));
  setText(els.sceneTitle, t(scene.title));
  setText(els.sceneCopy, t(scene.copy));
}

function setView(view, { focus = true } = {}) {
  if (!VIEW_STEP[view]) return;
  state.view = view;
  document.body.dataset.flowView = view;
  els.views.forEach((section) => {
    const active = section.dataset.view === view;
    section.hidden = !active;
    section.classList.toggle("is-active", active);
  });

  const step = VIEW_STEP[view];
  els.flowSteps.forEach((item) => {
    const itemStep = Number(item.dataset.flowStep);
    item.classList.toggle("is-on", itemStep === step);
    item.classList.toggle("is-done", itemStep < step);
    item.setAttribute("aria-current", itemStep === step ? "step" : "false");
  });
  sceneFor(view);

  if (els.heroWelcomeBubble) {
    els.heroWelcomeBubble.hidden = view !== "returning";
  }
  if (els.heroLoadingToast) {
    els.heroLoadingToast.hidden = view !== "loading";
  }

  if (view === "profile") paintProfile();
  if (view === "returning") paintReturning();
  if (focus) {
    requestAnimationFrame(() => {
      const target = els.views.find((section) => section.dataset.view === view)
        ?.querySelector("input:not([readonly]), button:not([disabled])");
      target?.focus({ preventScroll: true });
    });
  }
}

function updateCounts() {
  setText(els.nickCount, `${els.nick.value.length}/20`);
  setText(els.pidCount, `${els.pid.value.length}/20`);
}

function clearError(target = els.error) {
  if (!target) return;
  target.hidden = true;
  target.textContent = "";
}

function showError(code, target = els.error) {
  const map = {
    nickEmpty: "portal.error.nickEmpty",
    nickLength: "portal.error.nickLength",
    pidEmpty: "portal.error.pidEmpty",
    pidLength: "portal.error.pidLength",
    companion: "portal.error.companion",
    consent: "portal.error.consent",
    network: "portal.error.network",
  };
  if (!target) return;
  target.hidden = false;
  target.textContent = t(map[code] || "portal.error.network");
}

function setBusy(on, button = els.enter) {
  state.busy = on;
  [els.enter, els.continueBtn, els.profileSubmit, els.resume].forEach((control) => {
    if (control) control.disabled = on;
  });
  if (button) button.setAttribute("aria-busy", on ? "true" : "false");
}

function paintCompanions() {
  const cards = PORTAL_COMPANIONS.map((companion) => {
    const art = COMPANION_ART[companion.id] || COMPANION_ART.explorer;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `companion-card${state.companion === companion.id ? " is-on" : ""}`;
    button.dataset.companion = companion.id;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", state.companion === companion.id ? "true" : "false");
    button.style.setProperty("--accent", art.accent);
    button.style.setProperty("--portrait-bg", art.bg);
    button.style.setProperty("--selected-bg", art.bg);
    button.innerHTML = `
      <span class="portrait" data-prop="${art.prop}" aria-hidden="true">${art.face}</span>
      <strong>${t(companion.labelKey)}</strong>
      <small>${t(companion.descKey)}</small>
      <span class="radio" aria-hidden="true"></span>
    `;
    button.addEventListener("click", () => {
      state.companion = companion.id;
      paintCompanions();
      clearError();
    });
    return button;
  });
  els.companionGrid.replaceChildren(...cards);
}

function paintLooks() {
  const cards = LOOKS.map((look) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `look-card${state.avatarKey === look.id ? " is-on" : ""}`;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", state.avatarKey === look.id ? "true" : "false");
    button.dataset.look = look.id;
    button.innerHTML = `<span style="--look-bg:${look.bg}"><img src="${look.asset}" alt="" width="48" height="48" /></span><strong>${t(look.key)}</strong>`;
    button.addEventListener("click", () => {
      state.avatarKey = look.id;
      paintLooks();
      paintProfileAvatar();
      clearError(els.profileError);
    });
    return button;
  });
  els.lookGrid.replaceChildren(...cards);
}

function paintBadges() {
  const cards = BADGES.map((badge) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `badge-card${state.badgeKey === badge.id ? " is-on" : ""}`;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", state.badgeKey === badge.id ? "true" : "false");
    button.dataset.badge = badge.id;
    button.innerHTML = `<img src="${badge.image}" alt="" /><span><strong>${t(badge.key)}</strong><small>${t(badge.descKey)}</small></span>`;
    button.addEventListener("click", () => {
      state.badgeKey = badge.id;
      paintBadges();
      clearError(els.profileError);
    });
    return button;
  });
  els.badgeGrid.replaceChildren(...cards);
}

function paintProfileAvatar() {
  if (!els.profileAvatar) return;
  const look = lookById(state.avatarKey);
  els.profileAvatar.replaceChildren();
  const img = document.createElement("img");
  img.src = look.asset;
  img.alt = "";
  img.width = 66;
  img.height = 66;
  els.profileAvatar.appendChild(img);
}

function paintProfileCompanion() {
  const companionId = state.user?.companion || state.companion;
  const art = companionArt(companionId);
  if (els.profileCompanionArt) {
    els.profileCompanionArt.textContent = art.face;
    els.profileCompanionArt.style.background = art.bg;
    els.profileCompanionArt.dataset.prop = art.prop;
  }
  setText(els.profileCompanionName, companionName(companionId));
  if (els.profileCompanionDesc) {
    els.profileCompanionDesc.textContent = t(companionDescKey(companionId));
  }
}

function paintProfile() {
  if (!state.user) return;
  state.avatarKey = state.user.avatar_key || state.user.profile?.avatar_key || state.avatarKey;
  state.badgeKey = state.user.badge_key || state.user.profile?.badge_key || state.badgeKey;
  els.profileNick.value = state.user.display_name || "";
  els.profilePid.value = state.user.participant_id || "";
  els.consent.checked = state.user.agree_research === true || state.user.profile?.agree_research === true;
  paintProfileAvatar();
  paintProfileCompanion();
  paintLooks();
  paintBadges();
}

function inventoryCount(wallet) {
  return Object.values(wallet.inventory || {}).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
}

function formatNum(n) {
  return Number(n || 0).toLocaleString(getLang() === "en" ? "en-US" : "zh-CN");
}

function readWalletStats() {
  const wallet = safeReadJson("ailit_castle_wallet_v1", {});
  const points = Math.max(0, Number(wallet.points) || 0);
  const lifetime = Math.max(0, Number(wallet.lifetime) || 0);
  const level = Math.max(1, Math.floor(lifetime / 400) + 1);
  const equipped = wallet.equipped || {};
  const gems =
    (equipped.pet ? 120 : 0) +
    (equipped.trail ? 80 : 0) +
    Math.floor(points / 10);
  const castleTier = Math.min(5, Math.max(1, Math.floor(lifetime / 1500) + 1));
  const castlePct = Math.round((castleTier / 5) * 100);
  const best = Math.max(0, Number(localStorage.getItem("ailit_parkour_best_v1")) || 0);
  const sprintPct = Math.min(100, Math.round((best / 1250) * 100));
  const sprintStage = Math.max(1, Math.min(4, Math.ceil(sprintPct / 25) || 1));
  const companionLevel = Math.max(1, Math.floor(lifetime / 350) + 1);
  return {
    points,
    lifetime,
    level,
    gems,
    castleTier,
    castlePct,
    inventoryCount: inventoryCount(wallet),
    best,
    sprintPct,
    sprintStage,
    companionLevel,
  };
}

function relativeLastPlayed(timestamp) {
  const time = Number(timestamp);
  if (!Number.isFinite(time)) return t("portal.returning.justNow");
  const days = Math.max(0, Math.floor((Date.now() - time) / 86400000));
  if (days === 0) return t("portal.returning.justNow");
  if (days === 1) return t("portal.returning.yesterday");
  return t("portal.returning.daysAgo", { n: days });
}

function paintReturning() {
  const user = state.user || loadPortalUser();
  if (!user) return;
  const stats = readWalletStats();
  const companion = companionName(user.companion);
  const companionArtData = companionArt(user.companion);

  if (els.returningAvatar) {
    els.returningAvatar.replaceChildren();
    const img = document.createElement("img");
    img.src = lookAsset(user.avatar_key || user.profile?.avatar_key);
    img.alt = "";
    img.width = 50;
    img.height = 50;
    els.returningAvatar.appendChild(img);
  }

  setText(els.returningTitleName, user.display_name);
  setText(els.returningName, user.display_name);
  setText(els.returningLevelTag, `Lv.${stats.level}`);
  setText(els.returningRole, companion);
  setText(els.returningPoints, formatNum(stats.points));
  setText(els.returningGems, formatNum(stats.gems));
  setText(els.returningLast, relativeLastPlayed(user.previous_login_at || user.logged_in_at));
  setText(
    els.returningCompanion,
    t("portal.returning.companionLine", { name: companion, n: stats.companionLevel }),
  );

  if (els.returningCompanionChip) {
    els.returningCompanionChip.textContent = companionArtData.face;
    els.returningCompanionChip.style.background = companionArtData.bg;
  }

  setText(els.castleChapter, t("portal.returning.chapter", { n: stats.castleTier }));
  setText(els.castleProgressLabel, `${stats.castleTier} / 5`);
  els.castleProgress.style.width = `${stats.castlePct}%`;
  setText(
    els.castleItems,
    t("portal.returning.tierPools", { n: stats.castleTier }),
  );

  setText(els.sprintStage, t("portal.returning.stage", { n: stats.sprintStage }));
  setText(els.sprintProgressLabel, `${stats.sprintPct}%`);
  els.sprintProgress.style.width = `${stats.sprintPct}%`;
  setText(
    els.sprintBest,
    t("portal.returning.bestScore", { n: formatNum(stats.best) }),
  );
}

function paintContinue() {
  const existing = state.user || loadPortalUser();
  if (!existing || !els.continueWrap) {
    els.continueWrap.hidden = true;
    return;
  }
  els.continueWrap.hidden = false;
  if (!els.nick.value) els.nick.value = existing.display_name || "";
  if (!els.pid.value) els.pid.value = existing.participant_id || "";
  state.companion = existing.companion || "explorer";
  updateCounts();
  paintCompanions();
}

async function authenticate({ display_name, participant_id, companion }) {
  const previous = loadPortalUser();
  const result = await loginPortalUser({ display_name, participant_id, companion });
  const profile = result.user.profile || previous?.profile || {};
  const saved = savePortalUser({
    user_id: result.user_id,
    participant_id: result.user.participant_id,
    display_name: result.user.display_name,
    companion: result.user.companion,
    logged_in_at: Date.now(),
    previous_login_at: previous?.logged_in_at || result.user.profile?.last_seen_at || null,
    profile,
    avatar_key: profile.avatar_key || previous?.avatar_key,
    badge_key: profile.badge_key || previous?.badge_key,
    agree_research: profile.agree_research === true || previous?.agree_research === true,
    onboarding_step: Number(profile.onboarding_step ?? previous?.onboarding_step ?? 0),
  });
  state.user = saved;
  state.companion = saved.companion;
  state.avatarKey = saved.avatar_key;
  state.badgeKey = saved.badge_key;
  return { ...result, saved };
}

async function submitWelcome(event) {
  event.preventDefault();
  if (state.busy) return;
  clearError();

  const nick = validateNickname(els.nick.value);
  if (!nick.ok) {
    showError(nick.code);
    els.nick.focus();
    return;
  }
  const pid = validateParticipantId(els.pid.value);
  if (!pid.ok) {
    showError(pid.code);
    els.pid.focus();
    return;
  }
  const companion = validateCompanion(state.companion);
  if (!companion.ok) {
    showError(companion.code);
    return;
  }

  setBusy(true, els.enter);
  try {
    const result = await authenticate({ display_name: nick.name, participant_id: pid.id, companion: companion.id });
    announce(t("portal.toast.welcome", { name: result.saved.display_name }));
    setView(nextViewAfterLogin(result.saved, result.created));
  } catch (error) {
    console.warn("[portal] login failed", error);
    showError("network");
  } finally {
    setBusy(false, els.enter);
  }
}

async function openReturningPlayer() {
  const existing = loadPortalUser();
  if (!existing || state.busy) return;
  setBusy(true, els.continueBtn);
  clearError();
  try {
    const result = await authenticate({
      display_name: existing.display_name,
      participant_id: existing.participant_id,
      companion: existing.companion || "explorer",
    });
    setView(nextViewAfterLogin(result.saved, false));
  } catch (error) {
    console.warn("[portal] returning login failed", error);
    showError("network");
  } finally {
    setBusy(false, els.continueBtn);
  }
}

async function submitProfile(event) {
  event.preventDefault();
  if (!state.user || state.busy) return;
  clearError(els.profileError);
  const nick = validateNickname(els.profileNick.value);
  if (!nick.ok) {
    showError(nick.code, els.profileError);
    els.profileNick.focus();
    return;
  }
  if (!els.consent.checked) {
    showError("consent", els.profileError);
    els.consent.focus();
    return;
  }

  const profile = {
    ...state.user.profile,
    avatar_key: state.avatarKey,
    badge_key: state.badgeKey,
    agree_research: true,
    onboarding_step: 0,
    profile_completed_at: new Date().toISOString(),
  };

  setBusy(true, els.profileSubmit);
  try {
    const result = await loginPortalUser({
      display_name: nick.name,
      participant_id: state.user.participant_id,
      companion: state.user.companion,
      profile,
    });
    state.user = savePortalUser({
      ...state.user,
      user_id: result.user_id,
      display_name: result.user.display_name,
      profile: result.user.profile || profile,
      avatar_key: state.avatarKey,
      badge_key: state.badgeKey,
      agree_research: true,
      onboarding_step: 0,
    });
    localStorage.setItem(ONBOARDING_KEY, "0");
    startLoading({ onboarding: true });
  } catch (error) {
    console.warn("[portal] profile sync failed", error);
    showError("network", els.profileError);
  } finally {
    setBusy(false, els.profileSubmit);
  }
}

function paintLoadingSummary() {
  const user = state.user;
  if (!user) return;
  const stats = readWalletStats();
  const companionArtData = companionArt(user.companion);
  if (els.loadingAvatar) {
    els.loadingAvatar.replaceChildren();
    const img = document.createElement("img");
    img.src = lookAsset(user.avatar_key || user.profile?.avatar_key);
    img.alt = "";
    img.width = 34;
    img.height = 34;
    els.loadingAvatar.appendChild(img);
  }
  if (els.loadingCompanionChip) {
    els.loadingCompanionChip.textContent = companionArtData.face;
    els.loadingCompanionChip.style.background = companionArtData.bg;
  }
  setText(els.loadingName, user.display_name);
  setText(els.loadingCompanion, companionName(user.companion));
  setText(els.loadingLevel, `Lv.${stats.level}`);
  setText(els.loadingItems, Math.max(5, stats.inventoryCount || 5));
}

/** Parallel prep while the loading animation runs (no extra API routes). */
async function runLoadingSync() {
  const user = state.user;
  if (!user) return;
  const tasks = [
    loginPortalUser({
      display_name: user.display_name,
      participant_id: user.participant_id,
      companion: user.companion,
      profile: user.profile,
    }).catch((error) => {
      console.warn("[portal] loading user sync", error);
      return null;
    }),
    Promise.resolve().then(() => {
      readWalletStats();
      try {
        localStorage.setItem("nn_park_daily_ready", String(Date.now()));
      } catch {
        /* storage optional */
      }
    }),
  ];
  await Promise.all(tasks);
}

function updateLoading(progress) {
  const value = Math.min(100, Math.max(0, Math.round(progress)));
  setText(els.loadingPercent, `${value}%`);
  if (els.loadingFill) els.loadingFill.style.width = `${value}%`;
  if (els.loadingProgress) {
    els.loadingProgress.style.setProperty("--loading-progress", `${value}%`);
    els.loadingProgress.setAttribute("aria-valuenow", String(value));
  }
  els.syncItems.forEach((item) => {
    const threshold = Number(item.dataset.threshold);
    const done = value >= threshold;
    item.classList.toggle("is-done", done);
    const prev = els.syncItems[els.syncItems.indexOf(item) - 1];
    const active = !done && (!prev || prev.classList.contains("is-done"));
    item.classList.toggle("is-active", active);
  });
}

function finishLoading() {
  if (state.loadingFinished) return;
  state.loadingFinished = true;
  clearInterval(state.loadingTimer);
  updateLoading(100);
  const target = state.pendingOnboarding ? `${HOME_URL}?onboarding=1` : HOME_URL;
  clearTimeout(state.loadingRedirectTimer);
  state.loadingRedirectTimer = window.setTimeout(() => location.assign(target), 1800);
}

function startLoading({ onboarding = false } = {}) {
  clearInterval(state.loadingTimer);
  clearTimeout(state.loadingRedirectTimer);
  state.pendingOnboarding = onboarding;
  state.loadingFinished = false;
  setView("loading", { focus: false });
  paintLoadingSummary();
  updateLoading(0);
  state.loadingSync = runLoadingSync();
  let progress = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tickMs = reduced ? 40 : 90;
  const stepMin = reduced ? 16 : 2.2;
  const stepMax = reduced ? 22 : 5.5;
  state.loadingTimer = window.setInterval(() => {
    progress += stepMin + Math.random() * (stepMax - stepMin);
    if (progress >= 100) {
      updateLoading(100);
      finishLoading();
      return;
    }
    updateLoading(progress);
  }, tickMs);
  els.skipLoading?.focus({ preventScroll: true });
}

function resetJourneyProgress() {
  const exactKeys = [
    "ailit_castle_wallet_v1",
    "ailit_parkour_best_v1",
    "ai_monopoly_v3",
    "nn_park_week_star",
    "nn_park_guide_seen",
    "ailit_collect_viewlog",
  ];
  exactKeys.forEach((key) => localStorage.removeItem(key));
  const progressKeys = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith("ailit_progress_")) progressKeys.push(key);
  }
  progressKeys.forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(ONBOARDING_KEY, "0");
  state.user = savePortalUser({ ...state.user, onboarding_step: 0 });
  announce(t("portal.reset.done"));
  setView("profile");
}

function bindRadioKeyboard(container, itemSelector, choose) {
  container.addEventListener("keydown", (event) => {
    if (!/Arrow(Left|Right|Up|Down)/.test(event.key)) return;
    const cards = [...container.querySelectorAll(itemSelector)];
    const current = cards.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    const direction = /Right|Down/.test(event.key) ? 1 : -1;
    const next = cards[(current + direction + cards.length) % cards.length];
    next.focus();
    choose(next);
  });
}

els.form.addEventListener("submit", submitWelcome);
els.continueBtn?.addEventListener("click", openReturningPlayer);
els.profileAvatarBtn?.addEventListener("click", () => {
  els.lookGrid?.querySelector(`[data-look="${state.avatarKey}"]`)?.focus();
});
els.profileForm.addEventListener("submit", submitProfile);
els.profileBack.addEventListener("click", () => setView("welcome"));
els.nick.addEventListener("input", () => { clearError(); updateCounts(); });
els.pid.addEventListener("input", () => { clearError(); updateCounts(); });
els.profileNick.addEventListener("input", () => clearError(els.profileError));
els.consent.addEventListener("change", () => clearError(els.profileError));
els.resume.addEventListener("click", async () => {
  const user = state.user || loadPortalUser();
  if (!user || state.busy) return;
  setBusy(true, els.resume);
  try {
    void loginPortalUser({
      display_name: user.display_name,
      participant_id: user.participant_id,
      companion: user.companion,
      profile: user.profile,
    });
    startLoading({ onboarding: false });
  } catch (error) {
    console.warn("[portal] resume sync failed", error);
    startLoading({ onboarding: false });
  } finally {
    setBusy(false, els.resume);
  }
});
els.skipLoading.addEventListener("click", finishLoading);
els.startFresh.addEventListener("click", () => {
  if (typeof els.resetModal.showModal === "function") els.resetModal.showModal();
  else if (window.confirm(t("portal.reset.copy"))) resetJourneyProgress();
});
els.resetModal.addEventListener("close", () => {
  if (els.resetModal.returnValue === "confirm") resetJourneyProgress();
});
els.switchAccount.addEventListener("click", () => {
  clearPortalUser();
  localStorage.removeItem(ONBOARDING_KEY);
  state.user = null;
  state.companion = "explorer";
  els.nick.value = "";
  els.pid.value = "";
  els.continueWrap.hidden = true;
  updateCounts();
  paintCompanions();
  setView("welcome");
});

bindRadioKeyboard(els.companionGrid, ".companion-card", (card) => {
  state.companion = card.dataset.companion;
  paintCompanions();
  els.companionGrid.querySelector(`[data-companion="${state.companion}"]`)?.focus();
});
bindRadioKeyboard(els.lookGrid, ".look-card", (card) => {
  state.avatarKey = card.dataset.look;
  paintLooks();
  paintProfileAvatar();
  els.lookGrid.querySelector(`[data-look="${state.avatarKey}"]`)?.focus();
});
bindRadioKeyboard(els.badgeGrid, ".badge-card", (card) => {
  state.badgeKey = card.dataset.badge;
  paintBadges();
  els.badgeGrid.querySelector(`[data-badge="${state.badgeKey}"]`)?.focus();
});

onLangChange(() => {
  applyDom();
  paintCompanions();
  paintLooks();
  paintBadges();
  sceneFor();
  if (state.view === "profile") paintProfileCompanion();
  if (state.view === "returning") paintReturning();
  if (state.view === "loading") paintLoadingSummary();
});

paintCompanions();
paintLooks();
paintBadges();
paintContinue();
updateCounts();
applyDom();
sceneFor();

if (new URLSearchParams(location.search).has("force")) {
  els.continueWrap.hidden = true;
  els.nick.value = "";
  els.pid.value = "";
  updateCounts();
} else if (new URLSearchParams(location.search).get("step") === "profile") {
  const existing = loadPortalUser();
  if (existing) {
    state.user = existing;
    state.companion = existing.companion || "explorer";
    setView("profile", { focus: false });
  }
} else if (isPortalLoggedIn() && loadPortalUser() && isProfileComplete(loadPortalUser())) {
  state.user = loadPortalUser();
  setView("returning", { focus: false });
} else {
  els.nick.focus();
}
