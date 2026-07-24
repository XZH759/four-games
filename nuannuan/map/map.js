import {
  NODES,
  REGIONS,
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
} from "/js/nuannuan/map-config.js";
import { loadFinal } from "/js/nuannuan/avatar-config.js";
import {
  loadConfirmedCompanion,
  loadCompanionDraft,
} from "/js/nuannuan/companion-config.js";

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
};

const els = {
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
  doneCount: document.getElementById("done-count"),
  rewardList: document.getElementById("reward-list"),
  detailCard: document.getElementById("detail-card"),
  detailBadge: document.getElementById("detail-badge"),
  detailStatus: document.getElementById("detail-status"),
  detailTitle: document.getElementById("detail-title"),
  detailSummary: document.getElementById("detail-summary"),
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
};

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.remove("is-on"), 1700);
}

function statusLabel(status) {
  return (
    {
      done: "已完成",
      current: "进行中",
      open: "可进入",
      locked: "未解锁",
    }[status] || status
  );
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
  els.doneCount.textContent = String(p.completed.length);
  els.playerLv.textContent = `Lv.${Math.max(1, Math.floor(p.completed.length / 2) + 1)}`;

  const rewards = nextRewards(p);
  els.rewardList.innerHTML = rewards
    .map(
      (item) => `
      <div class="reward-item">
        <img src="${KIT}/${item.kind === "星星" ? "icon-star.png" : "chest-claimable.png"}" alt="" />
        <span><strong>${item.label}</strong><small>${item.kind}</small></span>
      </div>`,
    )
    .join("");
}

function paintRegions() {
  els.regionDock.innerHTML = REGIONS.map((region) => {
    const { done, total } = regionProgress(state.progress, region);
    const active =
      state.progress.current >= region.range[0] &&
      state.progress.current <= region.range[1];
    return `
      <button type="button" class="region-btn${active ? " is-active" : ""}" data-region="${region.id}">
        <img src="${KIT}/region-banner-${region.index}.png" alt="${region.titleEn}" />
        <span class="en">${region.titleEn} · ${done}/${total}</span>
      </button>`;
  }).join("");

  els.regionTitles.innerHTML = REGIONS.map(
    (region) => `
      <div class="region-title" style="left:${region.focus.x}%;top:${Math.max(8, region.focus.y - 10)}%">
        ${region.titleEn}
      </div>`,
  ).join("");

  els.regionDock.querySelectorAll(".region-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const region = REGIONS.find((r) => r.id === btn.dataset.region);
      if (!region) return;
      focusPercent(region.focus.x, region.focus.y);
      toast(region.titleEn);
    });
  });
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
      `第 ${pt.id} 关，${statusLabel(status)}${meta?.isChest ? "，奖励关" : ""}`,
    );
    btn.innerHTML = `
      <img class="art" src="${artMap[status]}" alt="" draggable="false" />
      <span class="num">${pt.id}</span>`;
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

function openDetail(id) {
  const node = getNode(id);
  if (!node) return;
  const status = nodeStatus(state.progress, id);
  state.selectedId = id;
  paintNodes();

  els.detailCard.hidden = false;
  els.detailBadge.textContent = String(id);
  els.detailStatus.textContent = statusLabel(status);
  els.detailTitle.textContent = node.title;
  els.detailSummary.textContent = node.summary;
  els.detailReward.textContent = `奖励：${node.reward.label}`;
  els.detailEnter.disabled = status === "locked";
  els.detailEnter.setAttribute(
    "aria-label",
    status === "done" ? "再次进入" : status === "locked" ? "尚未解锁" : "进入关卡",
  );

  if (status === "locked") toast("请先完成前一关后再解锁");
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
  openDetail(id);
  focusPercent(pt.x, pt.y, {
    quiet,
    message: `已定位到第 ${id} 关`,
  });
}

function enterLevel(id) {
  const status = nodeStatus(state.progress, id);
  if (status === "locked") {
    toast("关卡尚未解锁");
    return;
  }
  state.progress.current = id;
  saveProgress(state.progress);
  location.href = quizUrlFor(id);
}

function hydratePlayer() {
  const avatar = loadFinal();
  const companion = loadConfirmedCompanion() || loadCompanionDraft();
  if (avatar?.name) els.playerName.textContent = avatar.name;

  const frame = els.profileAvatar.querySelector(".frame-art");
  if (companion?.portrait) {
    els.profileAvatar.classList.remove("is-empty");
    const existing = els.profileAvatar.querySelector(".portrait");
    if (existing) existing.remove();
    const img = document.createElement("img");
    img.className = "portrait";
    img.src = companion.portrait;
    img.alt = companion.name || "";
    els.profileAvatar.insertBefore(img, frame);
    els.companionLine.textContent =
      companion.intro || "我在这里陪你。一步一步，我们就能走完全程。";
  } else {
    els.profileAvatar.classList.add("is-empty");
  }
}

function absorbQueryFlags() {
  const params = new URLSearchParams(location.search);
  const complete = Number(params.get("complete"));
  if (complete >= 1 && complete <= 50 && isUnlocked(state.progress, complete)) {
    if (!state.progress.completed.includes(complete)) {
      state.progress.completed.push(complete);
      state.progress.stars += 1;
      if (complete % 10 === 0) state.progress.gems += 5;
    }
    state.progress.current = Math.min(50, complete + 1);
    saveProgress(state.progress);
    history.replaceState({}, "", location.pathname);
    toast(`第 ${complete} 关已记入完成`);
  }
}

function paintAll() {
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
els.continueBtn.addEventListener("click", () => {
  const id = state.progress.current;
  if (!isUnlocked(state.progress, id)) {
    toast("当前关卡仍锁定");
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
hydratePlayer();
paintAll();
applyZoom();
locateCurrent({ quiet: true });
