/**
 * 界面 01 · 初始形象创建
 * 接入 /character-assets 分层素材：asset_id 状态 + 固定层序渲染
 */
import {
  GENDERS,
  DEFAULT_AVATAR,
  normalizeAvatar,
  loadDraft,
  saveDraft,
  loadFinal,
  saveFinal,
  loadByGenderMap,
  saveByGenderMap,
  randomName,
  validateName,
  toSavedCharacter,
} from "/js/nuannuan/avatar-config.js";
import { renderAvatar } from "/js/nuannuan/AvatarRenderer.js";
import { outfitAura } from "/js/nuannuan/avatar-manifest.js";
import { UI_ASSETS, uiCssVars } from "/js/nuannuan/ui-manifest.js";
import {
  APPEARANCE_LAYER_META,
  createDefaultSelection,
  cycleHairPair,
  cycleLayer,
  getAssetIndexSync,
  getAssetsByIdSync,
  getAssetsForLayer,
  getAssetUrl,
  labelForAsset,
  loadAssetIndex,
  preloadImages,
  randomizeSelection,
} from "/js/nuannuan/character-assets.js";
import {
  careerOptionsForGender,
  findReference,
  getReferenceSheetUrl,
  loadReferenceIndex,
} from "/js/nuannuan/character-reference.js";

const NEXT_URL = "/nuannuan/partner";
const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const USE_FIXTURES = new URLSearchParams(location.search).get("fixtures") === "1";

(function injectUiVars() {
  const style = document.createElement("style");
  style.id = "ui-manifest-vars";
  style.textContent = `:root {\n  ${uiCssVars("ui")};\n}`;
  document.head.appendChild(style);
})();

if (USE_FIXTURES) {
  document.body.classList.add("is-fixtures");
}

const state = {
  avatar: normalizeAvatar(loadDraft() || loadFinal() || DEFAULT_AVATAR),
  byGender: loadByGenderMap(),
  assetIndex: null,
  busy: false,
  confirmLock: false,
  ready: false,
};

const els = {
  doll: document.getElementById("doll"),
  stage: document.getElementById("stage"),
  appear: document.getElementById("appear-opts"),
  genderList: document.getElementById("gender-list"),
  careerList: document.getElementById("career-list"),
  name: document.getElementById("name"),
  nameError: document.getElementById("name-error"),
  nameScroll: document.getElementById("name-scroll"),
  toast: document.getElementById("toast"),
  confirm: document.getElementById("confirm"),
  random: document.getElementById("random"),
  placeholderNote: document.getElementById("placeholder-note"),
  loadError: document.getElementById("load-error"),
  pageSub: document.getElementById("page-sub"),
};

function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.remove("show"), 1800);
}

function ensureSelection(gender = state.avatar.gender) {
  const index = getAssetIndexSync();
  if (!index) return null;
  if (
    !state.avatar.selection ||
    state.avatar.gender !== gender ||
    !state.avatar.selection.body ||
    !state.avatar.selection.face ||
    !state.avatar.selection.eyes
  ) {
    state.avatar.selection = createDefaultSelection(index, gender);
  }
  return state.avatar.selection;
}

function persist() {
  saveDraft(state.avatar);
  state.byGender[state.avatar.gender] = toSavedCharacter(state.avatar);
  saveByGenderMap(state.byGender);
}

function applyGenderTheme() {
  const male = state.avatar.gender === "male";
  document.body.classList.toggle("is-male", male);
  document.body.classList.toggle("is-female", !male);
  if (els.pageSub) {
    els.pageSub.textContent = male
      ? "→ 选择你的专属学习伙伴（少年形象）"
      : "→ 选择你的专属学习伙伴";
  }
}

function setNameError(msg) {
  if (!els.nameError) return;
  els.nameError.textContent = msg || "";
  els.nameError.hidden = !msg;
  els.name?.classList.toggle("is-invalid", Boolean(msg));
  els.name?.setAttribute("aria-invalid", msg ? "true" : "false");
  els.nameScroll?.classList.toggle("is-error", Boolean(msg));
}

function clearCareerReference() {
  state.avatar.role = null;
  state.avatar.characterId = null;
  state.avatar.referenceSheet = null;
}

function applyCareerReference(role) {
  const asset = findReference(role, state.avatar.gender);
  if (!asset) return false;
  state.avatar.role = asset.role;
  state.avatar.characterId = asset.id;
  state.avatar.referenceSheet = getReferenceSheetUrl(asset);
  return true;
}

async function paintPreview() {
  if (!els.doll) return;
  if (!USE_FIXTURES && !state.avatar.selection && !state.avatar.referenceSheet) return;
  els.stage?.style.setProperty("--aura", outfitAura("scholar", state.avatar.gender));
  const payload = USE_FIXTURES
    ? { ...state.avatar, useFixtures: true, referenceSheet: null }
    : state.avatar;
  const result = await renderAvatar(els.doll, payload, {
    uid: "main",
    showBadge: false,
    allowSvgFallback: !USE_FIXTURES,
  });
  if (els.placeholderNote) {
    if (USE_FIXTURES) {
      els.placeholderNote.hidden = false;
      els.placeholderNote.textContent =
        "开发验收模式（?fixtures=1）：body / outfit / hairFront 契约剪影，脚底基线 y=1440。";
    } else {
      const usingCareerSheet = Boolean(state.avatar.referenceSheet) && !result?.placeholder;
      if (usingCareerSheet) {
        els.placeholderNote.hidden = false;
        els.placeholderNote.textContent =
          "当前为职业风格预览。正式单人立绘到位后将替换。";
      } else {
        els.placeholderNote.hidden = !result?.placeholder;
        if (result?.placeholder) {
          els.placeholderNote.innerHTML =
            `角色分层素材未就绪，已临时使用 SVG fallback。运行时素材位于 <code>/character-assets/</code>。`;
        }
      }
    }
  }
}

function currentAssetLabel(layer) {
  const id = state.avatar.selection?.[layer];
  if (!id) return "无";
  return labelForAsset(getAssetsByIdSync().get(id));
}

function layerPreviewSrc(layer) {
  const id = state.avatar.selection?.[layer];
  if (!id) return "";
  const asset = getAssetsByIdSync().get(id);
  return asset ? getAssetUrl(asset) : "";
}

async function preloadLayerCandidates(layerKeys) {
  const index = getAssetIndexSync();
  if (!index) return;
  const urls = [];
  layerKeys.forEach((layer) => {
    getAssetsForLayer(index, state.avatar.gender, layer).forEach((asset) => {
      urls.push(getAssetUrl(asset));
    });
  });
  await preloadImages(urls.slice(0, 12));
}

function paintAppear() {
  if (!els.appear || !state.avatar.selection) return;
  els.appear.innerHTML = "";

  APPEARANCE_LAYER_META.forEach((field) => {
    const primary = field.layers[0];
    const src = layerPreviewSrc(field.key === "hair" ? "hairFront" : primary);
    const row = document.createElement("div");
    row.className = "opt-row";
    row.innerHTML = `
      <span class="opt-label">${field.label}</span>
      <button type="button" class="arrow game-focus" data-dir="-1" aria-label="上一个${field.label}">◀</button>
      <span class="opt-value">
        ${src ? `<span class="opt-preview has-layer" aria-hidden="true"><img src="${src}" alt="" /></span>` : `<span class="opt-preview is-acc" aria-hidden="true">◇</span>`}
        <span class="opt-text">${currentAssetLabel(primary)}</span>
      </span>
      <button type="button" class="arrow game-focus" data-dir="1" aria-label="下一个${field.label}">▶</button>`;

    row.querySelectorAll(".arrow").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (state.busy || !state.ready) return;
        const dir = Number(btn.dataset.dir);
        const index = getAssetIndexSync();
        await preloadLayerCandidates(field.layers);
        if (field.key === "hair") {
          state.avatar.selection = cycleHairPair(
            index,
            state.avatar.gender,
            state.avatar.selection,
            dir,
          );
        } else {
          state.avatar.selection = cycleLayer(
            index,
            state.avatar.gender,
            state.avatar.selection,
            primary,
            dir,
          );
        }
        clearCareerReference();
        persist();
        paintAppear();
        paintCareers();
        await paintPreview();
        paintThumbs();
      });
    });
    els.appear.appendChild(row);
  });
}

function bindCardPress(btn) {
  const set = (cls, on) => btn.classList.toggle(cls, on);
  btn.addEventListener("pointerdown", () => {
    if (btn.disabled || btn.classList.contains("is-disabled")) return;
    set("is-pressed", true);
  });
  btn.addEventListener("pointerup", () => set("is-pressed", false));
  btn.addEventListener("pointerleave", () => set("is-pressed", false));
  btn.addEventListener("pointercancel", () => set("is-pressed", false));
}

function paintGenders() {
  if (!els.genderList) return;
  els.genderList.innerHTML = "";
  GENDERS.forEach((g) => {
    const on = state.avatar.gender === g.id;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `choice game-card${on ? " is-on is-selected" : ""}`;
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", on ? "true" : "false");
    btn.setAttribute("aria-label", `${g.label}${g.hint ? `，${g.hint}` : ""}`);
    btn.innerHTML = `
      <span class="mini" data-thumb="gender-${g.id}"></span>
      <span class="choice-label">${g.label}</span>
      <span class="check" aria-hidden="true"></span>`;
    bindCardPress(btn);
    btn.addEventListener("click", async () => {
      if (state.busy || on || !state.ready) return;
      state.byGender[state.avatar.gender] = toSavedCharacter(state.avatar);
      const sharedName = state.avatar.name;
      const remembered = state.byGender[g.id];
      if (remembered?.selection) {
        state.avatar = normalizeAvatar({ ...remembered, gender: g.id, name: sharedName });
      } else {
        state.avatar = normalizeAvatar({
          gender: g.id,
          name: sharedName,
          selection: createDefaultSelection(getAssetIndexSync(), g.id),
        });
      }
      ensureSelection(g.id);
      if (state.avatar.role) {
        if (!applyCareerReference(state.avatar.role)) clearCareerReference();
      }
      persist();
      applyGenderTheme();
      paintAppear();
      paintGenders();
      paintCareers();
      await paintPreview();
      paintThumbs();
      toast(g.id === "male" ? "已切换为男性形象" : "已切换为女性形象");
    });
    els.genderList.appendChild(btn);
  });
}

function paintCareers() {
  if (!els.careerList) return;
  els.careerList.innerHTML = "";
  careerOptionsForGender(state.avatar.gender).forEach((career) => {
    const on = state.avatar.role === career.id;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `choice career-choice${on ? " is-on is-selected" : ""}${career.disabled ? " is-disabled" : ""}`;
    btn.disabled = Boolean(career.disabled);
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", on ? "true" : "false");
    btn.setAttribute("aria-disabled", career.disabled ? "true" : "false");
    btn.innerHTML = `
      ${career.thumbUrl || career.sheetUrl ? `<span class="career-thumb" aria-hidden="true"><img src="${career.thumbUrl || career.sheetUrl}" alt="" /></span>` : ""}
      <span class="choice-label">${career.label}</span>
      <span class="choice-hint">${career.hint}</span>
      <span class="check" aria-hidden="true"></span>`;
    if (!career.disabled) {
      bindCardPress(btn);
      btn.addEventListener("click", async () => {
        if (state.busy || !state.ready) return;
        if (on) {
          clearCareerReference();
          toast("已回到分层自定义");
        } else {
          applyCareerReference(career.id);
          toast(`已选用${career.label}`);
        }
        persist();
        paintCareers();
        await paintPreview();
      });
    }
    els.careerList.appendChild(btn);
  });
}

function paintThumbs() {
  GENDERS.forEach((g) => {
    const el = document.querySelector(`[data-thumb="gender-${g.id}"]`);
    if (!el || !getAssetIndexSync()) return;
    const cfg =
      g.id === state.avatar.gender
        ? state.avatar
        : normalizeAvatar({
            ...(state.byGender[g.id] || {}),
            gender: g.id,
            name: state.avatar.name,
            selection:
              state.byGender[g.id]?.selection ||
              createDefaultSelection(getAssetIndexSync(), g.id),
          });
    el.classList.add("is-loading");
    renderAvatar(el, cfg, {
      uid: `g-${g.id}`,
      compact: true,
      showBadge: false,
    }).finally(() => el.classList.remove("is-loading"));
  });
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, REDUCE ? 0 : ms));
}

async function onRandom() {
  if (state.busy || state.confirmLock || !state.ready) return;
  state.busy = true;
  els.random.disabled = true;
  els.random.classList.add("is-saving");
  try {
    state.avatar.name = randomName(state.avatar.gender);
    els.name.value = state.avatar.name;
    setNameError("");
    state.avatar.selection = randomizeSelection(getAssetIndexSync(), state.avatar.gender);
    clearCareerReference();
    persist();
    paintAppear();
    paintCareers();
    await paintPreview();
    paintThumbs();
    toast("随机形象已生成");
  } finally {
    state.busy = false;
    els.random.disabled = false;
    els.random.classList.remove("is-saving");
  }
}

async function onConfirm() {
  if (state.confirmLock || state.busy || !state.ready) return;
  const check = validateName(els.name.value);
  if (!check.ok) {
    setNameError(check.message);
    els.name.focus();
    toast(check.message);
    return;
  }
  setNameError("");
  state.confirmLock = true;
  els.confirm.disabled = true;
  els.confirm.classList.add("is-saving");
  els.confirm.setAttribute("aria-busy", "true");
  els.confirm.textContent = "保存中…";

  try {
    state.avatar.name = check.name;
    saveFinal(state.avatar);
    toast("探索形象创建完成！");
    await wait(REDUCE ? 120 : 520);
    location.href = NEXT_URL;
  } catch (err) {
    state.confirmLock = false;
    els.confirm.disabled = false;
    els.confirm.classList.remove("is-saving");
    els.confirm.removeAttribute("aria-busy");
    els.confirm.textContent = "确认进入 ✦";
    toast("保存失败，请重试");
    console.error(err);
  }
}

function bindMobileToggles() {
  document.querySelectorAll("[data-panel-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-panel-toggle");
      const panel = document.getElementById(id);
      if (!panel) return;
      const open = panel.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
}

els.name.value = state.avatar.name || "";
els.name.addEventListener("input", () => {
  state.avatar.name = els.name.value.slice(0, 8);
  if (els.name.value.trim()) setNameError("");
  persist();
});
document.getElementById("dice")?.addEventListener("click", () => {
  els.name.value = randomName(state.avatar.gender);
  state.avatar.name = els.name.value;
  setNameError("");
  persist();
});
els.random?.addEventListener("click", onRandom);
els.confirm?.addEventListener("click", onConfirm);
bindMobileToggles();

const checkPreload = new Image();
checkPreload.src = UI_ASSETS.selectedCheck;

async function boot() {
  try {
    const [layeredIndex] = await Promise.all([
      loadAssetIndex(),
      loadReferenceIndex().catch((error) => {
        console.warn(error);
        return null;
      }),
    ]);
    state.assetIndex = layeredIndex;
    ensureSelection(state.avatar.gender);
    if (state.avatar.role && !state.avatar.referenceSheet) {
      applyCareerReference(state.avatar.role);
    }
    state.ready = true;
    if (els.loadError) els.loadError.hidden = true;
    applyGenderTheme();
    paintAppear();
    paintGenders();
    paintCareers();
    persist();
    await paintPreview();
    paintThumbs();
  } catch (error) {
    console.error(error);
    if (els.loadError) {
      els.loadError.hidden = false;
      els.loadError.textContent = error.message || "角色素材加载失败";
    }
    toast("角色素材加载失败");
  }
}

boot();
