import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { NEXUS_VERSION } from '../src/version.js';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
const entries = [
  '404.html','LICENSE','THIRD_PARTY_NOTICES.md','app-shell.css','app.js','assets','demo','entry.js','index.html',
  'library.html','library.js','player.html','portable','src','studio.html','studio.js','styles.css','vendor'
];
const textExtensions = new Set(['.css','.html','.js','.json','.md','.svg','.txt','.vtt']);
const textNames = new Set(['LICENSE']);
async function normalizeText(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await normalizeText(path);
    else if (textExtensions.has(extname(entry.name)) || textNames.has(entry.name)) {
      const source = await readFile(path, 'utf8');
      await writeFile(path, source.replaceAll('\r\n', '\n').replaceAll('\r', '\n'), 'utf8');
    }
  }
}

await mkdir(output, { recursive: true });
for (const entry of await readdir(output)) {
  await rm(resolve(output, entry), { recursive: true, force: true });
}
for (const entry of entries) await cp(resolve(root, entry), resolve(output, entry), { recursive: true });
await normalizeText(output);
await writeFile(resolve(output, '.nojekyll'), '', 'utf8');
const metadata = { product: 'NEXUS Present', version: NEXUS_VERSION, builtAt: null, deploymentReady: true };
await writeFile(resolve(output, 'build-info.json'), `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');

const htmlFiles = ['index.html','library.html','studio.html','player.html','404.html'];
for (const file of htmlFiles) {
  const html = await readFile(resolve(output, file), 'utf8');
  if (!html.includes('<meta name="viewport"')) throw new Error(`Missing viewport: ${file}`);
}
console.log(`Static release build prepared: ${NEXUS_VERSION}`);
