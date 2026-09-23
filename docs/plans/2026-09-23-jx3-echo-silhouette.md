# JX3 Echo Silhouette Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add scroll-driven “江湖残影” convergence to every role image without changing the memorial site's scroll-only interaction.

**Architecture:** Render two decorative image echoes beside the existing semantic role image. Extend the scroll controller with per-step progress and expose computed CSS variables for convergence, fading, reveal, scan, and mirrored couple direction. CSS performs compositing and preserves no-JS, mobile, and reduced-motion fallbacks.

**Tech Stack:** Static HTML rendering in JavaScript, CSS custom properties and blend modes, Node.js test runner.

---

### Task 1: Define the animation contract

**Files:**
- Modify: `tests/render.test.mjs`
- Modify: `tests/scroll.test.mjs`
- Modify: `tests/style-contract.test.mjs`

1. Require two accessible decorative echo layers for every rendered role.
2. Add unit coverage for local role-step progress.
3. Require desktop, couple-mirror, mobile, and reduced-motion styles.
4. Run `npm test` and confirm the new assertions fail.

### Task 2: Render and drive the residual shadows

**Files:**
- Modify: `js/render.js`
- Modify: `js/scroll.js`

1. Render ink and vermilion echo images with empty alternative text inside hidden decorative wrappers.
2. Export `getStepProgress`.
3. Calculate scroll phases and write the related CSS custom properties to each chapter.
4. Mirror horizontal offsets for the two sides of the couple chapter.

### Task 3: Style and verify the effect

**Files:**
- Modify: `css/site.css`

1. Add the echo layer stack, filters, masks, scan line, and main-image reveal.
2. Match existing desktop, couple, and mobile image heights.
3. Hide one mobile echo and remove all motion decoration under reduced motion.
4. Run `npm test`, `git diff --check`, and a local HTTP smoke check.
