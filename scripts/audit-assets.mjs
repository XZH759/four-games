/**
 * 扫描角色素材目录，检查画布契约与疑似白底。
 * 默认扫描：character-assets（分层运行时）+ character-reference（参考 sheet）
 * 用法：node scripts/audit-assets.mjs [dir ...]
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = path.resolve(process.cwd());

const DEFAULT_DIRS = [
  "character-assets",
  "character-reference/assets",
  "assets/nuannuan/avatar-standardized",
];

const CANVAS = { width: 1024, height: 1536 };
const IMAGE_EXT = new Set([".png", ".webp", ".jpg", ".jpeg", ".gif"]);

function loadSharp() {
  try {
    return require("sharp");
  } catch {
    console.error("需要 sharp：请先执行 npm install --no-save sharp");
    process.exit(1);
  }
}

function walkImages(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkImages(full, files);
    else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

function rel(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

async function sampleEdgePixels(sharp, file, width, height) {
  const points = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width / 2), 0],
    [Math.floor(width / 2), height - 1],
    [0, Math.floor(height / 2)],
    [width - 1, Math.floor(height / 2)],
  ];

  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  let suspectOpaqueEdge = false;
  const hits = [];

  for (const [x, y] of points) {
    const index = (y * info.width + x) * channels;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const a = data[index + 3];
    if (a > 10) {
      suspectOpaqueEdge = true;
      hits.push({ x, y, r, g, b, a });
    }
  }

  return { suspectOpaqueEdge, hits };
}

async function auditFile(sharp, file) {
  const relative = rel(file);
  const record = {
    file: relative,
    width: null,
    height: null,
    hasAlpha: false,
    flags: [],
    notes: [],
  };

  try {
    const meta = await sharp(file).metadata();
    record.width = meta.width ?? 0;
    record.height = meta.height ?? 0;
    record.hasAlpha = Boolean(meta.hasAlpha);

    if (!record.hasAlpha) record.flags.push("无 alpha 通道");
    if (record.width !== CANVAS.width || record.height !== CANVAS.height) {
      record.flags.push("不符画布契约");
    }
    if (record.width < 768) record.flags.push("分辨率不足");

    if (record.hasAlpha && record.width > 0 && record.height > 0) {
      const edge = await sampleEdgePixels(sharp, file, record.width, record.height);
      if (edge.suspectOpaqueEdge) {
        // 全画布角色脚底/边缘可能有合法不透明像素；仅当角落偏白时升为「疑似白底未抠」
        const whiteish = edge.hits.some(
          (p) => p.a > 10 && p.r >= 235 && p.g >= 235 && p.b >= 235,
        );
        if (whiteish) {
          record.flags.push("疑似白底未抠");
          record.notes.push(
            `边缘白不透明采样点: ${edge.hits
              .filter((p) => p.r >= 235 && p.g >= 235 && p.b >= 235)
              .map((p) => `(${p.x},${p.y})a=${p.a}`)
              .join(" ")}`,
          );
        } else {
          record.notes.push("边缘存在不透明像素（可能是合法角色内容）");
        }
      }
    } else if (!record.hasAlpha) {
      record.flags.push("疑似白底未抠");
    }

    // 参考分解图：整张 sheet，不是运行时图层
    if (relative.includes("reference_sheets") || relative.includes("character-reference")) {
      record.flags.push("参考分解图(非运行时图层)");
    }
  } catch (error) {
    record.flags.push("读取失败");
    record.notes.push(error.message);
  }

  return record;
}

function renderMarkdown(results, scannedDirs) {
  const flagged = results.filter((r) => r.flags.length);
  const byFlag = {};
  for (const item of flagged) {
    for (const flag of item.flags) {
      byFlag[flag] ??= [];
      byFlag[flag].push(item);
    }
  }

  const lines = [
    "# Asset Audit Report",
    "",
    `生成时间：${new Date().toISOString()}`,
    "",
    "## 扫描目录",
    "",
    ...scannedDirs.map((d) => `- \`${d}\``),
    "",
    "## 契约",
    "",
    `- 期望画布：\`${CANVAS.width}×${CANVAS.height}\``,
    "- 运行时图层须为透明 PNG，脚底中心对齐",
    "- `character-reference` 中的 sheet 为参考分解图，**不应用作运行时叠层**",
    "",
    "## 汇总",
    "",
    `| 指标 | 数量 |`,
    `|---|---:|`,
    `| 扫描文件 | ${results.length} |`,
    `| 有问题标记 | ${flagged.length} |`,
    `| 通过（无标记） | ${results.length - flagged.length} |`,
    "",
  ];

  for (const [flag, items] of Object.entries(byFlag)) {
    lines.push(`### ${flag}（${items.length}）`, "");
    for (const item of items) {
      lines.push(
        `- \`${item.file}\` — ${item.width}×${item.height}${item.hasAlpha ? " · alpha" : " · 无alpha"}`,
      );
      for (const note of item.notes) lines.push(`  - ${note}`);
    }
    lines.push("");
  }

  lines.push("## 全量明细", "");
  lines.push("| 文件 | 尺寸 | Alpha | 标记 |");
  lines.push("|---|---|---|---|");
  for (const item of results) {
    lines.push(
      `| \`${item.file}\` | ${item.width}×${item.height} | ${item.hasAlpha ? "yes" : "no"} | ${item.flags.join("；") || "OK"} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

async function main() {
  const sharp = loadSharp();
  const dirs = (process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_DIRS)
    .map((d) => path.resolve(root, d));

  const files = [];
  for (const dir of dirs) walkImages(dir, files);
  files.sort();

  const results = [];
  for (const file of files) {
    results.push(await auditFile(sharp, file));
  }

  const reportDir = path.join(root, "reports");
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, "asset-audit.md");
  const markdown = renderMarkdown(
    results,
    dirs.map((d) => rel(d)),
  );
  fs.writeFileSync(reportPath, markdown, "utf8");

  console.log(`Scanned ${results.length} images`);
  console.log(`Wrote ${rel(reportPath)}`);
  const summary = {};
  for (const item of results) {
    for (const flag of item.flags) summary[flag] = (summary[flag] || 0) + 1;
  }
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
