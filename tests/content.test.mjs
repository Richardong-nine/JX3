import test from 'node:test';
import assert from 'node:assert/strict';
await import('../js/content.js');
const { siteContent, validateSiteContent } = globalThis.JX3Content;

test('site content exposes memorial metadata', () => {
  assert.equal(siteContent.level, 130);
  assert.ok(siteContent.title.includes('130'));
  assert.ok(Array.isArray(siteContent.chapters));
});

test('every enabled role has a unique id, name, faction, intro and image', () => {
  const roles = siteContent.chapters
    .filter((chapter) => chapter.enabled !== false)
    .flatMap((chapter) => chapter.people)
    .flatMap((person) => person.roles);

  assert.equal(new Set(roles.map((role) => role.id)).size, roles.length);
  for (const role of roles) {
    assert.ok(role.name.trim());
    assert.ok(role.faction.trim());
    assert.ok(role.intro.trim());
    assert.ok(role.image.src.trim());
    assert.match(role.image.position, /^(left|center|right)\s+(top|center|bottom)$/);
  }
});

test('single and couple chapter shapes validate', () => {
  assert.deepEqual(validateSiteContent(siteContent), []);
});

test('confirmed role factions and couple positions match the memorial roster', () => {
  const roles = siteContent.chapters.flatMap((chapter) => chapter.people).flatMap((person) => person.roles);
  const factions = Object.fromEntries(roles.map((role) => [role.name, role.faction]));

  assert.deepEqual(factions, {
    '三色团子': '万花',
    '唐无岳': '唐门',
    '蕉糕': '五毒',
    '落雪依情': '丐帮',
    '千月渊': '天策',
    '微微凉的广筑': '七秀',
    '广筑的微微凉': '唐门'
  });

  const couple = siteContent.chapters.find((chapter) => chapter.type === 'couple');
  assert.ok(couple, 'missing couple chapter');
  assert.deepEqual(couple.people.map((person) => person.roles[0].name), [
    '微微凉的广筑',
    '广筑的微微凉'
  ]);
});
