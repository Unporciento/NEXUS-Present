const interactive = new Set(['BUTTON','A','INPUT','TEXTAREA','SELECT']);
export function bindTouch(target, player, { threshold = 48 } = {}) {
  let start = null;
  const down = (event) => { if (interactive.has(event.target?.tagName) || event.target?.isContentEditable) return; const point = event.touches?.[0]; if (point) start = { x: point.clientX, y: point.clientY }; };
  const up = (event) => { const point = event.changedTouches?.[0]; if (!start || !point) return; const dx = point.clientX - start.x, dy = point.clientY - start.y; start = null; if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy) || globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return; if (dx < 0) player.next(); else player.previous(); };
  const cancel = () => { start = null; }; target.addEventListener('touchstart', down, { passive: true }); target.addEventListener('touchend', up, { passive: true }); target.addEventListener('touchcancel', cancel, { passive: true });
  return () => { target.removeEventListener('touchstart', down); target.removeEventListener('touchend', up); target.removeEventListener('touchcancel', cancel); };
}
