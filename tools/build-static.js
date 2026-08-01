import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { NEXUS_VERSION } from '../src/version.js';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
const entries = [
  '404.html','LICENSE','THIRD_PARTY_NOTICES.md','app.js','assets','demo','index.html',
  'library.html','library.js','portable','src','studio.html','studio.js','styles.css','vendor'
];

await mkdir(output, { recursive: true });
for (const entry of await readdir(output)) {
  await rm(resolve(output, entry), { recursive: true, force: true });
}
for (const entry of entries) await cp(resolve(root, entry), resolve(output, entry), { recursive: true });
const metadata = { product: 'NEXUS Present', version: NEXUS_VERSION, builtAt: null, deployment: false };
await writeFile(resolve(output, 'build-info.json'), `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');

const htmlFiles = ['index.html','library.html','studio.html','404.html'];
for (const file of htmlFiles) {
  const html = await readFile(resolve(output, file), 'utf8');
  if (!html.includes('<meta name="viewport"')) throw new Error(`Missing viewport: ${file}`);
}
console.log(`Static RC build prepared: ${NEXUS_VERSION}`);
