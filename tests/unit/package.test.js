import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { demoPresentation } from '../../demo/public-demo.js';
import { createArchiveAdapter, inspectZip } from '../../src/package/archive-adapter.js';
import { createPackageExportService } from '../../src/package/package-export-service.js';
import { createPackageImportService } from '../../src/package/package-import-service.js';
import { validateArchivePath } from '../../src/package/path-policy.js';
import { readFileSync } from 'node:fs';

const encoder = new TextEncoder();
class TestFile extends Blob { constructor(parts, name, options) { super(parts, options); this.name = name; } }
const source = (withAsset = false) => {
  const value = structuredClone(demoPresentation);
  value.editorial = { studio: { local: true } };
  if (withAsset) {
    value.resources = [{ id: 'asset-one', type: 'image', mime: 'image/png', url: 'nexus-asset:asset-one', alt: 'Imagen de prueba' }];
    value.scenes[3].blocks[1] = { id: 'block-image', type: 'image', assetId: 'asset-one', alt: 'Imagen de prueba' };
  }
  return value;
};
const runtimeProvider = { collect: async () => [['runtime/app.js', encoder.encode('export {};\n')]] };
const storedAsset = { assetId: 'asset-one', draftKey: 'draft-one', kind: 'image', filename: 'visión-área.png', mime: 'image/png', blob: new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' }), metadata: { alt: 'Imagen de prueba' } };

test('archive paths reject traversal, absolute paths, controls and reserved names', () => {
  for (const path of ['../evil.js', '/absolute.js', 'C:/private.txt', 'safe\\evil.js', 'CON.txt', 'a/../b']) {
    assert.equal(validateArchivePath(path).ok, false, path);
  }
  assert.equal(validateArchivePath('nexus-presentación/assets/área.png').ok, true);
});

test('portable runtime resolves presentation relative to its own module URL', () => {
  const runtime = readFileSync(new URL('../../portable/runtime-app.js', import.meta.url), 'utf8');
  assert.match(runtime, /new URL\('\.\.\/\.\.\/presentation\.json', import\.meta\.url\)/);
});

test('portable package without assets is deterministic and contains required files', async () => {
  const service = createPackageExportService({ assetRepository: {}, runtimeProvider, cryptoApi: webcrypto });
  const first = await service.prepare(source(), 'draft-one');
  const second = await service.prepare(source(), 'draft-one');
  assert.equal(first.ok, true);
  assert.deepEqual(first.bytes, second.bytes);
  assert.equal(first.mime, 'application/zip');
  const extracted = createArchiveAdapter().extract(first.bytes);
  assert.equal(extracted.ok, true);
  assert.ok([...extracted.files.keys()].some((path) => path.endsWith('/manifest.json')));
  assert.ok([...extracted.files.keys()].some((path) => path.endsWith('/LEEME.txt')));
});

test('portable package includes only used local assets with hashes and safe accented names', async () => {
  const assetRepository = { get: async (id) => id === 'asset-one' ? { ok: true, value: storedAsset } : { ok: false } };
  const result = await createPackageExportService({ assetRepository, runtimeProvider, cryptoApi: webcrypto }).prepare(source(true), 'draft-one');
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.manifest.assets.length, 1);
  assert.match(result.manifest.assets[0].path, /visión-área\.png$/u);
  assert.match(result.manifest.assets[0].sha256, /^[a-f0-9]{64}$/);
  assert.equal(decodeURIComponent(result.publicDocument.resources[0].url), result.manifest.assets[0].path);
});

test('portable export fails safely when a referenced asset is missing or out of scope', async () => {
  const missing = { get: async () => ({ ok: false, error: { code: 'missing' } }) };
  const result = await createPackageExportService({ assetRepository: missing, runtimeProvider, cryptoApi: webcrypto }).prepare(source(true), 'draft-one');
  assert.equal(result.error.code, 'package-asset-missing');
});

test('archive preflight rejects corrupt and excessive compression inputs', () => {
  assert.equal(inspectZip(new Uint8Array([1, 2, 3])).error.code, 'package-zip-corrupt');
  assert.equal(inspectZip(new Uint8Array(20), { compressedBytes: 2, uncompressedBytes: 2, entries: 1, ratio: 1 }).error.code, 'package-size-limit');
});

test('package import verifies integrity, creates a copy and rebinds asset IDs', async () => {
  const assetRepository = {
    get: async () => ({ ok: true, value: storedAsset }),
    importAsset: async ({ draftKey }) => ({ ok: true, value: { assetId: 'asset-local', draftKey } }),
    delete: async () => ({ ok: true })
  };
  const exported = await createPackageExportService({ assetRepository, runtimeProvider, cryptoApi: webcrypto }).prepare(source(true), 'draft-one');
  let created;
  const draftRepository = {
    create: async (document, options) => { created = { document, options }; return { ok: true, value: { draftKey: options.draftKey, revision: 1 } }; },
    delete: async () => ({ ok: true })
  };
  const importer = createPackageImportService({ assetRepository, draftRepository, FileType: TestFile, cryptoApi: webcrypto });
  const file = new TestFile([exported.bytes], exported.filename, { type: 'application/zip' });
  const result = await importer.importFile(file);
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.importedAssets, 1);
  assert.equal(created.document.resources[0].id, 'asset-local');
  assert.equal(created.document.scenes[3].blocks[1].assetId, 'asset-local');
  assert.notEqual(created.options.draftKey, 'draft-one');
});

test('package import rejects a modified asset hash before persistence', async () => {
  const archive = createArchiveAdapter();
  const assetRepository = { get: async () => ({ ok: true, value: storedAsset }) };
  const exported = await createPackageExportService({ assetRepository, runtimeProvider, cryptoApi: webcrypto }).prepare(source(true), 'draft-one');
  const extracted = archive.extract(exported.bytes);
  const assetPath = [...extracted.files.keys()].find((path) => path.includes('/assets/'));
  extracted.files.set(assetPath, encoder.encode('modified'));
  const rebuilt = archive.create(extracted.files);
  let writes = 0;
  const importer = createPackageImportService({
    assetRepository: { importAsset: async () => { writes += 1; } },
    draftRepository: {}, FileType: TestFile, cryptoApi: webcrypto
  });
  const result = await importer.importFile(new TestFile([rebuilt.bytes], 'nexus-test.zip', { type: 'application/zip' }));
  assert.equal(result.error.code, 'package-integrity-failed');
  assert.equal(writes, 0);
});
