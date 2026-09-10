Image optimization script

This folder contains `optimize-images.js`, a Node script that generates responsive WebP variants
and a `manifest.json` that maps original filenames to `srcset` strings.

Install and run:

```bash
cd c:/Users/xavie/XRPwebsite
npm install sharp
node scripts/optimize-images.js
```

- The script writes files to `public/images/optimized/` and produces `manifest.json` there.
- You can pass filenames as arguments: `node scripts/optimize-images.js index3.webp pioupiou5.webp`.
- After generating images, update templates to use the manifest entries for `srcset`/`sizes`.
