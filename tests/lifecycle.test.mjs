import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const source = await readFile(new URL('../src/client.js', import.meta.url), 'utf8');

function loadPlugin() {
  let registration;
  const saved = new Map();
  const browser = {
    __ModuleLoader__: { load(value) { registration = value; } },
    localStorage: {
      getItem(key) { return saved.get(key) ?? null; },
      setItem(key, value) { saved.set(key, value); },
    },
  };
  runInNewContext(source, { window: browser });
  assert.equal(registration.id, '@local/dsh-rescue-buddy');
  const imported = [];
  const React = {
    createElement(type, props, ...children) { return { type, props, children }; },
    useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot(); },
    useState(initial) { return [initial, () => {}]; },
  };
  const plugin = registration.factory((name) => { imported.push(name); return React; });
  assert.deepEqual(imported, ['react'], 'no runtime downloads or bundled second React');
  return { plugin, saved };
}

test('theme follows local settings and unload restores prior token layer', () => {
  const { plugin, saved } = loadPlugin();
  const effects = [];
  const slots = new Map();
  let applies = 0;
  let removes = 0;
  const ctx = {
    theme: { overrideTokens(source, tokens) {
      assert.equal(source, 'rescue-buddy');
      assert.equal(typeof tokens, 'object');
      assert.equal(tokens['--dsw-alias-brand-primary'].light, '#8272c9');
      applies++;
      return () => { removes++; };
    } },
    effect(run) { effects.push(run()); },
    slots: {
      inject(name, run) { run(); },
      register(options, render) { slots.set(options.name, render); return () => {}; },
    },
  };
  plugin.apply(ctx);
  assert.equal(applies, 1, 'theme starts with enabled local defaults');
  assert.deepEqual([...slots.keys()], ['shell.overlay', 'settings.general.item']);
  const settings = slots.get('settings.general.item')().type();
  const inputs = settings.children.filter((child) => child?.type === 'label')
    .map((label) => label.children.find((child) => child?.type === 'input'));
  assert.equal(inputs.length, 3);
  inputs[2].props.onChange({ target: { value: '0.5' } });
  assert.equal(JSON.parse(saved.get('dsh-rescue-buddy:preferences')).opacity, .5);
  assert.equal(applies, 1, 'opacity does not churn theme registration');
  inputs[0].props.onChange({ target: { checked: false } });
  assert.equal(removes, 1, 'disable releases exactly our override');
  inputs[0].props.onChange({ target: { checked: true } });
  assert.equal(applies, 2);
  for (const dispose of effects.reverse()) dispose?.();
  assert.equal(removes, 2, 'unload releases the second override');
});
