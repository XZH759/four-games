/**
 * 角色分层素材运行时工具（对应接入包 characterAssets / randomizeCharacter）
 * 业务状态只存 asset_id；URL 由 relative_path 拼接。
 */

export const CHARACTER_ASSET_BASE = "/character-assets";

export const LAYER_ORDER = [
  "body",
  "outfit",
  "hairBack",
  "face",
  "eyes",
  "hairFront",
  "accessory",
];

export const REQUIRED_LAYERS = ["body", "face", "eyes"];

export const APPEARANCE_LAYER_META = [
  { key: "hair", label: "发型", layers: ["hairBack", "hairFront"] },
  { key: "eyes", label: "眼睛", layers: ["eyes"] },
  { key: "face", label: "脸型", layers: ["face"] },
  { key: "accessory", label: "配饰", layers: ["accessory"], optional: true },
  { key: "outfit", label: "服装", layers: ["outfit"] },
];

let cachedIndex = null;
let cachedById = null;

export async function loadAssetIndex(force = false) {
  if (cachedIndex && !force) return cachedIndex;
  const response = await fetch(`${CHARACTER_ASSET_BASE}/asset_index.json`);
  if (!response.ok) {
    throw new Error(`无法加载角色素材索引：${response.status}`);
  }
  cachedIndex = await response.json();
  cachedById = new Map(cachedIndex.assets.map((asset) => [asset.asset_id, asset]));
  return cachedIndex;
}

export async function loadSamplePresets() {
  const response = await fetch(`${CHARACTER_ASSET_BASE}/sample_presets.json`);
  if (!response.ok) {
    throw new Error(`无法加载角色预设：${response.status}`);
  }
  return response.json();
}

export function getAssetIndexSync() {
  return cachedIndex;
}

export function getAssetsByIdSync() {
  return cachedById || new Map();
}

export function getAssetUrl(asset, format = "png") {
  if (!asset) return "";
  const path = asset.relative_path.replace(/\.png$/i, `.${format}`);
  return `${CHARACTER_ASSET_BASE}/${path}`;
}

export function getAssetsForLayer(assetIndex, gender, layer) {
  return assetIndex.assets
    .filter((asset) => asset.gender === gender && asset.layer === layer)
    .sort((a, b) => a.variant - b.variant);
}

export function createDefaultSelection(assetIndex, gender) {
  return Object.fromEntries(
    LAYER_ORDER.map((layer) => {
      const first = getAssetsForLayer(assetIndex, gender, layer)[0];
      return [layer, first?.asset_id ?? null];
    }),
  );
}

export function selectionFromPreset(preset) {
  return { ...preset.assets };
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function randomizeSelection(assetIndex, gender) {
  return Object.fromEntries(
    LAYER_ORDER.map((layer) => {
      const candidates = getAssetsForLayer(assetIndex, gender, layer);
      if (layer === "accessory" && Math.random() < 0.2) return [layer, null];
      return [layer, pick(candidates)?.asset_id ?? null];
    }),
  );
}

/** 发型成对切换：同步 hairBack / hairFront 的同序号变体 */
export function cycleHairPair(assetIndex, gender, selection, direction) {
  const backs = getAssetsForLayer(assetIndex, gender, "hairBack");
  const fronts = getAssetsForLayer(assetIndex, gender, "hairFront");
  if (!backs.length || !fronts.length) return selection;
  const current = backs.findIndex((asset) => asset.asset_id === selection.hairBack);
  const index = Math.max(0, current);
  const next = (index + direction + backs.length) % backs.length;
  const variant = backs[next].variant;
  const front = fronts.find((asset) => asset.variant === variant) || fronts[next % fronts.length];
  return {
    ...selection,
    hairBack: backs[next].asset_id,
    hairFront: front.asset_id,
  };
}

export function cycleLayer(assetIndex, gender, selection, layer, direction) {
  const candidates = getAssetsForLayer(assetIndex, gender, layer);
  if (!candidates.length) return selection;
  const currentIndex = Math.max(
    0,
    candidates.findIndex((asset) => asset.asset_id === selection[layer]),
  );
  const nextIndex = (currentIndex + direction + candidates.length) % candidates.length;
  return {
    ...selection,
    [layer]: candidates[nextIndex].asset_id,
  };
}

export function resolveSelectionLayers(selection, assetsById = getAssetsByIdSync()) {
  const layers = {};
  LAYER_ORDER.forEach((layer) => {
    const assetId = selection?.[layer];
    if (!assetId) return;
    const asset = assetsById.get(assetId);
    if (!asset) return;
    layers[layer] = getAssetUrl(asset);
  });
  return layers;
}

export function validateSelection(selection, assetsById, gender) {
  const errors = [];
  for (const layer of LAYER_ORDER) {
    const assetId = selection?.[layer];
    if (!assetId) {
      if (REQUIRED_LAYERS.includes(layer)) errors.push(`缺少必选图层：${layer}`);
      continue;
    }
    const asset = assetsById.get(assetId);
    if (!asset) {
      errors.push(`未知素材：${assetId}`);
      continue;
    }
    if (asset.layer !== layer) errors.push(`${assetId} 属于 ${asset.layer}，不是 ${layer}`);
    if (asset.gender !== gender) errors.push(`${assetId} 属于 ${asset.gender}，不是 ${gender}`);
  }
  return errors;
}

export function preloadImages(urls) {
  return Promise.all(
    [...new Set(urls.filter(Boolean))].map(
      async (url) => {
        try {
          const response = await fetch(url, { cache: "no-cache" });
          if (!response.ok) return { url, ok: false };
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          const ok = await new Promise((resolve) => {
            const image = new Image();
            image.onload = () => resolve(true);
            image.onerror = () => resolve(false);
            image.src = objectUrl;
          });
          if (!ok) {
            URL.revokeObjectURL(objectUrl);
            return { url, ok: false };
          }
          return { url, ok: true, objectUrl };
        } catch {
          return { url, ok: false };
        }
      },
    ),
  );
}

export function labelForAsset(asset) {
  if (!asset) return "无";
  const labels = {
    body: "体型",
    outfit: "服装",
    hairBack: "发型",
    face: "脸型",
    eyes: "眼睛",
    hairFront: "前发",
    accessory: "配饰",
  };
  return `${labels[asset.layer] || asset.layer} ${String(asset.variant).padStart(2, "0")}`;
}
