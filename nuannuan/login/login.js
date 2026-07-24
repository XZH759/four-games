/**
 * 登录角色选择：按参考布局绑定交互按键。
 * 职业立绘为完整 composite；底部模块坞用于档案焦点，不伪造图层切换。
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

const NEXT_URL = "/nuannuan/partner";
const STORAGE_LOGIN = "nn_login_avatar_v1";
const CAREERS = ["researcher", "programmer", "engineer"];
const ROLE_BACKGROUNDS = {
  researcher: "/nuannuan/login/assets/bg-researcher.png",
  programmer: "/nuannuan/login/assets/bg-programmer.png",
  engineer: "/nuannuan/login/assets/bg-engineer.png",
};

const ROLE_MARKS = {
  researcher: {
    glyph: "◆",
    title: "理性之芯",
    desc: "以观测与推理推进实验。",
    theme: "实验室冷光",
    outfit: "白袍实验套装",
    accessory: "身份卡与数据板",
    eyes: "专注观测视界",
  },
  programmer: {
    glyph: "◈",
    title: "代码之瞳",
    desc: "在数据流中定位关键路径。",
    theme: "终端青紫辉光",
    outfit: "机能连帽外套",
    accessory: "耳麦与全息板",
    eyes: "高亮扫描视界",
  },
  engineer: {
    glyph: "▣",
    title: "构筑之手",
    desc: "把构想装配成可运行结构。",
    theme: "工位金蓝指示灯",
    outfit: "战术工程工装",
    accessory: "工具袋与护目镜",
    eyes: "结构校准视界",
  },
};

const MODULE_HINTS = {
  role: "查看职业与编号信息",
  outfit: "查看当前职业服装说明",
  accessory: "查看当前职业配饰说明",
  mark: "查看专属印记",
  eyes: "查看眼部风格说明",
  theme: "查看场景主题说明",
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
};

function snapshot() {
  return {
    gender: state.gender,
    role: state.role,
    name: state.name,
  };
}

function pushHistory() {
  const cur = snapshot();
  const last = state.history[state.history.length - 1];
  if (last && last.gender === cur.gender && last.role === cur.role && last.name === cur.name) {
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
      schemaVersion: 1,
      gender: state.gender,
      name: state.name,
      role: state.role,
      characterId: state.characterId,
      referenceSheet: state.referenceSheet,
      selection: null,
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
    1: "步骤 1：选择性别与职业",
    2: "步骤 2：确认形象与名称",
    3: "步骤 3：核对档案后确认进入",
  };
  if (state.module === "role") els.stageHint.textContent = hints[state.step];
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
  const mark = ROLE_MARKS[state.role];
  const hintExtra = {
    outfit: mark?.outfit,
    accessory: mark?.accessory,
    mark: mark?.title,
    eyes: mark?.eyes,
    theme: mark?.theme,
  };
  if (state.module !== "role") {
    els.stageHint.textContent = `${MODULE_HINTS[state.module]} · ${hintExtra[state.module] || ""}`;
  } else {
    paintSteps();
  }
}

function paintProfile() {
  const career = currentCareer();
  const genderLabel = state.gender === "male" ? "男性" : "女性";
  const mark = ROLE_MARKS[state.role] || ROLE_MARKS.researcher;
  els.stageGender.textContent = genderLabel;
  els.profileName.textContent = state.name || "未命名";
  els.collectCount.textContent = String(state.viewed.size);
  els.markGlyph.textContent = mark.glyph;
  els.markTitle.textContent = mark.title;
  els.markDesc.textContent = mark.desc;

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
  paintModules();
}

async function paintPreview() {
  if (!els.doll) return;
  paintProfile();
  paintSteps();
  await renderAvatar(
    els.doll,
    {
      gender: state.gender,
      selection: null,
      referenceSheet: state.referenceSheet,
      useFixtures: false,
    },
    { uid: "login", allowSvgFallback: true },
  );
}

async function applySelection(next, { record = true, message } = {}) {
  if (!state.ready || state.busy) return;
  if (record) pushHistory();
  if (next.gender) state.gender = next.gender;
  if (next.role) state.role = next.role;
  if (typeof next.name === "string") {
    state.name = next.name;
    els.name.value = next.name;
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
    await applySelection({
      name: randomName(state.gender),
      role: CAREERS[Math.floor(Math.random() * CAREERS.length)],
      gender: Math.random() > 0.5 ? "female" : "male",
    }, { message: "已随机生成形象" });
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
  await applySelection(prev, { record: false, message: "已回撤上一步" });
});

els.reset.addEventListener("click", async () => {
  await applySelection(
    { gender: "female", role: "researcher", name: "" },
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
  const meta = ROLE_META[state.role];
  const text = [
    `AI Character · ${state.name || "未命名"}`,
    `${meta?.labelCn || ""} · ${state.gender === "male" ? "男" : "女"}`,
    career ? characterCode(career) : "",
    career?.affiliation || "",
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
