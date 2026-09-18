import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('document contains the required memorial landmarks', () => {
  for (const landmark of ['<header', '<main', 'id="group-portrait"', 'id="chapters"', '<footer']) {
    assert.ok(html.includes(landmark), `missing ${landmark}`);
  }
});

test('document loads its script entrypoints and exposes a no-script message', () => {
  assert.match(html, /<script defer src="\.\/js\/app\.js"><\/script>/);
  assert.match(html, /<noscript>/);
});

test('document includes mobile and theme metadata', () => {
  assert.match(html, /name="viewport"/);
  assert.match(html, /name="theme-color"/);
});

test('document uses ordered classic scripts so it can open from file protocol', () => {
  assert.doesNotMatch(html, /type="module"/);
  assert.doesNotMatch(html, /<body[^>]*class="is-loading"/);
  const scriptSources = [...html.matchAll(/<script defer src="([^"]+)"><\/script>/g)].map((match) => match[1]);
  assert.deepEqual(scriptSources, [
    './js/content.js',
    './js/render.js',
    './js/scroll.js',
    './js/app.js'
  ]);
});
