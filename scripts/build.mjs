import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = resolve(root, 'dist');
await mkdir(dist, { recursive: true });
const assets = {};
const inventory = [];
for (const [key, filename] of Object.entries({
  wash: 'cream-watercolor.png', hero: 'rescue-hero.png', friends: 'sidebar-friends.png',
})) {
  const bytes = await readFile(resolve(root, 'assets', filename));
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    throw new Error(`${filename}: expected a PNG asset`);
  }
  if (key !== 'wash' && bytes[25] !== 6) throw new Error(`${filename}: requires RGBA transparency`);
  assets[key] = `data:image/png;base64,${bytes.toString('base64')}`;
  inventory.push({ filename, bytes: bytes.length, width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20), sha256: createHash('sha256').update(bytes).digest('hex') });
}
// A PNG data URI can exceed Chromium's CSS custom-property size limit.
// Emit it directly in the CSS image declaration instead of a --variable.
const css = (await readFile(resolve(root, 'src/theme.css'), 'utf8'))
  .replace('__RESCUE_WASH__', assets.wash);
if (css.includes('__RESCUE_WASH__')) throw new Error('Unresolved wallpaper image');
// Mixing var() with the multi-megabyte image declaration triggers the same
// computed-value limit, even when the URL itself is not held in a variable.
for (const declaration of css.matchAll(/background-image\s*:\s*([^;]*(?:;base64,[^;]*)?);/g)) {
  if (declaration[1].includes('var(')) throw new Error('Wallpaper image must not depend on CSS variables');
}
const { wash, ...artwork } = assets;
const client = (await readFile(resolve(root, 'src/client.js'), 'utf8'))
  .replace('/* BUILD:ASSETS */ null', JSON.stringify(artwork))
  .replace('/* BUILD:STYLES */ null', JSON.stringify(css));
if (/\/\* BUILD:/.test(client)) throw new Error('Unresolved build placeholder');
await writeFile(resolve(dist, 'client.js'), client);
await writeFile(resolve(dist, 'index.js'), await readFile(resolve(root, 'src/index.js')));
for (const name of ['client.js', 'index.js']) {
  execFileSync(process.execPath, ['--check', resolve(dist, name)], { stdio: 'inherit' });
}
await writeFile(resolve(dist, 'assets-manifest.json'), JSON.stringify(inventory, null, 2) + '\n');
console.log(`Built self-contained client and host; ${inventory.length} local assets, no runtime downloads.`);
