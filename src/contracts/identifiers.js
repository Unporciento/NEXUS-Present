import { diagnostic } from './errors.js';

const PATTERNS = Object.freeze({
  presentationId: /^[a-z][a-z0-9-]{2,63}$/,
  sceneId: /^scene-[a-z0-9-]{1,60}$/,
  blockId: /^block-[a-z0-9-]{1,60}$/,
  assetId: /^asset-[a-z0-9-]{1,60}$/,
  releaseId: /^release-[a-z0-9-]{1,60}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
});

export function validateIdentifier(kind, value, path) {
  if (typeof value !== 'string' || !PATTERNS[kind]?.test(value)) return [diagnostic('invalid-identifier', path, `Invalid ${kind}.`)];
  return [];
}

export function duplicateDiagnostics(items, field, path) {
  const seen = new Set(), diagnostics = [];
  items.forEach((item, index) => {
    const value = item?.[field];
    if (value && seen.has(value)) diagnostics.push(diagnostic('duplicate-identifier', `${path}[${index}].${field}`, `${value} is duplicated.`));
    seen.add(value);
  });
  return diagnostics;
}
