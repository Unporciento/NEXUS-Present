import {
  PUBLIC_PRESENTATION_FIELDS,
  createDefaultRegistry,
  parseSemver,
  validatePublicPresentation
} from '../contracts/index.js';
import { createPublicToSourceConverter } from './public-to-source.js';

const PRIVATE_FIELDS = new Set(['presenter', 'editorial', 'history', 'privateData']);
const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const localPath = /^(?:[a-z]:[\\/]|file:\/{2,3}|\/users\/|\\\\)/i;
const result = (code, message, path = '') => ({
  ok: false,
  diagnostics: [{ code, path, message, severity: 'error' }]
});

function inspectJson(value, { maxDepth = 64, maxNodes = 50000 } = {}) {
  const seen = new Set();
  let nodes = 0;
  const walk = (node, path, depth) => {
    if (depth > maxDepth) return result('import-too-deep', 'El documento tiene demasiados niveles.', path);
    if (++nodes > maxNodes) return result('import-too-complex', 'El documento contiene demasiados elementos.', path);
    if (node === null || ['string', 'boolean'].includes(typeof node)) {
      return typeof node === 'string' && localPath.test(node)
        ? result('private-local-path', 'El documento contiene una ruta local privada.', path)
        : null;
    }
    if (typeof node === 'number') return Number.isFinite(node)
      ? null : result('invalid-number', 'El documento contiene un número no válido.', path);
    if (typeof node !== 'object') return result('non-json-value', 'El documento contiene datos no admitidos.', path);
    if (seen.has(node)) return result('circular-reference', 'El documento contiene una referencia circular.', path);
    seen.add(node);
    for (const [key, child] of Object.entries(node)) {
      const childPath = path ? `${path}.${key}` : key;
      if (DANGEROUS_KEYS.has(key)) return result('dangerous-key', 'El documento contiene una clave no permitida.', childPath);
      const found = walk(child, childPath, depth + 1);
      if (found) return found;
    }
    seen.delete(node);
    return null;
  };
  return walk(value, '', 0);
}

export function createImportService({
  maxBytes = 5 * 1024 * 1024,
  converter = createPublicToSourceConverter(),
  TextDecoderType = globalThis.TextDecoder
} = {}) {
  let destroyed = false;
  let state = 'idle';
  let listeners = new Set();
  const setState = (next) => {
    state = next;
    if (!destroyed) listeners.forEach((listener) => listener(next));
  };
  const prepare = (document) => {
    createDefaultRegistry();
    const inspected = inspectJson(document);
    if (inspected) return inspected;
    if (!document || Array.isArray(document) || typeof document !== 'object') {
      return result('invalid-document', 'La raíz debe ser un objeto de presentación.');
    }
    for (const field of PRIVATE_FIELDS) {
      if (field in document) return result('private-field-import', 'El archivo contiene datos internos de Studio.', field);
    }
    const allowed = new Set(PUBLIC_PRESENTATION_FIELDS);
    const unknown = Object.keys(document).find((field) => !allowed.has(field));
    if (unknown) return result('unknown-import-field', 'El archivo contiene un campo no admitido.', unknown);
    const contract = parseSemver(document.contractVersion);
    if (!contract || contract[0] !== 1) {
      return result('contract-version-incompatible', 'La versión del contrato no es compatible.', 'contractVersion');
    }
    const validation = validatePublicPresentation(document);
    if (!validation.valid) return { ok: false, diagnostics: structuredClone(validation.diagnostics) };
    return converter.convert(document);
  };
  return {
    getState: () => state,
    subscribe(listener) {
      if (destroyed || typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    prepare,
    async importFile(file) {
      if (destroyed) return result('import-destroyed', 'La importación ya fue cerrada.');
      if (!file || typeof file.arrayBuffer !== 'function') return result('file-required', 'Selecciona un archivo JSON.');
      if (!/\.json$/i.test(file.name ?? '')) return result('invalid-file-extension', 'Selecciona un archivo con extensión .json.');
      if (file.type && file.type !== 'application/json') return result('invalid-file-type', 'El archivo debe ser JSON.');
      if (!Number.isSafeInteger(file.size) || file.size > maxBytes) return result('file-too-large', 'El archivo supera el límite de 5 MiB.');
      try {
        setState('reading');
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (bytes.byteLength > maxBytes) return result('file-too-large', 'El archivo supera el límite de 5 MiB.');
        setState('parsing');
        let text = new TextDecoderType('utf-8', { fatal: true }).decode(bytes);
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
        const prepared = prepare(JSON.parse(text));
        setState(prepared.ok ? 'ready' : 'invalid');
        return prepared;
      } catch (error) {
        setState('invalid');
        const code = error?.name === 'TypeError' ? 'invalid-utf8' : 'invalid-json';
        return result(code, code === 'invalid-utf8' ? 'El archivo no usa UTF-8 válido.' : 'El JSON está dañado o incompleto.');
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      state = 'destroyed';
      listeners.clear();
    }
  };
}
