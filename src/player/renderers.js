export function createRendererRegistry() {
  const renderers = new Map();
  return { register(renderer) { renderers.set(renderer.typeId, renderer); }, get(typeId) { return renderers.get(typeId) ?? null; } };
}

export function createTextRenderers() {
  const text = (scene) => ({ title: scene.blocks.find((block) => block.type === 'heading')?.text ?? scene.type, body: scene.blocks.filter((block) => block.type === 'paragraph').map((block) => block.text).join('\n') });
  return ['cover', 'statement', 'content', 'closing'].map((typeId) => ({ typeId, contractVersion: '1.0.0', render: text, dispose() {} }));
}
