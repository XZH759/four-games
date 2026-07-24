/**
 * AI 职业角色立绘注册表
 * 运行时预览使用单人透明 cutout / composite（1024×1536），
 * 不挂多人分解图 sheet。
 */

export const CHARACTER_REFERENCE_BASE = "/character-reference";
export const CAREER_CUTOUT_BASE = `${CHARACTER_REFERENCE_BASE}/assets/career-cutouts`;

export const LAYER_ORDER = [
  "body",
  "outfit",
  "hairBack",
  "face",
  "eyes",
  "hairFront",
  "accessory",
];

export const CANVAS = { width: 1024, height: 1536 };
export const ANCHOR = { type: "foot_center", x: 512, y: 1440 };

/** @type {Record<string, { labelCn: string, labelEn: string, hint: string, code: string }>} */
export const ROLE_META = {
  researcher: {
    labelCn: "研究员",
    labelEn: "Lab Researcher",
    hint: "实验室路线",
    code: "RS",
  },
  programmer: {
    labelCn: "程序员",
    labelEn: "Programmer",
    hint: "代码探索路线",
    code: "PRG",
  },
  engineer: {
    labelCn: "工程师",
    labelEn: "Engineer",
    hint: "工程实践路线",
    code: "EG",
  },
};

/**
 * @typedef {{
 *   id: string,
 *   role: 'researcher'|'programmer'|'engineer',
 *   gender: 'female'|'male',
 *   displayNameCn: string,
 *   displayNameEn: string,
 *   heightCm: number,
 *   affiliation: string,
 *   folder: string,
 *   previewCutout: string,
 *   previewCard: string,
 *   composite: string,
 * }} CareerCharacter
 */

/** @type {CareerCharacter[]} */
export const CHARACTER_REFERENCES = [
  {
    id: "researcher_female",
    role: "researcher",
    gender: "female",
    displayNameCn: "研究员·女",
    displayNameEn: "Researcher · Female",
    heightCm: 168,
    affiliation: "智能研究院",
    folder: "researcher_f",
    previewCutout: "assets/career-cutouts/researcher_f/preview_cutout.png",
    previewCard: "assets/career-cutouts/researcher_f/preview_card.png",
    composite: "assets/career-cutouts/researcher_f/canvas/composite.png",
  },
  {
    id: "researcher_male",
    role: "researcher",
    gender: "male",
    displayNameCn: "研究员·男",
    displayNameEn: "Researcher · Male",
    heightCm: 178,
    affiliation: "智能研究院",
    folder: "researcher_m",
    previewCutout: "assets/career-cutouts/researcher_m/preview_cutout.png",
    previewCard: "assets/career-cutouts/researcher_m/preview_card.png",
    composite: "assets/career-cutouts/researcher_m/canvas/composite.png",
  },
  {
    id: "programmer_female",
    role: "programmer",
    gender: "female",
    displayNameCn: "程序员·女",
    displayNameEn: "Programmer · Female",
    heightCm: 168,
    affiliation: "AI LAB",
    folder: "programmer_f",
    previewCutout: "assets/career-cutouts/programmer_f/preview_cutout.png",
    previewCard: "assets/career-cutouts/programmer_f/preview_card.png",
    composite: "assets/career-cutouts/programmer_f/canvas/composite.png",
  },
  {
    id: "programmer_male",
    role: "programmer",
    gender: "male",
    displayNameCn: "程序员·男",
    displayNameEn: "Programmer · Male",
    heightCm: 178,
    affiliation: "AI LAB",
    folder: "programmer_m",
    previewCutout: "assets/career-cutouts/programmer_m/preview_cutout.png",
    previewCard: "assets/career-cutouts/programmer_m/preview_card.png",
    composite: "assets/career-cutouts/programmer_m/canvas/composite.png",
  },
  {
    id: "engineer_female",
    role: "engineer",
    gender: "female",
    displayNameCn: "工程师·女",
    displayNameEn: "Engineer · Female",
    heightCm: 168,
    affiliation: "智能研究院",
    folder: "engineer_f",
    previewCutout: "assets/career-cutouts/engineer_f/preview_cutout.png",
    previewCard: "assets/career-cutouts/engineer_f/preview_card.png",
    composite: "assets/career-cutouts/engineer_f/canvas/composite.png",
  },
  {
    id: "engineer_male",
    role: "engineer",
    gender: "male",
    displayNameCn: "工程师·男",
    displayNameEn: "Engineer · Male",
    heightCm: 178,
    affiliation: "智能研究院",
    folder: "engineer_m",
    previewCutout: "assets/career-cutouts/engineer_m/preview_cutout.png",
    previewCard: "assets/career-cutouts/engineer_m/preview_card.png",
    composite: "assets/career-cutouts/engineer_m/canvas/composite.png",
  },
];

export const MASTER_LINEUP = `${CHARACTER_REFERENCE_BASE}/assets/reference_sheets/master_lineup/master_lineup.png`;

let cachedIndex = null;

export async function loadReferenceIndex(force = false) {
  if (cachedIndex && !force) return cachedIndex;
  const response = await fetch(`${CHARACTER_REFERENCE_BASE}/config/asset-index.json`);
  if (!response.ok) {
    throw new Error(`无法加载职业立绘索引：${response.status}`);
  }
  cachedIndex = await response.json();
  return cachedIndex;
}

export function assetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path) || path.startsWith("/")) return path;
  return `${CHARACTER_REFERENCE_BASE}/${path.replace(/^\//, "")}`;
}

/** @deprecated 使用 getCareerPreviewUrl / getCareerThumbUrl */
export function getReferenceSheetUrl(assetOrPath) {
  if (!assetOrPath) return "";
  if (typeof assetOrPath === "string") return assetUrl(assetOrPath);
  return getCareerPreviewUrl(assetOrPath);
}

export function getCareerPreviewUrl(character) {
  if (!character) return "";
  return assetUrl(character.composite || character.previewCutout);
}

export function getCareerThumbUrl(character) {
  if (!character) return "";
  return assetUrl(character.previewCard || character.previewCutout || character.composite);
}

export function findReferenceById(id) {
  return CHARACTER_REFERENCES.find((item) => item.id === id) || null;
}

export function findReference(role, gender) {
  return (
    CHARACTER_REFERENCES.find((item) => item.role === role && item.gender === gender) || null
  );
}

export function referencesForGender(gender) {
  return CHARACTER_REFERENCES.filter((item) => item.gender === gender);
}

export function careerOptionsForGender(gender) {
  return Object.entries(ROLE_META).map(([role, meta]) => {
    const asset = findReference(role, gender);
    return {
      id: role,
      label: meta.labelCn,
      labelEn: meta.labelEn,
      hint: meta.hint,
      code: meta.code,
      characterId: asset?.id || null,
      heightCm: asset?.heightCm ?? null,
      affiliation: asset?.affiliation || "",
      displayNameCn: asset?.displayNameCn || meta.labelCn,
      displayNameEn: asset?.displayNameEn || meta.labelEn,
      thumbUrl: asset ? getCareerThumbUrl(asset) : "",
      previewUrl: asset ? getCareerPreviewUrl(asset) : "",
      sheetUrl: asset ? getCareerPreviewUrl(asset) : "",
      disabled: !asset,
    };
  });
}

export function characterCode(character) {
  if (!character) return "";
  const meta = ROLE_META[character.role];
  const prefix = meta?.code || "CH";
  const g = character.gender === "male" ? "M" : "F";
  const n =
    character.role === "researcher" ? "01" : character.role === "programmer" ? "03" : "05";
  return `${prefix}-${g}-${n}`;
}
