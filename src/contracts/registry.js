import { diagnostic, result } from './errors.js';

const SCENES = new Map();
const BLOCKS = new Map();

export const initialSceneTypes = [
  ['cover', ['hero'], ['heading']], ['statement', ['centered'], ['heading', 'paragraph']],
  ['content', ['stack', 'split'], ['heading', 'paragraph', 'list', 'image', 'metric']],
  ['media', ['full', 'split'], ['image', 'video', 'heading']], ['comparison', ['split'], ['comparison', 'heading']],
  ['evidence', ['stack'], ['metric', 'quote', 'image']], ['closing', ['centered'], ['heading', 'callToAction']]
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
