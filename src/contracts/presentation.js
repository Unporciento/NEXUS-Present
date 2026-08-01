import { diagnostic, result } from './errors.js';
import { duplicateDiagnostics, validateIdentifier } from './identifiers.js';
import { checkEngineCompatibility, validateSemver } from './semver.js';
import { getBlockType, getSceneType } from './registry.js';
import { validateAssets } from './assets.js';
import { ENGINE_VERSION } from '../version.js';

const SOURCE_FIELDS = new Set(['contractVersion','id','version','minimumEngineVersion','maximumEngineVersion','title','description','author','holder','createdAt','updatedAt','theme','metadata','rights','navigation','resources','scenes','presenter','editorial','history','privateData']);
const PUBLIC_FIELDS = new Set([...SOURCE_FIELDS].filter((key) => !['presenter','editorial','history','privateData'].includes(key)));
const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

function baseDiagnostics(document, fields, kind) {
  const diagnostics = [];
  if (!document || typeof document !== 'object' || Array.isArray(document)) return [diagnostic('invalid-document', '', 'Document must be an object.')];
  Object.keys(document).filter((key) => !fields.has(key) && !key.startsWith('x-')).forEach((key) => diagnostics.push(diagnostic('unknown-field', key, `Unknown ${kind} field.`, 'warning')));
  diagnostics.push(...validateSemver(document.contractVersion, 'contractVersion'), ...validateSemver(document.version, 'version'), ...validateIdentifier('presentationId', document.id, 'id'));
  if (typeof document.title !== 'string' || document.title.length < 1 || document.title.length > 120) diagnostics.push(diagnostic('invalid-title', 'title', 'Title must contain 1–120 characters.'));
  if (document.description && (typeof document.description !== 'string' || document.description.length > 500)) diagnostics.push(diagnostic('invalid-description', 'description', 'Description exceeds its limit.'));
  for (const field of ['createdAt','updatedAt']) if (!iso.test(document[field] ?? '')) diagnostics.push(diagnostic('invalid-date', field, 'Expected UTC ISO-8601 date.'));
  if (document.createdAt && document.updatedAt && document.updatedAt < document.createdAt) diagnostics.push(diagnostic('invalid-date-order', 'updatedAt', 'Updated date precedes created date.'));
  if (!Array.isArray(document.scenes) || document.scenes.length < 1 || document.scenes.length > 200) diagnostics.push(diagnostic('invalid-scenes', 'scenes', 'Expected 1–200 scenes.'));
  return diagnostics;
}

export function validateScene(scene, index) {
  const path = `scenes[${index}]`, diagnostics = [];
  diagnostics.push(...validateIdentifier('sceneId', scene?.id, `${path}.id`));
  const definition = getSceneType(scene?.type);
  if (!definition) return result([...diagnostics, diagnostic('unregistered-scene-type', `${path}.type`, 'Scene type is not registered.')]);
  if (!definition.layouts.includes(scene?.layout)) diagnostics.push(diagnostic('unsupported-layout', `${path}.layout`, 'Layout is not allowed for this scene.'));
  if (!Array.isArray(scene?.blocks)) diagnostics.push(diagnostic('invalid-blocks', `${path}.blocks`, 'Blocks must be an array.'));
  else {
    diagnostics.push(...duplicateDiagnostics(scene.blocks, 'id', `${path}.blocks`));
    scene.blocks.forEach((block, blockIndex) => {
      const blockPath = `${path}.blocks[${blockIndex}]`; diagnostics.push(...validateIdentifier('blockId', block?.id, `${blockPath}.id`));
      if (!getBlockType(block?.type)) diagnostics.push(diagnostic('unregistered-block-type', `${blockPath}.type`, 'Block type is not registered.'));
      else if (!definition.blocks.includes(block.type)) diagnostics.push(diagnostic('unsupported-block', `${blockPath}.type`, 'Block is not allowed in this scene.'));
    });
  }
  return result(diagnostics);
}

export function validateSourcePresentation(document, engineVersion = ENGINE_VERSION) {
  const diagnostics = baseDiagnostics(document, SOURCE_FIELDS, 'source');
  if (!document || typeof document !== 'object') return result(diagnostics);
  diagnostics.push(...checkEngineCompatibility({ minimumEngineVersion: document.minimumEngineVersion, maximumEngineVersion: document.maximumEngineVersion, engineVersion }));
  if (Array.isArray(document.scenes)) { diagnostics.push(...duplicateDiagnostics(document.scenes, 'id', 'scenes')); document.scenes.forEach((scene, index) => diagnostics.push(...validateScene(scene, index).diagnostics)); }
  const used = Array.isArray(document.scenes) ? document.scenes.flatMap((scene) => scene.blocks ?? []).flatMap((block) => [block.assetId, block.posterAssetId, block.captionsAssetId].filter(Boolean)) : [];
  diagnostics.push(...validateAssets(document.resources ?? [], used).diagnostics);
  return result(diagnostics);
}

export function validatePublicPresentation(document, engineVersion = ENGINE_VERSION) {
  const diagnostics = baseDiagnostics(document, PUBLIC_FIELDS, 'public');
  ['presenter','editorial','history','privateData'].forEach((field) => { if (field in (document ?? {})) diagnostics.push(diagnostic('private-field-public', field, 'Private field appears in public document.')); });
  if (document && typeof document === 'object') {
    diagnostics.push(...checkEngineCompatibility({ minimumEngineVersion: document.minimumEngineVersion, maximumEngineVersion: document.maximumEngineVersion, engineVersion }));
    if (Array.isArray(document.scenes)) { diagnostics.push(...duplicateDiagnostics(document.scenes, 'id', 'scenes')); document.scenes.forEach((scene, index) => diagnostics.push(...validateScene(scene, index).diagnostics)); }
    const used = (document.scenes ?? []).flatMap((scene) => scene.blocks ?? []).flatMap((block) => [block.assetId, block.posterAssetId, block.captionsAssetId].filter(Boolean));
    diagnostics.push(...validateAssets(document.resources ?? [], used, true).diagnostics);
  }
  return result(diagnostics);
}
