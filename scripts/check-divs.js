import fs from 'fs/promises';
import path from 'path';

const root = process.cwd();
const targets = ['src', 'content'];
const exts = ['.astro', '.jsx', '.tsx', '.html', '.md'];

async function walk(dir, results=[]) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, results);
    else if (e.isFile() && exts.includes(path.extname(e.name).toLowerCase())) results.push(full);
  }
  return results;
}

async function analyze(file) {
  const content = await fs.readFile(file, 'utf8');
  const open = (content.match(/<div[\s>]/g) || []).length;
  const close = (content.match(/<\/div>/g) || []).length;
  return { file, open, close };
}

(async function main(){
  console.log('Scanning for <div> mismatches...');
  let problems = 0;
  for (const t of targets) {
    const dir = path.join(root, t);
    try {
      await fs.access(dir);
    } catch (err) { continue; }
    const files = await walk(dir);
    for (const f of files) {
      try {
        const {file, open, close} = await analyze(f);
        if (open !== close) {
          problems++;
          console.log(`[MISMATCH] ${file}  <div>: ${open}  </div>: ${close}`);
        }
      } catch (err) {
        console.error('[ERR]', f, err.message);
      }
    }
  }
  if (problems === 0) console.log('All files OK (div counts match).');
  else console.log(`Found ${problems} file(s) with mismatched <div> counts.`);
})();
