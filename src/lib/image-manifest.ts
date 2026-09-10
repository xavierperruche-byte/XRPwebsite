import fs from 'fs/promises';
import path from 'path';

let cached: Record<string, any> | null = null;

export async function getManifest(){
  if (cached) return cached;
  const file = path.join(process.cwd(), 'public', 'images', 'optimized', 'manifest.json');
  try{
    const txt = await fs.readFile(file, 'utf8');
    cached = JSON.parse(txt);
    return cached;
  }catch(err){
    // missing manifest: return empty
    cached = {};
    return cached;
  }
}
