# 剑网3 130级亲友纪念网站 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将现有视觉方向预览重构为一个可直接浏览、纯纵向滚动、支持单角色/多角色/双人共同章节并兼容桌面与手机的剑网3 130级亲友纪念网站首版。

**Architecture:** 保留 `design-preview/` 作为历史方向稿，在项目根目录新建生产版静态站点。内容与页面结构分离：`js/content.js` 维护人物与角色数据，`js/render.js` 生成语义化章节，`js/scroll.js` 负责滚动进度、固定舞台和动画状态，CSS 负责暗黑电影视觉及响应式降级。全部使用原生 HTML/CSS/JavaScript，不引入运行时框架或第三方动画库。

**Tech Stack:** HTML5、CSS Custom Properties、CSS Grid、CSS Sticky、SVG、ES Modules、IntersectionObserver、requestAnimationFrame、Node.js 内置 `node:test`。

**Relevant Skills:** 实施时使用 `@frontend-design` 落实视觉系统，使用 `@tdd` 保持数据模型、渲染和滚动计算可验证；按 `@executing-plans` 顺序执行本计划。

---

## 实施原则

1. 不修改或删除用户提供的 `image/` 原始素材。
2. 不覆盖 `design-preview/`；它保留为设计方向历史稿。
3. 生产页面从项目根目录 `/Users/dongjianming/Documents/project/JX3/index.html` 访问。
4. 当前未确认哪两位亲友组成双人章节，因此生产内容不擅自配对；双人模板通过测试夹具和禁用示例数据验证，待名单确认后只改 `js/content.js`。
5. 当前没有真实亲友大合影时，首页使用现有角色素材组成暗黑群像，不显示“图片待补充”类占位文案；未来配置 `hero.groupImage` 后自动切换为真实合影。
6. 首版不加入账号、后台、评论、视频弹窗、搜索或复杂音频播放器。
7. 所有动画必须同时支持 `prefers-reduced-motion` 和脚本初始化失败时的静态阅读。

---

### Task 1: 建立零依赖测试入口和内容数据契约

**Files:**
- Create: `package.json`
- Create: `js/content.js`
- Create: `tests/content.test.mjs`

**Step 1: 写内容数据契约的失败测试**

创建 `tests/content.test.mjs`，先定义以下约束：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { siteContent, validateSiteContent } from '../js/content.js';

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
```

**Step 2: 运行测试并确认失败**

Run: `node --test tests/content.test.mjs`  
Expected: FAIL，提示找不到 `js/content.js`。

**Step 3: 创建最小 `package.json`**

```json
{
  "name": "jx3-level-130-memorial",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "verify": "node scripts/verify-site.mjs"
  }
}
```

**Step 4: 实现内容数据结构**

在 `js/content.js` 导出：

```js
export const siteContent = {
  title: '剑网3 · 130级纪念',
  level: 130,
  subtitle: '山河仍在，故人仍在',
  hero: {
    groupImage: null,
    mobilePosition: 'center center',
    desktopPosition: 'center center'
  },
  chapters: [
    {
      id: 'sansetuanzhi',
      type: 'single',
      enabled: true,
      label: '故人录',
      people: [{
        id: 'friend-sansetuanzi',
        roles: [{
          id: 'role-sansetuanzi',
          name: '三色团子',
          faction: '门派待配置',
          intro: '这一身装束，也是一段被留住的江湖。',
          image: { src: './image/三色团子.png', alt: '三色团子的角色立绘', position: 'center top' },
          representative: true
        }]
      }]
    },
    {
      id: 'qianyueyuan',
      type: 'single',
      enabled: true,
      label: '故人录',
      people: [{
        id: 'friend-qianyueyuan',
        roles: [{
          id: 'role-qianyueyuan',
          name: '千月渊',
          faction: '门派待配置',
          intro: '月色落在衣袂之间，也落进共同走过的年月。',
          image: { src: './image/千月渊.png', alt: '千月渊的角色立绘', position: 'center top' },
          representative: true
        }]
      }]
    },
    {
      id: 'jiaogao',
      type: 'single',
      enabled: true,
      label: '故人录',
      people: [{
        id: 'friend-jiaogao',
        roles: [{
          id: 'role-jiaogao',
          name: '蕉糕',
          faction: '门派待配置',
          intro: '银白衣影从旧日截图中走来，仍像第一次相逢。',
          image: { src: './image/蕉糕.jpg', alt: '蕉糕的角色截图', position: 'center top' },
          representative: true
        }]
      }]
    },
    {
      id: 'weiweiliangdeguangzhu',
      type: 'single',
      enabled: true,
      label: '故人录',
      people: [{
        id: 'friend-weiweiliangdeguangzhu',
        roles: [{
          id: 'role-weiweiliangdeguangzhu',
          name: '微微凉的广筑',
          faction: '门派待配置',
          intro: '一帧近景，留下的是名字，也是这段江湖的温度。',
          image: { src: './image/微微凉的广筑.png', alt: '微微凉的广筑的角色近景', position: 'center top' },
          representative: true
        }]
      }]
    }
  ]
};
```

同时实现 `validateSiteContent(content)`，返回字符串错误数组，检查：

- `type` 只能是 `single`、`multi`、`couple`；
- `couple` 必须恰好有两组 `people`；
- `single` 和 `multi` 必须只有一组 `people`；
- 每个启用章节至少有一个角色；
- 角色 ID 全站唯一；
- 必填字段非空；
- 图片焦点符合允许格式。

说明：当前门派尚未提供，数据中使用可集中替换的中性值；页面视觉中不得出现“资料待补充”式提示，可将该值弱化为 `江湖身份`，待真实门派录入后自动显示。

**Step 5: 运行测试并确认通过**

Run: `npm test`  
Expected: 3 tests PASS。

**Step 6: 提交**

```bash
git add JX3/package.json JX3/js/content.js JX3/tests/content.test.mjs
git commit -m "feat: define memorial content model"
```

---

### Task 2: 建立生产页面语义结构与无脚本兜底

**Files:**
- Create: `index.html`
- Create: `css/site.css`
- Create: `tests/document.test.mjs`

**Step 1: 写 HTML 结构失败测试**

创建 `tests/document.test.mjs`，读取 `index.html` 并断言：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('document contains the required memorial landmarks', () => {
  for (const landmark of ['<header', '<main', 'id="group-portrait"', 'id="chapters"', '<footer']) {
    assert.ok(html.includes(landmark), `missing ${landmark}`);
  }
});

test('document loads one module entry and exposes a no-script message', () => {
  assert.match(html, /<script type="module" src="\.\/js\/app\.js"><\/script>/);
  assert.match(html, /<noscript>/);
});

test('document includes reduced-motion friendly viewport metadata', () => {
  assert.match(html, /name="viewport"/);
  assert.match(html, /theme-color/);
});
```

**Step 2: 运行测试并确认失败**

Run: `node --test tests/document.test.mjs`  
Expected: FAIL，提示 `index.html` 不存在。

**Step 3: 创建语义化 `index.html`**

页面固定结构：

```html
<body class="is-loading">
  <a class="skip-link" href="#chapters">跳到人物章节</a>
  <div class="film-grain" aria-hidden="true"></div>
  <div class="preloader" aria-live="polite">...</div>
  <header class="site-header">...</header>
  <main>
    <section class="prologue" id="prologue">...</section>
    <section class="group-portrait" id="group-portrait">...</section>
    <div class="fate-line" aria-hidden="true"><svg>...</svg></div>
    <section class="chapters" id="chapters" aria-label="亲友角色纪念章节"></section>
  </main>
  <footer class="epilogue" id="epilogue">...</footer>
  <noscript>...</noscript>
  <script type="module" src="./js/app.js"></script>
</body>
```

要求：

- `h1` 只用于“剑网3 · 130级纪念”；
- 章节容器初始为空，由数据渲染；
- `noscript` 提供可读的静态说明，不遮挡页面；
- 导航使用真实锚点；
- 图片区域预留固有比例，避免加载跳动。

**Step 4: 写基础 CSS 让无脚本页面可读**

在 `css/site.css` 先实现：

- 颜色变量和排版变量；
- `body` 深色背景和旧纸白文字；
- `skip-link` 键盘焦点样式；
- `main`、section、footer 的最小高度和层级；
- `.js .reveal` 才进入隐藏动画状态，避免脚本失败时内容不可见；
- 基础桌面/手机断点框架。

**Step 5: 运行测试并确认通过**

Run: `npm test`  
Expected: content 和 document 测试全部 PASS。

**Step 6: 提交**

```bash
git add JX3/index.html JX3/css/site.css JX3/tests/document.test.mjs
git commit -m "feat: add semantic memorial site shell"
```

---

### Task 3: 实现单角色、多角色和双人章节的纯函数渲染器

**Files:**
- Create: `js/render.js`
- Create: `tests/render.test.mjs`

**Step 1: 写渲染失败测试**

测试至少覆盖：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderChapter, renderChapterList } from '../js/render.js';

const role = (id, name) => ({
  id,
  name,
  faction: '七秀',
  intro: `${name} 的角色简介`,
  image: { src: `./image/${name}.png`, alt: name, position: 'center top' }
});

test('single chapter overlays the role name on its visual stage', () => {
  const html = renderChapter({ id: 'one', type: 'single', label: '故人录', people: [{ id: 'p1', roles: [role('r1', '角色一')] }] }, 0);
  assert.match(html, /data-role-id="r1"/);
  assert.match(html, /class="role-name"[^>]*>角色一</);
  assert.match(html, /七秀/);
});

test('multi chapter exposes scroll steps and role count', () => {
  const html = renderChapter({ id: 'many', type: 'multi', label: '故人录', people: [{ id: 'p1', roles: [role('r1', '一'), role('r2', '二')] }] }, 1);
  assert.equal((html.match(/class="role-step/g) ?? []).length, 2);
  assert.match(html, /02 ROLES/);
});

test('couple chapter keeps two people inside one shared section', () => {
  const html = renderChapter({ id: 'pair', type: 'couple', label: '双人共同章', people: [
    { id: 'left', roles: [role('l1', '左一')] },
    { id: 'right', roles: [role('r1', '右一'), role('r2', '右二')] }
  ] }, 2);
  assert.match(html, /chapter--couple/);
  assert.match(html, /data-side="left"/);
  assert.match(html, /data-side="right"/);
});
```

**Step 2: 运行测试并确认失败**

Run: `node --test tests/render.test.mjs`  
Expected: FAIL，提示找不到 `js/render.js`。

**Step 3: 实现安全 HTML 辅助函数**

在 `js/render.js` 内部实现并单测 `escapeHtml(value)`，至少转义 `& < > " '`，所有文本字段必须通过该函数输出。

**Step 4: 实现角色视觉单元**

`renderRole(role, context)` 输出：

- `.role-visual`；
- 带 `width`/`height` 或 `aspect-ratio` 容器的 `<img>`；
- `.role-name` 覆盖在视觉区域中；
- `.role-faction`；
- `.role-intro`；
- `data-role-id`；
- 图片焦点写入 CSS custom property：`--object-position`。

**Step 5: 实现三类章节**

- `single`：一个 `.chapter-stage` 和一个 `.role-step`；
- `multi`：一个 sticky `.chapter-stage`，多个 `.role-step` 和 `01 / N` 进度；
- `couple`：一个共同 `<section>`，左右两组 `.couple-track`，角色按最大长度交错生成 step，不制造空白占位角色；
- 章节标题包含 `CHAPTER NN`、章节类型和角色数量；
- 角色名必须位于图片视觉容器内部，而不是下方普通卡片标题。

**Step 6: 运行测试并确认通过**

Run: `npm test`  
Expected: render tests 和既有 tests 全部 PASS。

**Step 7: 提交**

```bash
git add JX3/js/render.js JX3/tests/render.test.mjs
git commit -m "feat: render cinematic character chapters"
```

---

### Task 4: 接入内容并完成片头、群像与终章渲染

**Files:**
- Create: `js/app.js`
- Modify: `index.html`
- Modify: `css/site.css`
- Create: `tests/app-contract.test.mjs`

**Step 1: 写应用装配契约测试**

读取 `js/app.js`，断言它：

- 导入 `siteContent`；
- 导入 `renderChapterList`；
- 将章节写入 `#chapters`；
- 更新总角色数；
- 在初始化完成后移除 `is-loading`；
- 图片加载失败时添加 `.media-fallback`，不抛出未捕获异常。

**Step 2: 运行测试并确认失败**

Run: `node --test tests/app-contract.test.mjs`  
Expected: FAIL，提示 `js/app.js` 不存在或缺少约定。

**Step 3: 实现 `js/app.js` 基础装配**

初始化顺序：

```js
document.documentElement.classList.add('js');
validate content -> render chapters -> render hero collage -> render epilogue names
-> bind image fallbacks -> mark document ready
```

如果内容验证失败：

- `console.error` 输出具体字段；
- 页面仍渲染合法章节；
- 不使用全屏错误弹窗阻塞浏览。

**Step 4: 实现加载片头**

- 预加载首屏与前两个章节的主图；
- 进度只计算关键图片，不等待所有懒加载图片；
- 最长 2.5 秒后强制进入页面；
- `prefers-reduced-motion` 下缩短为 200ms 内结束；
- 加载结束后把焦点保持在原位置，不自动抢焦点。

**Step 5: 实现无真实大合影时的群像封面**

当 `hero.groupImage` 为 `null`：

- 从启用章节的代表角色中取最多 4 张图；
- 形成 `.portrait-collage` 前后景群像；
- 使用渐变遮罩、暗角和红色命线统一画面；
- 文案显示实际收录角色数，不声称已经展示全部约 10 位亲友；
- 不显示“待补充”。

当以后设置 `hero.groupImage`：

- 自动渲染真实合影；
- 使用 `desktopPosition` 和 `mobilePosition` 控制焦点；
- 保持相同标题层和揭幕动画。

**Step 6: 实现终章名单**

- 从数据自动收集所有启用角色名；
- 去重后输出纪念名单；
- 结尾显示“山河仍在，故人仍在”；
- 返回开场链接指向 `#prologue`。

**Step 7: 运行测试并确认通过**

Run: `npm test`  
Expected: 全部 PASS。

**Step 8: 提交**

```bash
git add JX3/js/app.js JX3/index.html JX3/css/site.css JX3/tests/app-contract.test.mjs
git commit -m "feat: assemble memorial prologue and epilogue"
```

---

### Task 5: 完成暗黑电影视觉系统和三类章节布局

**Files:**
- Modify: `css/site.css`
- Create: `tests/style-contract.test.mjs`

**Step 1: 写视觉契约失败测试**

读取 CSS 并断言存在：

- `--color-abyss: #050607`；
- `--color-ink: #091014`；
- `--color-paper: #e8e2d6`；
- `--color-rust: #7d1618`；
- `--color-gold: #a88c59`；
- `.chapter--single`、`.chapter--multi`、`.chapter--couple`；
- `.role-name` 的绝对定位；
- `@media (prefers-reduced-motion: reduce)`；
- 至少一个手机断点。

**Step 2: 运行测试并确认失败**

Run: `node --test tests/style-contract.test.mjs`  
Expected: FAIL，缺少完整视觉契约。

**Step 3: 落实全局视觉变量**

使用以下核心变量并保持统一：

```css
:root {
  --color-abyss: #050607;
  --color-ink: #091014;
  --color-charcoal: #121518;
  --color-paper: #e8e2d6;
  --color-silver: #a9afb2;
  --color-muted: #60686c;
  --color-rust: #7d1618;
  --color-vermilion: #b52b2d;
  --color-gold: #a88c59;
  --font-display: "STKaiti", "KaiTi", serif;
  --font-serif: "Songti SC", "Noto Serif SC", serif;
  --font-meta: "Baskerville", "Times New Roman", serif;
}
```

避免使用 Inter、Arial、Space Grotesk 和紫色科技渐变。

**Step 4: 完成片头和群像构图**

- 首屏 `min-height: 100svh`；
- 标题使用大字距、细线和章节编号；
- 群像图片有前中后景位置差；
- 使用 CSS mask/gradient 将人物底部融入背景；
- 增加克制的噪点、暗角和低频浮尘；
- 不使用高频闪烁。

**Step 5: 完成单角色章节**

- 桌面端采用非对称两栏；
- 人物可越出内容网格；
- `.role-name` 位于图片内部并允许部分落到人物后方；
- 门派和简介放在独立稳定阅读区；
- 图片为全身图时优先完整显示武器和头饰。

**Step 6: 完成多角色固定舞台**

- `.chapter--multi .chapter-stage { position: sticky; top: 0; min-height: 100svh; }`；
- step 按角色数量设置滚动长度；
- 非激活角色保持不可见但不使用 `display:none`，便于动画；
- 角色进度显示在固定角落；
- 8～10 个角色时缩短单 step 高度，但每个名字和简介仍有可阅读停留时间。

**Step 7: 完成双人共同章节**

- 桌面端左右轨迹不强制镜像；
- 中央命线作为视觉连接；
- 两侧角色数量不等时，较短一侧停留代表角色剪影；
- 手机端切换为上下交错和纵向命线。

**Step 8: 运行测试并确认通过**

Run: `npm test`  
Expected: 全部 PASS。

**Step 9: 提交**

```bash
git add JX3/css/site.css JX3/tests/style-contract.test.mjs
git commit -m "feat: style dark cinematic memorial chapters"
```

---

### Task 6: 实现滚动进度、固定舞台切换和江湖命线

**Files:**
- Create: `js/scroll.js`
- Create: `tests/scroll.test.mjs`
- Modify: `js/app.js`
- Modify: `css/site.css`
- Modify: `index.html`

**Step 1: 写滚动纯函数失败测试**

在 `tests/scroll.test.mjs` 测试：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp01, getSectionProgress, getActiveStepIndex } from '../js/scroll.js';

test('clamp01 bounds progress', () => {
  assert.equal(clamp01(-1), 0);
  assert.equal(clamp01(0.4), 0.4);
  assert.equal(clamp01(2), 1);
});

test('section progress maps scroll position to zero through one', () => {
  assert.equal(getSectionProgress({ top: 100, height: 1000, viewportHeight: 500 }, 100), 0);
  assert.equal(getSectionProgress({ top: 100, height: 1000, viewportHeight: 500 }, 600), 1);
});

test('active step never exceeds available steps', () => {
  assert.equal(getActiveStepIndex(0, 10), 0);
  assert.equal(getActiveStepIndex(0.999, 10), 9);
  assert.equal(getActiveStepIndex(1, 10), 9);
});
```

**Step 2: 运行测试并确认失败**

Run: `node --test tests/scroll.test.mjs`  
Expected: FAIL，提示找不到 `js/scroll.js`。

**Step 3: 实现无 DOM 的滚动计算函数**

实现并导出：

- `clamp01(value)`；
- `getSectionProgress(rect, scrollY)`；
- `getActiveStepIndex(progress, count)`；
- `getPageProgress(scrollY, scrollHeight, viewportHeight)`。

边界条件：高度为 0、count 小于 1、页面不可滚动时都返回安全值。

**Step 4: 实现浏览器滚动控制器**

`createScrollController()` 使用：

- 单个 `requestAnimationFrame` 循环合并 scroll/resize 更新；
- `IntersectionObserver` 只控制章节进入和退出；
- 滚动计算只写 CSS variables 和 `data-active-role`；
- 不在每一帧读取、写入 DOM 交错进行，避免 layout thrashing；
- 页面隐藏时暂停更新。

**Step 5: 实现章节进度导航**

- 桌面端右侧竖线和章节编号；
- 手机端顶部细进度条和当前角色名；
- 导航按钮是可选快速定位，使用原生锚点或 `scrollIntoView`；
- 减少动态效果时使用 `behavior: 'auto'`；
- 当前项使用 `aria-current="step"`。

**Step 6: 实现江湖命线 SVG**

- 在 HTML 中保留一条主 SVG path；
- 根据全页进度更新 `stroke-dashoffset`；
- 多角色章节用 CSS 伪元素/局部 SVG 表示短分支；
- 双人章节主线分叉后再汇合；
- 终章路径收束为简化的 `130` 轮廓或三道同心线；
- reduced motion 下直接显示完整线条，不做持续绘制。

**Step 7: 接入应用初始化**

在 `js/app.js` 渲染完成后再调用控制器；销毁或重复初始化时不得注册重复监听器。

**Step 8: 运行测试并确认通过**

Run: `npm test`  
Expected: 全部 PASS。

**Step 9: 提交**

```bash
git add JX3/js/scroll.js JX3/js/app.js JX3/index.html JX3/css/site.css JX3/tests/scroll.test.mjs
git commit -m "feat: add scroll narrative and fate line"
```

---

### Task 7: 加入响应式重构、可访问性和性能保护

**Files:**
- Modify: `css/site.css`
- Modify: `js/app.js`
- Modify: `js/scroll.js`
- Create: `scripts/verify-site.mjs`
- Create: `tests/accessibility-contract.test.mjs`

**Step 1: 写可访问性契约失败测试**

测试生成后的静态契约：

- 每个角色图都有非空 `alt`；
- 页面只有一个 `h1`；
- 每个章节有可访问名称；
- 导航有 `aria-label`；
- 当前章节状态使用 `aria-current`；
- 不存在 `tabindex` 大于 0；
- CSS 有 `:focus-visible`；
- reduced motion 中禁用 `scroll-behavior: smooth` 和持续动画。

**Step 2: 运行测试并确认失败**

Run: `node --test tests/accessibility-contract.test.mjs`  
Expected: FAIL，指出尚未满足的契约。

**Step 3: 完成手机端专用构图**

在 `max-width: 760px`：

- 角色画面重排为竖屏海报；
- 角色名避开脸部的默认安全区；
- 角色简介不覆盖人物五官；
- 双人章节改为纵向交替；
- 关闭鼠标视差、mix-blend 大面积叠加和持续 blur；
- 使用 `100svh` 而不是固定 `100vh`；
- 导航改为顶部进度条。

**Step 4: 完成 reduced-motion 模式**

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .chapter-stage { position: relative; }
  .role-step { opacity: 1; transform: none; }
}
```

脚本中同步跳过逐帧视差和渐进命线。

**Step 5: 实现图片加载和失败保护**

- 首屏图使用 `fetchpriority="high"`；
- 后续角色图 `loading="lazy" decoding="async"`；
- 图片失败时保留章节文字和暗色轮廓背景；
- 不让空图片图标暴露；
- 图片容器有固定 aspect ratio；
- 对 RGBA 立绘使用 `object-fit: contain`，普通截图使用 `cover`。

**Step 6: 创建静态站点验证脚本**

`scripts/verify-site.mjs` 必须：

1. 读取 `index.html`、CSS、JS；
2. 从 `siteContent` 收集所有图片路径；
3. 校验本地图片存在；
4. 校验角色 ID 和章节 ID 唯一；
5. 校验 HTML 引用的 CSS/JS 文件存在；
6. 校验没有生产页面引用 `design-preview/` 中的实验脚本；
7. 失败时以非零状态退出并输出具体路径。

**Step 7: 运行全部验证**

Run: `npm test && npm run verify`  
Expected: 所有测试 PASS；verify 输出角色数、章节数和 `All site references are valid.`。

**Step 8: 提交**

```bash
git add JX3/css/site.css JX3/js/app.js JX3/js/scroll.js JX3/scripts/verify-site.mjs JX3/tests/accessibility-contract.test.mjs
git commit -m "feat: harden responsive and accessible experience"
```

---

### Task 8: 浏览器冒烟验证和内容交付检查

**Files:**
- Modify: `js/content.js`（仅修正验证中发现的真实内容问题）
- Modify: `css/site.css`（仅修正跨尺寸问题）
- Modify: `js/app.js` / `js/scroll.js`（仅修正运行问题）
- Create: `docs/CONTENT_GUIDE.md`

**Step 1: 编写内容维护指南**

`docs/CONTENT_GUIDE.md` 说明：

- 如何添加单角色亲友；
- 如何给同一亲友添加第 2～10 个角色，并将章节类型改为 `multi`；
- 如何创建 `couple` 双人共同章节；
- 如何设置真实大合影；
- 如何配置门派、简介、图片焦点；
- 推荐图片尺寸和透明图/截图用途；
- 禁止直接修改渲染器来增加内容。

必须给出一份完整 `single`、`multi`、`couple` 数据示例。

**Step 2: 启动本地服务器**

Run: `python3 -m http.server 4173 --directory /Users/dongjianming/Documents/project/JX3`  
Expected: 服务监听 `http://127.0.0.1:4173/`。

**Step 3: 执行 HTTP 冒烟检查**

Run:

```bash
curl -sS -I http://127.0.0.1:4173/
curl -sS -I http://127.0.0.1:4173/css/site.css
curl -sS -I http://127.0.0.1:4173/js/app.js
```

Expected: 三个请求均返回 HTTP 200。

**Step 4: 桌面浏览器验证**

使用 1440×900 视口检查：

- 片头可在最长 2.5 秒内退出；
- 群像封面不出现破图或“待补充”；
- 四个现有角色均出现；
- 角色名覆盖在角色视觉区域内；
- 章节导航和命线随滚动更新；
- 页面从头到尾不需要点击；
- 结尾名单与数据一致；
- 控制台无 uncaught error。

**Step 5: 手机浏览器验证**

使用 390×844 视口检查：

- 不出现横向滚动条；
- 人物脸部不被角色名遮挡；
- 简介可读；
- sticky 舞台不会锁死页面；
- 双人模板测试夹具在手机布局下为上下交替；
- 顶部进度条不遮挡内容。

**Step 6: reduced-motion 验证**

模拟 `prefers-reduced-motion: reduce`，确认：

- 所有角色依然可见；
- sticky 章节可正常顺序阅读；
- 命线静态显示；
- 页面无持续粒子和视差；
- 返回开场不会强制平滑滚动。

**Step 7: 运行最终自动检查**

Run: `npm test && npm run verify`  
Expected: 全部 PASS。

**Step 8: 检查本任务改动范围**

Run: `git status --short -- JX3`  
Expected: 只包含本计划创建或修改的 JX3 文件；不得暂存 `.DS_Store`、`.superpowers/` 或父项目其他改动。

**Step 9: 提交**

```bash
git add JX3/docs/CONTENT_GUIDE.md JX3/index.html JX3/css/site.css JX3/js JX3/scripts JX3/tests JX3/package.json
git commit -m "docs: add memorial content and validation guide"
```

---

## 最终验收清单

- [ ] 根目录页面可直接打开，`design-preview/` 保持不变；
- [ ] 全站无需点击即可完整向下浏览；
- [ ] 当前四张角色素材均被正确使用；
- [ ] 新增角色只需编辑 `js/content.js`；
- [ ] 一位亲友可配置 1～10 个角色；
- [ ] 双人章节支持两侧角色数量不一致；
- [ ] 每个角色名直接显示在角色图片视觉区域中；
- [ ] 门派和角色简介可配置；
- [ ] 大合影缺失时使用群像构图，不显示后台式占位文案；
- [ ] 大合影补齐后无需改组件代码；
- [ ] 桌面与手机都经过独立构图；
- [ ] reduced-motion 下内容完整；
- [ ] 图片失败不会阻塞章节阅读；
- [ ] 没有账号、后台、评论、搜索等范围扩张；
- [ ] `npm test` 和 `npm run verify` 通过；
- [ ] 实际项目目录 `/Users/dongjianming/Documents/project/JX3` 中文件已验证。
