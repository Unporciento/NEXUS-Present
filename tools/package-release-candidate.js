import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative } from 'node:path';
import { createArchiveAdapter } from '../src/package/archive-adapter.js';
import { NEXUS_VERSION } from '../src/version.js';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'dist');
const output = resolve(root, 'artifacts');
async function walk(directory) {
  const values = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) values.push(...await walk(path)); else values.push(path);
  }
  return values;
}

const entries = [];
for (const path of (await walk(source)).sort()) {
  const archivePath = `nexus-present-${NEXUS_VERSION}/${relative(source, path).replaceAll('\\', '/')}`;
  entries.push([archivePath, new Uint8Array(await readFile(path))]);
}
const archive = createArchiveAdapter().create(entries);
if (!archive.ok) throw new Error(archive.error.message);
await mkdir(output, { recursive: true });
const filename = `nexus-present-${NEXUS_VERSION}.zip`;
await writeFile(resolve(output, filename), archive.bytes);
const checksum = createHash('sha256').update(archive.bytes).digest('hex').toUpperCase();
await writeFile(resolve(output, `${filename}.sha256.txt`), `${checksum}  ${filename}\n`, 'utf8');
console.log(JSON.stringify({ filename, bytes: archive.bytes.byteLength, sha256: checksum }));
