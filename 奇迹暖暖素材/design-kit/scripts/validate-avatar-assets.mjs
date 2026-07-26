#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const root = process.argv[2];
if (!root) {
  console.error('用法: node validate-avatar-assets.mjs <资源目录>');
  process.exit(1);
}

const expectedWidth = Number(process.env.AVATAR_WIDTH || 1600);
const expectedHeight = Number(process.env.AVATAR_HEIGHT || 2400);
const validExtensions = new Set(['.png', '.webp']);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (validExtensions.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

const files = await walk(root);
let failures = 0;

for (const file of files) {
  try {
    const meta = await sharp(file).metadata();
    const issues = [];
    if (meta.width !== expectedWidth || meta.height !== expectedHeight) {
      issues.push(`尺寸 ${meta.width}x${meta.height}，应为 ${expectedWidth}x${expectedHeight}`);
    }
    if (!meta.hasAlpha) {
      issues.push('没有透明通道');
    }
    if (issues.length) {
      failures += 1;
      console.log(`✗ ${file}`);
      issues.forEach((issue) => console.log(`  - ${issue}`));
    } else {
      console.log(`✓ ${file}`);
    }
  } catch (error) {
    failures += 1;
    console.log(`✗ ${file}`);
    console.log(`  - 无法读取: ${error.message}`);
  }
}

console.log(`\n共检查 ${files.length} 个文件，异常 ${failures} 个。`);
process.exit(failures ? 1 : 0);
