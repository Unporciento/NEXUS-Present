export const sceneLabels = Object.freeze({
  cover: 'Portada',
  statement: 'Declaración',
  content: 'Contenido',
  media: 'Multimedia',
  comparison: 'Comparación',
  evidence: 'Evidencia',
  closing: 'Cierre'
});

export const sceneLabel = (type) => sceneLabels[type] ?? 'Escena';
