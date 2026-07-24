/**
 * Avatar 图层清单（路径唯一来源）
 * 契约：1024×1536 全画布叠加；层序读 zOrder
 * fixtures 验收锚点：脚底基线 y=1440
 */
import {
  LAYER_ORDER,
  resolveSelectionLayers,
  getAssetsByIdSync,
} from "./character-assets.js";
import { findById, STARTER_OUTFITS } from "./avatar-config.js";

export const AVATAR_CANVAS = { width: 1024, height: 1536, footY: 1216, footX: 512 };
export const FIXTURE_CANVAS = { width: 1024, height: 1536, footY: 1440, footX: 512 };
export const FIXTURE_BASE = "/avatar/_fixtures";

/** 与接入包 LAYER_ORDER 对齐的渲染顺序 */
export const AVATAR_LAYER_ORDER = [...LAYER_ORDER];

export const FIXTURE_LAYER_ORDER = ["body", "outfit", "hairFront"];

export function resolveFixtureLayers() {
  return {
    body: `${FIXTURE_BASE}/body.svg`,
    outfit: `${FIXTURE_BASE}/outfit.svg`,
    hairFront: `${FIXTURE_BASE}/hairFront.svg`,
  };
}

/**
 * @param {{ selection?: Record<string, string|null>, gender?: string, useFixtures?: boolean }} config
 */
export function resolveAvatarLayers(config) {
  if (config?.useFixtures) return resolveFixtureLayers();
  if (config?.selection) {
    return resolveSelectionLayers(config.selection, getAssetsByIdSync());
  }
  return {};
}

export function layerOrderFor(config) {
  return config?.useFixtures ? FIXTURE_LAYER_ORDER : AVATAR_LAYER_ORDER;
}

export function outfitAura(outfitId, gender = "female") {
  const o = findById(STARTER_OUTFITS, outfitId);
  if (!o) return "rgba(170, 150, 230, 0.35)";
  if (gender === "male" && o.auraMale) return o.auraMale;
  return o.aura;
}

export const AVATAR_PLACEHOLDER_NOTE =
  "角色分层 PNG 未就绪或加载失败，已临时使用 SVG fallback。请确认 /character-assets/ 可访问。";
