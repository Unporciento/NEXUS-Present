import { createPackageExportService } from '../package/package-export-service.js';
import { createBrowserDownloadAdapter } from './browser-download-adapter.js';

export function bindPackageExport(root, controller, {
  assetRepository, getDraftKey,
  service = createPackageExportService({ assetRepository }),
  downloader = createBrowserDownloadAdapter()
} = {}) {
  const button = root.querySelector('[data-package-export]');
  const status = root.querySelector('#package-export-status');
  let destroyed = false, busy = false, abortController = null;
  const message = (value) => { if (status) status.textContent = value; };
  const request = async () => {
    if (destroyed || busy) return false;
    const draftKey = getDraftKey();
    if (!draftKey) { message('Guarda primero el borrador para empaquetar sus recursos.'); return false; }
    busy = true; button.disabled = true; button.setAttribute('aria-busy', 'true');
    abortController = new AbortController();
    message('Validando y reuniendo los recursos usados…');
    const prepared = await service.prepare(controller.getState().draft, draftKey, { signal: abortController.signal });
    const downloaded = prepared.ok ? downloader.download(prepared) : prepared;
    message(downloaded.ok ? 'Paquete portable descargado.' : prepared.diagnostics?.[0]?.message ?? downloaded.error?.message ?? 'No fue posible crear el paquete.');
    busy = false; button.disabled = false; button.setAttribute('aria-busy', 'false'); abortController = null;
    return downloaded.ok;
  };
  button?.addEventListener('click', request);
  return { request, destroy() { if (destroyed) return; destroyed = true; abortController?.abort(); button?.removeEventListener('click', request); service.destroy(); downloader.destroy(); } };
}
