const ascii = (bytes, start, length) =>
  String.fromCharCode(...bytes.slice(start, start + length));

export function detectMime(bytes) {
  if (
    bytes[0] === 0x89 && ascii(bytes, 1, 3) === 'PNG'
    && bytes[4] === 0x0d && bytes[5] === 0x0a
  ) return 'image/png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'image/webp';
  if (ascii(bytes, 4, 4) === 'ftyp') return 'video/mp4';
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return 'video/webm';
  }
  const prefix = new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, 256))
    .replace(/^\uFEFF/, '')
    .trimStart();
  if (/^(?:<\?xml[^>]*>\s*)?<svg(?:\s|>)/i.test(prefix)) return 'image/svg+xml';
  if (/^WEBVTT(?:\s|$)/.test(prefix)) return 'text/vtt';
  return 'application/octet-stream';
}

export function readRasterDimensions(bytes, mime) {
  if (mime === 'image/png' && bytes.length >= 24) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (mime !== 'image/jpeg') return {};
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    const length = (bytes[offset + 2] << 8) + bytes[offset + 3];
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc9, 0xca, 0xcb].includes(marker)) {
      return {
        height: (bytes[offset + 5] << 8) + bytes[offset + 6],
        width: (bytes[offset + 7] << 8) + bytes[offset + 8]
      };
    }
    if (length < 2) break;
    offset += length + 2;
  }
  return {};
}
