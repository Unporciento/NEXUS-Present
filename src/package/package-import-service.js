import { createDefaultRegistry, validatePublicPresentation } from '../contracts/index.js';
import { createPublicToSourceConverter } from '../import/public-to-source.js';
import { createArchiveAdapter } from './archive-adapter.js';
import { verifyIntegrity } from './integrity-verifier.js';
import { validatePackageManifest } from './manifest-validator.js';

const failure = (code, message, context = {}) => ({ ok: false, error: { code, message, context } });
const privateKeys = new Set(['editorial','history','presenter','privateData','selection','dirty','preview']);
const dangerous = new Set(['__proto__','prototype','constructor']);
const decodeJson = (bytes) => {
  const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  const visit = (node, depth = 0) => {
    if (depth > 30) throw Object.assign(new Error('Object nesting limit'), { code: 'package-object-depth' });
    if (!node || typeof node !== 'object') return;
    for (const key of Object.keys(node)) {
      if (dangerous.has(key)) throw Object.assign(new Error('Dangerous key'), { code: 'package-dangerous-key' });
      visit(node[key], depth + 1);
    }
  };
  visit(value);
  return value;
};
const replaceIds = (document, replacements) => {
  const output = structuredClone(document);
  output.resources = (output.resources ?? []).map((resource) => ({ ...resource, id: replacements.get(resource.id) ?? resource.id, url: `nexus-asset:${replacements.get(resource.id) ?? resource.id}` }));
  output.scenes.forEach((scene) => scene.blocks?.forEach((block) => {
    for (const key of ['assetId','posterAssetId','captionsAssetId']) if (block[key]) block[key] = replacements.get(block[key]) ?? block[key];
  }));
  return output;
};

export function createPackageImportService({
  assetRepository,
  draftRepository,
  archive = createArchiveAdapter(),
  converter = createPublicToSourceConverter(),
  FileType = globalThis.File,
  maxBytes = 250 * 1024 * 1024,
  cryptoApi = globalThis.crypto
} = {}) {
  let destroyed = false;
  return {
    async importFile(file) {
      if (destroyed) return failure('package-import-destroyed', 'La importación fue cerrada.');
      if (!file || !/\.zip$/i.test(file.name ?? '') || file.size > maxBytes) return failure('package-file-invalid', 'Selecciona un paquete ZIP de NEXUS válido.');
      const importedIds = [];
      let createdDraft = null;
      try {
        const extracted = archive.extract(new Uint8Array(await file.arrayBuffer()));
        if (!extracted.ok) return extracted;
        const roots = new Set([...extracted.files.keys()].map((path) => path.split('/')[0]));
        if (roots.size !== 1) return failure('package-root-invalid', 'El paquete debe contener una única carpeta raíz.');
        const root = [...roots][0], prefix = `${root}/`;
        const relative = new Map([...extracted.files].map(([path, bytes]) => [path.slice(prefix.length), bytes]));
        const manifestBytes = relative.get('manifest.json');
        if (!manifestBytes) return failure('package-manifest-missing', 'El manifiesto no está disponible.');
        const manifest = decodeJson(manifestBytes);
        const manifestCheck = validatePackageManifest(manifest);
        if (!manifestCheck.ok) return { ok: false, error: { code: 'package-manifest-invalid', message: 'El manifiesto no es válido.' }, diagnostics: manifestCheck.errors };
        if (!manifest.packageVersion.startsWith('1.') || !manifest.engineVersion.startsWith('1.')) {
          return failure('package-version-incompatible', 'Esta versión del paquete requiere otro motor de NEXUS.');
        }
        const allowed = new Set(['manifest.json','index.html','LEEME.txt', manifest.presentation.path,
          ...manifest.assets.map((entry) => entry.path), ...manifest.runtime.map((entry) => entry.path)]);
        const unexpected = [...relative.keys()].find((path) => path && !allowed.has(path));
        if (unexpected) return failure('package-file-unexpected', 'El paquete contiene un archivo no permitido.', { path: unexpected });
        const integrity = await verifyIntegrity(relative, [manifest.presentation, ...manifest.assets, ...manifest.runtime], cryptoApi);
        if (!integrity.ok) return { ok: false, error: { code: 'package-integrity-failed', message: 'La integridad del paquete no coincide.' }, diagnostics: integrity.errors };
        const publicDocument = decodeJson(relative.get(manifest.presentation.path));
        if (Object.keys(publicDocument).some((key) => privateKeys.has(key))) return failure('package-private-data', 'El paquete contiene datos internos no admitidos.');
        createDefaultRegistry();
        const valid = validatePublicPresentation(publicDocument);
        if (!valid.valid) return { ok: false, error: { code: 'package-presentation-invalid', message: 'La presentación del paquete no es válida.' }, diagnostics: valid.diagnostics };
        const converted = converter.convert(publicDocument);
        if (!converted.ok) return converted;
        const replacements = new Map();
        for (const entry of manifest.assets) {
          const blob = new FileType([relative.get(entry.path)], entry.filename, { type: entry.mime });
          const stored = await assetRepository.importAsset({ draftKey: converted.draftKey, file: blob, kind: entry.kind, metadata: entry.metadata });
          if (!stored.ok) throw Object.assign(new Error(stored.error.message), { code: stored.error.code });
          importedIds.push(stored.value.assetId);
          replacements.set(entry.id, stored.value.assetId);
        }
        const sourceDocument = replaceIds(converted.sourceDocument, replacements);
        const created = await draftRepository.create(sourceDocument, { draftKey: converted.draftKey });
        if (!created.ok) throw Object.assign(new Error(created.error.message), { code: created.error.code });
        createdDraft = created.value;
        return { ok: true, value: created.value, draftKey: converted.draftKey, importedAssets: importedIds.length };
      } catch (error) {
        for (const assetId of importedIds) await assetRepository.delete(assetId, { confirmed: true });
        if (createdDraft) await draftRepository.delete(createdDraft.draftKey, createdDraft.revision);
        return failure(error?.code ?? 'package-import-failed', 'No fue posible importar el paquete de forma segura.', { name: error?.name ?? 'Error' });
      }
    },
    destroy() { destroyed = true; }
  };
}
