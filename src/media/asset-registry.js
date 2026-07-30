const MIB = 1024 * 1024;

const defaults = [
  {
    kind: 'image',
    mimes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    extensions: ['png', 'jpg', 'jpeg', 'webp', 'svg'],
    maxBytes: 10 * MIB
  },
  {
    kind: 'video',
    mimes: ['video/mp4', 'video/webm'],
    extensions: ['mp4', 'webm'],
    maxBytes: 200 * MIB
  },
  {
    kind: 'captions',
    mimes: ['text/vtt'],
    extensions: ['vtt'],
    maxBytes: 2 * MIB
  }
];

const failure = (code, message, context = {}) => ({
  ok: false,
  error: { code, message, context }
});

export function createAssetRegistry(definitions = defaults) {
  const entries = new Map(definitions.map((definition) => [
    definition.kind,
    Object.freeze({ ...definition, mimes: [...definition.mimes], extensions: [...definition.extensions] })
  ]));
  return {
    register(definition) {
      if (!definition?.kind || entries.has(definition.kind)) {
        return failure('asset-kind-exists', 'El tipo de recurso ya está registrado.');
      }
      entries.set(definition.kind, Object.freeze(structuredClone(definition)));
      return { ok: true };
    },
    get(kind) {
      const value = entries.get(kind);
      return value ? structuredClone(value) : null;
    },
    validateFile(file, kind) {
      const definition = entries.get(kind);
      if (!definition) return failure('asset-kind-unsupported', 'El tipo de recurso no es compatible.');
      if (!(file instanceof Blob)) return failure('asset-file-invalid', 'Selecciona un archivo válido.');
      if (!Number.isFinite(file.size) || file.size < 1) {
        return failure('asset-empty', 'El archivo está vacío.');
      }
      if (file.size > definition.maxBytes) {
        return failure('asset-too-large', 'El archivo supera el límite permitido.', {
          maxBytes: definition.maxBytes,
          actualBytes: file.size
        });
      }
      const extension = String(file.name ?? '').split('.').pop().toLowerCase();
      if (!definition.extensions.includes(extension) || !definition.mimes.includes(file.type)) {
        return failure('asset-format-unsupported', 'El formato del archivo no es compatible.');
      }
      return { ok: true, value: structuredClone(definition) };
    },
    list() {
      return [...entries.values()].map(structuredClone);
    }
  };
}

export const assetLimits = Object.freeze({
  image: 10 * MIB,
  video: 200 * MIB,
  captions: 2 * MIB
});
