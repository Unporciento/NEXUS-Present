const failure = (code, message, context = {}) => ({
  ok: false,
  error: { code, path: '', message, severity: 'error', context }
});

export function createBrowserDownloadAdapter({
  BlobType = globalThis.Blob,
  URLApi = globalThis.URL,
  documentApi = globalThis.document
} = {}) {
  let destroyed = false;
  let busy = false;
  let pendingUrl = null;

  const revoke = () => {
    if (!pendingUrl) return;
    URLApi?.revokeObjectURL?.(pendingUrl);
    pendingUrl = null;
  };

  return {
    download({ text, filename, mime = 'application/json' } = {}) {
      if (destroyed) return failure('download-destroyed', 'La descarga ya fue cerrada.');
      if (busy) return failure('download-in-progress', 'Ya hay una descarga en curso.');
      busy = true;
      let anchor = null;
      try {
        if (typeof BlobType !== 'function') throw new TypeError('Blob unavailable');
        if (typeof URLApi?.createObjectURL !== 'function') throw new TypeError('URL unavailable');
        if (typeof documentApi?.createElement !== 'function') throw new TypeError('Document unavailable');
        const blob = new BlobType([text], { type: mime });
        pendingUrl = URLApi.createObjectURL(blob);
        anchor = documentApi.createElement('a');
        anchor.href = pendingUrl;
        anchor.download = filename;
        anchor.hidden = true;
        documentApi.body?.append?.(anchor);
        anchor.click();
        return { ok: true, filename };
      } catch (error) {
        return failure('download-blocked', 'El navegador no pudo iniciar la descarga.', {
          name: error?.name ?? 'Error'
        });
      } finally {
        anchor?.remove?.();
        revoke();
        busy = false;
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      busy = false;
      revoke();
    }
  };
}
