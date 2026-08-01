const reserved = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;
const control = /[\0-\x1f\x7f]/;

export function validateArchivePath(input) {
  const value = String(input ?? '').normalize('NFC');
  if (!value || value.length > 240) return { ok: false, code: 'package-path-length' };
  if (value.includes('\\') || value.startsWith('/') || /^[a-z]:/i.test(value)) {
    return { ok: false, code: 'package-path-absolute' };
  }
  const parts = value.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..' || reserved.test(part) || control.test(part))) {
    return { ok: false, code: 'package-path-unsafe' };
  }
  return { ok: true, value: parts.join('/') };
}

export function safePackageSegment(value, fallback = 'archivo') {
  const cleaned = String(value ?? '').normalize('NFC').trim()
    .replace(/[\\/:*?"<>|\0-\x1f\x7f]/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/[. ]+$/g, '')
    .slice(0, 120);
  return cleaned && !reserved.test(cleaned) ? cleaned : fallback;
}

export function packageSlug(title) {
  return String(title ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'presentacion';
}
