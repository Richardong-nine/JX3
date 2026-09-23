# JX3 Texture Details Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add refined Jianghu-inspired etched patterns, formation rings, and restrained motion to the existing memorial page without changing its content or scroll-only interaction.

**Architecture:** Extend the existing CSS visual system using pseudo-elements, layered gradients, and the existing `--page-progress` / `--chapter-progress` custom properties. Keep markup and JavaScript unchanged unless a style hook proves necessary, and cover the visual contract with source-level CSS tests.

**Tech Stack:** Static HTML, CSS custom properties and gradients, Node.js test runner.

---

### Task 1: Define the texture contract

**Files:**
- Modify: `tests/style-contract.test.mjs`

1. Add a test requiring the global etched overlay, formation-ring selectors, couple chapter pattern, mobile density fallback, and reduced-motion fallback.
2. Run `npm test` and confirm the new test fails before implementation.

### Task 2: Implement the texture system

**Files:**
- Modify: `css/site.css`

1. Add reusable texture color and spacing tokens.
2. Add the fixed global grid/etch overlay.
3. Add formation rings and frame marks to the prologue and group portrait.
4. Add chapter, role image, multi-role, and couple-specific etched details.
5. Add the closing formation pattern to the epilogue.
6. Add restrained animations using existing scroll variables.
7. Add mobile and reduced-motion overrides.

### Task 3: Verify and publish locally

**Files:**
- Verify: `tests/style-contract.test.mjs`
- Verify: `css/site.css`

1. Run `npm test` and expect all tests to pass.
2. Inspect `git diff --check` and repository status.
3. Commit only the design, plan, test, and stylesheet changes.
