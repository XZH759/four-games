/**
 * 角色建立頁控制器
 */
import {
  TABS,
  DEFAULT_CONFIG,
  optionsForField,
  cloneConfig,
  loadDraft,
  saveDraft,
  loadFinal,
  saveFinal,
  randomConfig,
  normalizeConfig,
} from "../js/explorer/character-config.js";
import { buildCharacterSVG, buildOptionThumb } from "../js/explorer/character-preview.js";

const NEXT_URL = "/explorer/partner";
const REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  config: normalizeConfig(loadDraft() || loadFinal() || DEFAULT_CONFIG),
  tab: "body",
  view: 0,
};

const els = {
  preview: document.getElementById("preview-host"),
  tabs: document.getElementById("tabs"),
  options: document.getElementById("options"),
  viewHint: document.getElementById("view-hint"),
  dialog: document.getElementById("reset-dialog"),
  toast: document.getElementById("toast"),
};

const VIEW_LABELS = ["正面", "右側", "背面", "左側"];

function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.remove("show"), 1800);
}

function persistDraft() {
  saveDraft(state.config);
}

function paintPreview(withTransition = true) {
  const run = () => {
    els.preview.innerHTML = buildCharacterSVG(state.config, state.view, "main");
    els.preview.classList.toggle("is-idle", state.view === 0 && !REDUCE_MOTION);
    els.viewHint.textContent = `目前視角：${VIEW_LABELS[state.view]}`;
  };
  if (!withTransition || REDUCE_MOTION) {
    run();
    return;
  }
  els.preview.classList.add("is-switching");
  setTimeout(() => {
    run();
    els.preview.classList.remove("is-switching");
  }, 160);
}

function currentField() {
  return TABS.find((t) => t.id === state.tab)?.field || "bodyType";
}

function paintTabs() {
  els.tabs.innerHTML = "";
  TABS.forEach((tab) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tab";
    btn.id = `tab-${tab.id}`;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", tab.id === state.tab ? "true" : "false");
    btn.setAttribute("aria-controls", "options");
    btn.tabIndex = tab.id === state.tab ? 0 : -1;
    btn.textContent = tab.label;
    btn.addEventListener("click", () => {
      state.tab = tab.id;
      paintTabs();
      paintOptions();
    });
    btn.addEventListener("keydown", (e) => {
      const idx = TABS.findIndex((t) => t.id === state.tab);
      if (e.key === "ArrowRight") {
        e.preventDefault();
        state.tab = TABS[(idx + 1) % TABS.length].id;
        paintTabs();
        paintOptions();
        document.getElementById(`tab-${state.tab}`)?.focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        state.tab = TABS[(idx - 1 + TABS.length) % TABS.length].id;
        paintTabs();
        paintOptions();
        document.getElementById(`tab-${state.tab}`)?.focus();
      }
    });
    els.tabs.appendChild(btn);
  });
}

function paintOptions() {
  const field = currentField();
  const options = optionsForField(field);
  const isSwatch = field === "skinTone" || field === "hairColor";
  els.options.className = `options-grid${isSwatch ? " is-swatch" : ""}`;
  els.options.innerHTML = "";
  els.options.setAttribute("role", "listbox");
  els.options.setAttribute("aria-label", TABS.find((t) => t.id === state.tab)?.label || "選項");

  options.forEach((opt) => {
    const selected =
      field === "accessoryId"
        ? state.config.accessoryId === opt.id
        : state.config[field] === opt.id;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-card";
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-checked", selected ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      `${opt.label}${opt.hint ? `，${opt.hint}` : ""}${selected ? "，已選取" : ""}`
    );
    btn.tabIndex = 0;

    const thumb = buildOptionThumb(field, opt, state.config);
    btn.innerHTML = `
      <span class="check" aria-hidden="true">✓</span>
      ${thumb}
      <span class="label">${opt.label}</span>
      ${opt.hint ? `<span class="hint">${opt.hint}</span>` : ""}
    `;

    const apply = () => {
      if (field === "accessoryId") state.config.accessoryId = opt.id;
      else state.config[field] = opt.id;
      persistDraft();
      paintPreview(true);
      paintOptions();
    };

    btn.addEventListener("click", apply);
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        apply();
      }
    });
    els.options.appendChild(btn);
  });
}

function rotate(dir) {
  state.view = (state.view + dir + 4) % 4;
  paintPreview(true);
}

function onRandom() {
  state.config = randomConfig();
  persistDraft();
  paintPreview(true);
  paintOptions();
  toast("已隨機產生造型，可繼續微調");
}

function openReset() {
  els.dialog.hidden = false;
  document.getElementById("reset-confirm")?.focus();
}

function closeReset() {
  els.dialog.hidden = true;
  document.getElementById("btn-reset")?.focus();
}

function doReset() {
  state.config = cloneConfig(DEFAULT_CONFIG);
  state.view = 0;
  persistDraft();
  paintPreview(true);
  paintOptions();
  closeReset();
  toast("已恢復預設造型");
}

function useDefaultAndContinue() {
  state.config = cloneConfig(DEFAULT_CONFIG);
  finish(true);
}

function finish(fromDefault = false) {
  saveFinal(state.config);
  toast("探索者建立完成！");
  setTimeout(() => {
    location.href = NEXT_URL + (fromDefault ? "?from=default" : "");
  }, REDUCE_MOTION ? 200 : 700);
}

function bind() {
  document.getElementById("btn-rot-left")?.addEventListener("click", () => rotate(-1));
  document.getElementById("btn-rot-right")?.addEventListener("click", () => rotate(1));
  document.getElementById("btn-random")?.addEventListener("click", onRandom);
  document.getElementById("btn-reset")?.addEventListener("click", openReset);
  document.getElementById("reset-cancel")?.addEventListener("click", closeReset);
  document.getElementById("reset-confirm")?.addEventListener("click", doReset);
  document.getElementById("btn-skip")?.addEventListener("click", useDefaultAndContinue);
  document.getElementById("btn-finish")?.addEventListener("click", () => finish(false));

  els.dialog?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeReset();
  });
  els.dialog?.addEventListener("click", (e) => {
    if (e.target === els.dialog) closeReset();
  });
}

paintTabs();
paintOptions();
paintPreview(false);
bind();
persistDraft();
