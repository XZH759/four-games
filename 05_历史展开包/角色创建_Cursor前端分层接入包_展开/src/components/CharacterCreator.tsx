import { useEffect, useMemo, useState } from "react";
import type {
  AssetIndex,
  CharacterGender,
  CharacterLayer,
  CharacterSelection,
} from "../types/character";
import { LAYER_ORDER } from "../types/character";
import {
  createDefaultSelection,
  getAssetsForLayer,
  indexAssetsById,
  loadAssetIndex,
} from "../utils/characterAssets";
import { randomizeCharacter } from "../utils/randomizeCharacter";
import { LayeredCharacter } from "./LayeredCharacter";
import "../styles/character-creator.css";

const CUSTOMIZABLE_LAYERS: CharacterLayer[] = [
  "hairBack",
  "hairFront",
  "eyes",
  "face",
  "accessory",
  "outfit",
];

export function CharacterCreator() {
  const [assetIndex, setAssetIndex] = useState<AssetIndex | null>(null);
  const [gender, setGender] = useState<CharacterGender>("female");
  const [selection, setSelection] = useState<CharacterSelection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssetIndex()
      .then((index) => {
        setAssetIndex(index);
        setSelection(createDefaultSelection(index, "female"));
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : String(reason));
      });
  }, []);

  const assetsById = useMemo(
    () => (assetIndex ? indexAssetsById(assetIndex) : new Map()),
    [assetIndex],
  );

  if (error) return <p role="alert">{error}</p>;
  if (!assetIndex || !selection) return <p>正在加载角色素材…</p>;

  function changeGender(nextGender: CharacterGender) {
    setGender(nextGender);
    setSelection(createDefaultSelection(assetIndex!, nextGender));
  }

  function cycleLayer(layer: CharacterLayer, direction: -1 | 1) {
    const candidates = getAssetsForLayer(assetIndex!, gender, layer);
    if (!candidates.length) return;
    const currentId = selection![layer];
    const currentIndex = Math.max(
      0,
      candidates.findIndex((asset) => asset.asset_id === currentId),
    );
    const nextIndex = (currentIndex + direction + candidates.length) % candidates.length;
    setSelection({ ...selection!, [layer]: candidates[nextIndex].asset_id });
  }

  return (
    <main className="creator-shell">
      <section className="creator-panel creator-panel--appearance">
        <h2>外观定制</h2>
        {CUSTOMIZABLE_LAYERS.map((layer) => (
          <div className="creator-row" key={layer}>
            <span>{layer}</span>
            <button type="button" onClick={() => cycleLayer(layer, -1)} aria-label={`${layer} 上一个`}>
              ‹
            </button>
            <code>{selection[layer] ?? "none"}</code>
            <button type="button" onClick={() => cycleLayer(layer, 1)} aria-label={`${layer} 下一个`}>
              ›
            </button>
          </div>
        ))}
      </section>

      <section className="creator-stage">
        <LayeredCharacter selection={selection} assetsById={assetsById} />
        <div className="creator-actions">
          <button
            type="button"
            onClick={() => setSelection(randomizeCharacter(assetIndex, gender))}
          >
            随机生成
          </button>
          <button type="button" className="creator-actions__primary">
            确认进入
          </button>
        </div>
      </section>

      <section className="creator-panel creator-panel--identity">
        <h2>形象定制</h2>
        <div className="gender-options" role="radiogroup" aria-label="形象类型">
          {(["female", "male"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={gender === option}
              className={gender === option ? "is-selected" : ""}
              onClick={() => changeGender(option)}
            >
              {option === "female" ? "女性" : "男性"}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
