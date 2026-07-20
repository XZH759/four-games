/**
 * 界面 01 · 初始形象创建
 * 仅本页逻辑；确认进入 → /nuannuan/partner
 * 不改路由与保存契约
 */
import {
  getAppearanceFields,
  BODY_TYPES,
  STARTER_OUTFITS,
  GENDERS,
  DEFAULT_AVATAR,
  normalizeAvatar,
  loadDraft,
  saveDraft,
  loadFinal,
  saveFinal,
  loadByGenderMap,
  saveByGenderMap,
  randomAvatar,
  randomName,
  validateName,
  cycleOption,
  findById,
  switchGender,
} from "/js/nuannuan/avatar-config.js";
import { renderAvatar } from "/js/nuannuan/AvatarRenderer.js";
import { outfitAura } from "/js/nuannuan/avatar-manifest.js";
import { UI_ASSETS, uiCssVars } from "/js/nuannuan/ui-manifest.js";

const NEXT_URL = "/nuannuan/partner";
const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 注入 UI 资源 CSS 变量（路径唯一来自 ui-manifest） */
(function injectUiVars() {
  const style = document.createElement("style");
  style.id = "ui-manifest-vars";
  style.textContent = `:root {\n  ${uiCssVars("ui")};\n}`;
  document.head.appendChild(style);
})();

const state = {
  avatar: normalizeAvatar(loadDraft() || loadFinal() || DEFAULT_AVATAR),
  byGender: loadByGenderMap(),
  busy: false,
  confirmLock: false,
};

// 用当前草稿回填分性别缓存
if (state.avatar) {
  state.byGender[state.avatar.gender] = { ...state.avatar };
}

const els = {
  doll: document.getElementById("doll"),
  stage: document.getElementById("stage"),
  appear: document.getElementById("appear-opts"),
  genderList: document.getElementById("gender-list"),
  bodyList: document.getElementById("body-list"),
  outfitList: document.getElementById("outfit-list"),
  pager: document.getElementById("pager"),
  name: document.getElementById("name"),
  nameError: document.getElementById("name-error"),
  nameScroll: document.getElementById("name-scroll"),
  toast: document.getElementById("toast"),
  confirm: document.getElementById("confirm"),
  random: document.getElementById("random"),
  placeholderNote: document.getElementById("placeholder-note"),
};

function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.remove("show"), 1800);
}

function persist() {
  saveDraft(state.avatar);
  state.byGender[state.avatar.gender] = { ...state.avatar };
  saveByGenderMap(state.byGender);
}

function setNameError(msg) {
  if (!els.nameError) return;
  els.nameError.textContent = msg || "";
  els.nameError.hidden = !msg;
  els.name?.classList.toggle("is-invalid", Boolean(msg));
  els.name?.setAttribute("aria-invalid", msg ? "true" : "false");
  els.nameScroll?.classList.toggle("is-error", Boolean(msg));
  els.nameScroll?.classList.toggle("is-focus", false);
}

async function paintPreview() {
  if (!els.doll) return;
  els.stage?.style.setProperty("--aura", outfitAura(state.avatar.starterOutfit));
  const result = await renderAvatar(els.doll, state.avatar, {
    uid: "main",
    showBadge: false,
    allowSvgFallback: true,
  });
  if (els.placeholderNote) {
    els.placeholderNote.hidden = !result?.placeholder;
  }
}

function paintAppear() {
  els.appear.innerHTML = "";
  const fields = getAppearanceFields(state.avatar.gender);
  fields.forEach((field) => {
    const opts = field.options;
    const cur = findById(opts, state.avatar[field.key]);
    const row = document.createElement("div");
    row.className = "opt-row";
    const swatch =
      field.swatch && cur?.base
        ? `<span class="dot" style="background:${cur.base}"></span>`
        : field.swatchKey && cur?.[field.swatchKey]
          ? `<span class="dot" style="background:${cur[field.swatchKey]}"></span>`
          : "";

    row.innerHTML = `
      <span class="opt-label">${field.label}</span>
      <button type="button" class="arrow game-focus" data-dir="-1" aria-label="上一个${field.label}">◀</button>
      <span class="opt-value" id="val-${field.key}">${swatch}${cur?.label || ""}</span>
      <button type="button" class="arrow game-focus" data-dir="1" aria-label="下一个${field.label}">▶</button>`;

    row.querySelectorAll(".arrow").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (state.busy) return;
        state.avatar[field.key] = cycleOption(opts, state.avatar[field.key], Number(btn.dataset.dir));
        persist();
        paintAppear();
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
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", g.label);
    btn.innerHTML = `
      <span class="mini" data-thumb="gender-${g.id}"></span>
      <span class="choice-label">${g.label}</span>
      <span class="check" aria-hidden="true"></span>`;
    bindCardPress(btn);
    btn.addEventListener("click", async () => {
      if (state.busy || on) return;
      const { avatar, byGender } = switchGender(state.avatar, g.id, state.byGender);
      state.avatar = avatar;
      state.byGender = byGender;
      persist();
      paintAppear();
      paintGenders();
      paintBodies();
      paintOutfits();
      await paintPreview();
      paintThumbs();
    });
    els.genderList.appendChild(btn);
  });
}

function paintBodies() {
  els.bodyList.innerHTML = "";
  BODY_TYPES.forEach((b) => {
    const on = state.avatar.bodyType === b.id;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `choice game-card${on ? " is-on is-selected" : ""}`;
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", on ? "true" : "false");
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", `${b.label}，${b.hint}`);
    btn.innerHTML = `
      <span class="mini" data-thumb="body-${b.id}"></span>
      <span class="choice-label">${b.label}</span>
      <span class="check" aria-hidden="true"></span>`;
    bindCardPress(btn);
    btn.addEventListener("click", async () => {
      if (state.busy) return;
      state.avatar.bodyType = b.id;
      persist();
      paintBodies();
      await paintPreview();
      paintThumbs();
    });
    els.bodyList.appendChild(btn);
  });
}

function paintOutfits() {
  els.outfitList.innerHTML = "";
  STARTER_OUTFITS.forEach((o, i) => {
    const on = state.avatar.starterOutfit === o.id;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `choice game-card${on ? " is-on is-selected" : ""}`;
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", on ? "true" : "false");
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", o.label);
    btn.innerHTML = `
      <span class="mini" data-thumb="outfit-${o.id}"></span>
      <span class="choice-label">${o.label}</span>
      <span class="check" aria-hidden="true"></span>`;
    bindCardPress(btn);
    btn.addEventListener("click", async () => {
      if (state.busy) return;
      state.avatar.starterOutfit = o.id;
      els.pager.textContent = `${i + 1} / ${STARTER_OUTFITS.length}`;
      persist();
      paintOutfits();
      await paintPreview();
      paintThumbs();
    });
    els.outfitList.appendChild(btn);
  });
  const idx = Math.max(0, STARTER_OUTFITS.findIndex((o) => o.id === state.avatar.starterOutfit));
  els.pager.textContent = `${idx + 1} / ${STARTER_OUTFITS.length}`;
}

function paintThumbs() {
  GENDERS.forEach((g) => {
    const el = document.querySelector(`[data-thumb="gender-${g.id}"]`);
    if (!el) return;
    const cfg =
      g.id === state.avatar.gender
        ? state.avatar
        : state.byGender[g.id] ||
          normalizeAvatar({
            ...(g.id === "male"
              ? { gender: "male", hairStyle: "short_neat", accessory: "glasses", starterOutfit: "traveler" }
              : { gender: "female" }),
            name: state.avatar.name,
          });
    el.classList.add("is-loading");
    renderAvatar(el, { ...cfg, gender: g.id }, {
      uid: `g-${g.id}`,
      compact: true,
      showBadge: false,
    }).finally(() => el.classList.remove("is-loading"));
  });

  BODY_TYPES.forEach((b) => {
    const el = document.querySelector(`[data-thumb="body-${b.id}"]`);
    if (!el) return;
    el.classList.add("is-loading");
    renderAvatar(el, { ...state.avatar, bodyType: b.id }, {
      uid: `b-${b.id}`,
      compact: true,
      showBadge: false,
    }).finally(() => el.classList.remove("is-loading"));
  });

  STARTER_OUTFITS.forEach((o) => {
    const el = document.querySelector(`[data-thumb="outfit-${o.id}"]`);
    if (!el) return;
    el.classList.add("is-loading");
    renderAvatar(el, { ...state.avatar, starterOutfit: o.id }, {
      uid: `o-${o.id}`,
      compact: true,
      showBadge: false,
    }).finally(() => el.classList.remove("is-loading"));
  });
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, REDUCE ? 0 : ms));
}

async function onRandom() {
  if (state.busy || state.confirmLock) return;
  state.busy = true;
  els.random.disabled = true;
  els.random.classList.add("is-saving");
  const base = randomAvatar(state.avatar.name, state.avatar.gender);

  try {
    state.avatar.name = base.name;
    els.name.value = base.name;
    setNameError("");
    persist();
    await wait(120);

    state.avatar = {
      ...state.avatar,
      bodyType: base.bodyType,
      hairStyle: base.hairStyle,
      hairColor: base.hairColor,
      skinTone: base.skinTone,
      eyeStyle: base.eyeStyle,
      faceShape: base.faceShape,
      accessory: base.accessory,
    };
    persist();
    paintAppear();
    paintBodies();
    await paintPreview();
    paintThumbs();
    await wait(200);

    state.avatar.starterOutfit = base.starterOutfit;
    persist();
    paintOutfits();
    await paintPreview();
    paintThumbs();
    await wait(180);

    toast("随机形象已生成");
  } finally {
    state.busy = false;
    els.random.disabled = false;
    els.random.classList.remove("is-saving");
  }
}

async function onConfirm() {
  if (state.confirmLock || state.busy) return;
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
els.name.addEventListener("focus", () => {
  els.nameScroll?.classList.add("is-focus");
  els.nameScroll?.classList.remove("is-error");
});
els.name.addEventListener("blur", () => {
  els.nameScroll?.classList.remove("is-focus");
});

document.getElementById("dice")?.addEventListener("click", () => {
  els.name.value = randomName();
  state.avatar.name = els.name.value;
  setNameError("");
  persist();
});
els.random?.addEventListener("click", onRandom);
els.confirm?.addEventListener("click", onConfirm);
bindMobileToggles();

// 预加载勾章，避免选中态闪空白
const checkPreload = new Image();
checkPreload.src = UI_ASSETS.selectedCheck;

paintAppear();
paintGenders();
paintBodies();
paintOutfits();
paintPreview().then(paintThumbs);
persist();
