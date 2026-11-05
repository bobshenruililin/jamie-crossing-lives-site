#!/usr/bin/env node
/* Run with Playwright available. Optional CHROME_PATH selects local Chrome.
   HEADFUL=1 exercises native WebGPU. A headless run may use the SVG fallback.
   node tools/check-visual-studies.js [http://127.0.0.1:4188/experiments/20261106/]
   This checks the isolated comparison; it does not modify the main website. */
const {chromium} = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:4188/experiments/20261106/';
const checks = [], errors = [];
const check = (name, pass, detail = '') => checks.push({name, pass: Boolean(pass), detail});
(async () => {
  const browser = await chromium.launch({headless: process.env.HEADFUL !== '1', ...(process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {})});
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'});
  const p = await context.newPage();
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !m.location().url.includes('favicon.ico')) errors.push(m.text()); });
  await p.goto(base, {waitUntil: 'networkidle'});
  const child = () => p.frames().find(f => f.url().includes('study.html'));
  await p.frameLocator('#preview').locator('#hero-type.is-rearranged').waitFor();
  check('comparison keeps the WIP label', await child().locator('.site-status').textContent() === 'Work in progress');
  check('real heading remains readable to assistive technology', (await child().locator('#hero-title').textContent()).replace(/\s+/g, ' ').trim() === 'Two places, one life, rearranged.');
  const proposalPixels = await child().locator('#hero-type canvas').evaluate(c => c.toDataURL());
  await p.locator('[data-variant="original"]').click();
  await p.waitForTimeout(180);
  check('Current toggles the actual title rendering', proposalPixels !== await child().locator('#hero-type canvas').evaluate(c => c.toDataURL()));
  await p.locator('[data-variant="proposal"]').click();
  await p.locator('#try-action').click();
  await p.waitForTimeout(180);
  check('reduced-motion replay settles without motion', await child().locator('#hero-type').evaluate(n => n.classList.contains('is-rearranged')));
  await child().locator('#hero-type .ptype-hit').first().click();
  check('title photograph still opens', await child().locator('.photo-viewer').evaluate(n => n.open));
  await p.keyboard.press('Escape');
  check('paired screenshots load', await p.locator('.capture-grid img').evaluateAll(imgs => imgs.every(i => i.complete && i.naturalWidth > 0)));

  await p.locator('[data-study="pupils"]').click();
  await p.frameLocator('#preview').locator('.mini-zone').waitFor();
  await p.waitForTimeout(1800);
  const renderer = await child().locator('#miniature').getAttribute('data-renderer');
  check('pupil study opens the pupil scene', (await child().locator('.mini-now b').textContent()).includes('schoolchildren'));
  if (renderer === 'webgpu') {
    check('native GPU proposal has its separate count key', await child().locator('.pupil-count-dock').isVisible());
    check('count and School pin do not overlap', await child().evaluate(() => {
      const a=document.querySelector('.pupil-count-dock').getBoundingClientRect(), b=document.querySelector('.mini-mark[data-place="hk-school"]').getBoundingClientRect();
      return !(a.top < b.bottom && a.bottom > b.top && a.left < b.right && a.right > b.left);
    }));
    await p.locator('[data-variant="original"]').click();
    await child().waitForFunction(() => document.querySelector('.pupil-count-dock').hidden);
    check('Current restores the original count treatment', !(await child().locator('.pupil-count-dock').isVisible()));
    await p.locator('[data-variant="proposal"]').click();
    await child().waitForFunction(() => !document.querySelector('.pupil-count-dock').hidden);
    await child().locator('.mini-mark[data-place="hk-school"]').click();
    await child().locator('.mini-card').waitFor({state: 'visible'});
    check('school evidence card remains usable', await child().locator('.mini-card').isVisible());
    await p.keyboard.press('Escape');
  } else check('GPU fallback is explained', (await p.locator('.gpu-note').textContent()).includes('SVG fallback'));

  await p.locator('[data-study="guide"]').click();
  await p.frameLocator('#preview').locator('#guide-story summary').waitFor();
  await p.waitForTimeout(500);
  check('guide detail starts collapsed', !(await child().locator('#guide-story').evaluate(n => n.open)));
  await p.locator('#try-action').click();
  await child().waitForFunction(() => document.querySelector('#guide-story').open);
  check('review control expands the actual guide detail', await child().locator('#guide-story').evaluate(n => n.open));
  check('three specific details are available', await child().locator('.guide-story-parts li').count() === 3);
  await child().locator('.guide-story-link .pw').click();
  check('family phrase opens the corresponding model evidence', await child().locator('.mini-card h3').textContent() === 'Family in Hong Kong');
  await p.keyboard.press('Escape');
  await p.locator('[data-variant="original"]').click();
  await child().waitForFunction(() => document.documentElement.dataset.labVariant === 'original');
  check('Current removes the experimental guide addition', !(await child().locator('#guide-story').isVisible()));
  await p.locator('[data-variant="proposal"]').click();
  await child().waitForFunction(() => document.documentElement.dataset.labVariant === 'proposal');
  await child().locator('#guide-story summary').focus();
  const wasOpen = await child().locator('#guide-story').evaluate(n => n.open);
  await child().locator('#guide-story summary').press('Enter');
  await child().waitForFunction(wasOpen => document.querySelector('#guide-story').open !== wasOpen, wasOpen);
  check('native disclosure works by keyboard', wasOpen !== await child().locator('#guide-story').evaluate(n => n.open));
  await p.locator('.device').click();
  check('phone-width control resizes the actual preview', await p.locator('#preview').evaluate(n => n.clientWidth) === 390);

  for (const width of [320, 390, 844, 1440]) {
    await p.setViewportSize({width, height: 900});
    const box = await p.evaluate(() => ({client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth}));
    check(`comparison page fits ${width}px`, box.scroll <= box.client + 1, JSON.stringify(box));
  }
  check('no runtime or resource errors except the existing favicon', errors.length === 0, errors.join(' | '));
  await browser.close();
  checks.forEach(c => console.log(`${c.pass ? 'PASS' : 'FAIL'} ${c.name}${!c.pass ? ' — ' + c.detail : ''}`));
  console.log(`${checks.filter(c=>c.pass).length}/${checks.length} passed; renderer=${renderer}; ${base}`);
  if (checks.some(c=>!c.pass)) process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(2)});
