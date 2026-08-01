export const layouts = Object.freeze({
  centered: ['heading','paragraph','quote','callToAction'], split: ['heading','paragraph','image','list','metric','comparison'],
  stack: ['heading','paragraph','list','image','video','metric','quote','callToAction'],
  'media-left': ['heading','paragraph','image','video'], 'media-right': ['heading','paragraph','image','video'], comparison: ['heading','comparison'],
  'metric-focus': ['heading','metric','paragraph'], 'quote-focus': ['quote','heading'], 'evidence-grid': ['metric','quote','image'], 'closing-callout': ['heading','callToAction']
});
export function validateLayout(layout, blocks = []) { const allowed = layouts[layout]; return { valid: !!allowed && blocks.every(({ type }) => allowed.includes(type)), allowed: allowed ?? [] }; }
export function layoutClass(layout) { return layouts[layout] ? `layout-${layout}` : 'layout-centered'; }
