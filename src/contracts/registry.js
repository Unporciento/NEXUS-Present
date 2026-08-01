import { diagnostic, result } from './errors.js';

const SCENES = new Map();
const BLOCKS = new Map();

export const initialSceneTypes = [
  ['cover', ['hero','centered'], ['heading','paragraph']], ['statement', ['centered','quote-focus'], ['heading', 'paragraph','quote']],
  ['content', ['stack', 'split','centered','metric-focus'], ['heading', 'paragraph', 'list', 'image', 'metric']],
  ['media', ['media-left','media-right'], ['image', 'video', 'heading','paragraph']], ['comparison', ['comparison'], ['comparison', 'heading']],
  ['evidence', ['evidence-grid'], ['metric', 'quote', 'image']], ['closing', ['closing-callout','centered'], ['heading', 'callToAction']]
];

export const initialBlockTypes = ['heading', 'paragraph', 'list', 'image', 'metric', 'quote', 'comparison', 'video', 'callToAction'];

export function registerSceneType(definition) {
  if (!definition?.typeId || SCENES.has(definition.typeId)) return result([diagnostic('duplicate-scene-type', 'typeId', 'Scene type is already registered.')]);
  SCENES.set(definition.typeId, { contractVersion: '1.0.0', status: 'stable', capabilities: [], restrictions: [], ...definition });
  return result([], SCENES.get(definition.typeId));
}
export function getSceneType(typeId) { return SCENES.get(typeId) ?? null; }
export function registerBlockType(definition) {
  if (!definition?.typeId || BLOCKS.has(definition.typeId)) return result([diagnostic('duplicate-block-type', 'typeId', 'Block type is already registered.')]);
  BLOCKS.set(definition.typeId, { publicOnly: true, ...definition }); return result([], BLOCKS.get(definition.typeId));
}
export function getBlockType(typeId) { return BLOCKS.get(typeId) ?? null; }
export function createDefaultRegistry() {
  SCENES.clear(); BLOCKS.clear();
  initialBlockTypes.forEach((typeId) => registerBlockType({ typeId }));
  initialSceneTypes.forEach(([typeId, layouts, blocks]) => registerSceneType({ typeId, layouts, blocks, minimumEngineVersion: '1.0.0' }));
}
