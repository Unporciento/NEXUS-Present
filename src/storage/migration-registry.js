import { validateSourcePresentation } from '../contracts/index.js';

const failure = (code, message) => ({ ok: false, error: { code, message } });

export function createMigrationRegistry() {
  const migrations = new Map();
  return {
    register({ from, to, migrate }) {
      if (!Number.isInteger(from) || to !== from + 1 || typeof migrate !== 'function') {
        return failure('invalid-migration', 'La migración no tiene un contrato válido.');
      }
      if (migrations.has(from)) return failure('duplicate-migration', 'La migración ya está registrada.');
      migrations.set(from, { from, to, migrate });
      return { ok: true };
    },
    migrate(record, targetVersion) {
      let current = structuredClone(record);
      const original = structuredClone(record);
      while (current.schemaVersion < targetVersion) {
        const definition = migrations.get(current.schemaVersion);
        if (!definition) return failure('migration-unavailable', 'No existe una ruta de migración compatible.');
        try {
          current = definition.migrate(structuredClone(current));
        } catch {
          return failure('migration-failed', 'La migración no pudo completarse.');
        }
        if (current?.schemaVersion !== definition.to) {
          return failure('migration-invalid-result', 'La migración produjo una versión incorrecta.');
        }
        if (!validateSourcePresentation(current.sourceDocument).valid) {
          return failure('migration-invalid-source', 'La migración produjo un borrador inválido.');
        }
      }
      return { ok: true, value: structuredClone(current), original };
    }
  };
}
