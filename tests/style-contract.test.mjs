import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../css/site.css', import.meta.url), 'utf8');

test('visual system exposes the approved memorial palette', () => {
  for (const token of [
    '--color-abyss: #050607',
    '--color-ink: #091014',
    '--color-paper: #e8e2d6',
    '--color-rust: #7d1618',
    '--color-gold: #a88c59'
  ]) assert.ok(css.includes(token), `missing ${token}`);
});

test('all three chapter templates have dedicated layouts', () => {
  assert.match(css, /\.chapter--single/);
  assert.match(css, /\.chapter--multi/);
  assert.match(css, /\.chapter--couple/);
  assert.match(css, /\.role-visual__name-wrap\s*\{[^}]*position:\s*absolute/s);
});

test('styles include mobile reconstruction and reduced-motion fallback', () => {
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /\.chapter--couple[\s\S]*grid-template-columns/);
});
