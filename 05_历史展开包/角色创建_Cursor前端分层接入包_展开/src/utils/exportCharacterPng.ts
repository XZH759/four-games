import type { CharacterAsset, CharacterSelection } from "../types/character";
import { LAYER_ORDER } from "../types/character";
import { getAssetUrl } from "./characterAssets";

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${url}`));
    image.src = url;
  });
}

export async function exportCharacterPng(
  selection: CharacterSelection,
  assetsById: Map<string, CharacterAsset>,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1536;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D canvas is unavailable");
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (const layer of LAYER_ORDER) {
    const assetId = selection[layer];
    if (!assetId) continue;
    const asset = assetsById.get(assetId);
    if (!asset) continue;
    const image = await loadImage(getAssetUrl(asset, "png"));
    context.drawImage(image, 0, 0, 1024, 1536);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Unable to export character PNG"));
    }, "image/png");
  });
}
