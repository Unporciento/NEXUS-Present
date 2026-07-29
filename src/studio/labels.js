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

export const layoutLabels = Object.freeze({
  hero: 'Destacado',
  centered: 'Centrado',
  split: 'Dividido',
  comparison: 'Comparación',
  'media-left': 'Multimedia a la izquierda',
  'media-right': 'Multimedia a la derecha',
  'metric-focus': 'Métrica destacada',
  'quote-focus': 'Cita destacada',
  'evidence-grid': 'Cuadrícula de evidencias',
  'closing-callout': 'Cierre destacado'
});

export const layoutLabel = (layout) => layoutLabels[layout] ?? 'Diseño estándar';
