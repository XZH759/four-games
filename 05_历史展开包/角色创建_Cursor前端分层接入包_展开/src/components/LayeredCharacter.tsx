import type { CSSProperties } from "react";
import type {
  CharacterAsset,
  CharacterSelection,
} from "../types/character";
import { LAYER_ORDER } from "../types/character";
import { getAssetUrl } from "../utils/characterAssets";
import "../styles/character-creator.css";

interface LayeredCharacterProps {
  selection: CharacterSelection;
  assetsById: Map<string, CharacterAsset>;
  format?: "png" | "svg";
  className?: string;
  style?: CSSProperties;
}

export function LayeredCharacter({
  selection,
  assetsById,
  format = "png",
  className = "",
  style,
}: LayeredCharacterProps) {
  return (
    <div
      className={`layered-character ${className}`.trim()}
      style={style}
      aria-label="角色预览"
    >
      {LAYER_ORDER.map((layer, zIndex) => {
        const assetId = selection[layer];
        if (!assetId) return null;
        const asset = assetsById.get(assetId);
        if (!asset) return null;

        return (
          <img
            key={`${layer}:${assetId}`}
            className="layered-character__layer"
            src={getAssetUrl(asset, format)}
            alt=""
            draggable={false}
            decoding="async"
            style={{ zIndex }}
          />
        );
      })}
    </div>
  );
}
