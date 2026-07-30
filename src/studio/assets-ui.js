import { getSceneType } from '../contracts/index.js';

const messages = {
  idle: 'Las imágenes y videos se guardan solo en este dispositivo.',
  saving: 'Comprobando y guardando el recurso…',
  ready: 'Recurso añadido a la escena. Guarda el borrador para conservar la referencia.',
  error: 'No fue posible añadir el recurso.'
};

function markup() {
  return `<section class="asset-panel" aria-labelledby="asset-panel-title">
    <h3 id="asset-panel-title">Recursos locales</h3>
    <p>PNG, JPEG, WebP, SVG seguro, MP4, WebM o subtítulos WebVTT.</p>
    <label>Tipo
      <select data-asset-kind><option value="image">Imagen</option><option value="video">Vídeo</option><option value="captions">Subtítulos</option></select>
    </label>
    <label data-asset-purpose-label>Uso de la imagen
      <select data-asset-purpose><option value="content">Contenido de la escena</option><option value="poster">Poster del vídeo</option></select>
    </label>
    <label>Archivo
      <input data-asset-file type="file" accept=".png,.jpg,.jpeg,.webp,.svg,.mp4,.webm">
    </label>
    <label data-asset-alt-label>Descripción alternativa
      <input data-asset-alt maxlength="300" autocomplete="off">
    </label>
    <label>Título del recurso
      <input data-asset-title maxlength="120" autocomplete="off">
    </label>
    <button type="button" data-asset-import>Añadir a la escena seleccionada</button>
    <p data-asset-status role="status" aria-live="polite">${messages.idle}</p>
  </section>`;
}

const resourceEntry = (asset) => ({
  id: asset.assetId,
  type: asset.kind,
  mime: asset.mime,
  url: `nexus-asset:${asset.assetId}`,
  ...(asset.kind === 'image' ? { alt: asset.metadata.alt } : {}),
  ...(asset.metadata.title ? { title: asset.metadata.title } : {})
});

export function bindStudioAssets(root, {
  controller,
  repository,
  getDraftKey
} = {}) {
  const validation = root.querySelector('#validation-panel');
  validation?.insertAdjacentHTML?.('beforebegin', markup());
  const query = (selector) => root.querySelector(selector);
  const status = query('[data-asset-status]');
  const kind = query('[data-asset-kind]');
  const altLabel = query('[data-asset-alt-label]');
  const purposeLabel = query('[data-asset-purpose-label]');
  let destroyed = false;
  const onKind = () => {
    if (altLabel) altLabel.hidden = kind.value !== 'image';
    if (purposeLabel) purposeLabel.hidden = kind.value !== 'image';
    const file = query('[data-asset-file]');
    if (file) file.accept = ({
      image: '.png,.jpg,.jpeg,.webp,.svg',
      video: '.mp4,.webm',
      captions: '.vtt'
    })[kind.value];
  };
  const onImport = async () => {
    if (destroyed) return;
    const draftKey = getDraftKey();
    if (!draftKey) {
      status.textContent = 'Guarda primero el borrador para crear un espacio seguro para sus recursos.';
      query('[data-save]')?.focus();
      return;
    }
    const state = controller.getState();
    const scene = state.draft.scenes.find((item) => item.id === state.selectedSceneId);
    const definition = getSceneType(scene?.type);
    const purpose = query('[data-asset-purpose]').value;
    const blockKind = kind.value === 'captions' || purpose === 'poster' ? 'video' : kind.value;
    if (!scene || !definition?.blocks.includes(blockKind)) {
      status.textContent = kind.value === 'video'
        ? 'Selecciona una escena Multimedia para añadir este vídeo.'
        : blockKind === 'video'
          ? 'Selecciona una escena con un vídeo para asociar este recurso.'
          : 'Selecciona una escena compatible con imágenes.';
      return;
    }
    const targetVideo = scene.blocks.find((block) => block.type === 'video' && block.assetId);
    if ((kind.value === 'captions' || purpose === 'poster') && !targetVideo) {
      status.textContent = 'Añade primero el vídeo principal a esta escena.';
      return;
    }
    const file = query('[data-asset-file]').files?.[0];
    status.textContent = messages.saving;
    const imported = await repository.importAsset({
      draftKey,
      file,
      kind: kind.value,
      metadata: {
        alt: query('[data-asset-alt]').value.trim(),
        title: query('[data-asset-title]').value.trim(),
        ...(kind.value === 'video' ? { preload: 'metadata' } : {})
      }
    });
    if (!imported.ok) {
      status.textContent = `${messages.error} ${imported.error.message ?? ''}`.trim();
      return;
    }
    const added = controller.dispatch({ type: 'add-resource', resource: resourceEntry(imported.value) });
    if (!added.ok && added.error.code !== 'duplicate-resource') {
      status.textContent = messages.error;
      return;
    }
    const existing = blockKind === 'video' ? targetVideo ?? scene.blocks.find((block) => block.type === 'video') : scene.blocks.find((block) => block.type === kind.value);
    if (kind.value === 'captions' || purpose === 'poster') {
      const link = kind.value === 'captions' ? 'captionsAssetId' : 'posterAssetId';
      const blocks = scene.blocks.map((item) =>
        item.id === existing.id ? { ...item, [link]: imported.value.assetId } : item);
      const updated = controller.dispatch({ type: 'update-scene', id: scene.id, patch: { blocks } });
      status.textContent = updated.ok ? messages.ready : messages.error;
      return;
    }
    const block = {
      ...(existing ?? { id: `block-${scene.id}-${kind.value}`, type: kind.value }),
      assetId: imported.value.assetId,
      ...(kind.value === 'image' ? { alt: imported.value.metadata.alt } : {
        title: imported.value.metadata.title || 'Vídeo'
      })
    };
    const blocks = existing
      ? scene.blocks.map((item) => item.id === existing.id ? block : item)
      : [...scene.blocks, block];
    const updated = controller.dispatch({ type: 'update-scene', id: scene.id, patch: { blocks } });
    status.textContent = updated.ok ? messages.ready : messages.error;
  };
  kind?.addEventListener('change', onKind);
  query('[data-asset-import]')?.addEventListener('click', onImport);
  onKind();
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      kind?.removeEventListener('change', onKind);
      query('[data-asset-import]')?.removeEventListener('click', onImport);
    }
  };
}
