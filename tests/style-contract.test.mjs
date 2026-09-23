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


test('styles expose the etched jianghu texture system', () => {
  for (const selector of [
    '.jianghu-texture',
    '.prologue__atmosphere::before',
    '.group-portrait::before',
    '.chapter-header::before',
    '.role-visual::after',
    '.chapter--couple .chapter-stage::before',
    '.epilogue::after'
  ]) assert.ok(css.includes(selector), `missing ${selector}`);

  assert.match(css, /--texture-gold:/);
  assert.match(css, /@keyframes\s+formation-breathe/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*\.jianghu-texture/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*formation-breathe/);
});


test('styles implement scroll-driven jianghu echo silhouettes with safe fallbacks', () => {
  for (const selector of [
    '.role-echo--ink',
    '.role-echo--vermilion',
    '.role-visual__scan',
    '.chapter--couple .couple-role[data-side="left"]',
    '.chapter--couple .couple-role[data-side="right"]'
  ]) assert.ok(css.includes(selector), `missing ${selector}`);

  assert.match(css, /\.role-echo\s*\{[^}]*mix-blend-mode:\s*screen/s);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*\.role-echo--ink\s*\{[^}]*display:\s*none/s);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.role-echo[\s\S]*display:\s*none/s);
  assert.match(css, /--role-image-opacity:/);

  const echoSection = css.split('/* Jianghu residual silhouettes: scroll-driven ink and vermilion echoes */')[1] || '';
  assert.match(echoSection, /\.chapter\s*\{[^}]*--echo-ink-x:/s);
  assert.doesNotMatch(echoSection, /\.role-visual\s*\{[^}]*--echo-ink-x:/s);
});
