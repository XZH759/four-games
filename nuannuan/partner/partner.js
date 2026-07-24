import { loadFinal } from "/js/nuannuan/avatar-config.js";
import {
  COMPANIONS,
  confirmCompanion,
  loadCompanionDraft,
  loadConfirmedCompanion,
  saveCompanionDraft,
} from "/js/nuannuan/companion-config.js";

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
}

function portraitImg(src, alt = "") {
  return `<img src="${src}" alt="${alt}" draggable="false" decoding="async" />`;
}

function paintCandidates() {
  els.list.innerHTML = "";
  if (!COMPANIONS.length) {
    els.list.innerHTML = '<p class="empty-state">伙伴资料暂时不可用，请稍后再试。</p>';
    els.confirm.disabled = true;
    els.start.disabled = true;
    return;
  }

  COMPANIONS.forEach((companion, index) => {
    const selected = state.selected?.id === companion.id;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "candidate-card";
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(selected));
    button.setAttribute(
      "aria-label",
      `${companion.nameEn || companion.name}，${companion.role}。${companion.summary}`,
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

    button.addEventListener("click", () => selectCompanion(companion, button));
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
  els.tipsText.textContent = `已预览「${label}」。点击「选择伙伴」锁定后再开始答题。`;
  syncActions();
  state.busy = false;
  announce(`已预览 ${label}`);
}

function paintDetail(companion) {
  if (!companion) {
    els.detailAvatar.innerHTML = "";
    els.detailName.textContent = "请选择伙伴";
    els.detailNameEn.textContent = "PARTNER";
    els.detailRole.textContent = "从左侧候选中选择一位同行者";
    els.detailBio.textContent = "";
    els.detailIntro.textContent =
      "每次测试只能选择一位伙伴。伙伴不会影响分数，也不会提供题目答案。";
    els.traits.innerHTML = '<p class="empty-state">选择后可查看核心特质</p>';
    return;
  }

  applyTheme(companion);
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

function paintTeam(companion) {
  els.teamSlots.innerHTML = "";
  for (let i = 0; i < TEAM_SLOT_COUNT; i += 1) {
    const slot = document.createElement("div");
    slot.className = "team-slot";
    slot.dataset.slot = String(i + 1);
    if (i === 0 && companion) {
      slot.classList.add("is-filled");
      slot.setAttribute("aria-label", `已选择 ${companion.nameEn || companion.name}`);
      slot.innerHTML = portraitImg(companion.portrait, companion.nameEn || companion.name);
    } else {
      slot.innerHTML = "<span>未选择</span>";
    }
    els.teamSlots.appendChild(slot);
  }
}

function syncActions() {
  const hasSelection = Boolean(state.selected);
  const isConfirmed = hasSelection && state.confirmed?.id === state.selected.id;
  els.confirm.disabled = !hasSelection || state.busy;
  els.confirm.innerHTML = isConfirmed
    ? '<span aria-hidden="true">✓</span>已选择伙伴'
    : '<span aria-hidden="true">✦</span>选择伙伴';
  els.confirm.classList.toggle("is-confirmed", isConfirmed);
  els.start.disabled = !isConfirmed || state.busy;
  els.viewDetail.disabled = !hasSelection;
}

els.viewDetail.addEventListener("click", () => {
  if (!state.selected) {
    announce("请先选择一位学习伙伴");
    return;
  }
  const c = state.selected;
  els.detailDialogBody.innerHTML = `
    <strong>${c.nameEn || c.name} · ${c.role}</strong><br/><br/>
    ${c.description}<br/><br/>
    标签：${(c.tags || []).join(" / ")}<br/>
    提示：${c.summary}`;
  if (typeof els.detailDialog.showModal === "function") {
    els.detailDialog.showModal();
  } else {
    announce(c.description);
  }
});

els.confirm.addEventListener("click", async () => {
  if (state.busy) return;
  if (!state.selected) {
    announce("请先选择一位学习伙伴");
    return;
  }
  state.busy = true;
  syncActions();
  els.confirm.textContent = "保存中…";
  try {
    if (!confirmCompanion(state.selected.id)) throw new Error("Invalid companion");
    state.confirmed = state.selected;
    paintTeam(state.selected);
    const label = state.selected.nameEn || state.selected.name;
    els.tipsText.textContent = `「${label}」已锁定。可以开始答题了。`;
    announce(`已选择 ${label} 作为本次学习伙伴`);
  } catch (error) {
    console.error(error);
    announce("保存失败，请稍后重试");
  } finally {
    state.busy = false;
    syncActions();
  }
});

els.start.addEventListener("click", () => {
  if (state.busy) return;
  if (!state.confirmed || state.confirmed.id !== state.selected?.id) {
    announce("请先确认当前伙伴，再开始答题");
    return;
  }
  state.busy = true;
  syncActions();
  els.start.textContent = "正在进入…";
  location.href = TEST_URL;
});

els.guideOpen.addEventListener("click", () => {
  if (typeof els.guideDialog.showModal === "function") {
    els.guideDialog.showModal();
  } else {
    announce("伙伴只提供鼓励与提醒，不会直接告诉你答案。");
  }
});

paintCandidates();
paintDetail(state.selected);
paintTeam(state.selected);
syncActions();
if (state.selected) {
  els.tipsText.textContent = `当前预览「${state.selected.nameEn || state.selected.name}」。确认后即可开始答题。`;
}
