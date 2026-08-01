export const Severity = Object.freeze({ ERROR: 'error', WARNING: 'warning', INFO: 'info' });

export function diagnostic(code, path, message, severity = Severity.ERROR, context) {
  return { code, path, message, severity, ...(context === undefined ? {} : { context }) };
}

export function result(diagnostics = [], value) {
  return {
    valid: !diagnostics.some(({ severity }) => severity === Severity.ERROR),
    diagnostics,
    ...(value === undefined ? {} : { value })
  };
}
