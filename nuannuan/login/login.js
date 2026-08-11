/**
 * 登录角色选择：按参考布局绑定交互按键。
 * 职业立绘为完整 composite；底部模块坞切换档案焦点，
 * 并按职业×性别提供配饰 / 印记 / 眼部 / 主题可选元素。
 */
import { renderAvatar } from "/js/nuannuan/AvatarRenderer.js";
import {
  randomName,
  validateName,
  saveFinal,
  toSavedCharacter,
} from "/js/nuannuan/avatar-config.js";
import { initI18n, onLangChange, applyDom, getLang, t } from "/js/i18n.js";
import { mountLobbyExit } from "/js/lobby-exit.js";
import {
  ROLE_META,
  careerOptionsForGender,
  characterCode,
  findReference,
} from "/js/nuannuan/character-reference.js";
import {
  defaultThemeSelection,
  findAccessory,
  findEye,
  findKeyword,
  findMark,
  getThemePack,
  resolveAccessoryOverlays,
  resolveThemeSelection,
} from "/js/nuannuan/career-theme-packs.js";
import { localizePack } from "/js/nuannuan/login-theme-en.js";

initI18n({ toggleHost: "#lang-host" });
onLangChange(() => {
  applyDom();
  paintGenders();
  paintRoles();
  paintProfile();
  paintModules();
});
mountLobbyExit();

const NEXT_URL = "/nuannuan/partner";
const STORAGE_LOGIN = "nn_login_avatar_v1";
const CAREERS = ["researcher", "programmer", "engineer"];
const ROLE_BACKGROUNDS = {
  researcher: "/nuannuan/login/assets/bg-researcher.png",
  programmer: "/nuannuan/login/assets/bg-programmer.png",
  engineer: "/nuannuan/login/assets/bg-engineer.png",
};

const SELECTABLE_MODULES = new Set(["accessory", "mark", "eyes", "theme", "outfit"]);

function isEn() {
  return getLang() === "en";
}

function roleLabel(roleId) {
  const meta = ROLE_META[roleId];
  if (!meta) return roleId;
  return isEn() ? meta.labelEn : meta.labelCn;
}

function genderLabel(gender = state.gender) {
  return gender === "male" ? t("login.male") : t("login.female");
}

function slotLabel(slot) {
  return t(`login.slot.${slot}`) || slot;
}

function nameErrorMessage(check) {
  if (!check || check.ok) return "";
  if (check.code === "length") return t("login.nameLen");
  return t("login.nameNeed");
}

function currentPack() {
  return localizePack(getThemePack(state.role, state.gender), getLang());
}

function moduleHint(module) {
  return t(`login.hint.${module}`) || "";
}

function preloadRoleBackgrounds() {
  Object.values(ROLE_BACKGROUNDS).forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

const els = {
  doll: document.getElementById("doll"),
  genderList: document.getElementById("gender-list"),
  roleList: document.getElementById("role-list"),
  name: document.getElementById("name"),
  nameError: document.getElementById("name-error"),
  dice: document.getElementById("dice"),
  random: document.getElementById("random"),
  confirm: document.getElementById("confirm"),
  toast: document.getElementById("toast"),
  stageRole: document.getElementById("stage-role"),
  stageGender: document.getElementById("stage-gender"),
  stageId: document.getElementById("stage-id"),
  stageHint: document.getElementById("stage-hint"),
  detailSub: document.getElementById("detail-sub"),
  profileName: document.getElementById("profile-name"),
  profileRole: document.getElementById("profile-role"),
  profileCode: document.getElementById("profile-code"),
  profileAff: document.getElementById("profile-aff"),
  profileHeight: document.getElementById("profile-height"),
  markGlyph: document.getElementById("mark-glyph"),
  markTitle: document.getElementById("mark-title"),
  markDesc: document.getElementById("mark-desc"),
  collectCount: document.getElementById("collect-count"),
  moduleDock: document.getElementById("module-dock"),
  themePicker: document.getElementById("theme-picker"),
  themePickerTitle: document.getElementById("theme-picker-title"),
  themePickerSub: document.getElementById("theme-picker-sub"),
  themePickerList: document.getElementById("theme-picker-list"),
  themePickerDesc: document.getElementById("theme-picker-desc"),
  themePickerStats: document.getElementById("theme-picker-stats"),
  themePickerSheet: document.getElementById("theme-picker-sheet"),
  themeEquip: document.getElementById("theme-equip"),
  loadoutList: document.getElementById("loadout-list"),
  undo: document.getElementById("undo"),
  reset: document.getElementById("reset"),
  share: document.getElementById("share"),
  rolePrev: document.getElementById("role-prev"),
  roleNext: document.getElementById("role-next"),
  stepPrev: document.getElementById("step-prev"),
  stepNext: document.getElementById("step-next"),
  stepTrack: document.getElementById("step-track"),
};

const state = {
  ready: false,
  busy: false,
  gender: "female",
  role: "researcher",
  name: "",
  referenceSheet: null,
  characterId: null,
  step: 1,
  module: "role",
  history: [],
  viewed: new Set(["researcher"]),
  theme: defaultThemeSelection(null),
  focusItemId: null,
};

function currentPackRaw() {
  return getThemePack(state.role, state.gender);
}

function syncThemeForCareer({ keepCompatible = false } = {}) {
  const pack = currentPackRaw();
  if (!pack) {
    state.theme = defaultThemeSelection(null);
    return;
  }
  if (keepCompatible) {
    state.theme = resolveThemeSelection(pack, state.theme);
  } else {
    state.theme = defaultThemeSelection(pack);
  }
  state.focusItemId = null;
}

function snapshot() {
  return {
    gender: state.gender,
    role: state.role,
    name: state.name,
    theme: {
      accessories: [...state.theme.accessories],
      markId: state.theme.markId,
      eyeId: state.theme.eyeId,
      keywordId: state.theme.keywordId,
      placements: { ...(state.theme.placements || {}) },
    },
  };
}

function pushHistory() {
  const cur = snapshot();
  const last = state.history[state.history.length - 1];
  if (
    last &&
    last.gender === cur.gender &&
    last.role === cur.role &&
    last.name === cur.name &&
    JSON.stringify(last.theme) === JSON.stringify(cur.theme)
  ) {
    return;
  }
  state.history.push(cur);
  if (state.history.length > 20) state.history.shift();
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.remove("is-on"), 1600);
}

function currentCareer() {
  return findReference(state.role, state.gender);
}

function applyCareer() {
  const career = currentCareer();
  if (!career) {
    state.referenceSheet = null;
    state.characterId = null;
    document.body.dataset.role = state.role || "researcher";
    return;
  }
  state.characterId = career.id;
  state.referenceSheet = career.composite
    ? `/character-reference/${career.composite}`
    : `/character-reference/${career.previewCutout}`;
  document.body.dataset.role = career.role;
  state.viewed.add(career.role);
}

function persist() {
  localStorage.setItem(
    STORAGE_LOGIN,
    JSON.stringify({
      schemaVersion: 2,
      gender: state.gender,
      name: state.name,
      role: state.role,
      characterId: state.characterId,
      referenceSheet: state.referenceSheet,
      selection: null,
      themePack: snapshot().theme,
      step: state.step,
      viewed: [...state.viewed],
    }),
  );
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_LOGIN);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function paintSteps() {
  document.body.dataset.step = String(state.step);
  els.stepPrev.disabled = state.step <= 1;
  els.stepNext.disabled = state.step >= 3;
  els.stepTrack.querySelectorAll("li").forEach((li) => {
    const n = Number(li.dataset.step);
    li.classList.toggle("is-on", n === state.step);
    li.classList.toggle("is-done", n < state.step);
  });
  const hints = {
    1: t("login.hint.step1"),
    2: t("login.hint.step2"),
    3: t("login.hint.step3"),
  };
  if (state.module === "role") els.stageHint.textContent = hints[state.step];
}

function paintLoadout() {
  const pack = currentPack();
  if (!els.loadoutList) return;
  if (!pack || !state.theme.accessories.length) {
    els.loadoutList.innerHTML = `<li class="is-empty">${t("login.loadoutEmpty")}</li>`;
    return;
  }
  const rows = state.theme.accessories
    .map((id) => {
      const item = findAccessory(pack, id);
      if (!item) return "";
      const stats = (item.stats || []).map((s) => `<em>${s}</em>`).join("");
      return `<li><span class="loadout-glyph" aria-hidden="true">${item.glyph}</span><span><strong>${item.name}</strong><small>${slotLabel(item.slot)}</small><span class="loadout-stats">${stats}</span></span></li>`;
    })
    .join("");
  els.loadoutList.innerHTML = rows;
}

function paintEquipBadges() {
  const pack = currentPack();
  if (!els.themeEquip) return;
  if (!pack || !state.theme.accessories.length) {
    els.themeEquip.hidden = true;
    els.themeEquip.innerHTML = "";
    return;
  }
  els.themeEquip.hidden = false;
  const chips = state.theme.accessories
    .map((id) => {
      const item = findAccessory(pack, id);
      if (!item) return "";
      return `<span class="theme-equip__chip" title="${item.name}"><i>${item.glyph}</i>${item.name}</span>`;
    })
    .join("");
  els.themeEquip.innerHTML = `
    ${chips}
    <button type="button" class="theme-equip__reset" id="reset-acc-pos" title="${t("login.resetPosTitle")}">${t("login.resetPos")}</button>
    <span class="theme-equip__hint">${t("login.dragHint")}</span>`;
  els.themeEquip.querySelector("#reset-acc-pos")?.addEventListener("click", () => {
    pushHistory();
    const next = { ...(state.theme.placements || {}) };
    state.theme.accessories.forEach((id) => {
      delete next[id];
    });
    state.theme.placements = next;
    persist();
    toast(t("login.toast.posReset"));
    void paintPreview();
  });
}

function paintPickerMeta(item) {
  if (!item) {
    els.themePickerDesc.textContent = "";
    els.themePickerStats.innerHTML = "";
    return;
  }
  els.themePickerDesc.textContent = item.desc || item.title || item.label || "";
  const stats = item.stats || [];
  els.themePickerStats.innerHTML = stats.map((s) => `<span>${s}</span>`).join("");
}

function paintThemePicker() {
  const pack = currentPack();
  const show = SELECTABLE_MODULES.has(state.module) && !!pack;
  els.themePicker.hidden = !show;
  if (!show || !pack) return;

  const titles = {
    outfit: t("login.pick.outfit"),
    accessory: t("login.pick.accessory"),
    mark: t("login.pick.mark"),
    eyes: t("login.pick.eyes"),
    theme: t("login.pick.theme"),
  };
  els.themePickerTitle.textContent = titles[state.module] || t("login.themeTitle");
  els.themePickerSub.textContent = pack.slogan;
  els.themePickerSheet.hidden = false;
  els.themePickerSheet.href = pack.sheet;

  let items = [];
  if (state.module === "outfit") {
    items = [
      {
        id: "outfit_base",
        glyph: "▦",
        name: t("login.outfitBase"),
        desc: pack.outfit,
        selected: true,
        locked: true,
      },
    ];
  } else if (state.module === "accessory") {
    items = pack.accessories.map((a) => ({
      ...a,
      selected: state.theme.accessories.includes(a.id),
    }));
  } else if (state.module === "mark") {
    items = pack.marks.map((m) => ({
      id: m.id,
      glyph: m.glyph,
      name: m.title,
      desc: m.desc,
      selected: state.theme.markId === m.id,
    }));
  } else if (state.module === "eyes") {
    items = pack.eyes.map((e) => ({
      id: e.id,
      glyph: e.glyph,
      name: e.label,
      desc: e.desc,
      selected: state.theme.eyeId === e.id,
    }));
  } else if (state.module === "theme") {
    items = pack.keywords.map((k) => ({
      id: k.id,
      glyph: k.glyph,
      name: k.label,
      desc: pack.slogan,
      selected: state.theme.keywordId === k.id,
    }));
  }

  if (!state.focusItemId || !items.some((i) => i.id === state.focusItemId)) {
    state.focusItemId = items.find((i) => i.selected)?.id || items[0]?.id || null;
  }

  els.themePickerList.innerHTML = "";
  items.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `theme-opt${item.selected ? " is-on" : ""}${state.focusItemId === item.id ? " is-focus" : ""}`;
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", item.selected ? "true" : "false");
    btn.dataset.id = item.id;
    const slot = item.slot ? `<small>${slotLabel(item.slot)}</small>` : "";
    btn.innerHTML = `
      <span class="theme-opt__glyph" aria-hidden="true">${item.glyph || "◆"}</span>
      <span class="theme-opt__copy"><strong>${item.name}</strong>${slot}</span>
      ${item.selected && !item.locked ? '<span class="theme-opt__check" aria-hidden="true">✓</span>' : ""}`;
    btn.addEventListener("click", () => {
      state.focusItemId = item.id;
      paintPickerMeta(item);
      if (item.locked) {
        paintThemePicker();
        return;
      }
      void toggleThemeItem(state.module, item.id);
    });
    els.themePickerList.appendChild(btn);
  });

  const focused = items.find((i) => i.id === state.focusItemId) || items[0];
  paintPickerMeta(focused);

  if (state.module === "theme" && pack.palette?.length) {
    els.themePickerStats.innerHTML = pack.palette
      .map((c) => `<span class="theme-swatch" style="--sw:${c}" title="${c}"></span>`)
      .join("");
  }
}

async function toggleThemeItem(module, id) {
  const pack = currentPack();
  if (!pack) return;
  pushHistory();

  if (module === "accessory") {
    const set = new Set(state.theme.accessories);
    if (set.has(id)) {
      set.delete(id);
      toast(t("login.toast.accOff"));
    } else if (set.size >= 3) {
      toast(t("login.toast.accMax"));
    } else {
      set.add(id);
      const item = findAccessory(pack, id);
      toast(t("login.toast.accOn", { name: item?.name || t("login.mod.accessory") }));
    }
    state.theme.accessories = [...set];
  } else if (module === "mark") {
    state.theme.markId = id;
    toast(t("login.toast.mark", { name: findMark(pack, id)?.title || "" }));
  } else if (module === "eyes") {
    state.theme.eyeId = id;
    toast(t("login.toast.eyes", { name: findEye(pack, id)?.label || "" }));
  } else if (module === "theme") {
    state.theme.keywordId = id;
    toast(t("login.toast.theme", { name: findKeyword(pack, id)?.label || "" }));
  }

  persist();
  paintThemePicker();
  paintEquipBadges();
  paintLoadout();
  await paintPreview();
}

function paintModules() {
  els.moduleDock.querySelectorAll(".module-btn").forEach((btn) => {
    const on = btn.dataset.module === state.module;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-selected", on ? "true" : "false");
  });
  document.querySelectorAll("[data-focus]").forEach((node) => {
    node.classList.toggle("is-focus", node.dataset.focus === state.module);
  });

  const pack = currentPack();
  if (state.module === "role") {
    paintSteps();
    els.themePicker.hidden = true;
    return;
  }

  if (!pack) {
    els.stageHint.textContent = moduleHint(state.module);
    els.themePicker.hidden = true;
    return;
  }

  const extras = {
    outfit: pack.outfit,
    accessory: state.theme.accessories.length
      ? t("login.accSelected", { n: state.theme.accessories.length })
      : t("login.accMulti"),
    mark: findMark(pack, state.theme.markId)?.title || "",
    eyes: findEye(pack, state.theme.eyeId)?.label || "",
    theme: findKeyword(pack, state.theme.keywordId)?.label || pack.slogan,
  };
  els.stageHint.textContent = `${moduleHint(state.module)} · ${extras[state.module] || ""}`;
  paintThemePicker();
}

function paintProfile() {
  const career = currentCareer();
  const pack = currentPack();
  const gLabel = genderLabel();
  const mark = findMark(pack, state.theme.markId) || pack?.marks?.[0];
  els.stageGender.textContent = gLabel;
  els.profileName.textContent = state.name || t("login.unnamed");
  els.collectCount.textContent = String(state.viewed.size);
  els.markGlyph.textContent = mark?.glyph || "◆";
  els.markTitle.textContent = mark?.title || "—";
  els.markDesc.textContent = mark?.desc || "";

  if (!career) return;

  const meta = ROLE_META[career.role];
  const code = characterCode(career);
  const rLabel = isEn() ? (meta?.labelEn || career.displayNameEn) : (meta?.labelCn || career.displayNameCn);
  els.stageRole.textContent = rLabel;
  els.stageId.textContent = code;
  els.detailSub.textContent = isEn() ? career.displayNameEn : career.displayNameCn;
  els.profileRole.textContent = `${rLabel} · ${gLabel}`;
  els.profileCode.textContent = code;
  els.profileAff.textContent = isEn()
    ? (career.affiliationEn || career.affiliation)
    : career.affiliation;
  els.profileHeight.textContent = `${career.heightCm} cm`;
  paintLoadout();
  paintEquipBadges();
  paintModules();
}

async function paintPreview() {
  if (!els.doll) return;
  paintProfile();
  paintSteps();
  const pack = currentPack();
  const accessoryOverlays = resolveAccessoryOverlays(pack, state.theme);
  await renderAvatar(
    els.doll,
    {
      gender: state.gender,
      selection: null,
      referenceSheet: state.referenceSheet,
      useFixtures: false,
      accessoryOverlays,
    },
    {
      uid: "login",
      allowSvgFallback: true,
      draggableAccessories: true,
      onAccessoryPlace: (pos) => {
        if (!pos?.id) return;
        pushHistory();
        state.theme.placements = {
          ...(state.theme.placements || {}),
          [pos.id]: {
            left: pos.left,
            top: pos.top,
            ...(typeof pos.width === "number" ? { width: pos.width } : {}),
          },
        };
        persist();
        toast(t("login.toast.posSaved"));
      },
    },
  );
}

async function applySelection(next, { record = true, message, keepTheme = false } = {}) {
  if (!state.ready || state.busy) return;
  if (record) pushHistory();
  const careerChanged =
    (next.gender && next.gender !== state.gender) || (next.role && next.role !== state.role);
  if (next.gender) state.gender = next.gender;
  if (next.role) state.role = next.role;
  if (typeof next.name === "string") {
    state.name = next.name;
    els.name.value = next.name;
  }
  if (next.theme) {
    state.theme = resolveThemeSelection(currentPackRaw(), next.theme);
  } else if (careerChanged) {
    syncThemeForCareer({ keepCompatible: keepTheme });
  }
  applyCareer();
  persist();
  paintGenders();
  paintRoles();
  await paintPreview();
  if (message) toast(message);
}

function paintGenders() {
  els.genderList.innerHTML = "";
  [
    { id: "female", label: t("login.female"), hint: "Female", glyph: "♀" },
    { id: "male", label: t("login.male"), hint: "Male", glyph: "♂" },
  ].forEach((gender) => {
    const on = state.gender === gender.id;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `choice gender-choice${on ? " is-on" : ""}`;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", on ? "true" : "false");
    button.innerHTML = `
      <span class="gender-glyph" aria-hidden="true">${gender.glyph}</span>
      <strong>${gender.label}</strong>
      <small>${gender.hint}</small>`;
    button.addEventListener("click", async () => {
      if (on) return;
      await applySelection(
        { gender: gender.id },
        { message: t(gender.id === "male" ? "login.toast.male" : "login.toast.female") },
      );
    });
    els.genderList.appendChild(button);
  });
}

function paintRoles() {
  els.roleList.innerHTML = "";
  careerOptionsForGender(state.gender).forEach((role) => {
    const on = state.role === role.id;
    const label = isEn() ? role.labelEn : role.label;
    const hint = isEn() ? (role.hintEn || role.hint) : role.hint;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `choice role-card${on ? " is-on" : ""}`;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", on ? "true" : "false");
    button.innerHTML = `
      ${role.thumbUrl
        ? `<span class="role-thumb"><img src="${role.thumbUrl}" alt="" /></span>`
        : `<span class="role-thumb is-empty" aria-hidden="true">◇</span>`}
      <span class="role-copy"><strong>${label}</strong><small>${hint}</small></span>
      ${on ? `<span class="role-check" aria-hidden="true">✓</span>` : ""}`;
    button.addEventListener("click", async () => {
      await applySelection(
        { role: role.id },
        { message: t("login.toast.role", { name: label }) },
      );
    });
    els.roleList.appendChild(button);
  });
}

function cycleRole(dir) {
  const idx = CAREERS.indexOf(state.role);
  const next = CAREERS[(idx + dir + CAREERS.length) % CAREERS.length];
  return applySelection(
    { role: next },
    { message: t("login.toast.roleSwitch", { name: roleLabel(next) }) },
  );
}

els.name.addEventListener("input", () => {
  pushHistory();
  state.name = els.name.value.slice(0, 8);
  els.nameError.hidden = true;
  paintProfile();
  persist();
});

els.dice.addEventListener("click", () => {
  pushHistory();
  state.name = randomName(state.gender);
  els.name.value = state.name;
  els.nameError.hidden = true;
  paintProfile();
  persist();
  toast(t("login.toast.nameDice"));
});

els.random.addEventListener("click", async () => {
  if (!state.ready || state.busy) return;
  state.busy = true;
  try {
    const gender = Math.random() > 0.5 ? "female" : "male";
    const role = CAREERS[Math.floor(Math.random() * CAREERS.length)];
    const pack = getThemePack(role, gender);
    const theme = defaultThemeSelection(pack);
    if (pack?.accessories?.length) {
      const shuffled = [...pack.accessories].sort(() => Math.random() - 0.5);
      theme.accessories = shuffled.slice(0, 1 + Math.floor(Math.random() * 2)).map((a) => a.id);
      theme.markId = pack.marks[Math.floor(Math.random() * pack.marks.length)]?.id || theme.markId;
      theme.eyeId = pack.eyes[Math.floor(Math.random() * pack.eyes.length)]?.id || theme.eyeId;
      theme.keywordId =
        pack.keywords[Math.floor(Math.random() * pack.keywords.length)]?.id || theme.keywordId;
    }
    await applySelection(
      {
        name: randomName(gender),
        role,
        gender,
        theme,
      },
      { message: t("login.toast.randomAll") },
    );
    state.module = "accessory";
    paintModules();
  } finally {
    state.busy = false;
  }
});

els.rolePrev.addEventListener("click", () => cycleRole(-1));
els.roleNext.addEventListener("click", () => cycleRole(1));

els.undo.addEventListener("click", async () => {
  const prev = state.history.pop();
  if (!prev) {
    toast(t("login.toast.undoEmpty"));
    return;
  }
  await applySelection(prev, { record: false, message: t("login.toast.undo"), keepTheme: true });
});

els.reset.addEventListener("click", async () => {
  await applySelection(
    {
      gender: "female",
      role: "researcher",
      name: "",
      theme: defaultThemeSelection(getThemePack("researcher", "female")),
    },
    { message: t("login.toast.reset") },
  );
  els.nameError.hidden = true;
  state.step = 1;
  state.module = "role";
  paintSteps();
  paintModules();
});

els.share.addEventListener("click", async () => {
  const career = currentCareer();
  const pack = currentPack();
  const mark = findMark(pack, state.theme.markId);
  const accNames = state.theme.accessories
    .map((id) => findAccessory(pack, id)?.name)
    .filter(Boolean);
  const text = [
    `AI Character · ${state.name || t("login.unnamed")}`,
    `${roleLabel(state.role)} · ${genderLabel()}`,
    career ? characterCode(career) : "",
    mark ? `${t("login.share.mark")}:${mark.title}` : "",
    accNames.length ? `${t("login.share.acc")}:${accNames.join(isEn() ? ", " : "、")}` : "",
  ]
    .filter(Boolean)
    .join(" / ");
  try {
    await navigator.clipboard.writeText(text);
    toast(t("login.toast.copied"));
  } catch {
    toast(text);
  }
});

els.moduleDock.addEventListener("click", (event) => {
  const btn = event.target.closest(".module-btn");
  if (!btn) return;
  state.module = btn.dataset.module;
  state.focusItemId = null;
  paintModules();
});

els.stepPrev.addEventListener("click", () => {
  if (state.step <= 1) return;
  state.step -= 1;
  paintSteps();
  persist();
});

els.stepNext.addEventListener("click", () => {
  if (state.step >= 3) return;
  if (state.step === 2) {
    const check = validateName(state.name || els.name.value);
    if (!check.ok) {
      els.nameError.hidden = false;
      els.nameError.textContent = nameErrorMessage(check);
      els.name.focus();
      state.step = 2;
      paintSteps();
      toast(nameErrorMessage(check));
      return;
    }
    state.name = check.name;
    els.name.value = state.name;
  }
  state.step += 1;
  paintSteps();
  persist();
  if (state.step === 2) {
    els.name.focus();
    toast(t("login.toast.confirmName"));
  } else if (state.step === 3) {
    toast(t("login.toast.confirmProfile"));
  }
});

els.confirm.addEventListener("click", async () => {
  const check = validateName(state.name || els.name.value);
  if (!check.ok) {
    els.nameError.hidden = false;
    els.nameError.textContent = nameErrorMessage(check);
    els.name.focus();
    state.step = 2;
    paintSteps();
    return;
  }
  state.name = check.name;
  applyCareer();
  const avatar = toSavedCharacter({
    name: state.name,
    gender: state.gender,
    role: state.role,
    characterId: state.characterId,
    referenceSheet: state.referenceSheet,
    selection: null,
    themePack: snapshot().theme,
  });
  saveFinal(avatar);
  persist();
  toast(t("login.toast.saved"));
  await new Promise((resolve) => setTimeout(resolve, 420));
  location.href = NEXT_URL;
});

async function boot() {
  try {
    preloadRoleBackgrounds();
    const saved = loadSaved();
    if (saved?.gender === "male" || saved?.gender === "female") state.gender = saved.gender;
    if (typeof saved?.name === "string") {
      state.name = saved.name;
      els.name.value = saved.name;
    }
    if (saved?.role && ROLE_META[saved.role]) state.role = saved.role;
    if (Number(saved?.step) >= 1 && Number(saved?.step) <= 3) state.step = Number(saved.step);
    if (Array.isArray(saved?.viewed)) state.viewed = new Set(saved.viewed);

    applyCareer();
    state.theme = resolveThemeSelection(currentPackRaw(), saved?.themePack);
    state.ready = true;
    paintGenders();
    paintRoles();
    paintSteps();
    persist();
    await paintPreview();
  } catch (error) {
    console.error(error);
    toast(error.message || (isEn() ? "Failed to load assets" : "素材加载失败"));
  }
}

boot();
