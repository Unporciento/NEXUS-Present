import { getSceneType } from '../contracts/index.js';
import { applyTheme, themes } from '../themes/themes.js';
import { createStudioController } from './controller.js';
import { bindStudioExport } from './export-ui.js';
import { bindStudioGuidance } from './guidance-ui.js';
import { layoutLabel, sceneLabel } from './labels.js';
import { createPreviewBridge } from './preview-bridge.js';

const sceneTypes = ['cover', 'statement', 'content', 'media', 'comparison', 'evidence', 'closing'];
const escape = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));
const previewMessages = {
  idle: 'Vista previa sin generar.',
  validating: 'Validando la presentación…',
  invalid: 'Corrige los errores antes de previsualizar.',
  transforming: 'Preparando una copia pública segura…',
  rendering: 'Iniciando el Player…',
  ready: 'Vista previa actualizada.',
  stale: 'La vista previa está desactualizada. Actualízala para ver los cambios.',
  'recoverable-error': 'No fue posible mostrar la vista previa. Puedes intentarlo nuevamente.',
  'fatal-error': 'La vista previa no está disponible en esta sesión.',
  destroyed: 'Vista previa cerrada.'
};

function shell() {
  return `<main class="studio" data-studio-view="edit">
    <header>
      <div>
        <p class="brand">NEXUS STUDIO <span class="studio-version">1.0</span></p>
        <p class="studio-description">Crea, guarda, valida y previsualiza presentaciones web estructuradas.</p>
      </div>
      <div class="studio-header-actions">
        <p id="studio-status" role="status"></p>
        <p id="save-status" role="status" aria-live="polite"></p>
        <button type="button" class="primary-action" data-save>Guardar</button>
        <a class="button-link" href="library.html">Biblioteca</a>
        <button type="button" data-help>Ayuda</button>
      </div>
    </header>
    <nav class="studio-mode" aria-label="Vista del Studio">
      <button type="button" data-show-edit aria-pressed="true">Editar</button>
      <button type="button" data-show-preview aria-pressed="false">Previsualizar</button>
    </nav>
    <div class="studio-workspace">
      <section class="studio-editing" aria-labelledby="studio-editor-title">
        <div class="studio-grid">
          <aside aria-labelledby="scene-list-title">
            <h2 id="scene-list-title">Escenas</h2>
            <button type="button" data-add>+ Añadir escena</button>
            <ol id="scene-list"></ol>
            <div id="scene-empty" class="empty-state" hidden>
              <p>Tu presentación necesita al menos una escena.</p>
              <button type="button" data-add>Añadir primera escena</button>
            </div>
          </aside>
          <section id="editor-panel" aria-labelledby="studio-editor-title"></section>
          <aside aria-labelledby="studio-actions-title">
            <h2 id="studio-actions-title">Acciones</h2>
            <div class="studio-action-row">
              <button type="button" data-undo>Deshacer</button>
              <button type="button" data-redo>Rehacer</button>
            </div>
            <button type="button" class="primary-action" data-preview>Previsualizar</button>
            <button type="button" class="primary-action" data-export>Descargar presentación</button>
            <button type="button" data-package-export>Descargar paquete portable</button>
            <small>Formato JSON para intercambio · ZIP para conservar el Player y los recursos.</small>
            <p id="export-status" role="status" aria-live="polite"></p>
            <p id="package-export-status" role="status" aria-live="polite"></p>
            <section id="validation-panel" class="validation-panel" aria-labelledby="validation-title"></section>
            <p>El borrador se guarda en este navegador. La publicación permanece fuera de esta fase.</p>
          </aside>
        </div>
      </section>
      <section id="studio-preview-panel" class="studio-preview-panel" aria-labelledby="preview-title" hidden>
        <header>
          <div>
            <p class="eyebrow">PLAYER REAL</p>
            <h2 id="preview-title">Vista previa</h2>
          </div>
          <div class="studio-action-row">
            <button type="button" data-refresh-preview>Actualizar</button>
            <button type="button" data-close-preview>Cerrar vista previa</button>
          </div>
        </header>
        <p id="preview-status" role="status" aria-live="polite"></p>
        <div id="preview-host" class="preview-host" tabindex="-1" aria-label="Vista previa de la presentación"></div>
      </section>
    </div>
    <footer>© ${new Date().getFullYear()} NEXUS. Todos los derechos reservados.</footer>
  </main>
  <dialog data-confirm aria-labelledby="confirm-title">
    <h2 id="confirm-title">Eliminar escena</h2>
    <p data-confirm-text></p>
    <form method="dialog">
      <button value="cancel">Cancelar</button>
      <button data-confirm-delete value="delete">Eliminar</button>
    </form>
  </dialog>
  <dialog class="guidance-dialog" data-onboarding aria-labelledby="onboarding-title">
    <p class="eyebrow">PRIMEROS PASOS · VERSIÓN 1.0</p>
    <h2 id="onboarding-title">Bienvenido a NEXUS Studio</h2>
    <p>Crea, guarda, valida y previsualiza presentaciones web estructuradas.</p>
    <ol>
      <li>Define el título, la descripción y el tema.</li>
      <li>Añade escenas y edita su contenido.</li>
      <li>Guarda el borrador en este dispositivo.</li>
      <li>Corrige los avisos del panel Validación.</li>
      <li>Previsualiza o descarga la presentación pública.</li>
    </ol>
    <p>El tutorial puede repetirse en cualquier momento desde Ayuda.</p>
    <div class="studio-action-row">
      <button type="button" data-dialog-start data-onboarding-close>Omitir</button>
      <button type="button" class="primary-action" data-onboarding-close>Comenzar</button>
    </div>
  </dialog>
  <dialog class="guidance-dialog" data-help-dialog aria-labelledby="help-title">
    <h2 id="help-title">Ayuda de NEXUS Studio</h2>
    <p>Empieza con los datos generales, añade escenas y guarda antes de volver a la Biblioteca.</p>
    <details open><summary>Tipos de escenas</summary>
      <p>Portada, Declaración, Contenido, Multimedia, Comparación, Evidencia y Cierre.</p>
    </details>
    <details><summary>Temas y vista previa</summary>
      <p>Elige Nexus o Neutral. Actualiza la vista previa después de editar.</p>
    </details>
    <details><summary>Guardado y descarga</summary>
      <p>Guardar conserva el borrador privado local. Descargar genera un JSON público sin estado interno.</p>
    </details>
    <details><summary>Preguntas frecuentes</summary>
      <p>Si aparece un error, activa su mensaje para volver al campo correspondiente.</p>
    </details>
    <div class="studio-action-row">
      <button type="button" data-dialog-start data-repeat-onboarding>Repetir tutorial</button>
      <button type="button" data-help-close>Cerrar ayuda</button>
    </div>
  </dialog>`;
}

function sceneEditor(scene) {
  if (!scene) {
    return `<h1 id="studio-editor-title">Editar presentación</h1>
      <p>Selecciona una escena o añade una nueva.</p>`;
  }
  const definition = getSceneType(scene.type);
  const heading = scene.blocks.find((block) => block.type === 'heading');
  const paragraph = scene.blocks.find((block) => block.type === 'paragraph');
  return `<h1 id="studio-editor-title">Editar presentación</h1>
    <section aria-labelledby="scene-editor-title">
      <h2 id="scene-editor-title">${escape(sceneLabel(scene.type))}</h2>
      <label>Diseño
        <select data-layout>${definition.layouts.map((layout) =>
          `<option value="${escape(layout)}" ${layout === scene.layout ? 'selected' : ''}>${escape(layoutLabel(layout))}</option>`).join('')}</select>
      </label>
      ${heading ? `<label>Título <input data-block="${escape(heading.id)}" value="${escape(heading.text)}"></label>` : ''}
      ${paragraph ? `<label>Texto <textarea data-block="${escape(paragraph.id)}">${escape(paragraph.text)}</textarea></label>` : ''}
      <p>Edita los campos disponibles para personalizar esta escena.</p>
    </section>`;
}

function editorContent(state) {
  const draft = state.draft;
  const selected = draft.scenes.find((scene) => scene.id === state.selectedSceneId);
  return `<h1 id="studio-editor-title">Editar presentación</h1>
    <label>Título <input data-meta="title" value="${escape(draft.title)}"></label>
    <label>Descripción <textarea data-meta="description">${escape(draft.description)}</textarea></label>
    <label>Tema
      <select data-theme>${Object.keys(themes).map((theme) =>
        `<option ${theme === draft.theme ? 'selected' : ''}>${escape(theme)}</option>`).join('')}</select>
    </label>
    ${selected ? sceneEditor(selected).replace('<h1 id="studio-editor-title">Editar presentación</h1>', '') :
      '<div class="empty-state"><p>Selecciona una escena para editarla o añade una nueva.</p><button type="button" data-add>Añadir escena</button></div>'}`;
}

function diagnosticsContent(state) {
  const diagnostics = state.validation.diagnostics;
  const errors = diagnostics.filter((item) => item.severity === 'error');
  if (!diagnostics.length) {
    return `<h3 id="validation-title">Validación</h3>
      <p class="validation-ok">Presentación válida · 0 errores</p>`;
  }
  return `<h3 id="validation-title">Validación</h3>
    <p class="validation-error">Presentación inválida · ${errors.length} ${errors.length === 1 ? 'error' : 'errores'}</p>
    <ul>${diagnostics.map((item) => `<li>
      <button type="button" class="validation-link" data-error-path="${escape(item.path)}">
        ${escape(readableDiagnostic(item))}
      </button>
    </li>`).join('')}</ul>`;
}

function readableDiagnostic(diagnostic) {
  const area = diagnostic.path.startsWith('scenes') ? 'Escena' :
    diagnostic.path.startsWith('resources') ? 'Recurso' : 'Presentación';
  const messages = {
    'invalid-title': 'El título es obligatorio.',
    'invalid-scenes': 'Añade al menos una escena.',
    'duplicate-identifier': 'Hay identificadores repetidos.',
    'unsupported-layout': 'El layout no es compatible con la escena.',
    'unsupported-block': 'Un bloque no es compatible con la escena.',
    'missing-asset': 'Falta un recurso utilizado por una escena.'
  };
  return `${area}: ${messages[diagnostic.code] ?? diagnostic.message}`;
}

export function createStudioApp(root, {
  controller = createStudioController(),
  previewBridge = createPreviewBridge(),
  ownsController = true,
  ownsPreviewBridge = true
} = {}) {
  let destroyed = false;
  let pendingRemoval = null;
  let removalOrigin = null;
  let previewOpen = false;
  let draftSignature = null;
  const removers = [];
  root.innerHTML = shell();
  const query = (selector) => root.querySelector?.(selector) ?? null;
  const on = (event, selector, action) => {
    const handler = (input) => {
      const element = input.target?.closest?.(selector);
      if (element) action(input, element);
    };
    root.addEventListener(event, handler);
    removers.push(() => root.removeEventListener(event, handler));
  };

  const renderStudio = (state) => {
    if (destroyed) return;
    applyTheme(root, state.draft.theme);
    const signature = JSON.stringify(state.draft);
    if (draftSignature !== null && signature !== draftSignature) previewBridge.markStale();
    draftSignature = signature;
    const status = query('#studio-status');
    if (status) status.textContent = `${state.valid ? 'Presentación válida' : 'Presentación con errores'} · ${state.dirty ? 'Cambios pendientes' : 'Sin cambios'}`;
    const list = query('#scene-list');
    if (list) list.innerHTML = state.draft.scenes.map((scene, index) => `<li>
      <button type="button" data-select="${escape(scene.id)}" aria-pressed="${scene.id === state.selectedSceneId}">${index + 1}. ${escape(sceneLabel(scene.type))}</button>
      <button type="button" data-up="${escape(scene.id)}" aria-label="Subir escena ${index + 1}" ${index ? '' : 'disabled'}>↑</button>
      <button type="button" data-down="${escape(scene.id)}" aria-label="Bajar escena ${index + 1}" ${index < state.draft.scenes.length - 1 ? '' : 'disabled'}>↓</button>
      <button type="button" data-remove="${escape(scene.id)}">Eliminar</button>
    </li>`).join('');
    const empty = query('#scene-empty');
    if (empty) empty.hidden = state.draft.scenes.length > 0;
    const editor = query('#editor-panel');
    if (editor) editor.innerHTML = editorContent(state);
    const validation = query('#validation-panel');
    if (validation) validation.innerHTML = diagnosticsContent(state);
    const undo = query('[data-undo]');
    const redo = query('[data-redo]');
    if (undo) undo.disabled = !state.canUndo;
    if (redo) redo.disabled = !state.canRedo;
  };

  const renderPreview = (previewState) => {
    const panel = query('#studio-preview-panel');
    if (panel) panel.hidden = !previewOpen;
    const status = query('#preview-status');
    if (status) status.textContent = previewMessages[previewState.status] ?? 'Estado de vista previa desconocido.';
    const refresh = query('[data-refresh-preview]');
    if (refresh) refresh.disabled = !previewState.canPreview;
    const trigger = query('[data-preview]');
    if (trigger) trigger.textContent = previewState.status === 'stale' ? 'Actualizar vista previa' : 'Previsualizar';
    const main = query('.studio');
    if (main) {
      main.dataset.previewState = previewState.status;
      main.dataset.previewOpen = String(previewOpen);
    }
  };

  const requestPreview = () => {
    previewOpen = true;
    const state = controller.getState();
    const result = previewBridge.preview(state.draft, query('#preview-host'));
    renderPreview(previewBridge.getState());
    if (result.ok) {
      query('.studio').dataset.studioView = 'preview';
      query('[data-show-edit]')?.setAttribute('aria-pressed', 'false');
      query('[data-show-preview]')?.setAttribute('aria-pressed', 'true');
      query('#preview-host')?.focus();
    } else {
      query('#validation-panel')?.focus?.();
    }
  };

  const focusDiagnostic = (path) => {
    if (path === 'title') return query('[data-meta="title"]')?.focus();
    const match = /^scenes\[(\d+)\]/.exec(path);
    if (!match) return query('#editor-panel')?.focus?.();
    const scene = controller.getState().draft.scenes[Number(match[1])];
    if (scene) {
      controller.selectScene(scene.id);
      query(`[data-select="${scene.id}"]`)?.focus();
    }
  };

  on('input', '[data-meta]', (_, element) =>
    controller.dispatch({ type: 'set-metadata', field: element.dataset.meta, value: element.value }));
  on('change', '[data-theme]', (_, element) =>
    controller.dispatch({ type: 'set-theme', theme: element.value }));
  on('change', '[data-layout]', (_, element) => {
    const state = controller.getState();
    controller.dispatch({ type: 'update-scene', id: state.selectedSceneId, patch: { layout: element.value } });
  });
  on('input', '[data-block]', (_, element) => {
    const state = controller.getState();
    const scene = state.draft.scenes.find((item) => item.id === state.selectedSceneId);
    const blocks = scene.blocks.map((block) =>
      block.id === element.dataset.block ? { ...block, text: element.value } : block);
    controller.dispatch({ type: 'update-scene', id: scene.id, patch: { blocks } });
  });
  on('click', '[data-select]', (_, element) => controller.selectScene(element.dataset.select));
  on('click', '[data-up]', (_, element) => {
    const state = controller.getState();
    const index = state.draft.scenes.findIndex((scene) => scene.id === element.dataset.up);
    controller.dispatch({ type: 'move-scene', id: element.dataset.up, to: index - 1 });
  });
  on('click', '[data-down]', (_, element) => {
    const state = controller.getState();
    const index = state.draft.scenes.findIndex((scene) => scene.id === element.dataset.down);
    controller.dispatch({ type: 'move-scene', id: element.dataset.down, to: index + 1 });
  });
  on('click', '[data-add]', () => {
    const state = controller.getState();
    const type = sceneTypes.find((candidate) => !state.draft.scenes.some((scene) => scene.type === candidate)) ?? 'content';
    controller.dispatch({ type: 'add-scene', sceneType: type });
    controller.selectScene(controller.getState().draft.scenes.at(-1).id);
  });
  on('click', '[data-remove]', (_, element) => {
    removalOrigin = element;
    pendingRemoval = element.dataset.remove;
    const dialog = query('[data-confirm]');
    const scene = controller.getState().draft.scenes.find((item) => item.id === pendingRemoval);
    const text = dialog?.querySelector('[data-confirm-text]');
    if (text) text.textContent = `¿Eliminar la escena ${sceneLabel(scene?.type)}?`;
    dialog?.showModal?.();
    if (dialog && !dialog.open) dialog.setAttribute('open', '');
    dialog?.querySelector('[data-confirm-delete]')?.focus();
  });
  on('click', '[value="cancel"]', () => {
    pendingRemoval = null;
    removalOrigin?.focus();
    removalOrigin = null;
  });
  on('click', '[data-confirm-delete]', () => {
    if (pendingRemoval) controller.dispatch({ type: 'remove-scene', id: pendingRemoval });
    pendingRemoval = null;
    removalOrigin = null;
    query('[data-add]')?.focus();
  });
  on('click', '[data-undo]', () => controller.undo());
  on('click', '[data-redo]', () => controller.redo());
  on('click', '[data-preview]', requestPreview);
  on('click', '[data-refresh-preview]', requestPreview);
  on('click', '[data-close-preview]', () => {
    previewBridge.close();
    previewOpen = false;
    query('.studio').dataset.studioView = 'edit';
    renderPreview(previewBridge.getState());
    query('[data-preview]')?.focus();
  });
  on('click', '[data-show-edit]', (_, element) => {
    query('.studio').dataset.studioView = 'edit';
    element.setAttribute('aria-pressed', 'true');
    query('[data-show-preview]')?.setAttribute('aria-pressed', 'false');
  });
  on('click', '[data-show-preview]', (_, element) => {
    if (!previewOpen) requestPreview();
    query('.studio').dataset.studioView = 'preview';
    element.setAttribute('aria-pressed', 'true');
    query('[data-show-edit]')?.setAttribute('aria-pressed', 'false');
  });
  on('click', '[data-error-path]', (_, element) => focusDiagnostic(element.dataset.errorPath));

  const stopController = controller.subscribe(renderStudio);
  const stopPreview = previewBridge.subscribe(renderPreview);
  const exportUi = bindStudioExport(root, controller);
  const guidanceUi = bindStudioGuidance(root);
  renderStudio(controller.getState());
  renderPreview(previewBridge.getState());

  return {
    preview: requestPreview,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stopController();
      stopPreview();
      exportUi.destroy();
      guidanceUi.destroy();
      removers.forEach((remove) => remove());
      if (ownsPreviewBridge) previewBridge.destroy();
      if (ownsController) controller.destroy();
      root.replaceChildren();
    }
  };
}
