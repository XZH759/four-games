import { loadFinal } from "/js/nuannuan/avatar-config.js";
import { mountLobbyExit } from "/js/lobby-exit.js";
import { initI18n, onLangChange, applyDom, getLang, t } from "/js/i18n.js";
import {
  COMPANIONS,
  confirmCompanion,
  loadCompanionDraft,
  loadConfirmedCompanion,
  localizeCompanion,
  saveCompanionDraft,
} from "/js/nuannuan/companion-config.js";

initI18n({ toggleHost: "#lang-host" });
onLangChange(() => {
  applyDom();
  refreshUi();
});
mountLobbyExit();

const TEST_URL = "/nuannuan/map";
const TEAM_SLOT_COUNT = 6;

const state = {
  selected: loadCompanionDraft() || loadConfirmedCompanion() || COMPANIONS[5] || COMPANIONS[0] || null,
  confirmed: loadConfirmedCompanion(),
  busy: false,
};

const els = {
  list: document.getElementById("candidate-list"),
  detailAvatar: document.getElementById("detail-avatar"),
  detailName: document.getElementById("detail-name"),
  detailNameEn: document.getElementById("detail-name-en"),
  detailRole: document.getElementById("detail-role"),
  detailBio: document.getElementById("detail-bio"),
  detailIntro: document.getElementById("detail-intro"),
  traits: document.getElementById("trait-list"),
  teamSlots: document.getElementById("team-slots"),
  tipsText: document.getElementById("tips-text"),
  viewDetail: document.getElementById("view-detail"),
  confirm: document.getElementById("confirm-partner"),
  start: document.getElementById("start-test"),
  message: document.getElementById("page-message"),
  guideOpen: document.getElementById("guide-open"),
  guideDialog: document.getElementById("guide-dialog"),
  detailDialog: document.getElementById("detail-dialog"),
  detailDialogBody: document.getElementById("detail-dialog-body"),
};

if (!loadFinal()) {
  location.replace("/nuannuan/login");
}

function current(companion = state.selected) {
  return localizeCompanion(companion, getLang());
}

function announce(text) {
  els.message.textContent = text;
  els.message.classList.add("is-visible");
  clearTimeout(announce.timer);
  announce.timer = setTimeout(() => els.message.classList.remove("is-visible"), 1900);
}

function applyTheme(companion) {
  const accent = companion?.accent || "#ff7ab8";
  document.body.style.setProperty("--accent", accent);
  document.body.dataset.companion = companion?.id || "";
  const stageWrap = document.querySelector(".detail-stage-wrap");
  if (stageWrap) {
    if (companion?.stage) {
      stageWrap.style.setProperty("--stage-bg", `url("${companion.stage}")`);
      stageWrap.dataset.hasStage = "1";
    } else {
      stageWrap.style.removeProperty("--stage-bg");
      stageWrap.dataset.hasStage = "0";
    }
  }
}

function portraitImg(src, alt = "") {
  return `<img src="${src}" alt="${alt}" draggable="false" decoding="async" />`;
}

function paintCandidates() {
  els.list.innerHTML = "";
  if (!COMPANIONS.length) {
    els.list.innerHTML = `<p class="empty-state">${t("partner.emptyList")}</p>`;
    els.confirm.disabled = true;
    els.start.disabled = true;
    return;
  }

  COMPANIONS.forEach((raw, index) => {
    const companion = localizeCompanion(raw, getLang());
    const selected = state.selected?.id === companion.id;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "candidate-card";
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(selected));
    button.setAttribute(
      "aria-label",
      t("partner.ariaCard", {
        name: companion.nameEn || companion.name,
        role: companion.role,
        summary: companion.summary,
      }),
    );
    button.innerHTML = `
      <span class="candidate-number" aria-hidden="true">${index + 1}</span>
      <span class="selected-badge">SELECTED</span>
      <span class="candidate-avatar">${portraitImg(companion.portrait, "")}</span>
      <span class="candidate-copy">
        <span class="candidate-name">${companion.nameEn || companion.name}</span>
        <span class="candidate-role">${companion.role}</span>
        <span class="candidate-tags">${(companion.tags || [])
          .map((tag) => `<span>${tag}</span>`)
          .join("")}</span>
      </span>`;

    button.addEventListener("click", () => selectCompanion(raw, button));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(event.key)) return;
      event.preventDefault();
      const cols = 2;
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % COMPANIONS.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + COMPANIONS.length) % COMPANIONS.length;
      if (event.key === "ArrowDown") nextIndex = (index + cols) % COMPANIONS.length;
      if (event.key === "ArrowUp") nextIndex = (index - cols + COMPANIONS.length) % COMPANIONS.length;
      const next = els.list.children[nextIndex];
      next?.focus();
      selectCompanion(COMPANIONS[nextIndex], next);
    });

    els.list.appendChild(button);
  });
}

async function selectCompanion(companion, button) {
  if (state.busy || !companion) return;
  if (state.selected?.id === companion.id) {
    syncActions();
    return;
  }
  state.busy = true;
  state.selected = companion;
  if (state.confirmed?.id !== companion.id) state.confirmed = null;
  saveCompanionDraft(companion.id);

  [...els.list.children].forEach((item) => {
    item.setAttribute("aria-selected", String(item === button));
  });
  applyTheme(companion);
  paintDetail(companion);
  paintTeam(companion);
  const label = companion.nameEn || companion.name;
  els.tipsText.textContent = t("partner.previewTip", { name: label });
  syncActions();
  state.busy = false;
  announce(t("partner.previewed", { name: label }));
}

function paintDetail(raw) {
  const companion = current(raw);
  if (!companion) {
    els.detailAvatar.innerHTML = "";
    els.detailName.textContent = t("partner.pickFirst");
    els.detailNameEn.textContent = "PARTNER";
    els.detailRole.textContent = t("partner.pickHint");
    els.detailBio.textContent = "";
    els.detailIntro.textContent = t("partner.emptyIntro");
    els.traits.innerHTML = `<p class="empty-state">${t("partner.emptyTraits")}</p>`;
    return;
  }

  applyTheme(raw);
  const label = companion.nameEn || companion.name;
  els.detailAvatar.innerHTML = portraitImg(companion.portrait, `${label}`);
  els.detailName.textContent = label;
  els.detailNameEn.textContent = label;
  els.detailRole.textContent = companion.role;
  els.detailBio.textContent = companion.description;
  els.detailIntro.textContent = companion.intro || companion.summary;
  els.traits.innerHTML = companion.traits
    .map(
      (trait) => `
        <div class="trait">
          <span class="trait-icon" aria-hidden="true">${trait.icon}</span>
          <span><strong>${trait.name}</strong><small>${trait.text}</small></span>
        </div>`,
    )
    .join("");
}

function paintTeam(raw) {
  const companion = current(raw);
  els.teamSlots.innerHTML = "";
  for (let i = 0; i < TEAM_SLOT_COUNT; i += 1) {
    const slot = document.createElement("div");
    slot.className = "team-slot";
    slot.dataset.slot = String(i + 1);
    if (i === 0 && companion) {
      const label = companion.nameEn || companion.name;
      slot.classList.add("is-filled");
      slot.setAttribute("aria-label", t("partner.slotFilled", { name: label }));
      slot.innerHTML = portraitImg(companion.portrait, label);
    } else {
      slot.innerHTML = `<span>${t("partner.slotEmpty")}</span>`;
    }
    els.teamSlots.appendChild(slot);
  }
}

function syncActions() {
  const hasSelection = Boolean(state.selected);
  const isConfirmed = hasSelection && state.confirmed?.id === state.selected.id;
  els.confirm.disabled = !hasSelection || state.busy;
  els.confirm.innerHTML = isConfirmed
    ? `<span aria-hidden="true">✓</span>${t("partner.picked")}`
    : `<span aria-hidden="true">✦</span>${t("partner.pick")}`;
  els.confirm.classList.toggle("is-confirmed", isConfirmed);
  els.start.disabled = !isConfirmed || state.busy;
  els.start.innerHTML = `<span aria-hidden="true">◎</span>${t("partner.start")}`;
  els.viewDetail.disabled = !hasSelection;
  els.viewDetail.innerHTML = `<span aria-hidden="true">📄</span>${t("partner.viewDetail")}`;
}

function refreshUi() {
  paintCandidates();
  paintDetail(state.selected);
  paintTeam(state.selected);
  syncActions();
  if (state.selected) {
    const label = state.selected.nameEn || state.selected.name;
    const locked = state.confirmed?.id === state.selected.id;
    els.tipsText.textContent = locked
      ? t("partner.lockedTip", { name: label })
      : t("partner.currentTip", { name: label });
  } else {
    els.tipsText.textContent = t("partner.tipsDefault");
  }
}

els.viewDetail.addEventListener("click", () => {
  if (!state.selected) {
    announce(t("partner.needPick"));
    return;
  }
  const c = current(state.selected);
  els.detailDialogBody.innerHTML = `
    <strong>${c.nameEn || c.name} · ${c.role}</strong><br/><br/>
    ${c.description}<br/><br/>
    ${t("partner.tags")}：${(c.tags || []).join(" / ")}<br/>
    ${t("partner.hint")}：${c.summary}`;
  if (typeof els.detailDialog.showModal === "function") {
    els.detailDialog.showModal();
  } else {
    announce(c.description);
  }
});

els.confirm.addEventListener("click", async () => {
  if (state.busy) return;
  if (!state.selected) {
    announce(t("partner.needPick"));
    return;
  }
  state.busy = true;
  syncActions();
  els.confirm.textContent = t("partner.saving");
  try {
    if (!confirmCompanion(state.selected.id)) throw new Error("Invalid companion");
    state.confirmed = state.selected;
    paintTeam(state.selected);
    const label = state.selected.nameEn || state.selected.name;
    els.tipsText.textContent = t("partner.lockedTip", { name: label });
    announce(t("partner.chosen", { name: label }));
  } catch (error) {
    console.error(error);
    announce(t("partner.saveFail"));
  } finally {
    state.busy = false;
    syncActions();
  }
});

els.start.addEventListener("click", () => {
  if (state.busy) return;
  if (!state.confirmed || state.confirmed.id !== state.selected?.id) {
    announce(t("partner.needConfirm"));
    return;
  }
  state.busy = true;
  syncActions();
  els.start.textContent = t("partner.entering");
  location.href = TEST_URL;
});

els.guideOpen.addEventListener("click", () => {
  if (typeof els.guideDialog.showModal === "function") {
    els.guideDialog.showModal();
  } else {
    announce(t("partner.notice"));
  }
});

function preloadStages() {
  for (const companion of COMPANIONS) {
    if (!companion.stage) continue;
    const img = new Image();
    img.decoding = "async";
    img.src = companion.stage;
  }
}

preloadStages();
refreshUi();
