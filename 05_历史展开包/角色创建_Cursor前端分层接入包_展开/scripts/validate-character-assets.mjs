import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "public/character-assets");
const indexPath = path.join(root, "asset_index.json");
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const expectedOrder = ["body", "outfit", "hairBack", "face", "eyes", "hairFront", "accessory"];
const failures = [];

if (JSON.stringify(index.layer_order) !== JSON.stringify(expectedOrder)) {
  failures.push(`Invalid layer order: ${JSON.stringify(index.layer_order)}`);
}

function readPngHeader(filePath) {
  const buffer = fs.readFileSync(filePath);
  const pngSignature = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== pngSignature) {
    throw new Error("Not a PNG file");
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colorType: buffer[25],
  };
}

for (const asset of index.assets) {
  const filePath = path.join(root, asset.relative_path);
  if (!fs.existsSync(filePath)) {
    failures.push(`Missing: ${asset.relative_path}`);
    continue;
  }
  try {
    const header = readPngHeader(filePath);
    if (header.width !== 1024 || header.height !== 1536) {
      failures.push(`${asset.asset_id}: ${header.width}x${header.height}, expected 1024x1536`);
    }
    if (![4, 6].includes(header.colorType)) {
      failures.push(`${asset.asset_id}: PNG has no alpha channel (color type ${header.colorType})`);
    }
  } catch (error) {
    failures.push(`${asset.asset_id}: ${error.message}`);
  }

  if (asset.anchor_x !== 512 || asset.anchor_y !== 1216) {
    failures.push(`${asset.asset_id}: invalid anchor`);
  }
}

if (failures.length) {
  console.error("Character asset validation failed:\n" + failures.map((x) => `- ${x}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${index.assets.length} character assets successfully.`);
