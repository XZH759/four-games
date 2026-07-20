/**
 * 暖暖风初始形象 · AvatarConfig
 * @typedef {Object} AvatarConfig
 * @property {string} name
 * @property {'female'|'male'} gender
 * @property {'slender'|'balanced'|'lively'|'slim'|'standard'} bodyType
 * @property {string} hairStyle
 * @property {string} hairColor
 * @property {string} skinTone
 * @property {string} eyeStyle
 * @property {string} faceShape
 * @property {string|null} accessory
 * @property {string} starterOutfit
 */

export const STORAGE_DRAFT = "nn_avatar_draft_v1";
export const STORAGE_FINAL = "nn_avatar_v1";
export const STORAGE_BY_GENDER = "nn_avatar_by_gender_v1";
/** 兼容旧商城门禁 */
export const STORAGE_LEGACY = "nn_profile_v1";

export const GENDERS = [
  { id: "female", label: "女性探索者" },
  { id: "male", label: "男性探索者" },
];

export const HAIR_STYLES_BY_GENDER = {
  female: [
    { id: "wave_long", label: "波浪长发" },
    { id: "princess", label: "公主卷" },
    { id: "twin", label: "双马尾" },
    { id: "bob", label: "齐肩短发" },
    { id: "side_braid", label: "侧编发" },
  ],
  male: [
    { id: "short_neat", label: "清爽短发" },
    { id: "soft_part", label: "侧分柔发" },
    { id: "messy", label: "微乱碎发" },
    { id: "pony_low", label: "低束马尾" },
    { id: "curtain", label: "中分帘发" },
  ],
};

export const HAIR_COLORS = [
  { id: "linen", label: "亚麻金", base: "#d9c39a", dark: "#b0946a", light: "#f0e4c6" },
  { id: "silver", label: "月光银", base: "#dfe3f0", dark: "#aab1cc", light: "#f6f8fd" },
  { id: "tea", label: "蜜茶棕", base: "#a9805b", dark: "#7c5a3c", light: "#c9a97f" },
  { id: "sakura", label: "樱花粉", base: "#f4b8c8", dark: "#d3849e", light: "#fbdce6" },
  { id: "night", label: "夜空黑", base: "#4a4458", dark: "#2e2a3a", light: "#6f6886" },
];

export const SKIN_TONES = [
  { id: "porcelain", label: "瓷白", base: "#fdeee4", shade: "#f0d4c2" },
  { id: "warm", label: "暖白", base: "#f9e2ce", shade: "#e9c6ab" },
  { id: "natural", label: "自然", base: "#eec9a4", shade: "#d8ad83" },
  { id: "wheat", label: "小麦", base: "#d9aa7e", shade: "#bd8c60" },
  { id: "deep", label: "暖棕", base: "#b07a52", shade: "#8d5a38" },
];

export const EYE_STYLES = [
  { id: "violet", label: "紫罗兰", iris: "#9678e0", rim: "#5c4699" },
  { id: "lake", label: "湖水蓝", iris: "#66a4e6", rim: "#3a6cab" },
  { id: "amber", label: "琥珀金", iris: "#dea845", rim: "#9c7127" },
  { id: "cherry", label: "樱桃红", iris: "#de7386", rim: "#a04352" },
  { id: "jade", label: "翡翠绿", iris: "#57c493", rim: "#31855f" },
];

export const FACE_SHAPES = [
  { id: "standard", label: "标准" },
  { id: "round", label: "圆润" },
  { id: "soft", label: "柔和" },
  { id: "sharp", label: "尖俏" },
  { id: "oval", label: "鹅蛋" },
];

export const ACCESSORIES_BY_GENDER = {
  female: [
    { id: "bow", label: "蝴蝶结" },
    { id: "lace", label: "蕾丝发带" },
    { id: "star", label: "星星发夹" },
    { id: "pearl", label: "珍珠耳饰" },
    { id: "flower", label: "花饰发夹" },
  ],
  male: [
    { id: "brooch", label: "星徽胸针" },
    { id: "glasses", label: "细框眼镜" },
    { id: "earcuff", label: "耳骨夹" },
    { id: "pendant", label: "星链吊坠" },
    { id: "band", label: "发带" },
  ],
};

export const BODY_TYPES = [
  { id: "slender", label: "纤细型", hint: "轻盈气质", aliases: ["slim"] },
  { id: "balanced", label: "标准型", hint: "均衡比例", aliases: ["standard"] },
  { id: "lively", label: "活泼型", hint: "轻快体态", aliases: [] },
];

/** 初始套装：轮廓明显不同，名称不暗示能力 */
export const STARTER_OUTFITS = [
  {
    id: "scholar",
    label: "星语学者",
    aura: "rgba(244, 184, 200, 0.45)",
    pal: { main: "#f6c0d6", light: "#fdeaf2", accent: "#a98ade", trim: "#ffffff", deep: "#e296b8" },
  },
  {
    id: "traveler",
    label: "晨光旅者",
    aura: "rgba(150, 180, 235, 0.5)",
    pal: { main: "#e9eefb", light: "#ffffff", accent: "#7f9fdf", trim: "#cfdcf6", deep: "#b9c9ec" },
  },
  {
    id: "night",
    label: "夜幕礼装",
    aura: "rgba(140, 60, 90, 0.5)",
    pal: { main: "#3c2c40", light: "#5c4358", accent: "#a83050", trim: "#241b2c", deep: "#2c2032" },
  },
];

export const NAME_POOL = [
  "暖暖", "星璃", "雪见", "岚音", "桃夭", "月见草",
  "绮罗", "苏芮", "小鹿", "菱纱", "云裳", "清歌",
  "景行", "清川", "夜白", "朔风", "拾光", "归晚",
];

/** @type {AvatarConfig} */
export const DEFAULT_AVATAR = {
  name: "",
  gender: "female",
  bodyType: "balanced",
  hairStyle: "wave_long",
  hairColor: "linen",
  skinTone: "warm",
  eyeStyle: "violet",
  faceShape: "standard",
  accessory: "bow",
  starterOutfit: "scholar",
};

export const DEFAULT_AVATAR_MALE = {
  name: "",
  gender: "male",
  bodyType: "balanced",
  hairStyle: "short_neat",
  hairColor: "tea",
  skinTone: "natural",
  eyeStyle: "lake",
  faceShape: "oval",
  accessory: "glasses",
  starterOutfit: "traveler",
};

export function hairStylesFor(gender) {
  return HAIR_STYLES_BY_GENDER[gender] || HAIR_STYLES_BY_GENDER.female;
}

export function accessoriesFor(gender) {
  return ACCESSORIES_BY_GENDER[gender] || ACCESSORIES_BY_GENDER.female;
}

export function getAppearanceFields(gender = "female") {
  return [
    { key: "hairStyle", label: "发型", options: hairStylesFor(gender) },
    { key: "hairColor", label: "发色", options: HAIR_COLORS, swatch: true },
    { key: "skinTone", label: "肤色", options: SKIN_TONES, swatch: true },
    { key: "eyeStyle", label: "眼睛", options: EYE_STYLES, swatchKey: "iris" },
    { key: "faceShape", label: "脸型", options: FACE_SHAPES },
    { key: "accessory", label: "配饰", options: accessoriesFor(gender) },
  ];
}

/** @deprecated 使用 getAppearanceFields(gender) */
export const APPEARANCE_FIELDS = getAppearanceFields("female");

export function cloneAvatar(cfg) {
  return { ...cfg };
}

export function findById(list, id) {
  return list.find((x) => x.id === id) || list[0];
}

export function defaultForGender(gender) {
  return normalizeAvatar(gender === "male" ? DEFAULT_AVATAR_MALE : DEFAULT_AVATAR);
}

export function normalizeAvatar(partial) {
  const genderHint = partial?.gender === "male" ? "male" : "female";
  const base = cloneAvatar(genderHint === "male" ? DEFAULT_AVATAR_MALE : DEFAULT_AVATAR);
  if (!partial || typeof partial !== "object") return base;

  if (typeof partial.name === "string") base.name = partial.name.slice(0, 8);
  if (partial.gender === "male" || partial.gender === "female") base.gender = partial.gender;

  if (typeof partial.bodyType === "string") base.bodyType = partial.bodyType;
  if (typeof partial.hairStyle === "string") base.hairStyle = partial.hairStyle;
  if (typeof partial.hairColor === "string") base.hairColor = partial.hairColor;
  if (typeof partial.skinTone === "string") base.skinTone = partial.skinTone;
  if (typeof partial.eyeStyle === "string") base.eyeStyle = partial.eyeStyle;
  if (typeof partial.faceShape === "string") base.faceShape = partial.faceShape;
  if (partial.accessory === null || typeof partial.accessory === "string") {
    base.accessory = partial.accessory;
  }
  if (typeof partial.starterOutfit === "string") base.starterOutfit = partial.starterOutfit;

  // 旧 nn_profile_v1 数字索引兼容
  if (typeof partial.body === "number") {
    base.bodyType = BODY_TYPES[partial.body]?.id || base.bodyType;
  }
  if (typeof partial.hair === "number") {
    base.hairStyle = hairStylesFor(base.gender)[partial.hair]?.id || base.hairStyle;
  }
  if (typeof partial.hairColor === "number") {
    base.hairColor = HAIR_COLORS[partial.hairColor]?.id || base.hairColor;
  }
  if (typeof partial.skin === "number") {
    base.skinTone = SKIN_TONES[partial.skin]?.id || base.skinTone;
  }
  if (typeof partial.eyes === "number") {
    base.eyeStyle = EYE_STYLES[partial.eyes]?.id || base.eyeStyle;
  }
  if (typeof partial.face === "number") {
    base.faceShape = FACE_SHAPES[partial.face]?.id || base.faceShape;
  }
  if (typeof partial.acc === "number") {
    base.accessory = accessoriesFor(base.gender)[partial.acc]?.id ?? base.accessory;
  }
  if (typeof partial.outfit === "number") {
    base.starterOutfit = STARTER_OUTFITS[partial.outfit]?.id || base.starterOutfit;
  }

  const bodyAlias = { slim: "slender", standard: "balanced" };
  if (bodyAlias[base.bodyType]) base.bodyType = bodyAlias[base.bodyType];
  if (typeof partial.outfitId === "string" && !partial.starterOutfit) {
    base.starterOutfit = partial.outfitId;
  }
  if (partial.accessoryId !== undefined && !("accessory" in (partial || {}))) {
    base.accessory = partial.accessoryId;
  }

  if (!BODY_TYPES.some((b) => b.id === base.bodyType || (b.aliases || []).includes(base.bodyType))) {
    base.bodyType = "balanced";
  } else if (!BODY_TYPES.some((b) => b.id === base.bodyType)) {
    const hit = BODY_TYPES.find((b) => (b.aliases || []).includes(base.bodyType));
    if (hit) base.bodyType = hit.id;
  }

  const hairs = hairStylesFor(base.gender);
  if (!hairs.some((h) => h.id === base.hairStyle)) base.hairStyle = hairs[0].id;
  if (!HAIR_COLORS.some((h) => h.id === base.hairColor)) base.hairColor = "linen";
  if (!SKIN_TONES.some((s) => s.id === base.skinTone)) base.skinTone = "warm";
  if (!EYE_STYLES.some((e) => e.id === base.eyeStyle)) base.eyeStyle = "violet";
  if (!FACE_SHAPES.some((f) => f.id === base.faceShape)) base.faceShape = "standard";
  const accs = accessoriesFor(base.gender);
  if (base.accessory != null && !accs.some((a) => a.id === base.accessory)) {
    base.accessory = accs[0].id;
  }
  if (!STARTER_OUTFITS.some((o) => o.id === base.starterOutfit)) base.starterOutfit = "scholar";
  return base;
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_DRAFT);
    if (raw) return normalizeAvatar(JSON.parse(raw));
  } catch { /* ignore */ }
  return null;
}

export function saveDraft(cfg) {
  localStorage.setItem(STORAGE_DRAFT, JSON.stringify(normalizeAvatar(cfg)));
}

export function loadByGenderMap() {
  try {
    const raw = localStorage.getItem(STORAGE_BY_GENDER);
    if (!raw) return { female: null, male: null };
    const parsed = JSON.parse(raw);
    return {
      female: parsed.female ? normalizeAvatar({ ...parsed.female, gender: "female" }) : null,
      male: parsed.male ? normalizeAvatar({ ...parsed.male, gender: "male" }) : null,
    };
  } catch {
    return { female: null, male: null };
  }
}

export function saveByGenderMap(map) {
  const payload = {
    female: map.female ? normalizeAvatar({ ...map.female, gender: "female" }) : null,
    male: map.male ? normalizeAvatar({ ...map.male, gender: "male" }) : null,
  };
  localStorage.setItem(STORAGE_BY_GENDER, JSON.stringify(payload));
}

export function loadFinal() {
  try {
    const raw = localStorage.getItem(STORAGE_FINAL);
    if (raw) return normalizeAvatar(JSON.parse(raw));
  } catch { /* ignore */ }
  try {
    const legacy = localStorage.getItem(STORAGE_LEGACY);
    if (legacy) return normalizeAvatar(JSON.parse(legacy));
  } catch { /* ignore */ }
  return null;
}

export function saveFinal(cfg) {
  const avatar = { ...normalizeAvatar(cfg), savedAt: Date.now() };
  localStorage.setItem(STORAGE_FINAL, JSON.stringify(avatar));
  localStorage.setItem(STORAGE_LEGACY, JSON.stringify(avatar));
  const map = loadByGenderMap();
  map[avatar.gender] = avatar;
  saveByGenderMap(map);
  localStorage.removeItem(STORAGE_DRAFT);
  return avatar;
}

export function randomName() {
  return NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)];
}

/** 随机外观：倾向协调配色，不绑定能力 */
export function randomAvatar(keepName = "", gender = "female") {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const naturalHair = HAIR_COLORS.slice(0, 3);
  const softHair = HAIR_COLORS.slice(3);
  const hairPool = Math.random() < 0.7 ? naturalHair : softHair;
  const g = gender === "male" ? "male" : "female";
  return normalizeAvatar({
    name: keepName || randomName(),
    gender: g,
    bodyType: pick(BODY_TYPES).id,
    hairStyle: pick(hairStylesFor(g)).id,
    hairColor: pick(hairPool).id,
    skinTone: pick(SKIN_TONES).id,
    eyeStyle: pick(EYE_STYLES).id,
    faceShape: pick(FACE_SHAPES).id,
    accessory: pick(accessoriesFor(g)).id,
    starterOutfit: pick(STARTER_OUTFITS).id,
  });
}

export function validateName(name) {
  const n = (name || "").trim();
  if (!n) return { ok: false, message: "先给角色起个名字吧" };
  if (n.length > 8) return { ok: false, message: "名称请控制在 8 个字以内" };
  return { ok: true, name: n };
}

export function cycleOption(list, currentId, dir) {
  const idx = Math.max(0, list.findIndex((x) => x.id === currentId));
  const next = (idx + dir + list.length) % list.length;
  return list[next].id;
}

/**
 * 切换性别时保留各自配置，共享名称
 */
export function switchGender(current, nextGender, byGenderMap) {
  const map = {
    female: byGenderMap?.female ? normalizeAvatar(byGenderMap.female) : null,
    male: byGenderMap?.male ? normalizeAvatar(byGenderMap.male) : null,
  };
  const cur = normalizeAvatar(current);
  map[cur.gender] = { ...cur };
  const sharedName = cur.name;
  const next = map[nextGender]
    ? normalizeAvatar({ ...map[nextGender], gender: nextGender, name: sharedName })
    : defaultForGender(nextGender);
  next.name = sharedName;
  return { avatar: next, byGender: map };
}
