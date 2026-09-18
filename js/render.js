(() => {
'use strict';

const POSITION_PATTERN = /^(left|center|right)\s+(top|center|bottom)$/;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function imagePosition(value) {
  return POSITION_PATTERN.test(String(value ?? '')) ? value : 'center center';
}

function roleCountLabel(count) {
  return `${String(count).padStart(2, '0')} ${count === 1 ? 'ROLE' : 'ROLES'}`;
}

function renderRole(role, { index = 0, total = 1, side = '', stepClass = 'role-step' } = {}) {
  const image = role.image ?? {};
  const sideAttr = side ? ` data-side="${escapeHtml(side)}"` : '';
  const visualClass = side ? `role-visual role-visual--${escapeHtml(side)}` : 'role-visual';
  return `
    <article class="${stepClass}" data-role-id="${escapeHtml(role.id)}" data-role-index="${index}"${sideAttr}>
      <div class="${visualClass}" style="--object-position: ${escapeHtml(imagePosition(image.position))}">
        <img class="role-visual__image" src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt || role.name)}" loading="lazy" decoding="async">
        <div class="role-visual__veil" aria-hidden="true"></div>
        <div class="role-visual__name-wrap">
          <span class="role-progress">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
          <h3 class="role-name">${escapeHtml(role.name)}</h3>
        </div>
      </div>
      <div class="role-copy">
        <p class="role-faction">${escapeHtml(role.faction)}</p>
        <p class="role-intro">${escapeHtml(role.intro)}</p>
      </div>
    </article>`;
}

function renderChapterHeader(chapter, chapterIndex, roleCount) {
  const typeLabel = chapter.type === 'couple' ? 'TWO AS ONE' : chapter.type === 'multi' ? 'ONE COMPANION / MANY FORMS' : 'ONE ROLE / ONE MEMORY';
  return `
    <header class="chapter-header reveal">
      <p class="chapter-index">CHAPTER ${String(chapterIndex + 1).padStart(2, '0')} / ${escapeHtml(typeLabel)}</p>
      <p class="chapter-count">${roleCountLabel(roleCount)}</p>
      <h2>${escapeHtml(chapter.label || '故人录')}</h2>
    </header>`;
}

function getPeopleRoles(chapter) {
  return (chapter.people ?? []).map((person) => ({
    ...person,
    roles: (person.roles ?? []).filter((role) => role.enabled !== false)
  }));
}

function renderSingleChapter(chapter, index, roles) {
  return `
    <section class="chapter chapter--single" id="chapter-${escapeHtml(chapter.id)}" data-chapter-id="${escapeHtml(chapter.id)}" data-chapter-type="single" aria-labelledby="chapter-title-${escapeHtml(chapter.id)}">
      ${renderChapterHeader({ ...chapter, label: chapter.label || roles[0]?.name || '故人录' }, index, roles.length)}
      <div class="chapter-stage" id="chapter-title-${escapeHtml(chapter.id)}">
        ${renderRole(roles[0], { index: 0, total: 1 })}
      </div>
    </section>`;
}

function renderMultiChapter(chapter, index, roles) {
  const roleSteps = roles.map((role, roleIndex) => renderRole(role, { index: roleIndex, total: roles.length })).join('');
  return `
    <section class="chapter chapter--multi" id="chapter-${escapeHtml(chapter.id)}" data-chapter-id="${escapeHtml(chapter.id)}" data-chapter-type="multi" aria-labelledby="chapter-title-${escapeHtml(chapter.id)}">
      ${renderChapterHeader(chapter, index, roles.length)}
      <div class="chapter-stage" id="chapter-title-${escapeHtml(chapter.id)}">
        <div class="role-steps" data-role-count="${roles.length}">${roleSteps}</div>
      </div>
    </section>`;
}

function renderCoupleChapter(chapter, index, people) {
  const tracks = people.map((person, personIndex) => ({
    side: personIndex === 0 ? 'left' : 'right',
    roles: person.roles
  }));
  const totalSteps = Math.max(...tracks.map((track) => track.roles.length), 0);
  const steps = Array.from({ length: totalSteps }, (_, stepIndex) => `
    <div class="couple-step" data-couple-index="${stepIndex}">
      ${tracks.map((track) => {
        const role = track.roles[stepIndex];
        return role ? renderRole(role, { index: stepIndex, total: track.roles.length, side: track.side, stepClass: 'couple-role' }) : '';
      }).join('')}
    </div>`).join('');

  return `
    <section class="chapter chapter--couple" id="chapter-${escapeHtml(chapter.id)}" data-chapter-id="${escapeHtml(chapter.id)}" data-chapter-type="couple" aria-labelledby="chapter-title-${escapeHtml(chapter.id)}">
      ${renderChapterHeader(chapter, index, tracks.reduce((sum, track) => sum + track.roles.length, 0))}
      <div class="chapter-stage" id="chapter-title-${escapeHtml(chapter.id)}">
        <div class="couple-intro reveal"><p>两个人的江湖，从来不是两条孤立的路。</p></div>
        <div class="couple-line" aria-hidden="true"></div>
        <div class="couple-steps" data-couple-step-count="${totalSteps}">${steps}</div>
      </div>
    </section>`;
}

function renderChapter(chapter, index = 0) {
  const people = getPeopleRoles(chapter);
  const roles = people.flatMap((person) => person.roles);
  if (!roles.length) return '';
  if (chapter.type === 'couple') return renderCoupleChapter(chapter, index, people);
  if (chapter.type === 'multi' || roles.length > 1) return renderMultiChapter(chapter, index, roles);
  return renderSingleChapter(chapter, index, roles);
}

function renderChapterList(chapters = []) {
  return chapters
    .filter((chapter) => chapter?.enabled !== false)
    .map((chapter, index) => renderChapter(chapter, index))
    .join('');
}

function flattenEnabledRoles(chapters = []) {
  return chapters
    .filter((chapter) => chapter?.enabled !== false)
    .flatMap((chapter) => (chapter.people ?? []).flatMap((person) => (person.roles ?? []).filter((role) => role.enabled !== false)));
}

globalThis.JX3Render = Object.freeze({ escapeHtml, renderChapter, renderChapterList, flattenEnabledRoles });
})();
