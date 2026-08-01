const hex = (bytes) => [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
export async function sha256Bytes(bytes, cryptoApi = globalThis.crypto) {
  if (!cryptoApi?.subtle?.digest) throw Object.assign(new Error('SHA-256 unavailable'), { code: 'hash-unavailable' });
  return hex(new Uint8Array(await cryptoApi.subtle.digest('SHA-256', bytes)));
}

export async function verifyIntegrity(files, entries, cryptoApi = globalThis.crypto) {
  const errors = [];
  for (const entry of entries) {
    const bytes = files.get(entry.path);
    if (!bytes) errors.push({ code: 'package-file-missing', path: entry.path });
    else if (bytes.byteLength !== entry.size) errors.push({ code: 'package-size-mismatch', path: entry.path });
    else if (await sha256Bytes(bytes, cryptoApi) !== entry.sha256) errors.push({ code: 'package-hash-mismatch', path: entry.path });
  }
  return { ok: errors.length === 0, errors };
}
