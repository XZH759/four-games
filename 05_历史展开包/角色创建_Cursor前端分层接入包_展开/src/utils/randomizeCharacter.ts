import type {
  AssetIndex,
  CharacterGender,
  CharacterLayer,
  CharacterSelection,
} from "../types/character";
import { LAYER_ORDER } from "../types/character";
import { getAssetsForLayer } from "./characterAssets";

function pick<T>(items: T[]): T | undefined {
  return items[Math.floor(Math.random() * items.length)];
}

export function randomizeCharacter(
  assetIndex: AssetIndex,
  gender: CharacterGender,
): CharacterSelection {
  return Object.fromEntries(
    LAYER_ORDER.map((layer: CharacterLayer) => {
      const candidates = getAssetsForLayer(assetIndex, gender, layer);
      const optionalAccessory = layer === "accessory" && Math.random() < 0.2;
      return [layer, optionalAccessory ? null : pick(candidates)?.asset_id ?? null];
    }),
  ) as CharacterSelection;
}
