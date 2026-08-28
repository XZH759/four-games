import {
  NODES,
  REGIONS,
  TOTAL_LEVELS,
  CHEST_NODES,
  loadProgress,
  saveProgress,
  nodeStatus,
  completionRatio,
  nextRewards,
  getNode,
  quizUrlFor,
  pathPoints,
  isUnlocked,
  isCompleted,
  regionProgress,
  localizeNode,
  localizeReward,
  localizeRegion,
} from "/js/nuannuan/map-config.js";
import { setActiveBoutique, getBoutique, invalidBoutiqueFromUrl } from "/js/nuannuan/fashion-town.js";
import {
  isFashionMapMode,
  resolveMapBoutiqueId,
  mountFashionMap,
  paintFashionModules,
  fashionModuleLabel,
} from "/nuannuan/map/map-fashion.js";
import { loadFinal } from "/js/nuannuan/avatar-config.js";
import {
  loadConfirmedCompanion,
  loadCompanionDraft,
  localizeCompanion,
} from "/js/nuannuan/companion-config.js";
import { mountLobbyExit } from "/js/lobby-exit.js";
import { initI18n, onLangChange, applyDom, getLang, t } from "/js/i18n.js";

initI18n({ toggleHost: "#lang-host" });
onLangChange(() => {
  applyDom();
  hydratePlayer();
  paintAll();
  if (state.selectedId) openDetail(state.selectedId, { quiet: true });
});
mountLobbyExit();

const KIT = "/nuannuan/map/assets/kit";

const NODE_ART = {
  done: `${KIT}/node-done.png`,
  current: `${KIT}/node-current.png`,
  open: `${KIT}/node-open.png`,
  locked: `${KIT}/node-locked.png`,
};

const NODE_ART_LG = {
  done: `${KIT}/node-done-lg.png`,
  current: `${KIT}/node-current-lg.png`,
  open: `${KIT}/node-open-lg.png`,
  locked: `${KIT}/node-locked-lg.png`,
};

const state = {
  progress: loadProgress(),
  selectedId: null,
  zoom: 1,
  points: pathPoints(),
  boutiqueId: resolveMapBoutiqueId(),
  fashionMode: isFashionMapMode(),
};

const els = {
  back: document.getElementById("back-link"),
  h1: document.getElementById("page-h1"),
  sub: document.getElementById("page-sub"),
  stage: document.getElementById("map-stage"),
  viewport: document.getElementById("map-viewport"),
  nodes: document.getElementById("map-nodes"),
  chests: document.getElementById("map-chests"),
  links: document.getElementById("map-links"),
  regionDock: document.getElementById("region-dock"),
  regionTitles: document.getElementById("region-titles"),
  starCount: document.getElementById("star-count"),
  gemCount: document.getElementById("gem-count"),
  progressRing: document.getElementById("progress-ring"),
  progressPct: document.getElementById("progress-pct"),
  levelsDoneLine: document.getElementById("levels-done-line"),
  rewardList: document.getElementById("reward-list"),
  detailCard: document.getElementById("detail-card"),
  detailBadge: document.getElementById("detail-badge"),
  detailStatus: document.getElementById("detail-status"),
  detailTitle: document.getElementById("detail-title"),
  detailSummary: document.getElementById("detail-summary"),
  detailModule: document.getElementById("detail-module"),
  detailReward: document.getElementById("detail-reward"),
  detailClose: document.getElementById("detail-close"),
  detailEnter: document.getElementById("detail-enter"),
  continueBtn: document.getElementById("continue-journey"),
  locate: document.getElementById("locate"),
  compass: document.getElementById("compass"),
  zoomIn: document.getElementById("zoom-in"),
  zoomOut: document.getElementById("zoom-out"),
  toast: document.getElementById("toast"),
  profileAvatar: document.getElementById("profile-avatar"),
  playerLv: document.getElementById("player-lv"),
  playerName: document.getElementById("player-name"),
  companionLine: document.getElementById("companion-line"),
  helpOpen: document.getElementById("help-open"),
  helpDialog: document.getElementById("help-dialog"),
  modulePanel: document.getElementById("module-panel"),
  rewardCard: document.getElementById("reward-card"),
};

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.remove("is-on"), 1700);
}

function statusLabel(status) {
  return t(`map.status.${status}`) || status;
}

function pointOf(id) {
  return state.points.find((p) => p.id === id);
}

function paintHud() {
  const p = state.progress;
  const pct = completionRatio(p);
  els.starCount.textContent = String(p.stars);
  els.gemCount.textContent = String(p.gems);
  els.progressRing.style.setProperty("--p", String(pct));
  els.progressPct.textContent = `${pct}%`;
  if (els.levelsDoneLine) {
    els.levelsDoneLine.textContent = t("map.levelsDone", { n: p.completed.length });
  }
  els.playerLv.textContent = `Lv.${Math.max(1, Math.floor(p.completed.length / 2) + 1)}`;

  const rewards = nextRewards(p).map((item) => localizeReward(item, getLang()));
  els.rewardList.innerHTML = rewards
    .map(
      (item) => `
      <div class="reward-item">
        <img src="${KIT}/${item.kind === "星星" || item.kind === "Star" ? "icon-star.png" : "chest-claimable.png"}" alt="" />
        <span><strong>${item.label}</strong><small>${item.kind}</small></span>
      </div>`,
    )
    .join("");
}

function paintRegions() {
  els.regionDock.innerHTML = REGIONS.map((raw) => {
    const region = localizeRegion(raw, getLang());
    const { done, total } = regionProgress(state.progress, raw);
    const active =
      state.progress.current >= raw.range[0] &&
      state.progress.current <= raw.range[1];
    const label = getLang() === "en" ? region.titleEn : region.title;
    return `
      <button type="button" class="region-btn${active ? " is-active" : ""}" data-region="${raw.id}">
        <img src="${KIT}/region-banner-${raw.index}.png" alt="${region.titleEn}" />
        <span class="en">${label} · ${done}/${total}</span>
      </button>`;
  }).join("");

  els.regionTitles.innerHTML = REGIONS.map(
    (region) => `
      <div class="region-title" style="left:${region.focus.x}%;top:${Math.max(8, region.focus.y - 10)}%">
        ${getLang() === "en" ? region.titleEn : region.title}
      </div>`,
  ).join("");
}

function bindRegionDock() {
  if (els.regionDock._bound) return;
  els.regionDock.addEventListener("click", (event) => {
    const btn = event.target.closest(".region-btn");
    if (!btn) return;
    const region = REGIONS.find((r) => r.id === btn.dataset.region);
    if (!region) return;
    focusPercent(region.focus.x, region.focus.y);
    toast(getLang() === "en" ? region.titleEn : region.title);
  });
  els.regionDock._bound = true;
}

function segmentClass(fromId) {
  const fromDone = isCompleted(state.progress, fromId);
  const toId = fromId + 1;
  if (fromDone && isCompleted(state.progress, toId)) return "path-done";
  if (fromDone && state.progress.current === toId) return "path-current";
  if (fromDone) return "path-done";
  return "path-pending";
}

function paintLinks() {
  const parts = [];
  for (let i = 0; i < state.points.length - 1; i += 1) {
    const a = state.points[i];
    const b = state.points[i + 1];
    const cls = segmentClass(a.id);
    parts.push(
      `<path class="${cls}" d="M ${a.x.toFixed(2)} ${a.y.toFixed(2)} L ${b.x.toFixed(2)} ${b.y.toFixed(2)}" />`,
    );
  }
  els.links.innerHTML = parts.join("");
}

function chestSrc(id) {
  if (isCompleted(state.progress, id)) return `${KIT}/chest-open.png`;
  if (isUnlocked(state.progress, id)) return `${KIT}/chest-claimable.png`;
  return `${KIT}/chest-locked.png`;
}

function paintChests() {
  els.chests.innerHTML = "";
  NODES.filter((n) => n.isChest).forEach((node) => {
    const pt = pointOf(node.id);
    if (!pt) return;
    const mark = document.createElement("div");
    mark.className = "chest-mark";
    mark.style.left = `${pt.x}%`;
    mark.style.top = `${pt.y}%`;
    mark.innerHTML = `<img src="${chestSrc(node.id)}" alt="" />`;
    els.chests.appendChild(mark);
  });
}

function paintNodes() {
  els.nodes.innerHTML = "";
  state.points.forEach((pt) => {
    const status = nodeStatus(state.progress, pt.id);
    const meta = getNode(pt.id);
    const selected = state.selectedId === pt.id;
    const artMap = selected ? NODE_ART_LG : NODE_ART;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `node is-${status}${meta?.isChest ? " is-chest" : ""}${
      selected ? " is-selected" : ""
    }`;
    btn.style.left = `${pt.x}%`;
    btn.style.top = `${pt.y}%`;
    btn.dataset.id = String(pt.id);
    btn.setAttribute("role", "listitem");
    btn.setAttribute(
      "aria-label",
      t("map.nodeAria", { n: pt.id, status: statusLabel(status) }) +
        (meta?.isChest ? t("map.nodeChest") : ""),
    );
    btn.innerHTML = `
      <img class="art" src="${artMap[status]}" alt="" draggable="false" />
      <span class="num">${pt.id}</span>${
        state.fashionMode
          ? `<span class="node-status">${statusLabel(status)}</span>`
          : ""
      }`;
    btn.tabIndex = status === "locked" ? -1 : 0;
    btn.addEventListener("click", () => openDetail(pt.id));
    btn.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openDetail(pt.id);
    });
    els.nodes.appendChild(btn);
  });
}

function openDetail(id, { quiet = false } = {}) {
  const raw = getNode(id);
  if (!raw) return;
  const node = localizeNode(raw, getLang());
  const status = nodeStatus(state.progress, id);
  state.selectedId = id;
  paintNodes();

  els.detailCard.hidden = false;
  els.detailBadge.textContent = String(id);
  els.detailStatus.textContent = statusLabel(status);
  els.detailTitle.textContent = node.title;
  els.detailSummary.textContent = node.summary;
  const boutique = getBoutique(state.boutiqueId);
  if (state.fashionMode && boutique && els.detailModule) {
    const modLabel = fashionModuleLabel(id, boutique, t);
    els.detailModule.hidden = false;
    els.detailModule.textContent = t("map.ft.designModule", { module: modLabel });
  } else if (els.detailModule) {
    els.detailModule.hidden = true;
  }
  els.detailReward.textContent = t("map.rewardPrefix", { label: node.reward.label });
  els.detailEnter.disabled = status === "locked";
  els.detailEnter.setAttribute(
    "aria-label",
    status === "done"
      ? t("map.enterAgain")
      : status === "locked"
        ? t("map.notUnlocked")
        : t("map.enter"),
  );

  if (!quiet && status === "locked") toast(t("map.lockPrev"));
}

function closeDetail() {
  state.selectedId = null;
  els.detailCard.hidden = true;
  paintNodes();
}

function applyZoom() {
  els.stage.style.transform = `scale(${state.zoom})`;
}

function focusPercent(x, y, { quiet = false, message } = {}) {
  const rect = els.viewport.getBoundingClientRect();
  const stageW = els.stage.offsetWidth * state.zoom;
  const stageH = els.stage.offsetHeight * state.zoom;
  els.viewport.scrollLeft = (x / 100) * stageW - rect.width / 2;
  els.viewport.scrollTop = (y / 100) * stageH - rect.height / 2;
  if (!quiet && message) toast(message);
}

function locateCurrent({ quiet = false } = {}) {
  const id = state.progress.current;
  const pt = pointOf(id);
  if (!pt) return;
  openDetail(id, { quiet: true });
  focusPercent(pt.x, pt.y, {
    quiet,
    message: t("map.located", { n: id }),
  });
}

function enterLevel(id) {
  const status = nodeStatus(state.progress, id);
  if (status === "locked") {
    toast(t("map.lockLevel"));
    return;
  }
  state.progress.current = id;
  saveProgress(state.progress);
  location.href = quizUrlFor(id, state.boutiqueId);
}

function hydratePlayer() {
  const avatar = loadFinal();
  const companionRaw = loadConfirmedCompanion() || loadCompanionDraft();
  const companion = localizeCompanion(companionRaw, getLang());
  if (avatar?.name) {
    els.playerName.textContent = avatar.name;
  } else {
    els.playerName.textContent = t("map.traveler");
  }

  const frame = els.profileAvatar.querySelector(".frame-art");
  const existing = els.profileAvatar.querySelector(".portrait");
  if (existing) existing.remove();
  if (companion?.portrait) {
    els.profileAvatar.classList.remove("is-empty");
    const img = document.createElement("img");
    img.className = "portrait";
    img.src = companion.portrait;
    img.alt = companion.name || "";
    els.profileAvatar.insertBefore(img, frame);
    els.companionLine.textContent = state.fashionMode
      ? companion.summary || companion.intro || t("map.ft.companionEncourage")
      : companion.intro || t("map.companionFallback");
  } else {
    els.profileAvatar.classList.add("is-empty");
    els.companionLine.textContent = t("map.companionDefault");
  }
}

function absorbQueryFlags() {
  const params = new URLSearchParams(location.search);
  const boutiqueId = params.get("boutique") || state.boutiqueId;
  if (boutiqueId && getBoutique(boutiqueId)) {
    setActiveBoutique(boutiqueId);
    state.boutiqueId = boutiqueId;
    state.fashionMode = true;
  }
  const raw = params.get("complete");
  if (!raw) return;
  const ids = raw
    .split(",")
    .map((n) => Number(n.trim()))
    .filter((n) => n >= 1 && n <= TOTAL_LEVELS)
    .sort((a, b) => a - b);
  if (!ids.length) return;
  let last = null;
  ids.forEach((complete) => {
    if (!isUnlocked(state.progress, complete)) return;
    if (!state.progress.completed.includes(complete)) {
      state.progress.completed.push(complete);
      state.progress.stars += 1;
      if (CHEST_NODES.includes(complete)) state.progress.gems += 5;
    }
    last = complete;
  });
  if (last != null) {
    state.progress.current = Math.min(TOTAL_LEVELS, last + 1);
    saveProgress(state.progress);
    toast(t("map.completedToast", { n: last }));
  }
  const keep = state.boutiqueId ? `?boutique=${encodeURIComponent(state.boutiqueId)}` : "";
  history.replaceState({}, "", `${location.pathname}${keep}`);
}

function paintAll() {
  if (state.fashionMode) {
    mountFashionMap({ state, els, t, getLang });
    paintFashionModules({ state, els, t });
    if (els.rewardCard) els.rewardCard.hidden = true;
    if (els.modulePanel) els.modulePanel.hidden = false;
  } else {
    if (els.rewardCard) els.rewardCard.hidden = false;
    if (els.modulePanel) els.modulePanel.hidden = true;
  }
  paintHud();
  paintRegions();
  paintLinks();
  paintChests();
  paintNodes();
}

els.detailClose.addEventListener("click", closeDetail);
els.detailEnter.addEventListener("click", () => {
  if (!state.selectedId) return;
  enterLevel(state.selectedId);
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || !state.selectedId || els.detailCard.hidden) return;
  if (document.activeElement === els.detailEnter && !els.detailEnter.disabled) {
    enterLevel(state.selectedId);
  }
});
els.continueBtn.addEventListener("click", () => {
  const id = state.progress.current;
  if (!isUnlocked(state.progress, id)) {
    toast(t("map.lockCurrent"));
    return;
  }
  locateCurrent();
  enterLevel(id);
});
els.locate.addEventListener("click", () => locateCurrent());
els.compass.addEventListener("click", () => locateCurrent());
els.zoomIn.addEventListener("click", () => {
  state.zoom = Math.min(1.5, state.zoom + 0.15);
  applyZoom();
});
els.zoomOut.addEventListener("click", () => {
  state.zoom = Math.max(0.7, state.zoom - 0.15);
  applyZoom();
});
els.helpOpen.addEventListener("click", () => {
  if (typeof els.helpDialog.showModal === "function") els.helpDialog.showModal();
});

absorbQueryFlags();
bindRegionDock();
hydratePlayer();
const invalidBoutique = invalidBoutiqueFromUrl();
if (invalidBoutique) toast(t("town.invalidBoutique", { id: invalidBoutique }));
paintAll();
applyZoom();
locateCurrent({ quiet: true });
