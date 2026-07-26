export const LAYER_ORDER = [
  "body",
  "outfit",
  "hairBack",
  "face",
  "eyes",
  "hairFront",
  "accessory",
] as const;

export type CharacterLayer = (typeof LAYER_ORDER)[number];
export type CharacterGender = "female" | "male";

export interface CharacterAsset {
  asset_id: string;
  file_name: string;
  relative_path: string;
  gender: CharacterGender;
  gender_code: "F" | "M";
  layer: CharacterLayer;
  layer_code: string;
  variant: number;
  z_index: number;
  canvas_width: 1024;
  canvas_height: 1536;
  anchor_x: 512;
  anchor_y: 1216;
  tags: string[];
  role?: "researcher" | "programmer" | "engineer" | "general";
  compatible_with?: string[];
  excludes?: string[];
}

export interface AssetIndex {
  version: string;
  canvas: { width: 1024; height: 1536 };
  anchor: { type: "foot_center"; x: 512; y: 1216 };
  layer_order: CharacterLayer[];
  assets: CharacterAsset[];
}

export type CharacterSelection = Record<CharacterLayer, string | null>;

export interface CharacterPreset {
  preset_id: string;
  gender: CharacterGender;
  display_name: string;
  role?: "researcher" | "programmer" | "engineer" | "general";
  assets: CharacterSelection;
}
