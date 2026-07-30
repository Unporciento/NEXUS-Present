import { diagnostic, result } from './errors.js';
import { duplicateDiagnostics, validateIdentifier } from './identifiers.js';

const MIME_BY_TYPE = { image: /^image\//, video: /^video\//, audio: /^audio\//, captions: /^text\/vtt$/ };
const safeUrl = /^(?:https:\/\/|nexus-asset:[A-Za-z0-9][A-Za-z0-9._-]{0,63}$|\.?\/?[A-Za-z0-9][A-Za-z0-9._/-]*)$/i;
export function validateAssets(assets = [], usedAssetIds = [], isPublic = false) {
  const diagnostics = [...duplicateDiagnostics(assets, 'id', 'assets')];
  const available = new Set(assets.map((asset) => asset?.id));
  usedAssetIds.filter((id) => !available.has(id)).forEach((id) => diagnostics.push(diagnostic('missing-asset', 'scenes', `Referenced asset ${id} does not exist.`)));
  assets.forEach((asset, index) => {
    const path = `assets[${index}]`; diagnostics.push(...validateIdentifier('assetId', asset?.id, `${path}.id`));
    if (!MIME_BY_TYPE[asset?.type]?.test(asset?.mime ?? '')) diagnostics.push(diagnostic('incompatible-asset-mime', `${path}.mime`, 'Asset MIME does not match its type.'));
    if (
      typeof asset?.url !== 'string'
      || !safeUrl.test(asset.url)
      || asset.url.includes('..')
      || asset.url.includes('\\')
    ) diagnostics.push(diagnostic('unsafe-asset-url', `${path}.url`, 'Asset URL is unsafe or local.'));
    if (asset?.type === 'image' && !asset?.alt) diagnostics.push(diagnostic('missing-alt-text', `${path}.alt`, 'Visual asset requires alternative text.'));
    if (isPublic && asset?.private) diagnostics.push(diagnostic('private-asset-public', path, 'Private asset cannot be public.'));
    if (!usedAssetIds.includes(asset?.id)) diagnostics.push(diagnostic('unused-asset', path, 'Asset is not referenced.', 'warning'));
  });
  return result(diagnostics);
}
