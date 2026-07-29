import { createBrowserDownloadAdapter } from './browser-download-adapter.js';
import { createExportService } from './export-service.js';

const messages = {
  idle: 'Aún no se ha exportado este borrador.',
  validating: 'Validando el borrador actual…',
  invalid: 'Corrige los errores de validación antes de exportar.',
  preparing: 'Preparando el archivo JSON…',
  ready: 'El archivo JSON está preparado.',
  stale: 'Los cambios actuales todavía no se han exportado.',
  downloading: 'Iniciando la descarga local…',
  exported: 'Archivo JSON exportado correctamente.',
  'recoverable-error': 'No fue posible exportar. Puedes intentarlo nuevamente.',
  destroyed: 'La exportación fue cerrada.'
};

export function bindStudioExport(root, controller, {
  exportService = createExportService(),
  downloadAdapter = createBrowserDownloadAdapter(),
  ownsExportService = true,
  ownsDownloadAdapter = true
} = {}) {
  let destroyed = false;
  let busy = false;
  let lastSignature = JSON.stringify(controller.getState().draft);
  const button = root.querySelector?.('[data-export]');
  const status = root.querySelector?.('#export-status');
  const render = (name) => {
    if (status) status.textContent = messages[name] ?? messages['recoverable-error'];
    if (button) {
      button.disabled = busy || name === 'destroyed';
      button.setAttribute('aria-busy', String(busy));
    }
    const studio = root.querySelector?.('.studio');
    if (studio) studio.dataset.exportState = name;
  };
  const request = () => {
    if (destroyed || busy) return false;
    busy = true;
    render('validating');
    const prepared = exportService.prepare(controller.getState().draft);
    if (!prepared.ok) {
      busy = false;
      render(prepared.diagnostics ? 'invalid' : 'recoverable-error');
      root.querySelector?.('#validation-panel')?.focus?.();
      return false;
    }
    render('downloading');
    const downloaded = downloadAdapter.download(prepared);
    busy = false;
    render(downloaded.ok ? 'exported' : 'recoverable-error');
    if (!downloaded.ok) button?.focus?.();
    return downloaded.ok;
  };
  const click = (event) => {
    if (event.target?.closest?.('[data-export]')) request();
  };
  root.addEventListener('click', click);
  const stop = controller.subscribe((state) => {
    const signature = JSON.stringify(state.draft);
    if (signature !== lastSignature) {
      exportService.markStale();
      render('stale');
      lastSignature = signature;
    }
  });
  render('idle');
  return {
    request,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stop();
      root.removeEventListener('click', click);
      if (ownsDownloadAdapter) downloadAdapter.destroy();
      if (ownsExportService) exportService.destroy();
      render('destroyed');
    }
  };
}
