import {
  PUBLIC_PRESENTATION_FIELDS,
  validatePublicPresentation,
  validateSourcePresentation
} from '../contracts/index.js';

const failure = (code, message, diagnostics = []) => ({
  ok: false,
  error: { code, message },
  diagnostics
});

export function createPublicToSourceConverter({
  createKey = () => globalThis.crypto.randomUUID(),
  now = () => new Date().toISOString()
} = {}) {
  return {
    convert(publicDocument) {
      const publicResult = validatePublicPresentation(publicDocument);
      if (!publicResult.valid) {
        return failure('invalid-public-document', 'El documento público no es válido.', publicResult.diagnostics);
      }
      const sourceDocument = Object.fromEntries(
        PUBLIC_PRESENTATION_FIELDS
          .filter((field) => field in publicDocument)
          .map((field) => [field, structuredClone(publicDocument[field])])
      );
      sourceDocument.editorial = {
        studio: {
          origin: 'import',
          importedAt: now(),
          schemaVersion: 1
        }
      };
      const sourceResult = validateSourcePresentation(sourceDocument);
      if (!sourceResult.valid) {
        return failure('conversion-invalid', 'No fue posible crear un borrador compatible.', sourceResult.diagnostics);
      }
      return {
        ok: true,
        draftKey: createKey(),
        sourceDocument: structuredClone(sourceDocument)
      };
    }
  };
}
