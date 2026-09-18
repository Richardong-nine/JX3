import test from 'node:test';
import assert from 'node:assert/strict';
await import('../js/render.js');
const { renderChapter, renderChapterList, escapeHtml } = globalThis.JX3Render;

const role = (id, name) => ({
  id,
  name,
  faction: '七秀',
  intro: `${name} 的角色简介`,
  image: { src: `./image/${name}.png`, alt: name, position: 'center top' }
});

test('escapes user-provided text before rendering', () => {
  assert.equal(escapeHtml('<script>&"\''), '&lt;script&gt;&amp;&quot;&#39;');
});

test('single chapter overlays the role name on its visual stage', () => {
  const html = renderChapter({ id: 'one', type: 'single', label: '故人录', people: [{ id: 'p1', roles: [role('r1', '角色一')] }] }, 0);
  assert.match(html, /data-role-id="r1"/);
  assert.match(html, /class="role-name"[^>]*>角色一</);
  assert.match(html, /七秀/);
  assert.match(html, /角色一 的角色简介/);
});

test('multi chapter exposes scroll steps and role count', () => {
  const html = renderChapter({ id: 'many', type: 'multi', label: '故人录', people: [{ id: 'p1', roles: [role('r1', '一'), role('r2', '二')] }] }, 1);
  assert.equal((html.match(/class="role-step"/g) ?? []).length, 2);
  assert.match(html, /02 ROLES/);
  assert.match(html, /data-role-index="1"/);
});

test('couple chapter keeps two people inside one shared section', () => {
  const html = renderChapter({ id: 'pair', type: 'couple', label: '双人共同章', people: [
    { id: 'left', roles: [role('l1', '左一')] },
    { id: 'right', roles: [role('r1', '右一'), role('r2', '右二')] }
  ] }, 2);
  assert.match(html, /chapter--couple/);
  assert.match(html, /data-side="left"/);
  assert.match(html, /data-side="right"/);
  assert.equal((html.match(/class="couple-step"/g) ?? []).length, 2);
});

test('chapter list renders only enabled chapters in order', () => {
  const html = renderChapterList([
    { id: 'off', type: 'single', enabled: false, label: '不显示', people: [{ id: 'p', roles: [role('off-role', '不显示')] }] },
    { id: 'on', type: 'single', enabled: true, label: '显示', people: [{ id: 'p2', roles: [role('on-role', '显示')] }] }
  ]);
  assert.doesNotMatch(html, /不显示/);
  assert.match(html, /显示/);
});
