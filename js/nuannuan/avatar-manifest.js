/**
 * Avatar 图层清单（路径唯一来源）
 * 画布约定：1600×2400，中心对齐，脚底锚点 FOOT_Y≈2240
 */
import { findById, STARTER_OUTFITS } from "./avatar-config.js";

export const AVATAR_CANVAS = { width: 1600, height: 2400, footY: 2240 };

export const AVATAR_LAYER_ORDER = [
  "hairBack",
  "bodyBase",
  "legs",
  "shoes",
  "outfitMain",
  "faceBase",
  "eyes",
  "hairFront",
  "headAccessory",
  "highlights",
];

const BASE = "/assets/avatar";

/**
 * @param {import('./avatar-config.js').AvatarConfig} config
 */
export function resolveAvatarLayers(config) {
  const gender = config.gender === "male" ? "male" : "female";
  const body = config.bodyType || "balanced";
  const skin = config.skinTone || "warm";
  const hair = config.hairStyle || (gender === "male" ? "short_neat" : "wave_long");
  const color = config.hairColor || "linen";
  const outfit = config.starterOutfit || config.outfitId || "scholar";
  const face = config.faceShape || "standard";
  const eyes = config.eyeStyle || "violet";
  const acc = config.accessory ?? config.accessoryId ?? null;
  const root = `${BASE}/${gender}`;

  return {
    hairBack: `${root}/hair/${hair}/${color}-back.webp`,
    bodyBase: `${root}/base/${body}/body-${skin}.webp`,
    legs: `${root}/base/${body}/legs-${skin}.webp`,
    shoes: `${root}/outfits/${outfit}/${body}-shoes.webp`,
    outfitMain: `${root}/outfits/${outfit}/${body}-main.webp`,
    faceBase: `${root}/base/face-${face}-${skin}.webp`,
    eyes: `${root}/faces/eyes/${eyes}.webp`,
    hairFront: `${root}/hair/${hair}/${color}-front.webp`,
    headAccessory: acc ? `${root}/accessories/${acc}/head.webp` : undefined,
    highlights: `${BASE}/effects/soft-highlights.webp`,
  };
}

export function outfitAura(outfitId) {
  return findById(STARTER_OUTFITS, outfitId).aura;
}

export const AVATAR_PLACEHOLDER_NOTE =
  "当前为开发 SVG fallback。正式页面应使用 /assets/avatar 下 1600×2400 WebP 分层。";
