(() => {
'use strict';

const { siteContent, validateSiteContent } = globalThis.JX3Content;
const { flattenEnabledRoles, renderChapterList } = globalThis.JX3Render;
const { createScrollController } = globalThis.JX3Scroll;

document.documentElement.classList.add('js');
document.body.classList.add('is-loading');

const $ = (selector, root = document) => root.querySelector(selector);
let scrollController = null;

function renderGroupPortrait(content, roles) {
  const stage = $('[data-group-portrait]');
  if (!stage) return;

  if (content.hero?.groupImage) {
    stage.classList.add('group-portrait__stage--photo');
    stage.style.setProperty('--desktop-position', content.hero.desktopPosition || 'center center');
    stage.style.setProperty('--mobile-position', content.hero.mobilePosition || 'center center');
    stage.innerHTML = `
      <img class="group-photo" src="${content.hero.groupImage}" alt="130级纪念亲友大合影" fetchpriority="high" decoding="async">
      <div class="group-photo__veil" aria-hidden="true"></div>`;
    return;
  }

  const representatives = roles.filter((role) => role.representative !== false).slice(0, 4);
  stage.classList.add('portrait-collage');
  stage.innerHTML = representatives.map((role, index) => `
    <figure class="portrait-collage__item portrait-collage__item--${index + 1}" style="--object-position: ${role.image.position}">
      <img src="${role.image.src}" alt="${role.image.alt}" ${index === 0 ? 'fetchpriority="high"' : 'loading="eager"'} decoding="async">
      <figcaption>${role.name}</figcaption>
    </figure>`).join('');
}

function renderMemorialNames(roles) {
  const target = $('[data-memorial-names]');
  if (!target) return;
  const uniqueNames = [...new Set(roles.map((role) => role.name))];
  target.innerHTML = uniqueNames.map((name, index) => `<span><small>${String(index + 1).padStart(2, '0')}</small>${name}</span>`).join('');
}

function bindImageFallbacks(root = document) {
  root.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      const frame = image.closest('.role-visual, .portrait-collage__item, .group-portrait__stage') || image.parentElement;
      frame?.classList.add('media-fallback');
      image.hidden = true;
    }, { once: true });
  });
}

function observeReveals() {
  const items = [...document.querySelectorAll('.reveal')];
  if (!items.length) return;
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  items.forEach((item) => observer.observe(item));
}

function preloadImage(src, onProgress) {
  return new Promise((resolve) => {
    const image = new Image();
    const done = () => {
      onProgress();
      resolve();
    };
    image.onload = done;
    image.onerror = done;
    image.src = src;
  });
}

async function releaseLoader(roles) {
  const progress = $('[data-loading-progress]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sources = siteContent.hero?.groupImage
    ? [siteContent.hero.groupImage]
    : roles.slice(0, 2).map((role) => role.image.src);
  let completed = 0;
  const update = () => {
    completed += 1;
    if (progress) progress.textContent = `${Math.round((completed / Math.max(sources.length, 1)) * 100)}%`;
  };

  if (!sources.length) update();
  const preload = Promise.all(sources.map((src) => preloadImage(src, update)));
  const timeout = new Promise((resolve) => setTimeout(resolve, reduceMotion ? 180 : 2500));
  await Promise.race([preload, timeout]);
  if (progress) progress.textContent = '100%';
  requestAnimationFrame(() => document.body.classList.remove('is-loading'));
}

function mountSite() {
  const errors = validateSiteContent(siteContent);
  if (errors.length) console.error('Invalid memorial content:', errors);

  const validChapterIds = new Set(errors
    .filter((error) => error.startsWith('enabled chapter '))
    .map((error) => error.split(' ')[2]));
  const chapters = siteContent.chapters.filter((chapter) => !validChapterIds.has(chapter.id));
  const roles = flattenEnabledRoles(chapters);
  const chapterTarget = document.querySelector('#chapters');

  if (chapterTarget) chapterTarget.innerHTML = renderChapterList(chapters);
  const roleCount = $('[data-role-count]');
  if (roleCount) roleCount.textContent = String(roles.length).padStart(2, '0');

  renderGroupPortrait(siteContent, roles);
  renderMemorialNames(roles);
  bindImageFallbacks();
  observeReveals();
  scrollController?.destroy();
  scrollController = createScrollController();
  releaseLoader(roles).catch((error) => {
    console.error('Loader failed:', error);
    document.body.classList.remove('is-loading');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountSite, { once: true });
} else {
  mountSite();
}
})();
