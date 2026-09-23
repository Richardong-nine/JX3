(() => {
'use strict';

function clamp01(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(1, Math.max(0, number));
}

function getSectionProgress({ top = 0, height = 0, viewportHeight = 0 } = {}, scrollY = 0) {
  const travel = Number(height) - Number(viewportHeight);
  if (!Number.isFinite(travel) || travel <= 0) return 0;
  return clamp01((Number(scrollY) - Number(top)) / travel);
}

function getActiveStepIndex(progress, count) {
  const safeCount = Math.max(0, Math.floor(Number(count) || 0));
  if (safeCount < 1) return 0;
  return Math.min(safeCount - 1, Math.floor(clamp01(progress) * safeCount));
}

function getStepProgress(progress, count) {
  const safeCount = Math.max(1, Math.floor(Number(count) || 1));
  const scaled = clamp01(progress) * safeCount;
  if (scaled >= safeCount) return 1;
  return scaled - Math.floor(scaled);
}

function getPageProgress(scrollY, scrollHeight, viewportHeight) {
  const travel = Number(scrollHeight) - Number(viewportHeight);
  if (!Number.isFinite(travel) || travel <= 0) return 0;
  return clamp01(Number(scrollY) / travel);
}

function getChapterRoleName(chapter, activeStep) {
  if (chapter.dataset.chapterType === 'couple') {
    const step = chapter.querySelector(`.couple-step[data-couple-index="${activeStep}"]`);
    const names = [...(step?.querySelectorAll('.role-name') ?? [])].map((node) => node.textContent.trim()).filter(Boolean);
    return names.join(' × ');
  }
  const role = chapter.querySelector(`[data-role-index="${activeStep}"] .role-name`)
    || chapter.querySelector('.role-name');
  return role?.textContent.trim() || '故人录';
}

function buildChapterIndex(root, chapters) {
  const target = root.querySelector('[data-chapter-progress]');
  if (!target) return [];

  target.replaceChildren(...chapters.map((chapter, index) => {
    const item = root.createElement('li');
    const link = root.createElement('a');
    const roleName = chapter.querySelector('.role-name')?.textContent.trim() || '故人录';
    const number = root.createElement('small');
    const label = root.createElement('span');
    link.href = `#${chapter.id}`;
    link.dataset.chapterLink = chapter.dataset.chapterId;
    number.textContent = String(index + 1).padStart(2, '0');
    label.textContent = roleName;
    link.append(number, label);
    item.append(link);
    return item;
  }));

  return [...target.querySelectorAll('[data-chapter-link]')];
}

function createScrollController({ root = document, view = window } = {}) {
  const chapters = [...root.querySelectorAll('[data-chapter-id]')];
  const progressBar = root.querySelector('[data-page-progress]');
  const fatePath = root.querySelector('[data-fate-line]');
  const currentRole = root.querySelector('[data-current-role]');
  const chapterLinks = buildChapterIndex(root, chapters);
  const reduceMotion = view.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const visibleChapters = new Set();
  let frame = 0;
  let destroyed = false;
  let pathLength = 0;

  const preparePath = () => {
    if (!fatePath) return;
    try {
      pathLength = fatePath.getTotalLength();
    } catch {
      pathLength = 1000;
    }
    if (!Number.isFinite(pathLength) || pathLength <= 0) pathLength = 1000;
    fatePath.style.strokeDasharray = `${pathLength}`;
    fatePath.style.strokeDashoffset = reduceMotion ? '0' : `${pathLength}`;
  };

  const update = () => {
    frame = 0;
    if (destroyed || root.hidden) return;

    const scrollY = view.scrollY || view.pageYOffset || 0;
    const viewportHeight = Math.max(view.innerHeight || 0, 1);
    const pageProgress = getPageProgress(scrollY, root.documentElement.scrollHeight, viewportHeight);
    const focusY = scrollY + viewportHeight * 0.48;

    const measurements = chapters.map((chapter) => {
      const rect = chapter.getBoundingClientRect();
      const top = rect.top + scrollY;
      const height = rect.height;
      const progress = getSectionProgress({ top, height, viewportHeight }, scrollY);
      const stepCount = chapter.dataset.chapterType === 'couple'
        ? chapter.querySelectorAll('.couple-step').length
        : chapter.querySelectorAll('.role-step').length;
      const activeStep = getActiveStepIndex(progress, stepCount);
      const containsFocus = top <= focusY && top + height > focusY;
      const distance = containsFocus ? 0 : Math.min(Math.abs(focusY - top), Math.abs(focusY - (top + height)));
      return { chapter, top, height, progress, activeStep, stepCount, distance, containsFocus };
    });

    const active = measurements.reduce((best, item) => {
      if (!best) return item;
      if (item.containsFocus && !best.containsFocus) return item;
      if (item.containsFocus === best.containsFocus && item.distance < best.distance) return item;
      return best;
    }, null);

    root.documentElement.style.setProperty('--page-progress', pageProgress.toFixed(4));
    if (progressBar) progressBar.style.transform = `scaleX(${pageProgress})`;
    if (fatePath && pathLength) {
      fatePath.style.strokeDashoffset = reduceMotion ? '0' : `${pathLength * (1 - pageProgress)}`;
    }

    measurements.forEach((item) => {
      const roleProgress = reduceMotion ? 1 : getStepProgress(item.progress, item.stepCount);
      const converge = clamp01((roleProgress - 0.04) / 0.64);
      const spread = 1 - converge;
      const inkFade = 1 - clamp01((roleProgress - 0.7) / 0.3);
      const vermilionIn = clamp01((roleProgress - 0.12) / 0.18);
      const vermilionFade = 1 - clamp01((roleProgress - 0.76) / 0.24);
      const reveal = clamp01((roleProgress - 0.05) / 0.58);
      const scanTravel = clamp01((roleProgress - 0.54) / 0.34);
      const scanOpacity = roleProgress >= 0.54 && roleProgress <= 0.9
        ? Math.sin(scanTravel * Math.PI) * 0.72
        : 0;

      item.chapter.style.setProperty('--chapter-progress', item.progress.toFixed(4));
      item.chapter.style.setProperty('--role-progress', roleProgress.toFixed(4));
      item.chapter.style.setProperty('--echo-ink-x', `${(-42 * spread).toFixed(2)}px`);
      item.chapter.style.setProperty('--echo-red-x', `${(48 * spread).toFixed(2)}px`);
      item.chapter.style.setProperty('--echo-ink-opacity', (0.58 * inkFade).toFixed(3));
      item.chapter.style.setProperty('--echo-red-opacity', (0.5 * vermilionIn * vermilionFade).toFixed(3));
      item.chapter.style.setProperty('--role-image-opacity', (0.18 + 0.82 * reveal).toFixed(3));
      item.chapter.style.setProperty('--role-mask', `${(18 * spread).toFixed(2)}%`);
      item.chapter.style.setProperty('--scan-y', `${(18 + 66 * scanTravel).toFixed(2)}%`);
      item.chapter.style.setProperty('--scan-opacity', scanOpacity.toFixed(3));
      item.chapter.dataset.activeRole = String(item.activeStep);
      item.chapter.classList.toggle('is-current', item.chapter === active?.chapter);
    });

    chapterLinks.forEach((link) => {
      const isCurrent = link.dataset.chapterLink === active?.chapter.dataset.chapterId;
      if (isCurrent) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });

    if (currentRole) {
      currentRole.textContent = active ? getChapterRoleName(active.chapter, active.activeStep) : '江湖序章';
    }
  };

  const schedule = () => {
    if (destroyed || frame || root.hidden) return;
    frame = view.requestAnimationFrame(update);
  };

  const onVisibilityChange = () => {
    if (root.hidden && frame) {
      view.cancelAnimationFrame(frame);
      frame = 0;
    } else {
      schedule();
    }
  };

  let observer = null;
  if ('IntersectionObserver' in view) {
    observer = new view.IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleChapters.add(entry.target);
        else visibleChapters.delete(entry.target);
        entry.target.classList.toggle('is-in-view', entry.isIntersecting);
      });
      schedule();
    }, { rootMargin: '-18% 0px -18% 0px', threshold: 0 });
    chapters.forEach((chapter) => observer.observe(chapter));
  }

  preparePath();
  view.addEventListener('scroll', schedule, { passive: true });
  view.addEventListener('resize', schedule, { passive: true });
  root.addEventListener('visibilitychange', onVisibilityChange);
  schedule();

  return {
    update: schedule,
    destroy() {
      destroyed = true;
      if (frame) view.cancelAnimationFrame(frame);
      observer?.disconnect();
      view.removeEventListener('scroll', schedule);
      view.removeEventListener('resize', schedule);
      root.removeEventListener('visibilitychange', onVisibilityChange);
      visibleChapters.clear();
    }
  };
}

globalThis.JX3Scroll = Object.freeze({ clamp01, getSectionProgress, getActiveStepIndex, getStepProgress, getPageProgress, createScrollController });
})();
