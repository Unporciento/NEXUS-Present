import { diagnostic, result } from './errors.js';
import { validatePublicPresentation, validateSourcePresentation } from './presentation.js';

const PUBLIC_FIELDS = ['contractVersion','id','version','minimumEngineVersion','maximumEngineVersion','title','description','author','holder','createdAt','updatedAt','theme','metadata','rights','navigation','resources','scenes'];

export function createPublicPresentation(source, engineVersion = '1.0.0') {
  const sourceResult = validateSourcePresentation(source, engineVersion);
  if (!sourceResult.valid) return result(sourceResult.diagnostics);
  const output = Object.fromEntries(PUBLIC_FIELDS.filter((key) => key in source).map((key) => [key, structuredClone(source[key])]));
  output.resources = (output.resources ?? []).filter((asset) => !asset.private);
  const allowed = new Set(output.resources.map((asset) => asset.id));
  const privateReference = output.scenes.flatMap((scene) => scene.blocks ?? []).find((block) => block.assetId && !allowed.has(block.assetId));
  if (privateReference) return result([diagnostic('private-asset-reference', 'scenes', 'Public scene references a private or unavailable asset.')]);
  const publicResult = validatePublicPresentation(output, engineVersion);
  return result(publicResult.diagnostics, publicResult.valid ? output : undefined);
}
