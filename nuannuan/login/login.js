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
  SLOT_LABELS,
} from "/js/nuannuan/career-theme-packs.js";

const NEXT_URL = "/nuannuan/partner";
const STORAGE_LOGIN = "nn_login_avatar_v1";
const CAREERS = ["researcher", "programmer", "engineer"];
const ROLE_BACKGROUNDS = {
  researcher: "/nuannuan/login/assets/bg-researcher.png",
  programmer: "/nuannuan/login/assets/bg-programmer.png",
  engineer: "/nuannuan/login/assets/bg-engineer.png",
};

const SELECTABLE_MODULES = new Set(["accessory", "mark", "eyes", "theme", "outfit"]);

const MODULE_HINTS = {
  role: "查看职业与编号信息",
  outfit: "查看当前职业服装说明",
  accessory: "点选配饰（可多选，最多 3 件）；可拖动立绘上的配饰调位置",
  mark: "选择专属印记",
  eyes: "选择眼部风格",
  theme: "选择主题关键词",
};

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

function currentPack() {
  return getThemePack(state.role, state.gender);
}

function syncThemeForCareer({ keepCompatible = false } = {}) {
  const pack = currentPack();
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
    1: "步骤 1：选择性别与职业，再点底部配饰/印记定制",
    2: "步骤 2：确认形象、主题元素与名称",
    3: "步骤 3：核对档案后确认进入",
  };
  if (state.module === "role") els.stageHint.textContent = hints[state.step];
}

function paintLoadout() {
  const pack = currentPack();
  if (!els.loadoutList) return;
  if (!pack || !state.theme.accessories.length) {
    els.loadoutList.innerHTML = '<li class="is-empty">尚未选择配饰</li>';
    return;
  }
  const rows = state.theme.accessories
    .map((id) => {
      const item = findAccessory(pack, id);
      if (!item) return "";
      const stats = (item.stats || []).map((s) => `<em>${s}</em>`).join("");
      return `<li><span class="loadout-glyph" aria-hidden="true">${item.glyph}</span><span><strong>${item.name}</strong><small>${SLOT_LABELS[item.slot] || item.slot}</small><span class="loadout-stats">${stats}</span></span></li>`;
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
    <button type="button" class="theme-equip__reset" id="reset-acc-pos" title="将已装备配饰位置恢复默认">重置位置</button>
    <span class="theme-equip__hint">拖动立绘上的配饰可调整位置</span>`;
  els.themeEquip.querySelector("#reset-acc-pos")?.addEventListener("click", () => {
    pushHistory();
    const next = { ...(state.theme.placements || {}) };
    state.theme.accessories.forEach((id) => {
      delete next[id];
    });
    state.theme.placements = next;
    persist();
    toast("已重置配饰位置");
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
    outfit: "服装说明",
    accessory: "配饰选择",
    mark: "印记选择",
    eyes: "眼部风格",
    theme: "主题关键词",
  };
  els.themePickerTitle.textContent = titles[state.module] || "主题元素";
  els.themePickerSub.textContent = pack.slogan;
  els.themePickerSheet.hidden = false;
  els.themePickerSheet.href = pack.sheet;

  let items = [];
  if (state.module === "outfit") {
    items = [
      {
        id: "outfit_base",
        glyph: "▦",
        name: "基础职业装",
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
    const slot = item.slot ? `<small>${SLOT_LABELS[item.slot] || item.slot}</small>` : "";
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
      toast("已卸下配饰");
    } else if (set.size >= 3) {
      toast("最多选择 3 件配饰");
    } else {
      set.add(id);
      const item = findAccessory(pack, id);
      toast(`已装备：${item?.name || "配饰"}`);
    }
    state.theme.accessories = [...set];
  } else if (module === "mark") {
    state.theme.markId = id;
    toast(`印记：${findMark(pack, id)?.title || ""}`);
  } else if (module === "eyes") {
    state.theme.eyeId = id;
    toast(`眼部：${findEye(pack, id)?.label || ""}`);
  } else if (module === "theme") {
    state.theme.keywordId = id;
    toast(`主题：${findKeyword(pack, id)?.label || ""}`);
  }

  persist();
  paintThemePicker();
  paintEquipBadges();
  paintLoadout();
  // 立绘配饰增减：重新合成叠加层
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
    els.stageHint.textContent = MODULE_HINTS[state.module] || "";
    els.themePicker.hidden = true;
    return;
  }

  const extras = {
    outfit: pack.outfit,
    accessory: state.theme.accessories.length
      ? `已选 ${state.theme.accessories.length}/3`
      : "可多选最多 3 件",
    mark: findMark(pack, state.theme.markId)?.title || "",
    eyes: findEye(pack, state.theme.eyeId)?.label || "",
    theme: findKeyword(pack, state.theme.keywordId)?.label || pack.slogan,
  };
  els.stageHint.textContent = `${MODULE_HINTS[state.module]} · ${extras[state.module] || ""}`;
  paintThemePicker();
}

function paintProfile() {
  const career = currentCareer();
  const pack = currentPack();
  const genderLabel = state.gender === "male" ? "男性" : "女性";
  const mark = findMark(pack, state.theme.markId) || pack?.marks?.[0];
  els.stageGender.textContent = genderLabel;
  els.profileName.textContent = state.name || "未命名";
  els.collectCount.textContent = String(state.viewed.size);
  els.markGlyph.textContent = mark?.glyph || "◆";
  els.markTitle.textContent = mark?.title || "—";
  els.markDesc.textContent = mark?.desc || "";

  if (!career) return;

  const meta = ROLE_META[career.role];
  const code = characterCode(career);
  els.stageRole.textContent = meta?.labelCn || career.displayNameCn;
  els.stageId.textContent = code;
  els.detailSub.textContent = career.displayNameEn;
  els.profileRole.textContent = `${meta?.labelCn || ""} · ${genderLabel}`;
  els.profileCode.textContent = code;
  els.profileAff.textContent = career.affiliation;
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
        toast("配饰位置已保存");
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
    state.theme = resolveThemeSelection(currentPack(), next.theme);
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
    { id: "female", label: "女性", hint: "Female", glyph: "♀" },
    { id: "male", label: "男性", hint: "Male", glyph: "♂" },
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
        { message: gender.id === "male" ? "已切换为男性界面" : "已切换为女性界面" },
      );
    });
    els.genderList.appendChild(button);
  });
}

function paintRoles() {
  els.roleList.innerHTML = "";
  careerOptionsForGender(state.gender).forEach((role) => {
    const on = state.role === role.id;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `choice role-card${on ? " is-on" : ""}`;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", on ? "true" : "false");
    button.innerHTML = `
      ${role.thumbUrl
        ? `<span class="role-thumb"><img src="${role.thumbUrl}" alt="" /></span>`
        : `<span class="role-thumb is-empty" aria-hidden="true">◇</span>`}
      <span class="role-copy"><strong>${role.label}</strong><small>${role.hint}</small></span>
      ${on ? `<span class="role-check" aria-hidden="true">✓</span>` : ""}`;
    button.addEventListener("click", async () => {
      await applySelection({ role: role.id }, { message: `已选择${role.label}` });
    });
    els.roleList.appendChild(button);
  });
}

function cycleRole(dir) {
  const idx = CAREERS.indexOf(state.role);
  const next = CAREERS[(idx + dir + CAREERS.length) % CAREERS.length];
  return applySelection({ role: next }, { message: `已切换为${ROLE_META[next].labelCn}` });
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
  toast("已随机名称");
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
      { message: "已随机生成形象与主题元素" },
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
    toast("没有可回撤的操作");
    return;
  }
  await applySelection(prev, { record: false, message: "已回撤上一步", keepTheme: true });
});

els.reset.addEventListener("click", async () => {
  await applySelection(
    {
      gender: "female",
      role: "researcher",
      name: "",
      theme: defaultThemeSelection(getThemePack("researcher", "female")),
    },
    { message: "已重置为默认形象" },
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
  const meta = ROLE_META[state.role];
  const mark = findMark(pack, state.theme.markId);
  const accNames = state.theme.accessories
    .map((id) => findAccessory(pack, id)?.name)
    .filter(Boolean);
  const text = [
    `AI Character · ${state.name || "未命名"}`,
    `${meta?.labelCn || ""} · ${state.gender === "male" ? "男" : "女"}`,
    career ? characterCode(career) : "",
    mark ? `印记:${mark.title}` : "",
    accNames.length ? `配饰:${accNames.join("、")}` : "",
  ]
    .filter(Boolean)
    .join(" / ");
  try {
    await navigator.clipboard.writeText(text);
    toast("角色信息已复制");
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
      els.nameError.textContent = check.message;
      els.name.focus();
      state.step = 2;
      paintSteps();
      toast(check.message);
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
    toast("请确认名称与形象");
  } else if (state.step === 3) {
    toast("请核对档案后确认进入");
  }
});

els.confirm.addEventListener("click", async () => {
  const check = validateName(state.name || els.name.value);
  if (!check.ok) {
    els.nameError.hidden = false;
    els.nameError.textContent = check.message;
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
  toast("登录形象已保存");
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
    state.theme = resolveThemeSelection(currentPack(), saved?.themePack);
    state.ready = true;
    paintGenders();
    paintRoles();
    paintSteps();
    persist();
    await paintPreview();
  } catch (error) {
    console.error(error);
    toast(error.message || "素材加载失败");
  }
}

boot();
