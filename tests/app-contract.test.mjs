import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../js/app.js', import.meta.url), 'utf8');

test('app imports content validation and chapter rendering', () => {
  assert.match(source, /siteContent/);
  assert.match(source, /validateSiteContent/);
  assert.match(source, /renderChapterList/);
});

test('app mounts chapters and updates role count', () => {
  assert.match(source, /querySelector\(['"]#chapters['"]\)/);
  assert.match(source, /data-role-count/);
  assert.match(source, /innerHTML\s*=\s*renderChapterList/);
});

test('app releases the loader and handles failed media', () => {
  assert.match(source, /classList\.remove\(['"]is-loading['"]\)/);
  assert.match(source, /media-fallback/);
  assert.match(source, /addEventListener\(['"]error['"]/);
});
