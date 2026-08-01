import { validateArchivePath } from './path-policy.js';

const keys = new Set(['packageVersion','engineVersion','contractVersion','presentation','assets','runtime','requiredCapabilities']);
const semver = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const assetKeys = new Set(['id','kind','path','mime','size','sha256','filename','metadata']);
const fileKeys = new Set(['path','size','sha256']);
export function validatePackageManifest(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, errors: [{ code: 'manifest-invalid' }] };
  Object.keys(value).filter((key) => !keys.has(key)).forEach((path) => errors.push({ code: 'manifest-unknown-field', path }));
  for (const field of ['packageVersion','engineVersion','contractVersion']) {
    if (!semver.test(value[field] ?? '')) errors.push({ code: 'manifest-version-invalid', path: field });
  }
  if (!validateArchivePath(value.presentation?.path).ok) errors.push({ code: 'manifest-presentation-path' });
  if (!Array.isArray(value.assets) || !Array.isArray(value.runtime) || !Array.isArray(value.requiredCapabilities)) {
    errors.push({ code: 'manifest-collections-invalid' });
  }
  for (const entry of [...(value.assets ?? []), ...(value.runtime ?? []), value.presentation].filter(Boolean)) {
    if (!validateArchivePath(entry.path).ok || !/^[a-f0-9]{64}$/.test(entry.sha256 ?? '') || !Number.isSafeInteger(entry.size) || entry.size < 0) {
      errors.push({ code: 'manifest-entry-invalid', path: entry.path });
    }
  }
  for (const entry of value.assets ?? []) {
    if (!entry || typeof entry !== 'object' || Object.keys(entry).some((key) => !assetKeys.has(key))
      || !['image','video','captions'].includes(entry.kind) || typeof entry.id !== 'string'
      || typeof entry.filename !== 'string' || typeof entry.mime !== 'string') {
      errors.push({ code: 'manifest-asset-invalid', path: entry?.path });
    }
  }
  for (const entry of [...(value.runtime ?? []), value.presentation].filter(Boolean)) {
    if (!entry || typeof entry !== 'object' || Object.keys(entry).some((key) => !fileKeys.has(key))) {
      errors.push({ code: 'manifest-file-invalid', path: entry?.path });
    }
  }
  return { ok: errors.length === 0, errors };
}
