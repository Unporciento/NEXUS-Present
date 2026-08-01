import { createDefaultRegistry, createPublicPresentation, validatePublicPresentation } from '../contracts/index.js';
import { createArchiveAdapter } from './archive-adapter.js';
import { sha256Bytes } from './integrity-verifier.js';
import { packageSlug, safePackageSegment } from './path-policy.js';
import { createRuntimeProvider } from './runtime-provider.js';
import { ENGINE_VERSION, PACKAGE_FORMAT_VERSION } from '../version.js';

const text = (value) => new TextEncoder().encode(`${JSON.stringify(value, null, 2)}\n`);
const usedIds = (document) => new Set((document.scenes ?? []).flatMap((scene) => scene.blocks ?? [])
  .flatMap((block) => [block.assetId, block.posterAssetId, block.captionsAssetId]).filter(Boolean));
const folder = { image: 'images', video: 'videos', poster: 'posters', captions: 'captions' };
const failure = (code, message, context = {}) => ({ ok: false, error: { code, message, context } });
const urlPath = (path) => path.split('/').map(encodeURIComponent).join('/');

export function createPackageExportService({
  assetRepository,
  runtimeProvider = createRuntimeProvider(),
  archive = createArchiveAdapter(),
  engineVersion = ENGINE_VERSION,
  packageVersion = PACKAGE_FORMAT_VERSION,
  cryptoApi = globalThis.crypto
} = {}) {
  let destroyed = false;
  return {
    async prepare(sourceDocument, draftKey, { signal } = {}) {
      if (destroyed) return failure('package-export-destroyed', 'La exportación portable fue cerrada.');
      try {
        createDefaultRegistry();
        const converted = createPublicPresentation(sourceDocument, engineVersion);
        if (!converted.valid) return { ok: false, diagnostics: converted.diagnostics };
        const publicDocument = converted.value;
        const ids = usedIds(publicDocument), entries = [], manifestAssets = [];
        const posterIds = new Set(publicDocument.scenes.flatMap((scene) => scene.blocks ?? []).map((block) => block.posterAssetId).filter(Boolean));
        const root = `nexus-${packageSlug(publicDocument.title)}`;
        const resources = new Map((publicDocument.resources ?? []).map((resource) => [resource.id, resource]));
        for (const assetId of [...ids].sort()) {
          if (signal?.aborted) return failure('package-export-cancelled', 'La exportación fue cancelada.');
          const stored = await assetRepository.get(assetId);
          if (!stored.ok || stored.value.draftKey !== draftKey) return failure('package-asset-missing', 'Falta un recurso usado por la presentación.', { assetId });
          const asset = stored.value;
          const kind = posterIds.has(assetId) ? 'poster' : asset.kind;
          const path = `assets/${folder[kind] ?? folder[asset.kind]}/${asset.assetId}-${safePackageSegment(asset.filename)}`;
          const bytes = new Uint8Array(await asset.blob.arrayBuffer());
          entries.push([`${root}/${path}`, bytes]);
          manifestAssets.push({ id: assetId, kind: asset.kind, path, mime: asset.mime, size: bytes.byteLength, sha256: await sha256Bytes(bytes, cryptoApi), filename: asset.filename, metadata: asset.metadata ?? {} });
          const publicAsset = resources.get(assetId);
          if (publicAsset) publicAsset.url = urlPath(path);
        }
        const check = validatePublicPresentation(publicDocument, engineVersion);
        if (!check.valid) return { ok: false, diagnostics: check.diagnostics };
        const presentationBytes = text(publicDocument);
        entries.push([`${root}/presentation.json`, presentationBytes]);
        const runtimeFiles = await runtimeProvider.collect();
        const manifestRuntime = [];
        for (const [path, bytes] of runtimeFiles) {
          entries.push([`${root}/${path}`, bytes]);
          manifestRuntime.push({ path, size: bytes.byteLength, sha256: await sha256Bytes(bytes, cryptoApi) });
        }
        const manifest = {
          packageVersion, engineVersion, contractVersion: publicDocument.contractVersion,
          presentation: { path: 'presentation.json', size: presentationBytes.byteLength, sha256: await sha256Bytes(presentationBytes, cryptoApi) },
          assets: manifestAssets, runtime: manifestRuntime,
          requiredCapabilities: ['es-modules', ...(manifestAssets.some((asset) => asset.kind === 'video') ? ['html-video'] : [])]
        };
        entries.push([`${root}/manifest.json`, text(manifest)]);
        entries.push([`${root}/index.html`, new TextEncoder().encode(`<!doctype html><html lang="es" data-engine-version="${engineVersion}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Presentación portable NEXUS"><title>${publicDocument.title.replace(/[<>&"]/g, '')} · NEXUS</title><link rel="stylesheet" href="runtime/styles.css"></head><body><div id="app"></div><script type="module" src="runtime/portable/runtime-app.js"></script></body></html>\n`)]);
        entries.push([`${root}/LEEME.txt`, new TextEncoder().encode('NEXUS portable\n\n1. Conserva toda esta carpeta.\n2. Sírvela con un servidor HTTP estático.\n3. Abre index.html desde la URL del servidor.\n\nNo se garantiza el funcionamiento mediante file://.\n')]);
        const zipped = archive.create(entries);
        return zipped.ok ? { ok: true, bytes: zipped.bytes, text: zipped.bytes, mime: 'application/zip', filename: `${root}.zip`, manifest, publicDocument } : zipped;
      } catch (error) {
        return failure(error?.code ?? 'package-export-failed', 'No fue posible crear el paquete portable.', { name: error?.name ?? 'Error' });
      }
    },
    destroy() { destroyed = true; }
  };
}
