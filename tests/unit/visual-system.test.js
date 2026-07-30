import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyTheme, themes, validateTheme } from '../../src/themes/themes.js'; import { validateLayout } from '../../src/layouts/layouts.js'; import { createVisualRenderers } from '../../src/player/renderers.js'; import { demoPresentation } from '../../demo/public-demo.js';
import { resourceFallback, resourceStates } from '../../src/media/resource-state.js';
test('themes validate and apply required tokens', () => { const target = { style:{ setProperty(){} }, dataset:{} }; assert.equal(validateTheme(themes.nexus).valid,true); assert.equal(validateTheme({id:'bad',tokens:{}}).valid,false); assert.equal(applyTheme(target,'nexus').valid,true); });
test('both themes define legible control, status, focus and footer tokens',()=>{for(const theme of Object.values(themes)){for(const token of ['--nx-text','--nx-muted','--nx-border','--nx-control','--nx-control-text','--nx-disabled','--nx-focus','--nx-status','--nx-footer'])assert.ok(theme.tokens[token]);assert.notEqual(theme.tokens['--nx-control-text'],'black');}});
test('each theme owns its depth color without a fixed Player background',()=>{for(const theme of Object.values(themes))assert.ok(theme.tokens['--nx-depth']);const css=readFileSync(new URL('../../styles.css',import.meta.url),'utf8');assert.match(css,/var\(--nx-depth\)/);assert.doesNotMatch(css,/radial-gradient\([^)]*#1a3154/);});
test('layouts and renderers accept the public demo', () => { const renderers = createVisualRenderers(); demoPresentation.scenes.forEach((scene) => { const layout = scene.layout === 'hero' ? 'centered' : scene.layout; assert.equal(validateLayout(layout,scene.blocks).valid,true); assert.match(renderers.find((renderer)=>renderer.typeId===scene.type).render(scene).html,/scene/); }); assert.equal(validateLayout('comparison',[{type:'paragraph'}]).valid,false); });
test('every Studio default layout has a renderer contract', () => {
  assert.equal(validateLayout('stack', [{ type: 'heading' }, { type: 'paragraph' }]).valid, true);
});
test('resource fixtures expose accessible safe states', () => { assert.deepEqual(resourceStates,['idle','loading','ready','failed','unsupported']); assert.match(resourceFallback('failed').message,/no está disponible/); assert.equal(resourceFallback('unsupported').recoverable,true); });
