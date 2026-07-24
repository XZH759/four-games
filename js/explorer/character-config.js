/**
 * 探索者角色配置（可擴充）
 * @typedef {Object} CharacterConfig
 * @property {string} bodyType
 * @property {string} skinTone
 * @property {string} faceShape
 * @property {string} eyeStyle
 * @property {string} eyebrowStyle
 * @property {string} mouthStyle
 * @property {string} hairStyle
 * @property {string} hairColor
 * @property {string} outfitId
 * @property {string|null} accessoryId
 */

export const STORAGE_DRAFT = "ailit_explorer_draft_v1";
export const STORAGE_FINAL = "ailit_explorer_v1";

/** @type {CharacterConfig} */
export const DEFAULT_CONFIG = {
  bodyType: "standard",
  skinTone: "s3",
  faceShape: "oval",
  eyeStyle: "dot",
  eyebrowStyle: "soft",
  mouthStyle: "neutral",
  hairStyle: "short_neat",
  hairColor: "black",
  outfitId: "campus",
  accessoryId: null,
};

export const TABS = [
  { id: "body", label: "基本造型", field: "bodyType" },
  { id: "skin", label: "膚色", field: "skinTone" },
  { id: "face", label: "臉型", field: "faceShape" },
  { id: "eyes", label: "眼睛", field: "eyeStyle" },
  { id: "brows", label: "眉毛", field: "eyebrowStyle" },
  { id: "mouth", label: "嘴型", field: "mouthStyle" },
  { id: "hair", label: "髮型", field: "hairStyle" },
  { id: "hairColor", label: "髮色", field: "hairColor" },
  { id: "outfit", label: "初始服裝", field: "outfitId" },
  { id: "accessory", label: "配件", field: "accessoryId" },
];

export const BODY_TYPES = [
  { id: "compact", label: "小巧", hint: "略為精巧的比例" },
  { id: "standard", label: "標準", hint: "均衡的探索者比例" },
  { id: "tall", label: "修長", hint: "稍長的身形比例" },
];

export const SKIN_TONES = [
  { id: "s1", label: "瓷白", hex: "#f7e6d8" },
  { id: "s2", label: "淺暖", hex: "#f3d5bf" },
  { id: "s3", label: "自然淺", hex: "#e8c4a4" },
  { id: "s4", label: "自然中", hex: "#d9a87e" },
  { id: "s5", label: "暖褐", hex: "#c48a5c" },
  { id: "s6", label: "深暖", hex: "#a86b42" },
  { id: "s7", label: "深棕", hex: "#7d4d2e" },
  { id: "s8", label: "深褐", hex: "#5a3420" },
];

export const FACE_SHAPES = [
  { id: "round", label: "圓潤" },
  { id: "oval", label: "橢圓" },
  { id: "softSquare", label: "柔和方形" },
  { id: "long", label: "稍長" },
  { id: "heart", label: "柔和心形" },
  { id: "soft", label: "柔邊" },
];

export const EYE_STYLES = [
  { id: "dot", label: "圓點眼" },
  { id: "oval", label: "橢圓眼" },
  { id: "curve", label: "微彎眼" },
  { id: "mono", label: "單眼皮風" },
  { id: "downturn", label: "柔和下垂" },
  { id: "upturn", label: "微微上揚" },
  { id: "wide", label: "寬圓眼" },
  { id: "narrow", label: "細長眼" },
  { id: "half", label: "半圓眼" },
  { id: "soft", label: "柔和點" },
];

export const EYEBROW_STYLES = [
  { id: "soft", label: "柔和弧" },
  { id: "straight", label: "平直" },
  { id: "thin", label: "細眉" },
  { id: "thick", label: "稍粗" },
  { id: "short", label: "短眉" },
  { id: "angled", label: "微折" },
  { id: "high", label: "高挑" },
  { id: "low", label: "低平" },
];

export const MOUTH_STYLES = [
  { id: "neutral", label: "中性" },
  { id: "smile", label: "微笑" },
  { id: "arc", label: "小弧線" },
  { id: "open", label: "輕微張口" },
  { id: "flat", label: "柔和平直" },
  { id: "dot", label: "小圓點" },
  { id: "softSmile", label: "淺笑" },
  { id: "tiny", label: "細線" },
];

export const HAIR_STYLES = [
  { id: "short_neat", label: "整齊短髮" },
  { id: "short_fluffy", label: "蓬鬆短髮" },
  { id: "buzz", label: "極短" },
  { id: "bob", label: "齊肩鮑伯" },
  { id: "mid_straight", label: "中長直髮" },
  { id: "mid_wave", label: "中長微捲" },
  { id: "long_straight", label: "長直髮" },
  { id: "long_wave", label: "長捲髮" },
  { id: "bangs_side", label: "側分劉海" },
  { id: "bangs_full", label: "齊劉海" },
  { id: "ponytail", label: "高束髮" },
  { id: "twin", label: "雙束" },
  { id: "curly_short", label: "短捲" },
  { id: "undercut", label: "中性層次" },
];

/** 自然色在前，特殊色在後 */
export const HAIR_COLORS = [
  { id: "black", label: "黑色", hex: "#2a2430" },
  { id: "darkBrown", label: "深棕", hex: "#4a3428" },
  { id: "lightBrown", label: "淺棕", hex: "#8b6a4a" },
  { id: "darkGray", label: "深灰", hex: "#5a5a62" },
  { id: "silver", label: "銀灰", hex: "#b8bcc8" },
  { id: "navy", label: "深藍", hex: "#3a4a6e" },
  { id: "softGreen", label: "柔和綠色", hex: "#6a8f78" },
  { id: "softPurple", label: "柔和紫色", hex: "#8a7a9e" },
  { id: "softPink", label: "柔和粉色", hex: "#c994a8" },
];

export const OUTFITS = [
  {
    id: "campus",
    label: "校園休閒",
    colors: { top: "#7eb8d4", bottom: "#4a5a6a", shoe: "#3a4450", accent: "#f0e6d8" },
  },
  {
    id: "sport",
    label: "運動探索",
    colors: { top: "#5cb88a", bottom: "#3d4a52", shoe: "#2e3840", accent: "#e8f5ee" },
  },
  {
    id: "tech",
    label: "簡約科技",
    colors: { top: "#6b7c93", bottom: "#3a4250", shoe: "#2a3038", accent: "#9fd4e8" },
  },
  {
    id: "travel",
    label: "戶外旅行",
    colors: { top: "#d4a574", bottom: "#5a6b4a", shoe: "#4a3a2a", accent: "#e8dcc8" },
  },
  {
    id: "studio",
    label: "創意工作室",
    colors: { top: "#c98bb0", bottom: "#5a4a62", shoe: "#3a3040", accent: "#f5e0ec" },
  },
  {
    id: "research",
    label: "資料研究員",
    colors: { top: "#8a9bb8", bottom: "#44506a", shoe: "#2e3448", accent: "#dce6f5" },
  },
];

export const ACCESSORIES = [
  { id: null, label: "無配件" },
  { id: "backpack", label: "小背包" },
  { id: "band", label: "資料手環" },
  { id: "hat", label: "探索帽" },
  { id: "headphones", label: "耳機" },
  { id: "glasses", label: "眼鏡" },
];

const OPTIONS_BY_FIELD = {
  bodyType: BODY_TYPES,
  skinTone: SKIN_TONES,
  faceShape: FACE_SHAPES,
  eyeStyle: EYE_STYLES,
  eyebrowStyle: EYEBROW_STYLES,
  mouthStyle: MOUTH_STYLES,
  hairStyle: HAIR_STYLES,
  hairColor: HAIR_COLORS,
  outfitId: OUTFITS,
  accessoryId: ACCESSORIES,
};

export function optionsForField(field) {
  return OPTIONS_BY_FIELD[field] || [];
}

export function skinHex(id) {
  return SKIN_TONES.find((s) => s.id === id)?.hex || SKIN_TONES[2].hex;
}

export function hairHex(id) {
  return HAIR_COLORS.find((h) => h.id === id)?.hex || HAIR_COLORS[0].hex;
}

export function outfitColors(id) {
  return OUTFITS.find((o) => o.id === id)?.colors || OUTFITS[0].colors;
}

export function cloneConfig(cfg) {
  return { ...cfg };
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_DRAFT);
    if (!raw) return null;
    return normalizeConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveDraft(cfg) {
  localStorage.setItem(STORAGE_DRAFT, JSON.stringify(cfg));
}

export function loadFinal() {
  try {
    const raw = localStorage.getItem(STORAGE_FINAL);
    if (!raw) return null;
    return normalizeConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveFinal(cfg) {
  const payload = { ...normalizeConfig(cfg), savedAt: Date.now() };
  localStorage.setItem(STORAGE_FINAL, JSON.stringify(payload));
  localStorage.removeItem(STORAGE_DRAFT);
  return payload;
}

export function normalizeConfig(partial) {
  const base = cloneConfig(DEFAULT_CONFIG);
  if (!partial || typeof partial !== "object") return base;
  for (const key of Object.keys(DEFAULT_CONFIG)) {
    if (key === "accessoryId") {
      if (partial.accessoryId === null || typeof partial.accessoryId === "string") {
        base.accessoryId = partial.accessoryId;
      }
      continue;
    }
    if (typeof partial[key] === "string") base[key] = partial[key];
  }
  return base;
}

/** 隨機：避免過度誇張配色（特殊髮色機率較低） */
export function randomConfig() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)].id;
  const naturalHair = HAIR_COLORS.slice(0, 5);
  const specialHair = HAIR_COLORS.slice(5);
  const hairPool = Math.random() < 0.78 ? naturalHair : specialHair;
  const accPool = ACCESSORIES;
  return normalizeConfig({
    bodyType: pick(BODY_TYPES),
    skinTone: pick(SKIN_TONES),
    faceShape: pick(FACE_SHAPES),
    eyeStyle: pick(EYE_STYLES),
    eyebrowStyle: pick(EYEBROW_STYLES),
    mouthStyle: pick(MOUTH_STYLES),
    hairStyle: pick(HAIR_STYLES),
    hairColor: hairPool[Math.floor(Math.random() * hairPool.length)].id,
    outfitId: pick(OUTFITS),
    accessoryId: accPool[Math.floor(Math.random() * accPool.length)].id,
  });
}
