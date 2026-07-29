import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOnboardingPreference,
  ONBOARDING_KEY,
  ONBOARDING_VERSION
} from '../../src/studio/onboarding.js';
import { sceneLabel, sceneLabels } from '../../src/studio/labels.js';

function storage() {
  const values = new Map();
  const calls = [];
  return {
    values,
    calls,
    getItem(key) { calls.push(['get', key]); return values.get(key) ?? null; },
    setItem(key, value) { calls.push(['set', key, value]); values.set(key, value); },
    removeItem(key) { calls.push(['remove', key]); values.delete(key); }
  };
}

test('onboarding appears initially, can be completed or omitted and is versioned', () => {
  const local = storage();
  const preference = createOnboardingPreference({ storage: local });
  assert.equal(preference.shouldShow(), true);
  assert.equal(preference.markSeen(), true);
  assert.equal(preference.shouldShow(), false);
  assert.equal(local.values.get(ONBOARDING_KEY), ONBOARDING_VERSION);
  const upgraded = createOnboardingPreference({ storage: local, version: '2.0' });
  assert.equal(upgraded.shouldShow(), true);
});

test('onboarding can repeat and storage is limited to its single preference', () => {
  const local = storage();
  const preference = createOnboardingPreference({ storage: local });
  preference.markSeen();
  assert.equal(preference.reset(), true);
  assert.equal(preference.shouldShow(), true);
  assert.deepEqual([...local.values.keys()], []);
  assert.ok(local.calls.every((call) => call[1] === ONBOARDING_KEY));
  assert.doesNotMatch(JSON.stringify(local.calls), /draft|presentation|scene|history/);
});

test('onboarding remains usable when local preference storage is unavailable', () => {
  const broken = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); },
    removeItem() { throw new Error('blocked'); }
  };
  const preference = createOnboardingPreference({ storage: broken });
  assert.equal(preference.shouldShow(), true);
  assert.equal(preference.markSeen(), false);
  assert.equal(preference.reset(), false);
});

test('friendly scene labels preserve internal identifiers', () => {
  assert.deepEqual(sceneLabels, {
    cover: 'Portada',
    statement: 'Declaración',
    content: 'Contenido',
    media: 'Multimedia',
    comparison: 'Comparación',
    evidence: 'Evidencia',
    closing: 'Cierre'
  });
  assert.equal(sceneLabel('cover'), 'Portada');
  assert.equal(sceneLabel('unknown'), 'Escena');
  assert.equal(Object.keys(sceneLabels)[0], 'cover');
});
