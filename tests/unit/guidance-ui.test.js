import test from 'node:test';
import assert from 'node:assert/strict';
import { bindStudioGuidance } from '../../src/studio/guidance-ui.js';

function element(matches = () => false) {
  return {
    open: false,
    focused: 0,
    matches,
    focus() { this.focused += 1; },
    showModal() { this.open = true; },
    close() { this.open = false; },
    setAttribute(name) { if (name === 'open') this.open = true; },
    removeAttribute(name) { if (name === 'open') this.open = false; },
    querySelector() { return this.start ?? null; }
  };
}

function setup(shouldShow = true) {
  const start = element();
  const onboarding = element();
  const help = element();
  onboarding.start = start;
  help.start = start;
  const listeners = new Set();
  const preference = {
    seen: 0, resetCount: 0,
    shouldShow: () => shouldShow,
    markSeen() { this.seen += 1; },
    reset() { this.resetCount += 1; }
  };
  const root = {
    querySelector(selector) {
      return selector === '[data-onboarding]' ? onboarding :
        selector === '[data-help-dialog]' ? help : null;
    },
    addEventListener(_, listener) { listeners.add(listener); },
    removeEventListener(_, listener) { listeners.delete(listener); }
  };
  return { root, preference, onboarding, help, listeners };
}

function click(listeners, target) {
  listeners.forEach((listener) => listener({ target: { closest: () => target } }));
}

test('guidance opens initial onboarding, closes it and destroys listeners', () => {
  const fixture = setup(true);
  const guidance = bindStudioGuidance(fixture.root, { preference: fixture.preference });
  assert.equal(fixture.onboarding.open, true);
  const close = element((selector) => selector === '[data-onboarding-close]');
  click(fixture.listeners, close);
  assert.equal(fixture.onboarding.open, false);
  assert.equal(fixture.preference.seen, 1);
  guidance.destroy();
  guidance.destroy();
  assert.equal(fixture.listeners.size, 0);
});

test('help opens, repeats onboarding and can close with focus return', () => {
  const fixture = setup(false);
  bindStudioGuidance(fixture.root, { preference: fixture.preference });
  const helpButton = element((selector) => selector === '[data-help]');
  click(fixture.listeners, helpButton);
  assert.equal(fixture.help.open, true);
  const repeat = element((selector) => selector === '[data-repeat-onboarding]');
  click(fixture.listeners, repeat);
  assert.equal(fixture.help.open, false);
  assert.equal(fixture.onboarding.open, true);
  assert.equal(fixture.preference.resetCount, 1);
});
