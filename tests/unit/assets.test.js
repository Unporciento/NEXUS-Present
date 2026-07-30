import test from 'node:test';
import assert from 'node:assert/strict';
import { createAssetRegistry, assetLimits } from '../../src/media/asset-registry.js';
import { detectMime, readRasterDimensions } from '../../src/media/file-signature.js';
import { createObjectUrlPool } from '../../src/media/object-url-pool.js';
import { sanitizeSvgText } from '../../src/media/svg-sanitizer.js';
import { createAssetRepository } from '../../src/storage/asset-repository.js';
import { createMemoryAssetAdapter } from './memory-asset-adapter.js';

function file(bytes, name, type) {
  const value = new Blob([bytes], { type });
  Object.defineProperty(value, 'name', { value: name });
  return value;
}

function png(name = 'imagen.png') {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  new DataView(bytes.buffer).setUint32(16, 640);
  new DataView(bytes.buffer).setUint32(20, 360);
  return file(bytes, name, 'image/png');
}

function mp4(name = 'video.mp4') {
  const bytes = new Uint8Array(16);
  bytes.set([0x00, 0x00, 0x00, 0x10, 0x66, 0x74, 0x79, 0x70]);
  return file(bytes, name, 'video/mp4');
}

function setup() {
  let sequence = 0;
  const adapter = createMemoryAssetAdapter();
  const repository = createAssetRepository({
    adapter,
    createId: () => `asset-${++sequence}`,
    now: () => '2026-07-29T12:00:00Z'
  });
  return { adapter, repository };
}

test('AssetRegistry enforces formats and conservative size budgets', () => {
  const registry = createAssetRegistry();
  assert.equal(registry.validateFile(png(), 'image').ok, true);
  assert.equal(registry.validateFile(file([1], 'foto.gif', 'image/gif'), 'image').error.code, 'asset-format-unsupported');
  assert.equal(assetLimits.image, 10 * 1024 * 1024);
  assert.equal(assetLimits.video, 200 * 1024 * 1024);
});

test('signatures and dimensions reject extension-only trust', () => {
  const value = png();
  return value.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer);
    assert.equal(detectMime(bytes), 'image/png');
    assert.deepEqual(readRasterDimensions(bytes, 'image/png'), { width: 640, height: 360 });
    assert.equal(detectMime(new Uint8Array([1, 2, 3])), 'application/octet-stream');
  });
});

test('SVG sanitizer accepts inert vectors and rejects scripts and external references', () => {
  assert.equal(sanitizeSvgText('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>').ok, true);
  assert.equal(sanitizeSvgText('<svg><script>alert(1)</script></svg>').error.code, 'svg-unsafe');
  assert.equal(sanitizeSvgText('<svg><image href="https://example.com/a.png"/></svg>').error.code, 'svg-unsafe');
  assert.equal(sanitizeSvgText('<svg onload="alert(1)"></svg>').error.code, 'svg-unsafe');
});

test('AssetRepository stores scoped Blobs, hashes, dimensions and defensive records', async () => {
  const { repository } = setup();
  assert.equal((await repository.open()).ok, true);
  const imported = await repository.importAsset({
    draftKey: 'draft-one',
    file: png(),
    kind: 'image',
    metadata: { alt: 'Gráfico azul' }
  });
  assert.equal(imported.ok, true);
  assert.equal(imported.value.metadata.width, 640);
  assert.equal(imported.value.metadata.height, 360);
  assert.match(imported.value.hash, /^[a-f0-9]{64}$/);
  const listed = await repository.list('draft-one');
  assert.equal(listed.value.length, 1);
  listed.value[0].metadata.alt = 'mutado';
  assert.equal((await repository.get(imported.value.assetId)).value.metadata.alt, 'Gráfico azul');
});

test('AssetRepository deduplicates per draft and preserves separate scopes', async () => {
  const { repository } = setup();
  await repository.open();
  const first = await repository.importAsset({
    draftKey: 'draft-one', file: png(), kind: 'image', metadata: { alt: 'A' }
  });
  const duplicate = await repository.importAsset({
    draftKey: 'draft-one', file: png('otra.png'), kind: 'image', metadata: { alt: 'B' }
  });
  const separate = await repository.importAsset({
    draftKey: 'draft-two', file: png(), kind: 'image', metadata: { alt: 'C' }
  });
  assert.equal(duplicate.value.assetId, first.value.assetId);
  assert.equal(duplicate.value.deduplicated, true);
  assert.notEqual(separate.value.assetId, first.value.assetId);
});

test('AssetRepository accepts MP4 and WebVTT without transcoding their bytes', async () => {
  const { repository } = setup();
  await repository.open();
  const video = await repository.importAsset({
    draftKey: 'draft',
    file: mp4(),
    kind: 'video',
    metadata: { title: 'Demostración', description: 'Vídeo local', preload: 'metadata' }
  });
  const captions = await repository.importAsset({
    draftKey: 'draft',
    file: file(['WEBVTT\n\n00:00.000 --> 00:01.000\nHola\n'], 'es.vtt', 'text/vtt'),
    kind: 'captions',
    metadata: { title: 'Español' }
  });
  assert.equal(video.value.mime, 'video/mp4');
  assert.equal(video.value.size, mp4().size);
  assert.equal(captions.value.mime, 'text/vtt');
});

test('AssetRepository sanitizes accepted SVG before hashing and storage', async () => {
  const { repository } = setup();
  await repository.open();
  const svg = file(
    ['<svg xmlns="http://www.w3.org/2000/svg"><!-- comentario --><path d="M0 0"/></svg>'],
    'grafico.svg',
    'image/svg+xml'
  );
  const imported = await repository.importAsset({
    draftKey: 'draft',
    file: svg,
    kind: 'image',
    metadata: { alt: 'Gráfico vectorial' }
  });
  assert.equal(imported.ok, true);
  assert.doesNotMatch(await imported.value.blob.text(), /comentario/);
});

test('AssetRepository rejects false MIME, unsafe names and missing alt', async () => {
  const { repository } = setup();
  await repository.open();
  const missing = await repository.importAsset({
    draftKey: 'draft', file: undefined, kind: 'image', metadata: { alt: 'A' }
  });
  assert.equal(missing.error.code, 'asset-file-invalid');
  assert.match(missing.error.message, /Selecciona un archivo válido/);
  const falseMime = file([1, 2, 3], 'imagen.png', 'image/png');
  assert.equal((await repository.importAsset({
    draftKey: 'draft', file: falseMime, kind: 'image', metadata: { alt: 'A' }
  })).error.code, 'asset-mime-mismatch');
  assert.equal((await repository.importAsset({
    draftKey: 'draft', file: png('../privada.png'), kind: 'image', metadata: { alt: 'A' }
  })).error.code, 'asset-filename-unsafe');
  assert.equal((await repository.importAsset({
    draftKey: 'draft', file: png(), kind: 'image', metadata: {}
  })).error.code, 'asset-alt-required');
});

test('AssetRepository finds references and removes only confirmed orphans', async () => {
  const { repository } = setup();
  await repository.open();
  const imported = await repository.importAsset({
    draftKey: 'draft', file: png(), kind: 'image', metadata: { alt: 'A' }
  });
  const document = { scenes: [{ blocks: [{ assetId: imported.value.assetId }] }] };
  assert.equal(repository.references(document, imported.value.assetId).value, 1);
  assert.equal((await repository.cleanupOrphans('draft', [])).error.code, 'confirmation-required');
  assert.equal((await repository.delete(imported.value.assetId, { referenced: true, confirmed: true })).error.code, 'asset-in-use');
  assert.equal((await repository.cleanupOrphans('draft', [], { confirmed: true })).value, 1);
});

test('AssetRepository converts browser quota failures into a clear result', async () => {
  const adapter = createMemoryAssetAdapter();
  const originalWrite = adapter.write;
  adapter.write = async () => {
    const error = new Error('quota');
    error.name = 'QuotaExceededError';
    throw error;
  };
  const repository = createAssetRepository({ adapter, createId: () => 'asset-one' });
  await repository.open();
  const result = await repository.importAsset({
    draftKey: 'draft', file: png(), kind: 'image', metadata: { alt: 'A' }
  });
  assert.equal(result.error.code, 'asset-quota-exceeded');
  adapter.write = originalWrite;
});

test('ObjectUrlPool counts references, revokes exactly once and double destroys safely', () => {
  const created = [], revoked = [];
  const pool = createObjectUrlPool({
    urlApi: {
      createObjectURL(blob) { created.push(blob); return `blob:${created.length}`; },
      revokeObjectURL(url) { revoked.push(url); }
    }
  });
  const asset = { assetId: 'asset-one', blob: new Blob(['a']) };
  assert.equal(pool.acquire(asset), 'blob:1');
  assert.equal(pool.acquire(asset), 'blob:1');
  pool.release('asset-one');
  assert.equal(revoked.length, 0);
  pool.release('asset-one');
  assert.deepEqual(revoked, ['blob:1']);
  pool.destroy();
  pool.destroy();
});
