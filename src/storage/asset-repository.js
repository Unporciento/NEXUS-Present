import { createAssetRegistry } from '../media/asset-registry.js';
import { detectMime, readRasterDimensions } from '../media/file-signature.js';
import { sanitizeSvgBlob } from '../media/svg-sanitizer.js';

const clone = (value) => structuredClone(value);
const failure = (code, message, context = {}) => ({ ok: false, error: { code, message, context } });
const privatePath = /^(?:[a-z]:[\\/]|file:\/{2,3}|\/users\/|\\\\)/i;
const allowedMetadata = new Set([
  'alt', 'title', 'description', 'width', 'height', 'posterAssetId', 'captionsAssetId', 'preload'
]);

function safeFilename(value) {
  const filename = String(value ?? '').trim();
  if (!filename || privatePath.test(filename) || /[\\/:\0-\x1f]/.test(filename)) return null;
  const cleaned = filename.replace(/[<>:"|?*]/g, '-').replace(/\.+$/g, '').slice(0, 160);
  return cleaned && !/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(cleaned) ? cleaned : null;
}

function safeMetadata(input, kind) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) input = {};
  if (Object.keys(input).some((key) => !allowedMetadata.has(key))) {
    return failure('asset-metadata-unknown', 'Los metadatos contienen campos no admitidos.');
  }
  const metadata = {};
  for (const key of allowedMetadata) if (input[key] !== undefined) metadata[key] = clone(input[key]);
  if (kind === 'image' && (!String(metadata.alt ?? '').trim() || String(metadata.alt).length > 300)) {
    return failure('asset-alt-required', 'Describe brevemente la imagen antes de añadirla.');
  }
  if (metadata.title && String(metadata.title).length > 120) {
    return failure('asset-title-invalid', 'El título del recurso supera 120 caracteres.');
  }
  if (metadata.description && String(metadata.description).length > 500) {
    return failure('asset-description-invalid', 'La descripción del recurso supera 500 caracteres.');
  }
  if (metadata.preload && !['none', 'metadata'].includes(metadata.preload)) {
    return failure('asset-preload-invalid', 'La precarga de video no es válida.');
  }
  return { ok: true, value: metadata };
}

async function sha256(blob, cryptoApi) {
  if (!cryptoApi?.subtle?.digest) throw Object.assign(new Error('SHA-256 unavailable'), { code: 'hash-unavailable' });
  const digest = await cryptoApi.subtle.digest('SHA-256', await blob.arrayBuffer());
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

function normalizeError(error) {
  if (error?.name === 'QuotaExceededError') {
    return failure('asset-quota-exceeded', 'No hay espacio local suficiente para guardar el recurso.');
  }
  if (error?.code) return failure(error.code, error.message);
  return failure(error?.code ?? 'asset-repository-error', 'No fue posible completar la operación con el recurso.', {
    name: error?.name ?? 'Error'
  });
}

export function createAssetRepository({
  adapter,
  registry = createAssetRegistry(),
  cryptoApi = globalThis.crypto,
  createId = () => `asset-${cryptoApi.randomUUID()}`,
  now = () => new Date().toISOString()
} = {}) {
  let destroyed = false;
  const execute = async (operation) => {
    if (destroyed) return failure('repository-destroyed', 'El repositorio de recursos fue cerrado.');
    try {
      return { ok: true, value: clone(await operation()) };
    } catch (error) {
      return normalizeError(error);
    }
  };
  return {
    open: () => execute(() => adapter.open()),
    get: (assetId) => execute(async () => {
      const value = await adapter.get(assetId);
      if (!value) throw Object.assign(new Error('Asset missing'), { code: 'asset-not-found' });
      return value;
    }),
    list: (draftKey) => execute(() => adapter.list(draftKey)),
    importAsset: ({ draftKey, file, kind, metadata = {} }) => execute(async () => {
      if (!draftKey || privatePath.test(draftKey)) {
        throw Object.assign(new Error('Invalid draft scope'), { code: 'asset-scope-invalid' });
      }
      const fileCheck = registry.validateFile(file, kind);
      if (!fileCheck.ok) throw Object.assign(new Error(fileCheck.error.message), { code: fileCheck.error.code });
      const filename = safeFilename(file.name);
      if (!filename) throw Object.assign(new Error('El nombre del archivo no es seguro.'), { code: 'asset-filename-unsafe' });
      const metadataCheck = safeMetadata(metadata, kind);
      if (!metadataCheck.ok) {
        throw Object.assign(new Error(metadataCheck.error.message), { code: metadataCheck.error.code });
      }
      let blob = file;
      if (file.type === 'image/svg+xml') {
        const sanitized = await sanitizeSvgBlob(file);
        if (!sanitized.ok) throw Object.assign(new Error(sanitized.error.message), { code: sanitized.error.code });
        blob = sanitized.value;
      }
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const detectedMime = detectMime(bytes);
      if (detectedMime !== file.type) {
        throw Object.assign(new Error('MIME mismatch'), { code: 'asset-mime-mismatch' });
      }
      const hash = await sha256(blob, cryptoApi);
      const existing = await adapter.findByScopeHash(draftKey, hash);
      if (existing) return { ...existing, deduplicated: true };
      const timestamp = now();
      const dimensions = kind === 'image' ? readRasterDimensions(bytes, detectedMime) : {};
      const record = {
        assetId: createId(),
        draftKey,
        kind,
        filename,
        mime: detectedMime,
        size: blob.size,
        hash,
        blob,
        metadata: { ...metadataCheck.value, ...dimensions },
        createdAt: timestamp,
        updatedAt: timestamp,
        schemaVersion: 1
      };
      return adapter.write(record, { createOnly: true });
    }),
    updateMetadata: (assetId, metadata) => execute(async () => {
      const current = await adapter.get(assetId);
      if (!current) throw Object.assign(new Error('Asset missing'), { code: 'asset-not-found' });
      const checked = safeMetadata({ ...current.metadata, ...metadata }, current.kind);
      if (!checked.ok) throw Object.assign(new Error(checked.error.message), { code: checked.error.code });
      return adapter.write({ ...current, metadata: checked.value, updatedAt: now() });
    }),
    delete: (assetId, { referenced = false, confirmed = false } = {}) => execute(async () => {
      if (referenced) throw Object.assign(new Error('Asset is referenced'), { code: 'asset-in-use' });
      if (!confirmed) throw Object.assign(new Error('Confirmation required'), { code: 'confirmation-required' });
      return adapter.delete(assetId);
    }),
    references(document, assetId) {
      const references = (document?.scenes ?? []).flatMap((scene) => scene.blocks ?? [])
        .flatMap((block) => [block.assetId, block.posterAssetId, block.captionsAssetId])
        .filter((value) => value === assetId).length;
      return { ok: true, value: references };
    },
    findOrphans: (draftKey, referencedIds = []) => execute(async () => {
      const used = new Set(referencedIds);
      return (await adapter.list(draftKey)).filter((asset) => !used.has(asset.assetId));
    }),
    cleanupOrphans: (draftKey, referencedIds = [], { confirmed = false } = {}) => execute(async () => {
      if (!confirmed) throw Object.assign(new Error('Confirmation required'), { code: 'confirmation-required' });
      const used = new Set(referencedIds);
      const orphanIds = (await adapter.list(draftKey))
        .filter((asset) => !used.has(asset.assetId))
        .map((asset) => asset.assetId);
      return adapter.bulkDelete(orphanIds);
    }),
    close() {
      adapter.close();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      adapter.destroy();
    }
  };
}
