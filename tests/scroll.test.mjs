import test from 'node:test';
import assert from 'node:assert/strict';
await import('../js/scroll.js');
const { clamp01, getSectionProgress, getActiveStepIndex, getStepProgress, getPageProgress } = globalThis.JX3Scroll;

test('clamp01 bounds progress', () => {
  assert.equal(clamp01(-1), 0);
  assert.equal(clamp01(0.4), 0.4);
  assert.equal(clamp01(2), 1);
});

test('section progress maps scroll position to zero through one', () => {
  assert.equal(getSectionProgress({ top: 100, height: 1000, viewportHeight: 500 }, 100), 0);
  assert.equal(getSectionProgress({ top: 100, height: 1000, viewportHeight: 500 }, 350), 0.5);
  assert.equal(getSectionProgress({ top: 100, height: 1000, viewportHeight: 500 }, 600), 1);
});

test('active step never exceeds available steps', () => {
  assert.equal(getActiveStepIndex(0, 10), 0);
  assert.equal(getActiveStepIndex(0.999, 10), 9);
  assert.equal(getActiveStepIndex(1, 10), 9);
  assert.equal(getActiveStepIndex(0.5, 0), 0);
});

test('step progress restarts for each role and completes at chapter end', () => {
  assert.equal(getStepProgress(0, 1), 0);
  assert.equal(getStepProgress(0.5, 1), 0.5);
  assert.equal(getStepProgress(1, 1), 1);
  assert.equal(getStepProgress(0.25, 2), 0.5);
  assert.equal(getStepProgress(0.5, 2), 0);
  assert.equal(getStepProgress(1, 2), 1);
});

test('page progress is safe for short and scrollable pages', () => {
  assert.equal(getPageProgress(250, 1000, 500), 0.5);
  assert.equal(getPageProgress(900, 1000, 500), 1);
  assert.equal(getPageProgress(20, 500, 500), 0);
});
