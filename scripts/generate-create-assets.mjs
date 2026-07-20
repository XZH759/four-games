/**
 * 生成正式透明 WebP 人物图层（1600×2400）与九宫格 UI 素材
 * 原创程序化绘制，非参考图裁切。SVG 仅作绘制源，输出为 WebP。
 *
 * 用法: node scripts/generate-create-assets.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const AVATAR = path.join(ROOT, "assets", "avatar");
const UI = path.join(ROOT, "assets", "ui", "nine-slice");

const W = 1600;
const H = 2400;
/* 脚底锚点：画布底部向上 160px 的基线 */
const FOOT_Y = 2240;
const CX = 800;

const HAIR_COLORS = {
  linen: { base: "#d9c39a", dark: "#b0946a", light: "#f0e4c6" },
  silver: { base: "#dfe3f0", dark: "#aab1cc", light: "#f6f8fd" },
  tea: { base: "#a9805b", dark: "#7c5a3c", light: "#c9a97f" },
  sakura: { base: "#f4b8c8", dark: "#d3849e", light: "#fbdce6" },
  night: { base: "#4a4458", dark: "#2e2a3a", light: "#6f6886" },
};

const SKINS = {
  porcelain: { base: "#fdeee4", shade: "#f0d4c2" },
  warm: { base: "#f9e2ce", shade: "#e9c6ab" },
  natural: { base: "#eec9a4", shade: "#d8ad83" },
  wheat: { base: "#d9aa7e", shade: "#bd8c60" },
  deep: { base: "#b07a52", shade: "#8d5a38" },
};

const EYES = {
  violet: { iris: "#9678e0", rim: "#5c4699" },
  lake: { iris: "#66a4e6", rim: "#3a6cab" },
  amber: { iris: "#dea845", rim: "#9c7127" },
  cherry: { iris: "#de7386", rim: "#a04352" },
  jade: { iris: "#57c493", rim: "#31855f" },
};

const BODY = {
  slender: { sh: 118, waist: 78, hip: 112, arm: 40, leg: 58, torso: 320 },
  balanced: { sh: 136, waist: 96, hip: 132, arm: 46, leg: 70, torso: 310 },
  lively: { sh: 152, waist: 118, hip: 154, arm: 54, leg: 84, torso: 298 },
};

const OUTFITS = {
  scholar: { main: "#f6c0d6", light: "#fdeaf2", accent: "#a98ade", deep: "#e296b8", shoe: "#c9a256" },
  traveler: { main: "#e9eefb", light: "#ffffff", accent: "#7f9fdf", deep: "#b9c9ec", shoe: "#6a7fa8" },
  night: { main: "#3c2c40", light: "#5c4358", accent: "#a83050", deep: "#2c2032", shoe: "#1a1218" },
};

const FEMALE_HAIR = ["wave_long", "princess", "twin", "bob", "side_braid"];
const MALE_HAIR = ["short_neat", "soft_part", "messy", "pony_low", "curtain"];
const FACES = ["standard", "round", "soft", "sharp", "oval"];
const FEMALE_ACC = ["bow", "lace", "star", "pearl", "flower"];
const MALE_ACC = ["brooch", "glasses", "earcuff", "pendant", "band"];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeWebp(filePath, svg, { width = W, height = H } = {}) {
  await ensureDir(path.dirname(filePath));
  const buf = Buffer.from(svg);
  await sharp(buf, { density: 96 })
    .resize(width, height, { fit: "fill" })
    .webp({ quality: 86, alphaQuality: 90 })
    .toFile(filePath);
}

function wrap(inner, { width = W, height = H } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${inner}</svg>`;
}

function facePath(shape) {
  const y = 520;
  if (shape === "round") {
    return `M${CX - 118},${y} Q${CX - 120},${y + 170} ${CX - 40},${y + 230} Q${CX},${y + 255} ${CX + 40},${y + 230} Q${CX + 120},${y + 170} ${CX + 118},${y} Q${CX + 110},${y - 150} ${CX},${y - 170} Q${CX - 110},${y - 150} ${CX - 118},${y} Z`;
  }
  if (shape === "sharp") {
    return `M${CX - 108},${y - 10} Q${CX - 115},${y + 150} ${CX - 28},${y + 220} Q${CX},${y + 255} ${CX + 28},${y + 220} Q${CX + 115},${y + 150} ${CX + 108},${y - 10} Q${CX + 100},${y - 155} ${CX},${y - 175} Q${CX - 100},${y - 155} ${CX - 108},${y - 10} Z`;
  }
  if (shape === "soft") {
    return `M${CX - 112},${y} Q${CX - 118},${y + 160} ${CX - 36},${y + 225} Q${CX},${y + 248} ${CX + 36},${y + 225} Q${CX + 118},${y + 160} ${CX + 112},${y} Q${CX + 105},${y - 148} ${CX},${y - 168} Q${CX - 105},${y - 148} ${CX - 112},${y} Z`;
  }
  if (shape === "oval") {
    return `M${CX - 105},${y - 5} Q${CX - 112},${y + 165} ${CX - 32},${y + 235} Q${CX},${y + 252} ${CX + 32},${y + 235} Q${CX + 112},${y + 165} ${CX + 105},${y - 5} Q${CX + 98},${y - 160} ${CX},${y - 180} Q${CX - 98},${y - 160} ${CX - 105},${y - 5} Z`;
  }
  return `M${CX - 110},${y} Q${CX - 115},${y + 160} ${CX - 35},${y + 228} Q${CX},${y + 248} ${CX + 35},${y + 228} Q${CX + 115},${y + 160} ${CX + 110},${y} Q${CX + 102},${y - 152} ${CX},${y - 172} Q${CX - 102},${y - 152} ${CX - 110},${y} Z`;
}

function bodyGeom(bodyType, gender) {
  const b = BODY[bodyType];
  const neckY = 620;
  const shoulderY = 700;
  const waistY = shoulderY + b.torso * 0.55;
  const hipY = shoulderY + b.torso;
  const genderScale = gender === "male" ? 1.08 : 1;
  return {
    neckY,
    shoulderY,
    waistY,
    hipY,
    sh: b.sh * genderScale,
    waist: b.waist * (gender === "male" ? 1.15 : 1),
    hip: b.hip * (gender === "male" ? 0.95 : 1),
    arm: b.arm * genderScale,
    leg: b.leg * genderScale,
  };
}

function bodySvg(gender, bodyType, skinId) {
  const S = SKINS[skinId];
  const g = bodyGeom(bodyType, gender);
  const left = CX - g.sh;
  const right = CX + g.sh;
  const torso = `
    <path d="M${CX - 28},${g.neckY} L${CX + 28},${g.neckY}
      L${right},${g.shoulderY} L${CX + g.waist},${g.waistY} L${CX + g.hip},${g.hipY}
      L${CX - g.hip},${g.hipY} L${CX - g.waist},${g.waistY} L${left},${g.shoulderY} Z"
      fill="${S.base}" stroke="${S.shade}" stroke-width="3"/>
    <ellipse cx="${CX}" cy="${g.neckY - 8}" rx="34" ry="28" fill="${S.base}"/>`;
  const arms = `
    <path d="M${left},${g.shoulderY + 10} Q${left - g.arm * 1.6},${g.waistY} ${left - g.arm},${hipArmY(g)}
      Q${left - g.arm * 0.4},${g.hipY - 40} ${left + 8},${g.shoulderY + 40} Z" fill="${S.base}" stroke="${S.shade}" stroke-width="2"/>
    <path d="M${right},${g.shoulderY + 10} Q${right + g.arm * 1.6},${g.waistY} ${right + g.arm},${hipArmY(g)}
      Q${right + g.arm * 0.4},${g.hipY - 40} ${right - 8},${g.shoulderY + 40} Z" fill="${S.base}" stroke="${S.shade}" stroke-width="2"/>`;
  return wrap(torso + arms);
}

function hipArmY(g) {
  return g.hipY - 20;
}

function legsSvg(gender, bodyType, skinId) {
  const S = SKINS[skinId];
  const g = bodyGeom(bodyType, gender);
  const top = g.hipY - 8;
  const mid = (top + FOOT_Y) / 2;
  const lw = g.leg;
  return wrap(`
    <path d="M${CX - g.hip + 12},${top} Q${CX - lw * 0.9},${mid} ${CX - lw * 0.75},${FOOT_Y - 20}
      L${CX - 18},${FOOT_Y - 20} Q${CX - lw * 0.35},${mid} ${CX - 20},${top} Z" fill="${S.base}" stroke="${S.shade}" stroke-width="2"/>
    <path d="M${CX + g.hip - 12},${top} Q${CX + lw * 0.9},${mid} ${CX + lw * 0.75},${FOOT_Y - 20}
      L${CX + 18},${FOOT_Y - 20} Q${CX + lw * 0.35},${mid} ${CX + 20},${top} Z" fill="${S.base}" stroke="${S.shade}" stroke-width="2"/>
  `);
}

function faceSvg(shape, skinId) {
  const S = SKINS[skinId];
  return wrap(`
    <path d="${facePath(shape)}" fill="${S.base}" stroke="${S.shade}" stroke-width="3"/>
    <ellipse cx="${CX - 70}" cy="610" rx="22" ry="12" fill="#f7a8b8" opacity="0.35"/>
    <ellipse cx="${CX + 70}" cy="610" rx="22" ry="12" fill="#f7a8b8" opacity="0.35"/>
    <path d="M${CX - 18},640 Q${CX},652 ${CX + 18},640" fill="none" stroke="#c26875" stroke-width="5" stroke-linecap="round"/>
  `);
}

function eyesSvg(eyeId) {
  const E = EYES[eyeId];
  const one = (cx, f) => `
    <ellipse cx="${cx}" cy="560" rx="42" ry="48" fill="#fff" stroke="#decfda" stroke-width="2"/>
    <ellipse cx="${cx}" cy="564" rx="32" ry="38" fill="${E.iris}"/>
    <ellipse cx="${cx}" cy="548" rx="32" ry="16" fill="${E.rim}" opacity="0.4"/>
    <ellipse cx="${cx}" cy="568" rx="14" ry="18" fill="#221623"/>
    <circle cx="${cx - 12}" cy="546" r="10" fill="#fff" opacity="0.95"/>
    <path d="M${cx + f * 48},540 Q${cx},${f > 0 ? 500 : 500} ${cx - f * 40},536" fill="none" stroke="#2c1f28" stroke-width="10" stroke-linecap="round"/>
  `;
  return wrap(one(CX - 55, -1) + one(CX + 55, 1));
}

function hairFemale(style, color) {
  const H = HAIR_COLORS[color];
  const g = `url(#hg)`;
  const defs = `<defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${H.light}"/><stop offset="55%" stop-color="${H.base}"/><stop offset="100%" stop-color="${H.dark}"/>
  </linearGradient></defs>`;
  const cap = `<path d="M${CX - 130},520 Q${CX - 150},280 ${CX},250 Q${CX + 150},280 ${CX + 130},520 Q${CX + 110},400 ${CX},370 Q${CX - 110},400 ${CX - 130},520 Z" fill="${g}" stroke="${H.dark}" stroke-width="4"/>`;
  let back = "";
  let front = `
    <path d="M${CX - 130},500 Q${CX - 120},320 ${CX},300 Q${CX + 120},320 ${CX + 130},500
      Q${CX + 100},470 ${CX + 80},500 Q${CX + 50},380 ${CX + 20},495 Q${CX - 10},380 ${CX - 40},498 Q${CX - 80},400 ${CX - 100},505 Q${CX - 120},470 ${CX - 130},500 Z"
      fill="${g}" stroke="${H.dark}" stroke-width="3"/>`;

  if (style === "wave_long") {
    back = `
      <path d="M${CX - 125},480 Q${CX - 220},900 ${CX - 160},1400 Q${CX - 210},1800 ${CX - 140},2100 Q${CX - 100},2140 ${CX - 90},2080 Q${CX - 150},1700 ${CX - 110},1200 Q${CX - 160},800 ${CX - 90},500 Z" fill="${g}" stroke="${H.dark}" stroke-width="3"/>
      <path d="M${CX + 125},480 Q${CX + 220},900 ${CX + 160},1400 Q${CX + 210},1800 ${CX + 140},2100 Q${CX + 100},2140 ${CX + 90},2080 Q${CX + 150},1700 ${CX + 110},1200 Q${CX + 160},800 ${CX + 90},500 Z" fill="${g}" stroke="${H.dark}" stroke-width="3"/>`;
  } else if (style === "princess") {
    back = `
      <path d="M${CX - 120},500 Q${CX - 200},850 ${CX - 170},1200 Q${CX - 230},1500 ${CX - 120},1650 Q${CX - 60},1680 ${CX - 80},1600 Q${CX - 160},1400 ${CX - 120},1100 Q${CX - 150},750 ${CX - 80},520 Z" fill="${g}" stroke="${H.dark}" stroke-width="3"/>
      <path d="M${CX + 120},500 Q${CX + 200},850 ${CX + 170},1200 Q${CX + 230},1500 ${CX + 120},1650 Q${CX + 60},1680 ${CX + 80},1600 Q${CX + 160},1400 ${CX + 120},1100 Q${CX + 150},750 ${CX + 80},520 Z" fill="${g}" stroke="${H.dark}" stroke-width="3"/>
      <ellipse cx="${CX - 150}" cy="1550" rx="55" ry="70" fill="${g}" stroke="${H.dark}" stroke-width="3"/>
      <ellipse cx="${CX + 150}" cy="1550" rx="55" ry="70" fill="${g}" stroke="${H.dark}" stroke-width="3"/>`;
  } else if (style === "twin") {
    back = `
      <path d="M${CX - 100},480 Q${CX - 180},700 ${CX - 200},1100 Q${CX - 210},1500 ${CX - 190},1900" fill="none" stroke="${H.base}" stroke-width="48" stroke-linecap="round"/>
      <path d="M${CX + 100},480 Q${CX + 180},700 ${CX + 200},1100 Q${CX + 210},1500 ${CX + 190},1900" fill="none" stroke="${H.base}" stroke-width="48" stroke-linecap="round"/>
      <circle cx="${CX - 190}" cy="1920" r="42" fill="${g}" stroke="${H.dark}" stroke-width="3"/>
      <circle cx="${CX + 190}" cy="1920" r="42" fill="${g}" stroke="${H.dark}" stroke-width="3"/>`;
  } else if (style === "bob") {
    back = `
      <path d="M${CX - 130},500 Q${CX - 170},780 ${CX - 140},980 Q${CX - 100},1020 ${CX - 80},960 Q${CX - 130},780 ${CX - 90},520 Z" fill="${g}" stroke="${H.dark}" stroke-width="3"/>
      <path d="M${CX + 130},500 Q${CX + 170},780 ${CX + 140},980 Q${CX + 100},1020 ${CX + 80},960 Q${CX + 130},780 ${CX + 90},520 Z" fill="${g}" stroke="${H.dark}" stroke-width="3"/>`;
  } else {
    back = `
      <path d="M${CX - 40},480 Q${CX - 200},900 ${CX - 220},1500 Q${CX - 180},1900 ${CX - 120},2000" fill="none" stroke="${H.base}" stroke-width="52" stroke-linecap="round"/>
      <path d="M${CX + 90},500 Q${CX + 160},800 ${CX + 140},1100" fill="none" stroke="${H.base}" stroke-width="40" stroke-linecap="round"/>`;
  }
  return { back: wrap(defs + back + cap), front: wrap(defs + front) };
}

function hairMale(style, color) {
  const H = HAIR_COLORS[color];
  const defs = `<defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${H.light}"/><stop offset="55%" stop-color="${H.base}"/><stop offset="100%" stop-color="${H.dark}"/>
  </linearGradient></defs>`;
  const g = "url(#hg)";
  let back = `<path d="M${CX - 125},520 Q${CX - 140},300 ${CX},270 Q${CX + 140},300 ${CX + 125},520 Q${CX + 100},400 ${CX},380 Q${CX - 100},400 ${CX - 125},520 Z" fill="${g}" stroke="${H.dark}" stroke-width="4"/>`;
  let front = `<path d="M${CX - 120},500 Q${CX - 90},340 ${CX},320 Q${CX + 90},340 ${CX + 120},500 Q${CX + 70},450 ${CX + 40},490 Q${CX + 10},360 ${CX - 20},492 Q${CX - 60},380 ${CX - 90},495 Q${CX - 110},460 ${CX - 120},500 Z" fill="${g}" stroke="${H.dark}" stroke-width="3"/>`;

  if (style === "soft_part") {
    front = `<path d="M${CX - 20},310 Q${CX + 100},330 ${CX + 125},500 Q${CX + 80},460 ${CX + 50},490 Q${CX + 20},360 ${CX - 10},480 Q${CX - 80},350 ${CX - 110},500 Q${CX - 90},400 ${CX - 40},320 Z" fill="${g}" stroke="${H.dark}" stroke-width="3"/>`;
  } else if (style === "messy") {
    front += `<path d="M${CX - 80},340 L${CX - 40},280 L${CX - 10},340" fill="${g}"/><path d="M${CX + 20},330 L${CX + 55},270 L${CX + 70},340" fill="${g}"/>`;
  } else if (style === "pony_low") {
    back += `<path d="M${CX},520 Q${CX + 40},900 ${CX + 20},1400 Q${CX + 10},1700 ${CX - 10},1900" fill="none" stroke="${H.base}" stroke-width="44" stroke-linecap="round"/>`;
  } else if (style === "curtain") {
    front = `<path d="M${CX - 130},500 Q${CX - 100},340 ${CX - 10},360 Q${CX - 40},450 ${CX - 70},510 Q${CX - 110},470 ${CX - 130},500 Z" fill="${g}" stroke="${H.dark}" stroke-width="3"/>
      <path d="M${CX + 130},500 Q${CX + 100},340 ${CX + 10},360 Q${CX + 40},450 ${CX + 70},510 Q${CX + 110},470 ${CX + 130},500 Z" fill="${g}" stroke="${H.dark}" stroke-width="3"/>`;
  }
  return { back: wrap(defs + back), front: wrap(defs + front) };
}

function outfitMainSvg(gender, bodyType, outfitId) {
  const O = OUTFITS[outfitId];
  const g = bodyGeom(bodyType, gender);
  if (gender === "female") {
    if (outfitId === "scholar") {
      return wrap(`
        <path d="M${CX - g.sh + 10},${g.shoulderY + 20} L${CX + g.sh - 10},${g.shoulderY + 20}
          L${CX + g.hip + 40},${g.hipY + 420} L${CX - g.hip - 40},${g.hipY + 420} Z"
          fill="${O.main}" stroke="${O.deep}" stroke-width="4"/>
        <path d="M${CX - 40},${g.shoulderY + 20} L${CX + 40},${g.shoulderY + 20} L${CX + 30},${g.shoulderY + 160} L${CX - 30},${g.shoulderY + 160} Z" fill="${O.light}"/>
        <circle cx="${CX}" cy="${g.shoulderY + 90}" r="18" fill="${O.accent}"/>
      `);
    }
    if (outfitId === "traveler") {
      return wrap(`
        <path d="M${CX - g.sh},${g.shoulderY + 10} L${CX + g.sh},${g.shoulderY + 10}
          L${CX + g.waist + 20},${g.hipY + 80} L${CX - g.waist - 20},${g.hipY + 80} Z" fill="${O.main}" stroke="${O.deep}" stroke-width="4"/>
        <path d="M${CX - g.sh - 20},${g.shoulderY} Q${CX},${g.shoulderY + 40} ${CX + g.sh + 20},${g.shoulderY}
          L${CX + g.sh + 40},${g.hipY + 200} Q${CX},${g.hipY + 240} ${CX - g.sh - 40},${g.hipY + 200} Z" fill="${O.accent}" opacity="0.55"/>
        <rect x="${CX - 50}" y="${g.hipY - 10}" width="100" height="28" rx="8" fill="${O.deep}"/>
      `);
    }
    return wrap(`
      <path d="M${CX - g.sh + 5},${g.shoulderY + 15} L${CX + g.sh - 5},${g.shoulderY + 15}
        L${CX + g.hip + 60},${FOOT_Y - 80} L${CX - g.hip - 60},${FOOT_Y - 80} Z" fill="${O.main}" stroke="${O.accent}" stroke-width="5"/>
      <path d="M${CX - 70},${g.shoulderY + 15} L${CX + 70},${g.shoulderY + 15} L${CX + 90},${g.shoulderY + 220} L${CX - 90},${g.shoulderY + 220} Z" fill="${O.light}" opacity="0.7"/>
      <path d="M${CX - 20},${g.shoulderY + 40} L${CX + 20},${g.shoulderY + 40} L${CX},${g.shoulderY + 180} Z" fill="${O.accent}"/>
    `);
  }
  // male
  if (outfitId === "scholar") {
    return wrap(`
      <path d="M${CX - g.sh},${g.shoulderY} L${CX + g.sh},${g.shoulderY}
        L${CX + g.hip - 10},${g.hipY + 40} L${CX - g.hip + 10},${g.hipY + 40} Z" fill="${O.main}" stroke="${O.deep}" stroke-width="4"/>
      <path d="M${CX - g.sh - 10},${g.shoulderY + 10} L${CX + g.sh + 10},${g.shoulderY + 10}
        L${CX + g.sh + 30},${g.hipY + 280} L${CX - g.sh - 30},${g.hipY + 280} Z" fill="${O.accent}" opacity="0.45"/>
    `);
  }
  if (outfitId === "traveler") {
    return wrap(`
      <path d="M${CX - g.sh},${g.shoulderY} L${CX + g.sh},${g.shoulderY}
        L${CX + g.waist + 10},${g.hipY} L${CX + g.leg},${FOOT_Y - 40} L${CX + 24},${FOOT_Y - 40}
        L${CX + 30},${g.hipY} L${CX - 30},${g.hipY} L${CX - 24},${FOOT_Y - 40} L${CX - g.leg},${FOOT_Y - 40}
        L${CX - g.waist - 10},${g.hipY} Z" fill="${O.main}" stroke="${O.deep}" stroke-width="4"/>
      <path d="M${CX - g.sh - 30},${g.shoulderY + 20} Q${CX - 40},${g.waistY} ${CX - g.sh - 10},${g.hipY + 160}
        L${CX - g.sh + 40},${g.hipY + 160} Q${CX - 20},${g.waistY} ${CX - 40},${g.shoulderY + 40} Z" fill="${O.accent}" opacity="0.7"/>
    `);
  }
  return wrap(`
    <path d="M${CX - g.sh},${g.shoulderY} L${CX + g.sh},${g.shoulderY}
      L${CX + g.hip},${g.hipY + 20} L${CX - g.hip},${g.hipY + 20} Z" fill="${O.main}" stroke="${O.accent}" stroke-width="4"/>
    <path d="M${CX - 40},${g.shoulderY} L${CX + 40},${g.shoulderY} L${CX + 50},${g.hipY + 10} L${CX - 50},${g.hipY + 10} Z" fill="${O.light}"/>
    <rect x="${CX - 60}" y="${g.hipY - 20}" width="120" height="24" rx="6" fill="${O.accent}"/>
  `);
}

function shoesSvg(gender, bodyType, outfitId) {
  const O = OUTFITS[outfitId];
  const g = bodyGeom(bodyType, gender);
  const y = FOOT_Y - 8;
  return wrap(`
    <ellipse cx="${CX - g.leg * 0.55}" cy="${y}" rx="${gender === "female" ? 48 : 55}" ry="22" fill="${O.shoe}"/>
    <ellipse cx="${CX + g.leg * 0.55}" cy="${y}" rx="${gender === "female" ? 48 : 55}" ry="22" fill="${O.shoe}"/>
  `);
}

function accessorySvg(gender, id) {
  if (gender === "female") {
    if (id === "bow") {
      return wrap(`
        <path d="M${CX + 70},360 Q${CX + 20},330 ${CX + 70},300 Q${CX + 120},330 ${CX + 70},360 Z" fill="#f4a1b8" stroke="#c76b88" stroke-width="3"/>
        <path d="M${CX + 70},360 Q${CX + 120},390 ${CX + 70},420 Q${CX + 20},390 ${CX + 70},360 Z" fill="#f4a1b8" stroke="#c76b88" stroke-width="3"/>
        <circle cx="${CX + 70}" cy="360" r="14" fill="#e8d1a7"/>
      `);
    }
    if (id === "lace") {
      return wrap(`<path d="M${CX - 120},480 Q${CX},440 ${CX + 120},480" fill="none" stroke="#f8e8f0" stroke-width="14"/>
        <path d="M${CX - 120},480 Q${CX},440 ${CX + 120},480" fill="none" stroke="#d4a5c0" stroke-width="4"/>`);
    }
    if (id === "star") {
      return wrap(`<path d="M${CX - 90},340 l12,28 30,2 -22,20 7,30 -27,-16 -27,16 7,-30 -22,-20 30,-2 z" fill="#e8d1a7" stroke="#c9a256" stroke-width="2"/>`);
    }
    if (id === "pearl") {
      return wrap(`<circle cx="${CX - 115}" cy="600" r="10" fill="#fff"/><circle cx="${CX + 115}" cy="600" r="10" fill="#fff"/>`);
    }
    return wrap(`
      <circle cx="${CX - 95}" cy="350" r="28" fill="#f4b8c8" stroke="#d3849e" stroke-width="3"/>
      <circle cx="${CX - 95}" cy="350" r="12" fill="#fff0f5"/>
    `);
  }
  if (id === "brooch") {
    return wrap(`<circle cx="${CX + 70}" cy="760" r="22" fill="#e8d1a7" stroke="#c9a256" stroke-width="3"/><path d="M${CX + 70},748 l6,14 15,1 -11,10 3,15 -13,-8 -13,8 3,-15 -11,-10 15,-1 z" fill="#fff"/>`);
  }
  if (id === "glasses") {
    return wrap(`
      <circle cx="${CX - 55}" cy="560" r="48" fill="none" stroke="#5c4a6e" stroke-width="6"/>
      <circle cx="${CX + 55}" cy="560" r="48" fill="none" stroke="#5c4a6e" stroke-width="6"/>
      <path d="M${CX - 7},560 H${CX + 7}" stroke="#5c4a6e" stroke-width="5"/>
    `);
  }
  if (id === "earcuff") {
    return wrap(`<path d="M${CX + 115},560 Q${CX + 145},580 ${CX + 120},610" fill="none" stroke="#e8d1a7" stroke-width="6"/>`);
  }
  if (id === "pendant") {
    return wrap(`<path d="M${CX},640 L${CX},760" stroke="#c9a256" stroke-width="4"/><circle cx="${CX}" cy="780" r="18" fill="#a98ade" stroke="#e8d1a7" stroke-width="3"/>`);
  }
  return wrap(`<path d="M${CX - 100},470 Q${CX},450 ${CX + 100},470" fill="none" stroke="#7a5f9a" stroke-width="12"/>`);
}

function highlightsSvg() {
  return wrap(`
    <ellipse cx="${CX - 40}" cy="480" rx="30" ry="18" fill="#fff" opacity="0.25"/>
    <ellipse cx="${CX + 90}" cy="900" rx="40" ry="80" fill="#fff" opacity="0.12"/>
  `);
}

/* —— UI 九宫格 —— */
async function genUiPanel(name, opts) {
  const { w = 640, h = 480, fill, stroke, strokeW = 8, radius = 36 } = opts;
  const svg = wrap(
    `<rect x="12" y="12" width="${w - 24}" height="${h - 24}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}"/>
     <rect x="28" y="28" width="${w - 56}" height="${h - 56}" rx="${radius - 10}" fill="none" stroke="${stroke}" stroke-width="2" opacity="0.55"/>`,
    { width: w, height: h },
  );
  await writeWebp(path.join(UI, name), svg, { width: w, height: h });
}

async function genUiButton(name, opts) {
  const { w = 480, h = 120, fill, stroke } = opts;
  const svg = wrap(
    `<rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="56" fill="${fill}" stroke="${stroke}" stroke-width="6"/>
     <rect x="16" y="14" width="${w - 32}" height="${h * 0.35}" rx="28" fill="#fff" opacity="0.22"/>`,
    { width: w, height: h },
  );
  await writeWebp(path.join(UI, name), svg, { width: w, height: h });
}

async function genUiCard(name, opts) {
  const { w = 320, h = 420, fill, stroke, strokeW = 6 } = opts;
  const svg = wrap(
    `<rect x="10" y="10" width="${w - 20}" height="${h - 20}" rx="28" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}"/>`,
    { width: w, height: h },
  );
  await writeWebp(path.join(UI, name), svg, { width: w, height: h });
}

async function generateUi() {
  await ensureDir(UI);
  await genUiPanel("panel-primary.9.webp", { fill: "rgba(255,252,248,0.92)", stroke: "#c9a256" });
  await genUiPanel("panel-secondary.9.webp", { fill: "rgba(248,240,255,0.9)", stroke: "#b89ad4", w: 560, h: 400 });
  await genUiCard("card-default.9.webp", { fill: "rgba(255,255,255,0.82)", stroke: "#e2c789" });
  await genUiCard("card-hover.9.webp", { fill: "rgba(255,248,232,0.92)", stroke: "#c9a256", strokeW: 8 });
  await genUiCard("card-selected.9.webp", { fill: "rgba(255,244,220,0.96)", stroke: "#b08a3e", strokeW: 10 });
  await genUiCard("card-disabled.9.webp", { fill: "rgba(240,236,244,0.7)", stroke: "#cfc4d8", strokeW: 4 });
  await genUiCard("card-pressed.9.webp", { fill: "rgba(255,236,210,0.95)", stroke: "#a2762c", strokeW: 8 });
  await genUiCard("card-loading.9.webp", { fill: "rgba(255,252,248,0.6)", stroke: "#e2c789", strokeW: 4 });

  await genUiButton("button-primary-default.webp", { fill: "#e86a9a", stroke: "#fff0f5" });
  await genUiButton("button-primary-hover.webp", { fill: "#f080a8", stroke: "#ffffff" });
  await genUiButton("button-primary-pressed.webp", { fill: "#c84e80", stroke: "#f8d0e0" });
  await genUiButton("button-primary-disabled.webp", { fill: "#d4b0c0", stroke: "#eee" });
  await genUiButton("button-secondary-default.webp", { fill: "#8d6cc4", stroke: "#f0e8ff" });
  await genUiButton("button-secondary-hover.webp", { fill: "#9d7dd0", stroke: "#ffffff" });
  await genUiButton("button-secondary-pressed.webp", { fill: "#6f4fa8", stroke: "#e0d0f5" });
  await genUiButton("button-secondary-disabled.webp", { fill: "#b8a8d0", stroke: "#eee" });

  const ribbon = wrap(
    `<path d="M40,70 L80,30 H560 L600,70 L560,110 H80 Z" fill="#c3a6e1" stroke="#e8d1a7" stroke-width="6"/>
     <path d="M80,30 L100,10 H540 L560,30" fill="#d4b8ec"/>`,
    { width: 640, height: 140 },
  );
  await writeWebp(path.join(UI, "title-ribbon.9.webp"), ribbon, { width: 640, height: 140 });

  for (const [name, stroke] of [
    ["name-scroll-default.webp", "#e2c789"],
    ["name-scroll-focus.webp", "#b08a3e"],
    ["name-scroll-error.webp", "#c45a6e"],
  ]) {
    const svg = wrap(
      `<rect x="16" y="20" width="608" height="80" rx="40" fill="#fffaf2" stroke="${stroke}" stroke-width="6"/>`,
      { width: 640, height: 120 },
    );
    await writeWebp(path.join(UI, name), svg, { width: 640, height: 120 });
  }

  const check = wrap(
    `<circle cx="48" cy="48" r="40" fill="#c9a256" stroke="#fff9e8" stroke-width="4"/>
     <path d="M28 50 l12 12 26-28" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
    { width: 96, height: 96 },
  );
  await writeWebp(path.join(UI, "selected-check.webp"), check, { width: 96, height: 96 });

  for (const [name, bg] of [
    ["dice-button-default.webp", "#fff8e8"],
    ["dice-button-hover.webp", "#ffe9b8"],
  ]) {
    const svg = wrap(
      `<rect x="8" y="8" width="80" height="80" rx="18" fill="${bg}" stroke="#c9a256" stroke-width="4"/>
       <rect x="28" y="28" width="40" height="40" rx="8" fill="#fff" stroke="#b08a3e" stroke-width="3"/>
       <circle cx="40" cy="40" r="4" fill="#b08a3e"/><circle cx="56" cy="48" r="4" fill="#b08a3e"/><circle cx="40" cy="56" r="4" fill="#b08a3e"/>`,
      { width: 96, height: 96 },
    );
    await writeWebp(path.join(UI, name), svg, { width: 96, height: 96 });
  }
}

async function generateGender(gender) {
  const hairs = gender === "female" ? FEMALE_HAIR : MALE_HAIR;
  const accs = gender === "female" ? FEMALE_ACC : MALE_ACC;
  const base = path.join(AVATAR, gender);

  for (const bodyType of Object.keys(BODY)) {
    for (const skin of Object.keys(SKINS)) {
      await writeWebp(path.join(base, "base", bodyType, `body-${skin}.webp`), bodySvg(gender, bodyType, skin));
      await writeWebp(path.join(base, "base", bodyType, `legs-${skin}.webp`), legsSvg(gender, bodyType, skin));
    }
  }

  for (const face of FACES) {
    for (const skin of Object.keys(SKINS)) {
      await writeWebp(path.join(base, "base", `face-${face}-${skin}.webp`), faceSvg(face, skin));
    }
  }

  for (const eye of Object.keys(EYES)) {
    await writeWebp(path.join(base, "faces", "eyes", `${eye}.webp`), eyesSvg(eye));
  }

  for (const style of hairs) {
    for (const color of Object.keys(HAIR_COLORS)) {
      const pair = gender === "female" ? hairFemale(style, color) : hairMale(style, color);
      await writeWebp(path.join(base, "hair", style, `${color}-back.webp`), pair.back);
      await writeWebp(path.join(base, "hair", style, `${color}-front.webp`), pair.front);
    }
  }

  for (const outfit of Object.keys(OUTFITS)) {
    for (const bodyType of Object.keys(BODY)) {
      await writeWebp(
        path.join(base, "outfits", outfit, `${bodyType}-main.webp`),
        outfitMainSvg(gender, bodyType, outfit),
      );
      await writeWebp(
        path.join(base, "outfits", outfit, `${bodyType}-shoes.webp`),
        shoesSvg(gender, bodyType, outfit),
      );
    }
  }

  for (const acc of accs) {
    await writeWebp(path.join(base, "accessories", acc, "head.webp"), accessorySvg(gender, acc));
  }
}

async function main() {
  console.log("Generating avatar layers…");
  await ensureDir(AVATAR);
  await writeWebp(path.join(AVATAR, "effects", "soft-highlights.webp"), highlightsSvg());
  await generateGender("female");
  await generateGender("male");
  console.log("Generating UI nine-slice…");
  await generateUi();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
