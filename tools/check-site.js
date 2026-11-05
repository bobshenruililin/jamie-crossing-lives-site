#!/usr/bin/env node
/* Crossing Lives — browser checks for the research website.

   Usage, from the repository root:
     python3 -m http.server 4188 --bind 127.0.0.1      (in another terminal)
     node tools/check-site.js                          (checks / )
     node tools/check-site.js http://127.0.0.1:4188/feature/

   Needs Playwright with Chromium. If it is not already installed:
     npm install --no-save playwright && npx playwright install chromium

   Covers interactions, deep links and every research shelf, plus evidence
   regressions agreed with dot on 5 November 2026: the unconsented street
   photograph is never requested, schoolchildren's homes are never placed in
   Shenzhen, the manager's shopping is never placed in Sheung Shui, the parent
   is not "locally based", and no institution is disclosed. */
const { chromium } = require('playwright');

const base = process.argv[2] || 'http://127.0.0.1:4188/';
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [], requests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  ctx.on('request', r => requests.push(r.url()));

  await page.goto(base, { waitUntil: 'networkidle' });

  // Work-in-progress status (explicit requirement)
  check('popup shows on first visit', await page.evaluate(() => document.querySelector('#status-popup').open));
  await page.click('.status-popup-explore');
  check('popup closes via its button', !(await page.evaluate(() => document.querySelector('#status-popup').open)));
  check('acknowledgement lasts for the tab session', await page.evaluate(() => sessionStorage.getItem('crossing-lives:website-wip-acknowledged') === 'yes'));
  check('header shows "Work in progress"', (await page.textContent('.site-status')) === 'Work in progress');
  await page.reload({ waitUntil: 'networkidle' });
  check('popup suppressed after reload in the same tab', !(await page.evaluate(() => document.querySelector('#status-popup').open)));

  // The miniature
  await page.waitForSelector('.mini-mark[data-place="sz-dining"]');
  await page.click('.mini-mark[data-place="sz-dining"]');
  check('marker opens an evidence card', await page.isVisible('.mini-card'), await page.textContent('.mini-card h3'));
  check('contextual photo is labelled as context', (await page.textContent('.mini-card')).includes('context, not a restaurant'));
  await page.click('.card-photo');
  check('photo viewer opens', await page.evaluate(() => document.querySelector('.photo-viewer')?.open));
  await page.keyboard.press('Escape');
  check('photo viewer closes on Escape and returns focus', !(await page.evaluate(() => document.querySelector('.photo-viewer')?.open)) && await page.evaluate(() => document.activeElement?.classList.contains('card-photo')));
  await page.click('.mini-mark[data-place="crossing"]');
  await page.click('.card-photo');
  await page.click('.pv-spot >> nth=1');
  check('photo detail highlight', await page.isVisible('.pv-box'), await page.textContent('.pv-note'));
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  check('Escape closes the card', !(await page.isVisible('.mini-card')));
  await page.focus('.mini-scene');
  const before = await page.$eval('[data-mini="world"] polygon', n => n.getAttribute('points'));
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
  check('arrow keys turn the model', before !== await page.$eval('[data-mini="world"] polygon', n => n.getAttribute('points')));

  const scene = async id => { await page.click(`.tour-switch [data-go="${id}"]`); await page.waitForTimeout(1400); };
  await scene('resident');
  check('switcher drives the tour', (await page.textContent('.mini-now b')) === 'Resident with Shenzhen ties');
  check('resident lights four places', (await page.$$eval('.mini-mark.is-lit', l => l.length)) === 4);
  await scene('repair');
  check('repair: unplaced parts float as ghosts', (await page.$$eval('.mini-ghost', l => l.length)) === 3);
  await scene('pupils');
  const pupilPins = await page.$$eval('.mini-flag, .mini-mark.has-pin', l => l.map(n => n.textContent));
  check('EVIDENCE pupils: homes drawn beyond Shenzhen', await page.isVisible('.mini-zone') && pupilPins.some(t => t.includes('Mainland')), pupilPins.join(' | '));
  await scene('manager');
  const shopPin = await page.$eval('.mini-mark[data-place="hk-shops"]', n => n.textContent);
  const managerFlags = await page.$$eval('.mini-flag', l => l.map(n => n.textContent));
  check('EVIDENCE manager: shopping not placed in Sheung Shui', !/shopping/i.test(shopPin) && managerFlags.some(t => /somewhere in Hong Kong/i.test(t)), `${shopPin} | ${managerFlags.join(' | ')}`);

  // Ledger
  check('EVIDENCE ledger: eight selected accounts plus an official count', (await page.textContent('#ledger .deck')).includes('Eight selected accounts'));
  const pupilMarks = await page.$$eval('.lrow[data-person="pupils"] .lmark', l => l.map(n => `${n.dataset.side}:${n.dataset.facet}`));
  check('EVIDENCE ledger: pupils’ home is Mainland, not Shenzhen', pupilMarks.includes('mainland:home') && !pupilMarks.includes('sz:home'), pupilMarks.join(' '));
  const parentBand = await page.$eval('.lrow[data-person="parent"]', n => n.closest('.lband').querySelector('.lband-name').textContent);
  check('EVIDENCE ledger: parent is not "locally based"', !/locally based/i.test(parentBand), parentBand);
  await page.click('.ledger-controls [data-focus="work"]');
  check('ledger highlight changes the reading', (await page.textContent('.ledger-reading')).startsWith('Every workplace'));
  await page.click('.lrow[data-person="guide"] .lrow-who');
  check('ledger row expands alone', await page.isVisible('#ledger-guide') && !(await page.isVisible('#ledger-repair')));

  // Lens B trail
  await page.click('.tr-stop[data-stop="licence"]');
  check('trail stop shows its photograph', (await page.getAttribute('.tr-frame img', 'src')).includes('ss-driving-school'));
  await page.click('.tr-spots [data-spot="0"]');
  check('trail detail highlight', await page.isVisible('.tr-box'));
  await page.click('.tr-stop[data-stop="delivery"]');
  check('EVIDENCE street photo uses the signage derivative', (await page.getAttribute('.tr-frame img', 'src')).includes('sz-services-signage'));
  await page.click('.tr-stop[data-stop="tuition"]');
  check('reported stop shows no photograph', await page.isVisible('.tr-nophoto'));

  // Lens C ties
  check('resident shows no former home', !(await page.isVisible('.tie-former')));
  await page.click('.ties-switch [data-profile="guide"]');
  check('guide leaves a former-home outline in Hong Kong', await page.isVisible('.city-hk .tie-former') && await page.isVisible('.city-sz [data-arrives]'));

  // Singapore–Johor
  check('Singapore–Johor: six markers and two forecast flows', (await page.$$eval('.echo-mark', l => l.length)) === 6 && (await page.$$eval('.echo-flow', l => l.length)) === 2);
  await page.hover('.echo-item[data-n="3"]');
  check('Singapore–Johor: a question lights its marker', await page.$eval('.echo-mark[data-n="3"]', n => n.classList.contains('is-on')));

  // Motion
  await page.click('#motion-control');
  check('motion pause sets data-motion=off', (await page.getAttribute('html', 'data-motion')) === 'off');
  await page.click('#motion-control');

  // The slogan: line 1's photo pieces rearrange into line 2
  check('slogan is drawn from field photographs', await page.evaluate(() => document.documentElement.classList.contains('has-photo-title') && document.querySelectorAll('#hero-type .ptype-hit').length === 2));
  check('slogan text stays in the document for assistive technology', (await page.textContent('#hero-title')).replace(/\s+/g, ' ').trim() === 'Two places, one life, rearranged.');
  await page.waitForFunction(() => document.querySelector('#hero-type').classList.contains('is-rearranged'), null, { timeout: 9000 }).catch(() => {});
  check('line 1’s pieces rearrange into line 2', await page.$eval('#hero-type', n => n.classList.contains('is-rearranged')));
  const wordLabel = await page.getAttribute('#hero-type .ptype-hit[data-word="0"]', 'aria-label');
  check('each slogan word names its photograph', /field photograph: .+Open the photograph/.test(wordLabel || ''), wordLabel);
  check('“A life doesn’t move all at once” is the tour’s payoff', (await page.textContent('#step-together h2')).includes('A life doesn’t move'));
  check('three lens letters are drawn from photographs', (await page.$$eval('.lens-mark.is-ready', l => l.length)) === 3);

  // Place words light the model and open its evidence
  await page.hover('.pw[data-place="sz-repair"] >> nth=0');
  check('a place word lights its building', await page.$eval('.mini-mark[data-place="sz-repair"]', n => n.classList.contains('is-peek')));
  await page.mouse.move(5, 5);
  check('the light goes when the pointer leaves', !(await page.$eval('.mini-mark[data-place="sz-repair"]', n => n.classList.contains('is-peek'))));
  await page.click('.pw[data-place="hk-rental"] >> nth=0');
  check('a place word opens its evidence', (await page.isVisible('.mini-card')) && (await page.textContent('.mini-card h3')) === 'A rented flat');
  await page.keyboard.press('Escape');

  // Life signatures
  check('a signature for every ledger row', (await page.$$eval('.lrow .lrow-sig svg.sig', l => l.length)) === 9);
  check('five signatures in the tour and five in the summary row', (await page.$$eval('.step-sig svg.sig', l => l.length)) === 5 && (await page.$$eval('.sig-row svg.sig', l => l.length)) === 5);
  const pupilSig = await page.$$eval('.lrow[data-person="pupils"] .sig-lane', l => l.map(n => `${n.dataset.facet}:${n.dataset.where}`));
  check('EVIDENCE pupils’ signature places home beyond Shenzhen', pupilSig.includes('home:beyond') && !pupilSig.some(t => t.startsWith('home:sz')), pupilSig.join(' '));
  const managerSig = await page.$$eval('.lrow[data-person="manager"] .sig-lane', l => l.map(n => `${n.dataset.facet}:${n.dataset.where}`));
  check('manager signature: shopping in both places, ties unknown', managerSig.includes('spend:both') && managerSig.includes('ties:unknown'), managerSig.join(' '));

  // Research shelves
  for (const id of ['about-inquiry', 'research-reading', 'evidence', 'care-evidence', 'school-evidence', 'street-level', 'policy-maps', 'horizon', 'questions', 'measure', 'responses', 'game-lab']) {
    await page.evaluate(id => { document.getElementById(id).open = true; }, id);
    await page.waitForTimeout(700);
    const length = await page.$eval(`#${id} .shelf-body`, n => n.innerText.length);
    const loading = await page.$eval(`#${id}`, n => Boolean(n.querySelector('.loading-note')));
    check(`shelf ${id} renders`, length > 200 && !loading, `${length} chars`);
  }
  const text = await page.evaluate(() => document.body.innerText);
  check('EVIDENCE no institution disclosed for the resident', !/universit/i.test(text));
  check('EVIDENCE trips name Lok Ma Chau/Futian and Lo Wu', text.includes('Lok Ma Chau/Futian') && text.includes('Lo Wu'));

  // Deep links, including legacy anchors
  for (const [hash, id] of [['#responses', 'responses'], ['#selective', 'choices'], ['#two-way', 'johor'], ['#arrangements', 'accounts']]) {
    const p = await ctx.newPage();
    await p.goto(base + hash, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1400);
    const r = await p.evaluate(id => { const el = document.getElementById(id); const d = el.closest('details'); return { top: Math.round(el.getBoundingClientRect().top), open: d ? d.open : true }; }, id);
    check(`deep link ${hash} reaches #${id}`, r.open && Math.abs(r.top) < 160, JSON.stringify(r));
    await p.close();
  }

  check('EVIDENCE the unconsented street photograph is never requested', !requests.some(u => /sz-services\.jpg/.test(u)));
  check('new field photographs load as cropped derivatives', ['hk-crossing-hall', 'sz-help-kiosk', 'sz-community-centre'].every(n => requests.some(u => u.includes(n))));
  check('no page errors', errors.length === 0, errors.join(' | '));
  await browser.close();

  const failed = results.filter(r => !r.ok);
  results.forEach(r => console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail && !r.ok ? `  — ${r.detail}` : ''}`));
  console.log(`\n${results.length - failed.length}/${results.length} passed · ${base}`);
  process.exit(failed.length ? 1 : 0);
})().catch(error => { console.error(error); process.exit(2); });
