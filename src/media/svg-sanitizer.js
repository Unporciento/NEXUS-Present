const forbiddenMarkup = /<(?:script|foreignObject|iframe|object|embed|audio|video|style)\b|<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/i;
const eventAttribute = /\son[a-z][\w:-]*\s*=/i;
const externalReference = /\b(?:href|xlink:href)\s*=\s*["'](?!#)[^"']+["']/i;
const unsafeUrl = /url\s*\(\s*(?!["']?#)[^)]+\)/i;

export function sanitizeSvgText(input) {
  const text = String(input ?? '').replace(/^\uFEFF/, '').trim();
  if (!/^<svg(?:\s|>)/i.test(text) || !/<\/svg>\s*$/i.test(text)) {
    return { ok: false, error: { code: 'svg-invalid', message: 'El SVG no tiene una estructura válida.' } };
  }
  if (
    forbiddenMarkup.test(text)
    || eventAttribute.test(text)
    || externalReference.test(text)
    || unsafeUrl.test(text)
    || /\bjavascript\s*:/i.test(text)
  ) {
    return { ok: false, error: { code: 'svg-unsafe', message: 'El SVG contiene código o referencias no permitidas.' } };
  }
  const value = text.replace(/<!--[\s\S]*?-->/g, '');
  return { ok: true, value };
}

export async function sanitizeSvgBlob(blob) {
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(await blob.arrayBuffer());
  } catch {
    return { ok: false, error: { code: 'svg-encoding-invalid', message: 'El SVG no utiliza UTF-8 válido.' } };
  }
  const sanitized = sanitizeSvgText(text);
  if (!sanitized.ok) return sanitized;
  return {
    ok: true,
    value: new Blob([sanitized.value], { type: 'image/svg+xml' })
  };
}
