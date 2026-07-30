import { createImportService } from '../import/import-service.js';
import { createStudioDraft } from '../studio/controller.js';
import { createBrowserDownloadAdapter } from '../studio/browser-download-adapter.js';
import { createBackupService } from '../storage/backup-service.js';

const escape = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));
const dateLabel = (value) => new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'medium',
  timeStyle: 'short'
}).format(new Date(value));

function shell() {
  return `<main class="library">
    <header>
      <div>
        <p class="brand">NEXUS <span class="studio-version">BIBLIOTECA</span></p>
        <h1>Mis presentaciones</h1>
        <p>Crea, importa y conserva borradores en este dispositivo.</p>
      </div>
      <button type="button" data-help>Ayuda</button>
    </header>
    <section class="library-actions" aria-labelledby="library-actions-title">
      <h2 id="library-actions-title">Comenzar</h2>
      <p>Empieza creando una presentación o importando un JSON público. Después podrás abrirla en NEXUS Studio.</p>
      <div class="studio-action-row">
        <button type="button" class="primary-action" data-new>Nueva presentación</button>
        <button type="button" data-import>Importar JSON</button>
        <button type="button" data-backup>Descargar respaldo</button>
        <button type="button" data-restore>Restaurar respaldo</button>
      </div>
      <input data-import-file hidden type="file" accept=".json,application/json">
      <input data-restore-file hidden type="file" accept=".json,application/json">
      <p id="library-status" role="status" aria-live="polite">Abriendo almacenamiento local…</p>
    </section>
    <section aria-labelledby="draft-list-title">
      <h2 id="draft-list-title">Borradores locales</h2>
      <div id="library-empty" class="empty-state" hidden>
        <h3>Tu biblioteca está vacía</h3>
        <p>Crea una presentación o importa un JSON exportado por NEXUS.</p>
        <button type="button" data-new>Crear primera presentación</button>
      </div>
      <ul id="draft-list" class="draft-list"></ul>
    </section>
    <aside class="privacy-note">
      <h2>Guardado local</h2>
      <p>Los borradores permanecen en este navegador. Descarga respaldos para protegerlos frente a limpieza o pérdida del dispositivo.</p>
    </aside>
    <footer>© ${new Date().getFullYear()} NEXUS. Todos los derechos reservados.</footer>
  </main>
  <dialog data-rename-dialog aria-labelledby="rename-title">
    <h2 id="rename-title">Renombrar presentación</h2>
    <label>Nuevo título <input data-rename-title maxlength="120"></label>
    <div class="studio-action-row">
      <button type="button" data-dialog-cancel>Cancelar</button>
      <button type="button" data-rename-confirm>Guardar nombre</button>
    </div>
  </dialog>
  <dialog data-delete-dialog aria-labelledby="delete-title">
    <h2 id="delete-title">Eliminar presentación</h2>
    <p data-delete-text></p>
    <div class="studio-action-row">
      <button type="button" data-dialog-cancel>Cancelar</button>
      <button type="button" data-delete-confirm>Eliminar</button>
    </div>
  </dialog>
  <dialog class="guidance-dialog" data-help-dialog aria-labelledby="library-help-title">
    <h2 id="library-help-title">Ayuda de la Biblioteca</h2>
    <p>Nueva presentación abre Studio. Importar JSON valida el archivo antes de crear un borrador.</p>
    <p>Renombrar, duplicar y eliminar afectan solo la copia local. Descargar respaldo conserva todos los borradores en un archivo privado.</p>
    <button type="button" data-help-close>Cerrar ayuda</button>
  </dialog>`;
}

function cards(records) {
  return records.map((record) => `<li class="draft-card">
    <div>
      <h3>${escape(record.title)}</h3>
      <p>Tema: ${escape(record.theme)} · Modificada ${escape(dateLabel(record.updatedAt))}</p>
      <p>Estado: ${record.status === 'editable' ? 'Lista para editar' : escape(record.status)}</p>
    </div>
    <div class="studio-action-row">
      <button type="button" class="primary-action" data-open="${escape(record.draftKey)}">Abrir</button>
      <button type="button" data-rename="${escape(record.draftKey)}">Renombrar</button>
      <button type="button" data-duplicate="${escape(record.draftKey)}">Duplicar</button>
      <button type="button" data-delete="${escape(record.draftKey)}">Eliminar</button>
    </div>
  </li>`).join('');
}

export function createLibraryApp(root, {
  repository,
  importService = createImportService(),
  backupService = createBackupService({ repository }),
  downloadAdapter = createBrowserDownloadAdapter(),
  navigate = (url) => globalThis.location.assign(url)
} = {}) {
  let destroyed = false;
  let records = [];
  let pending = null;
  let returnFocus = null;
  const removers = [];
  root.innerHTML = shell();
  const query = (selector) => root.querySelector?.(selector) ?? null;
  const status = (message) => { const node = query('#library-status'); if (node) node.textContent = message; };
  const on = (event, selector, action) => {
    const handler = (input) => {
      const target = input.target?.closest?.(selector);
      if (target) action(input, target);
    };
    root.addEventListener(event, handler);
    removers.push(() => root.removeEventListener(event, handler));
  };
  const refresh = async () => {
    const listed = await repository.list();
    if (!listed.ok) {
      status(listed.error.message);
      return false;
    }
    records = listed.value;
    query('#draft-list').innerHTML = cards(records);
    query('#library-empty').hidden = records.length > 0;
    status(records.length ? `${records.length} ${records.length === 1 ? 'borrador' : 'borradores'}.` : 'Biblioteca vacía.');
    return true;
  };
  const openDialog = (selector, origin) => {
    returnFocus = origin;
    const dialog = query(selector);
    dialog?.showModal?.();
    if (dialog && !dialog.open) dialog.setAttribute('open', '');
  };
  const closeDialogs = () => {
    root.querySelectorAll?.('dialog[open]').forEach((dialog) => dialog.close?.());
    returnFocus?.focus?.();
    returnFocus = null;
    pending = null;
  };
  const restoreFocus = () => {
    returnFocus?.focus?.();
    returnFocus = null;
    pending = null;
  };
  root.querySelectorAll?.('dialog').forEach((dialog) => {
    dialog.addEventListener?.('close', restoreFocus);
    removers.push(() => dialog.removeEventListener?.('close', restoreFocus));
  });
  on('click', '[data-new]', async () => {
    status('Creando presentación…');
    const created = await repository.create(createStudioDraft());
    if (created.ok) navigate(`studio.html?draft=${encodeURIComponent(created.value.draftKey)}`);
    else status(created.error.message);
  });
  on('click', '[data-open]', (_, button) => navigate(`studio.html?draft=${encodeURIComponent(button.dataset.open)}`));
  on('click', '[data-import]', () => query('[data-import-file]')?.click());
  on('change', '[data-import-file]', async (_, input) => {
    status('Validando archivo…');
    const imported = await importService.importFile(input.files?.[0]);
    if (!imported.ok) return status(imported.diagnostics?.[0]?.message ?? 'No fue posible importar.');
    const created = await repository.create(imported.sourceDocument, { draftKey: imported.draftKey });
    if (created.ok) navigate(`studio.html?draft=${encodeURIComponent(created.value.draftKey)}`);
    else status(created.error.message);
  });
  on('click', '[data-rename]', (_, button) => {
    pending = records.find((record) => record.draftKey === button.dataset.rename);
    query('[data-rename-title]').value = pending?.title ?? '';
    openDialog('[data-rename-dialog]', button);
    query('[data-rename-title]')?.focus();
  });
  on('click', '[data-rename-confirm]', async () => {
    const title = query('[data-rename-title]')?.value.trim();
    if (!title || !pending) return;
    const renamed = await repository.rename(pending.draftKey, title, pending.revision);
    closeDialogs();
    status(renamed.ok ? 'Presentación renombrada.' : renamed.error.message);
    await refresh();
  });
  on('click', '[data-duplicate]', async (_, button) => {
    const duplicated = await repository.duplicate(button.dataset.duplicate);
    status(duplicated.ok ? 'Copia creada.' : duplicated.error.message);
    await refresh();
  });
  on('click', '[data-delete]', (_, button) => {
    pending = records.find((record) => record.draftKey === button.dataset.delete);
    query('[data-delete-text]').textContent = `¿Eliminar “${pending?.title ?? 'esta presentación'}” de este dispositivo?`;
    openDialog('[data-delete-dialog]', button);
    query('[data-delete-confirm]')?.focus();
  });
  on('click', '[data-delete-confirm]', async () => {
    if (!pending) return;
    const removed = await repository.delete(pending.draftKey, pending.revision);
    closeDialogs();
    status(removed.ok ? 'Presentación eliminada.' : removed.error.message);
    await refresh();
  });
  on('click', '[data-dialog-cancel]', closeDialogs);
  on('click', '[data-help]', (_, button) => openDialog('[data-help-dialog]', button));
  on('click', '[data-help-close]', closeDialogs);
  on('click', '[data-backup]', async () => {
    status('Preparando respaldo…');
    const prepared = await backupService.exportAll();
    const downloaded = prepared.ok ? downloadAdapter.download(prepared) : prepared;
    status(downloaded.ok ? 'Respaldo descargado.' : downloaded.error.message);
  });
  on('click', '[data-restore]', () => query('[data-restore-file]')?.click());
  on('change', '[data-restore-file]', async (_, input) => {
    const file = input.files?.[0];
    if (!file || file.size > 50 * 1024 * 1024) return status('El respaldo no es válido o es demasiado grande.');
    try {
      status('Validando respaldo…');
      const restored = await backupService.restore(JSON.parse(await file.text()));
      status(restored.ok ? `${restored.restored} borradores restaurados como copias.` : restored.error.message);
      await refresh();
    } catch {
      status('El respaldo está dañado o incompleto.');
    }
  });
  repository.open().then(refresh);
  return {
    refresh,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      removers.forEach((remove) => remove());
      importService.destroy();
      downloadAdapter.destroy();
      repository.destroy();
      root.replaceChildren();
    }
  };
}
