import { unzipSync, zipSync } from '../../vendor/fflate.js';
import { validateArchivePath } from './path-policy.js';

export const ARCHIVE_LIMITS = Object.freeze({
  compressedBytes: 250 * 1024 * 1024,
  uncompressedBytes: 500 * 1024 * 1024,
  entries: 512,
  ratio: 100
});
// ZIP stores local DOS dates; day two remains valid even in negative UTC offsets.
const fixedDate = new Date('1980-01-02T12:00:00.000Z');
const failure = (code, message) => ({ ok: false, error: { code, message } });
const u16 = (bytes, offset) => bytes[offset] | (bytes[offset + 1] << 8);
const u32 = (bytes, offset) => (bytes[offset] | (bytes[offset + 1] << 8) |
  (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;

export function inspectZip(bytes, limits = ARCHIVE_LIMITS) {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength > limits.compressedBytes) {
    return failure('package-size-limit', 'El paquete supera el límite permitido.');
  }
  let offset = bytes.length - 22;
  while (offset >= Math.max(0, bytes.length - 65557) && u32(bytes, offset) !== 0x06054b50) offset -= 1;
  if (offset < 0) return failure('package-zip-corrupt', 'El archivo ZIP está dañado o incompleto.');
  const count = u16(bytes, offset + 10);
  if (count > limits.entries) return failure('package-entry-limit', 'El paquete contiene demasiados archivos.');
  let cursor = u32(bytes, offset + 16), total = 0;
  const decoder = new TextDecoder('utf-8', { fatal: true });
  try {
    for (let index = 0; index < count; index += 1) {
      if (u32(bytes, cursor) !== 0x02014b50) throw new Error('central-directory');
      const compressed = u32(bytes, cursor + 20), uncompressed = u32(bytes, cursor + 24);
      const nameLength = u16(bytes, cursor + 28), extraLength = u16(bytes, cursor + 30), commentLength = u16(bytes, cursor + 32);
      const name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength));
      const path = validateArchivePath(name.replace(/\/$/, ''));
      if (!path.ok) return failure(path.code, 'El paquete contiene una ruta insegura.');
      if (compressed === 0 && uncompressed > 0 || compressed && uncompressed / compressed > limits.ratio) {
        return failure('package-compression-ratio', 'El paquete excede la proporción segura de compresión.');
      }
      total += uncompressed;
      if (total > limits.uncompressedBytes) return failure('package-expanded-limit', 'El paquete expandido es demasiado grande.');
      cursor += 46 + nameLength + extraLength + commentLength;
    }
  } catch {
    return failure('package-zip-corrupt', 'El directorio del ZIP no es válido.');
  }
  return { ok: true, entries: count, uncompressedBytes: total };
}

export function createArchiveAdapter({ limits = ARCHIVE_LIMITS } = {}) {
  return {
    create(entries) {
      const files = {};
      for (const [path, bytes] of [...entries].sort(([a], [b]) => a.localeCompare(b, 'en'))) {
        const checked = validateArchivePath(path);
        if (!checked.ok) return failure(checked.code, 'No se puede crear una ruta insegura.');
        files[path] = [bytes, { mtime: fixedDate, level: 6 }];
      }
      return { ok: true, bytes: zipSync(files, { level: 6 }) };
    },
    extract(bytes) {
      const inspected = inspectZip(bytes, limits);
      if (!inspected.ok) return inspected;
      try {
        const output = unzipSync(bytes);
        return { ok: true, files: new Map(Object.entries(output).sort(([a], [b]) => a.localeCompare(b, 'en'))) };
      } catch {
        return failure('package-zip-corrupt', 'No fue posible abrir el archivo ZIP.');
      }
    }
  };
}
