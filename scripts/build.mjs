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
const css = await readFile(resolve(root, 'src/theme.css'), 'utf8');
const client = (await readFile(resolve(root, 'src/client.js'), 'utf8'))
  .replace('/* BUILD:ASSETS */ null', JSON.stringify(assets))
  .replace('/* BUILD:STYLES */ null', JSON.stringify(css));
if (/\/\* BUILD:/.test(client)) throw new Error('Unresolved build placeholder');
await writeFile(resolve(dist, 'client.js'), client);
await writeFile(resolve(dist, 'index.js'), await readFile(resolve(root, 'src/index.js')));
for (const name of ['client.js', 'index.js']) {
  execFileSync(process.execPath, ['--check', resolve(dist, name)], { stdio: 'inherit' });
}
await writeFile(resolve(dist, 'assets-manifest.json'), JSON.stringify(inventory, null, 2) + '\n');
console.log(`Built self-contained client and host; ${inventory.length} local assets, no runtime downloads.`);
