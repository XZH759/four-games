import type {
  AssetIndex,
  CharacterAsset,
  CharacterGender,
  CharacterLayer,
  CharacterSelection,
} from "../types/character";
import { LAYER_ORDER } from "../types/character";

export const CHARACTER_ASSET_BASE = "/character-assets";

export async function loadAssetIndex(): Promise<AssetIndex> {
  const response = await fetch(`${CHARACTER_ASSET_BASE}/asset_index.json`);
  if (!response.ok) {
    throw new Error(`Unable to load character asset index: ${response.status}`);
  }
  return (await response.json()) as AssetIndex;
}

export function indexAssetsById(assetIndex: AssetIndex): Map<string, CharacterAsset> {
  return new Map(assetIndex.assets.map((asset) => [asset.asset_id, asset]));
}

export function getAssetUrl(asset: CharacterAsset, format: "png" | "svg" = "png"): string {
  const path = asset.relative_path.replace(/\.png$/i, `.${format}`);
  return `${CHARACTER_ASSET_BASE}/${path}`;
}

export function getAssetsForLayer(
  assetIndex: AssetIndex,
  gender: CharacterGender,
  layer: CharacterLayer,
): CharacterAsset[] {
  return assetIndex.assets
    .filter((asset) => asset.gender === gender && asset.layer === layer)
    .sort((a, b) => a.variant - b.variant);
}

export function createDefaultSelection(
  assetIndex: AssetIndex,
  gender: CharacterGender,
): CharacterSelection {
  return Object.fromEntries(
    LAYER_ORDER.map((layer) => {
      const first = getAssetsForLayer(assetIndex, gender, layer)[0];
      return [layer, first?.asset_id ?? null];
    }),
  ) as CharacterSelection;
}

export function validateSelection(
  selection: CharacterSelection,
  assetsById: Map<string, CharacterAsset>,
  gender: CharacterGender,
): string[] {
  const errors: string[] = [];

  for (const layer of LAYER_ORDER) {
    const assetId = selection[layer];
    if (!assetId) {
      if (["body", "face", "eyes"].includes(layer)) {
        errors.push(`Required layer is missing: ${layer}`);
      }
      continue;
    }

    const asset = assetsById.get(assetId);
    if (!asset) {
      errors.push(`Unknown asset id: ${assetId}`);
      continue;
    }
    if (asset.layer !== layer) {
      errors.push(`${assetId} belongs to ${asset.layer}, not ${layer}`);
    }
    if (asset.gender !== gender) {
      errors.push(`${assetId} belongs to ${asset.gender}, not ${gender}`);
    }
  }

  return errors;
}
