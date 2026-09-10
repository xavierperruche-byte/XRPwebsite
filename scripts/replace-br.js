import fs from 'fs/promises';
import path from 'path';

const root = process.cwd();
const targets = ['src', 'content'];
const extAllow = ['.astro', '.md', '.html', '.jsx', '.tsx'];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (extAllow.includes(ext)) {
        await replaceInFile(full);
      }
    }
  }
}

async function replaceInFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    if (content.includes('</br>')) {
      const newContent = content.split('</br>').join('<br />');
      await fs.writeFile(filePath, newContent, 'utf8');
      console.log('[updated]', filePath);
    }
  } catch (err) {
    console.error('[error]', filePath, err.message);
  }
}

(async function main(){
  console.log('Running replace-br across:', targets.join(', '));
  for (const t of targets) {
    const dir = path.join(root, t);
    try {
      await fs.access(dir);
      await walk(dir);
    } catch (err) {
      // ignore missing directories
    }
  }
  console.log('Done. Review changes and run your build to verify.');
})();
