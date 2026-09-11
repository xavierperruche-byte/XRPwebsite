#!/usr/bin/env node
// ESM version: Generate responsive WebP variants and a manifest for site images.
// Usage:
//   npm install sharp
//   node scripts/optimize-images.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const imagesDir = path.join(workspaceRoot, 'public', 'images');
const outDir = path.join(imagesDir, 'optimized');

// Default image list (from Lighthouse suggestions). You can add filenames or pass list via argv.
const defaultImages = [
  '2025092.webp'
];

const widths = [480, 691, 900, 1200];
const quality = 75; // adjust for smaller size / lower quality

async function fileExists(p){
  try{ await fs.access(p); return true;}catch(e){return false}
}

async function ensureOut(){
  await fs.mkdir(outDir, { recursive: true });
}

async function optimizeImage(file){
  const src = path.join(imagesDir, file);
  if (!await fileExists(src)){
    console.warn('Missing source image:', file);
    return null;
  }
  const basename = path.parse(file).name;
  const ext = '.webp';
  const entries = [];

  for (const w of widths){
    const outName = `${basename}-${w}${ext}`;
    const outPath = path.join(outDir, outName);
    try{
      await sharp(src)
        .resize({ width: w })
        .webp({ quality })
        .toFile(outPath);
      entries.push({ url: `/images/optimized/${outName}`, width: w });
      console.log('Wrote', outName);
    }catch(err){
      console.error('Error processing', file, err.message);
    }
  }

  // Also write a 2x high-density variant for the largest size
  const max = Math.max(...widths);
  const outName2x = `${basename}-${max*2}${ext}`;
  try{
    await sharp(src)
      .resize({ width: max*2 })
      .webp({ quality })
      .toFile(path.join(outDir, outName2x));
    entries.push({ url: `/images/optimized/${outName2x}`, width: max*2 });
  }catch(e){/* ignore */}

  return { original: `/images/${file}`, srcset: entries.map(e=>`${e.url} ${e.width}w`).join(', '), entries };
}

async function main(){
  const argv = process.argv.slice(2);
  const list = argv.length ? argv : defaultImages;
  await ensureOut();
  const manifest = {};

  for (const img of list){
    const res = await optimizeImage(img);
    if (res) manifest[img] = res;
  }

  await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Manifest written to', path.join('/images/optimized/manifest.json'));
}

main().catch(err=>{ console.error(err); process.exit(1); });
